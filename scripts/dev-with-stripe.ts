import { type ChildProcess, spawn } from "node:child_process";
import { createInterface } from "node:readline";

const WEBHOOK_FORWARD_TO = "localhost:3000/api/stripe/webhook";
const STRIPE_EVENTS =
  "checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,account.updated";
const WEBHOOK_SECRET_PATTERN = /whsec_[a-zA-Z0-9]+/;

const children: ChildProcess[] = [];
let shuttingDown = false;

function log(prefix: string, message: string, stream: NodeJS.WriteStream = process.stdout) {
  for (const line of message.split(/\r?\n/)) {
    if (line.length === 0) continue;
    stream.write(`[${prefix}] ${line}\n`);
  }
}

function killChildren() {
  for (const child of children) {
    if (!child.killed && child.pid) {
      child.kill("SIGTERM");
    }
  }
  children.length = 0;
}

function pipeOutput(child: ChildProcess, prefix: string) {
  const handleStream = (stream: NodeJS.ReadableStream | null, isStderr: boolean) => {
    if (!stream) return;

    const rl = createInterface({ input: stream });
    rl.on("line", (line) => {
      log(prefix, line, isStderr ? process.stderr : process.stdout);
    });
  };

  handleStream(child.stdout, false);
  handleStream(child.stderr, true);
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  killChildren();
  setTimeout(() => process.exit(exitCode), 100);
}

function registerShutdownHandlers() {
  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));
}

async function commandExists(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn("which", [command], { stdio: "ignore" });
    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

function runNextDev(extraEnv: Record<string, string> = {}) {
  const child = spawn("next", ["dev"], {
    stdio: ["inherit", "pipe", "pipe"],
    env: { ...process.env, ...extraEnv },
  });

  children.push(child);
  pipeOutput(child, "next");

  child.on("close", (code) => {
    if (!shuttingDown) {
      shutdown(code ?? 1);
    }
  });

  child.on("error", (error) => {
    log("dev", `Failed to start Next.js: ${error.message}`, process.stderr);
    shutdown(1);
  });
}

function waitForWebhookSecret(child: ChildProcess): Promise<string> {
  return new Promise((resolve, reject) => {
    let resolved = false;
    let buffer = "";

    const tryResolve = (chunk: string) => {
      buffer += chunk;
      const match = buffer.match(WEBHOOK_SECRET_PATTERN);
      if (match && !resolved) {
        resolved = true;
        resolve(match[0]);
      }
    };

    child.stdout?.on("data", (data: Buffer) => {
      tryResolve(data.toString());
    });

    child.stderr?.on("data", (data: Buffer) => {
      tryResolve(data.toString());
    });

    child.on("close", (code) => {
      if (!resolved) {
        reject(
          new Error(
            `stripe listen exited before webhook secret was printed (code ${code ?? "unknown"}).`,
          ),
        );
      }
    });

    child.on("error", (error) => {
      if (!resolved) {
        reject(error);
      }
    });
  });
}

async function runWithStripeListen() {
  const stripe = spawn(
    "stripe",
    [
      "listen",
      "--events",
      STRIPE_EVENTS,
      "--forward-to",
      WEBHOOK_FORWARD_TO,
    ],
    { stdio: ["inherit", "pipe", "pipe"] },
  );

  children.push(stripe);
  pipeOutput(stripe, "stripe");

  const secretPromise = waitForWebhookSecret(stripe);

  stripe.on("close", (code) => {
    if (!shuttingDown) {
      log("stripe", `stripe listen exited (code ${code ?? "unknown"}).`, process.stderr);
      shutdown(code ?? 1);
    }
  });

  stripe.on("error", (error) => {
    log("dev", `Failed to start stripe listen: ${error.message}`, process.stderr);
    shutdown(1);
  });

  const secret = await secretPromise;
  log("dev", `Using Stripe webhook secret from CLI (${secret.slice(0, 12)}...).`);
  runNextDev({ STRIPE_WEBHOOK_SECRET: secret });
}

async function main() {
  registerShutdownHandlers();

  if (process.env.SKIP_STRIPE_LISTEN === "1") {
    runNextDev();
    return;
  }

  const hasStripe = await commandExists("stripe");
  if (!hasStripe) {
    log("dev", "Stripe CLI not found — starting Next.js only.", process.stderr);
    log("dev", "Install: brew install stripe/stripe-cli/stripe", process.stderr);
    log("dev", "Or set SKIP_STRIPE_LISTEN=1 to suppress this message.", process.stderr);
    runNextDev();
    return;
  }

  try {
    await runWithStripeListen();
  } catch (error) {
    killChildren();
    const message = error instanceof Error ? error.message : String(error);
    log("dev", `Stripe listen failed: ${message}`, process.stderr);
    log("dev", "Starting Next.js only.", process.stderr);
    runNextDev();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  log("dev", `Dev script failed: ${message}`, process.stderr);
  process.exit(1);
});
