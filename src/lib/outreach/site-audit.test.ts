import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzePage,
  classifyFileUrl,
  computeGaps,
  crawlKey,
  crawlPriority,
  currentSchoolYearStart,
  decodeEntities,
  detectFunding,
  detectPlatforms,
  detectTemplateProduct,
  detectTools,
  extractForms,
  extractTitle,
  findOnlineApplication,
  findPastDatedPhrases,
  findStaleSchoolYears,
  hasViewportMeta,
  isAllowedByRobots,
  isPasswordProtected,
  isSameSite,
  isStaffPage,
  summarizeFamilyTools,
  parseRobotsTxt,
  parseSitemap,
  renderReport,
  scanLinks,
  shouldSkipPage,
  visibleText,
  type PageResult,
} from "@/lib/outreach/site-audit";

const ORIGIN = "https://www.example-school.org";
const today = new Date(2026, 10, 22); // 2026-11-22

function page(url: string, html: string, status = 200, linkedFrom: string[] = []): PageResult {
  return { url, finalUrl: url, status, linkedFrom, facts: analyzePage(html, url, ORIGIN, today) };
}

describe("html primitives", () => {
  it("decodes entities", () => {
    assert.equal(decodeEntities("Tom &amp; Jerry&#39;s &#x2014; &nbsp;x"), "Tom & Jerry's —  x");
  });

  it("extracts title, falling back to og:title", () => {
    assert.equal(extractTitle("<title> Admissions &amp; Tuition </title>"), "Admissions & Tuition");
    assert.equal(extractTitle('<meta property="og:title" content="Home">'), "Home");
  });

  it("gets visible text without scripts, styles or comments", () => {
    const html = `<head><title>T</title></head><body><script>var x = "$500";</script><style>p{}</style>
      <!-- hidden --><h1>Hello</h1><p>World&nbsp;wide</p><noscript>Enable JS</noscript></body>`;
    assert.equal(visibleText(html), "Hello World wide");
  });

  it("detects viewport meta and password protection", () => {
    assert.equal(hasViewportMeta('<meta name="viewport" content="width=device-width">'), true);
    assert.equal(hasViewportMeta('<meta name="description" content="x">'), false);
    assert.equal(isPasswordProtected('<form class="post-password-form" action="/wp-login.php">'), true);
    assert.equal(isPasswordProtected("<p>This content is password protected. To view it please enter your password below:</p>"), true);
    assert.equal(isPasswordProtected("<p>Welcome</p>"), false);
  });

  it("does not flag a normal page with a members-login widget or builder password config", () => {
    const body = Array.from({ length: 40 }, (_, i) => `<p>Our learners explore nature, books and art together, week ${i}.</p>`).join("");
    const html = `<body class="page">
      <header><div class="members-login"><form class="member-login-form" action="/members/login">
        <input type="email" name="email"><input type="password" name="password"><button>Members login</button>
        <p>Enter the password to access the members area.</p></form></div></header>
      <main>${body}</main>
      <astro-island props="{&quot;passwordSubheadingText&quot;:[0,&quot;Please enter the password to access the page&quot;]}"></astro-island>
      </body>`;
    assert.equal(isPasswordProtected(html), false);
    assert.equal(analyzePage(html, `${ORIGIN}/about`, ORIGIN, today).passwordProtected, false);
  });
});

describe("urls", () => {
  it("treats www and http as the same site", () => {
    assert.equal(isSameSite(new URL("http://example-school.org/about"), ORIGIN), true);
    assert.equal(isSameSite(new URL("https://other.org/"), ORIGIN), false);
  });

  it("builds crawl keys without hashes, trailing slashes or tracking params", () => {
    assert.equal(
      crawlKey(new URL("http://example-school.org/about/?utm_source=x#team"), ORIGIN),
      "https://www.example-school.org/about",
    );
    assert.equal(crawlKey(new URL("https://www.example-school.org/"), ORIGIN), "https://www.example-school.org/");
    assert.equal(crawlKey(new URL("https://www.example-school.org/index.html"), ORIGIN), "https://www.example-school.org/");
  });

  it("skips admin, cart and search pages", () => {
    assert.equal(shouldSkipPage(new URL("https://x.org/wp-admin/")), true);
    assert.equal(shouldSkipPage(new URL("https://x.org/?s=tuition")), true);
    assert.equal(shouldSkipPage(new URL("https://x.org/tuition")), false);
  });

  it("puts the home page and admissions ahead of blog posts", () => {
    const home = crawlPriority(new URL("https://x.org/"));
    const admissions = crawlPriority(new URL("https://x.org/admissions"));
    const blog = crawlPriority(new URL("https://x.org/blog/2024/05/field-day"));
    assert.ok(home > admissions && admissions > blog);
  });

  it("classifies PDFs, flipbooks and other files", () => {
    assert.deepEqual(classifyFileUrl(new URL("https://x.org/_files/ugd/abc.pdf")), { kind: "pdf", provider: "PDF" });
    assert.deepEqual(classifyFileUrl(new URL("https://issuu.com/school/docs/handbook")), { kind: "flipbook", provider: "Issuu" });
    assert.deepEqual(classifyFileUrl(new URL("https://drive.google.com/file/d/1/view")), {
      kind: "flipbook",
      provider: "Google Drive",
    });
    assert.deepEqual(classifyFileUrl(new URL("https://www.canva.com/design/DAF/view")), { kind: "flipbook", provider: "Canva" });
    assert.deepEqual(classifyFileUrl(new URL("https://x.org/forms/enroll.docx")), { kind: "file", provider: "docx" });
    assert.equal(classifyFileUrl(new URL("https://x.org/tuition")), null);
  });
});

describe("robots.txt and sitemaps", () => {
  const robots = `User-agent: Googlebot\nDisallow: /\n\nUser-agent: *\nDisallow: /private/\nDisallow: /*?replytocom=\nAllow: /private/open-house\nCrawl-delay: 2\nSitemap: https://www.example-school.org/sitemap.xml`;

  it("reads the * group, crawl delay and sitemaps", () => {
    const rules = parseRobotsTxt(robots);
    assert.deepEqual(rules.disallow, ["/private/", "/*?replytocom="]);
    assert.deepEqual(rules.allow, ["/private/open-house"]);
    assert.equal(rules.crawlDelaySeconds, 2);
    assert.deepEqual(rules.sitemaps, ["https://www.example-school.org/sitemap.xml"]);
  });

  it("applies longest-match Allow/Disallow", () => {
    const rules = parseRobotsTxt(robots);
    assert.equal(isAllowedByRobots("/about", rules), true);
    assert.equal(isAllowedByRobots("/private/files", rules), false);
    assert.equal(isAllowedByRobots("/private/open-house", rules), true);
    assert.equal(isAllowedByRobots("/blog/post?replytocom=5", rules), false);
  });

  it("parses urlsets and sitemap indexes", () => {
    const index = `<?xml version="1.0"?><sitemapindex><sitemap><loc>https://x.org/pages-sitemap.xml</loc></sitemap></sitemapindex>`;
    assert.deepEqual(parseSitemap(index), { sitemaps: ["https://x.org/pages-sitemap.xml"], urls: [] });
    const urlset = `<urlset><url><loc>https://x.org/</loc></url><url><loc><![CDATA[https://x.org/a?b=1&amp;c=2]]></loc></url></urlset>`;
    assert.deepEqual(parseSitemap(urlset).urls, ["https://x.org/", "https://x.org/a?b=1&c=2"]);
  });
});

describe("links and forms", () => {
  const html = `
    <a href="/tuition#rates">Tuition</a>
    <a href="http://example-school.org/about">About</a>
    <a href="https://www.example-school.org/files/rates.pdf">2026 Rates <span>(PDF)</span></a>
    <a href="https://issuu.com/school/docs/viewbook">Viewbook</a>
    <a href="mailto:Office@Example-School.org?subject=Hi">Email us</a>
    <a href="tel:+15125550100">Call</a>
    <a href="https://app.transparentclassroom.com/online_applications/123">Apply now</a>
    <a href="https://www.instagram.com/school">Instagram</a>
    <a href="/images/photo.jpg">Photo</a>
    <iframe src="https://drive.google.com/file/d/abc/preview"></iframe>`;

  it("collects internal pages, files, contacts, http self-links and apply links", () => {
    const scan = scanLinks(html, `${ORIGIN}/`, ORIGIN);
    assert.deepEqual(scan.internalLinks, [`${ORIGIN}/tuition`, "http://example-school.org/about"]);
    assert.deepEqual(
      scan.files.map((f) => [f.kind, f.provider, f.text]),
      [
        ["pdf", "PDF", "2026 Rates (PDF)"],
        ["flipbook", "Issuu", "Viewbook"],
        ["flipbook", "Google Drive", "(embedded)"],
      ],
    );
    assert.deepEqual(scan.mailto, ["office@example-school.org"]);
    assert.deepEqual(scan.tel, ["+15125550100"]);
    assert.deepEqual(scan.httpSelfLinks, ["http://example-school.org/about"]);
    assert.deepEqual(scan.externalApplyLinks, [
      { url: "https://app.transparentclassroom.com/online_applications/123", text: "Apply now" },
    ]);
  });

  it("classifies forms and their action hosts", () => {
    const forms = extractForms(
      `<form role="search" action="/"><input name="s"></form>
       <form action="https://example.us21.list-manage.com/subscribe/post"><input type="email" name="EMAIL"><input type="submit"></form>
       <form action="https://formspree.io/f/x"><input name="name"><input name="email"><textarea></textarea><input type="hidden" name="t"></form>
       <form class="post-password-form" action="/wp-login.php?action=postpass"><input type="password" name="post_password"></form>`,
      `${ORIGIN}/contact`,
    );
    assert.deepEqual(
      forms.map((f) => [f.kind, f.actionHost, f.fieldCount]),
      [
        ["search", "www.example-school.org", 1],
        ["newsletter", "example.us21.list-manage.com", 1],
        ["general", "formspree.io", 3],
        ["password", "www.example-school.org", 1],
      ],
    );
  });
});

describe("detectors", () => {
  it("detects site platforms", () => {
    assert.deepEqual(detectPlatforms('<img src="https://static.wixstatic.com/media/a.jpg">'), ["Wix"]);
    assert.deepEqual(detectPlatforms("<!-- This is Squarespace. --><link href=\"https://static1.squarespace.com/x.css\">"), [
      "Squarespace",
    ]);
    assert.deepEqual(detectPlatforms('<link href="/wp-content/plugins/woocommerce/style.css">'), ["WordPress", "WooCommerce"]);
    assert.deepEqual(detectPlatforms('<html data-wf-page="1" data-wf-site="2">'), ["Webflow"]);
    assert.deepEqual(detectPlatforms('<script src="https://cdn.shopify.com/s/x.js"></script>'), ["Shopify"]);
    assert.deepEqual(detectPlatforms('<link href="https://cdn2.editmysite.com/css/sites.css">'), ["Weebly"]);
    assert.deepEqual(detectPlatforms('<meta name="generator" content="Google Sites">'), ["Google Sites"]);
    assert.deepEqual(detectPlatforms("<script>window._wixCssImports = [];</script>"), ["Wix"]);
    assert.deepEqual(detectPlatforms('<meta name="generator" content="Hostinger AI Builder"><img src="https://assets.zyrosite.com/x.png">'), [
      "Hostinger Website Builder",
    ]);
  });

  it("detects platforms from response headers", () => {
    assert.deepEqual(detectPlatforms("<p>hi</p>", { "X-Wix-Request-Id": "1" }), ["Wix"]);
    assert.deepEqual(detectPlatforms("<p>hi</p>", { "x-powered-by": "HostingerWebsiteBuilder" }), ["Hostinger Website Builder"]);
    assert.deepEqual(detectPlatforms("<p>hi</p>", { server: "Squarespace" }), ["Squarespace"]);
    assert.deepEqual(detectPlatforms("<p>hi</p>", { server: "nginx" }), []);
  });

  it("detects website-builder sample products", () => {
    assert.equal(detectTemplateProduct("Face Serum | Zoe Learning House", "Face Serum $25.00 Add to cart"), "Face Serum");
    assert.equal(detectTemplateProduct("Shop | School", "I'm a product detail. I'm a great place to add more information about your product"), "I'm a product detail");
    assert.equal(detectTemplateProduct("Tuition | School", "Tuition is $9,000"), null);
    assert.equal(detectTemplateProduct("Sunglasses Drive | School", "Collecting sunglasses for charity"), null);
  });

  it("detects form, payment, school, scheduling, calendar and newsletter tools", () => {
    const html = `
      <iframe src="https://docs.google.com/forms/d/e/1/viewform"></iframe>
      <a href="https://form.jotform.com/123">Enroll</a>
      <a href="https://buy.stripe.com/abc">Pay deposit</a>
      <a href="https://www.paypal.com/donate">Donate</a>
      <p>Pay by Venmo @school</p>
      <a href="https://www.zeffy.com/en-US/donation-form/x">Give</a>
      <p>We use Brightwheel for daily updates and SignUpGenius for volunteers. We accept TEFA, find us on Odyssey!</p>
      <a href="https://calendly.com/school/tour">Book a tour</a>
      <a href="https://school.as.me/tour">Schedule</a>
      <iframe src="https://calendar.google.com/calendar/embed?src=x"></iframe>
      <form action="https://school.us21.list-manage.com/subscribe/post"></form>
      <a href="https://school.substack.com">Newsletter</a>`;
    const names = detectTools(html).map((t) => `${t.category}:${t.name}`);
    for (const expected of [
      "form:Google Forms",
      "form:Jotform",
      "payment:Stripe",
      "payment:PayPal",
      "payment:Venmo",
      "payment:Zeffy",
      "school-software:Brightwheel",
      "school-software:SignUpGenius",
      "school-software:Odyssey",
      "scheduling:Calendly",
      "scheduling:Acuity Scheduling",
      "calendar:Google Calendar",
      "newsletter:Mailchimp",
      "newsletter:Substack",
    ]) {
      assert.ok(names.includes(expected), `missing ${expected} in ${names.join(", ")}`);
    }
    assert.ok(!names.includes("form:Typeform"));
  });

  it("detects Weebly/Square Online store pages but not the sitewide commerce script", () => {
    assert.ok(detectTools('<div class="wsite-com-product-price-container">$500</div>').some((t) => t.name === "Square Online store"));
    assert.ok(!detectTools('<script>var square_customer_id = null;</script>').some((t) => t.name === "Square Online store"));
  });

  it("detects payment, signing, class and chat tools added for the replacement map", () => {
    const cases: Array<[string, string]> = [
      ['<a href="https://omella.com/p5ka4">Register</a>', "Omella"],
      ['<a href="https://cash.app/$school">Pay</a>', "Cash App"],
      ["<p>Pay with Cash App to $school</p>", "Cash App"],
      ['<a href="https://www.docusign.net/Member/PowerFormSigning.aspx">Sign</a>', "DocuSign"],
      ['<a href="https://app.hellosign.com/s/abc">Sign</a>', "Dropbox Sign"],
      ['<a href="https://app.pandadoc.com/document/v2?token=1">Sign</a>', "PandaDoc"],
      ['<a href="https://www.eventbrite.com/e/open-house-123">Tickets</a>', "Eventbrite"],
      ["<p>Daily updates go out on ClassDojo.</p>", "ClassDojo"],
      ['<a href="https://app.seesaw.me/">Seesaw</a>', "Seesaw"],
      ['<a href="https://www.smarttuition.com/">Pay tuition</a>', "Smart Tuition"],
      ["<p>Tuition is drafted through Tuition Express.</p>", "Tuition Express"],
      ['<a href="https://connect.intuit.com/pay/abc">Pay invoice</a>', "QuickBooks invoices"],
      ['<a href="https://pay.waveapps.com/checkouts/abc">Pay invoice</a>', "Wave invoices"],
      ['<a href="https://groupme.com/join_group/123/abc">Join our parent chat</a>', "GroupMe"],
      ['<a href="https://chat.whatsapp.com/AbC123">Parent group</a>', "WhatsApp group"],
      ['<a href="https://calendar.app.google/RHSXmiX7ipajk5tE9">Book a call</a>', "Google Calendar booking"],
      ['<a href="https://calendar.google.com/calendar/appointments/schedules/AcZ">Book a tour</a>', "Google Calendar booking"],
      ['<a href="https://prenda.com/microschools/sunny">Enroll</a>', "Prenda"],
    ];
    for (const [html, name] of cases) {
      assert.ok(detectTools(html).some((t) => t.name === name), `${name} not detected in ${html}`);
    }
    // A booking link is not a calendar embed, and a playground seesaw is not the app.
    const booking = detectTools('<a href="https://calendar.google.com/calendar/appointments/schedules/x">Book</a>').map((t) => t.name);
    assert.ok(!booking.includes("Google Calendar"));
    assert.ok(!detectTools("<p>Kids love the seesaw at recess.</p>").some((t) => t.name === "Seesaw"));
    assert.ok(!detectTools("<p>Isaac Newton would be proud.</p>").some((t) => t.name === "Newton"));
  });

  it("detects Newton by KaiPod from app links or text near KaiPod", () => {
    const fromLink = detectTools('<a href="https://apps.apple.com/us/app/newton-by-kaipod-learning/id6479458552">App Store</a>');
    assert.deepEqual(fromLink.find((t) => t.name === "Newton"), { category: "school-software", name: "Newton", network: "KaiPod" });
    assert.ok(detectTools('<a href="https://play.google.com/store/apps/details?id=com.kaipodlearning.kairos.android">Play</a>').some((t) => t.name === "Newton"));
    assert.ok(detectTools("<p>All school communication goes through Newton, the KaiPod family app.</p>").some((t) => t.name === "Newton"));
  });

  it("detects Google Docs/Drive used as a form only from form-like link text", () => {
    const form = '<a href="https://docs.google.com/document/d/1abc/edit">2026-27 Registration Form</a>';
    const doc = '<a href="https://docs.google.com/document/d/1abc/edit">Texas Graduation Programs</a>';
    assert.ok(detectTools(form).some((t) => t.name === "Google Docs/Drive form"));
    assert.ok(!detectTools(doc).some((t) => t.name === "Google Docs/Drive form"));
    assert.ok(detectTools('<a href="https://drive.google.com/file/d/1/view">Enrollment application (PDF)</a>').some((t) => t.name === "Google Docs/Drive form"));
  });

  it("tags network-owned tool accounts", () => {
    const kaipod = detectTools('<iframe src="https://kaipodlearning.jotform.com/250616307765964"></iframe>');
    assert.equal(kaipod.find((t) => t.name === "Jotform")?.network, "KaiPod");
    const own = detectTools('<iframe src="https://form.jotform.com/250616307765964"></iframe>');
    assert.equal(own.find((t) => t.name === "Jotform")?.network, undefined);
    assert.equal(detectTools('<a href="https://www.wonderschool.com/p/sunny">Apply</a>')[0].network, "Wonderschool");
    assert.equal(detectTools('<a href="https://prenda.com/x">Apply</a>')[0].network, "Prenda");
  });

  it("detects WooCommerce cart/checkout only on WooCommerce sites", () => {
    assert.ok(detectTools('<body class="woocommerce"><a href="/cart/">Cart</a></body>').some((t) => t.name === "WooCommerce cart/checkout"));
    assert.ok(!detectTools('<a href="/cart/">Cart</a>').some((t) => t.name === "WooCommerce cart/checkout"));
    const product = '<div class="woocommerce"><form class="cart"><button type="submit" name="add-to-cart" value="166" class="single_add_to_cart_button">Sign up</button></form></div>';
    assert.ok(detectTools(product).some((t) => t.name === "WooCommerce cart/checkout"));
  });

  it("finds funding mentions with snippets", () => {
    const found = detectFunding(
      "We accept TEFA and other ESA funds. Families using Step Up For Students or charter funds welcome. No vouchers. Pay via ClassWallet.",
    );
    assert.deepEqual(Array.from(new Set(found.map((f) => f.term))), [
      "TEFA",
      "ESA",
      "Step Up",
      "Charter / enrichment funds",
      "Voucher",
      "ClassWallet",
    ]);
    assert.ok(found[0].snippet.includes("We accept TEFA"));
    assert.deepEqual(detectFunding("Go Gators! The gator mascot."), []);
  });
});

describe("dates", () => {
  it("derives the school year from an August 1 start", () => {
    assert.equal(currentSchoolYearStart(new Date(2026, 10, 22)), 2026);
    assert.equal(currentSchoolYearStart(new Date(2026, 6, 31)), 2025);
    assert.equal(currentSchoolYearStart(new Date(2026, 7, 1)), 2026);
  });

  it("flags school years before the current one", () => {
    const found = findStaleSchoolYears(
      "Tuition for 2024-2025 and 2025–26. Now enrolling for 2026-2027. Report dated 2025-05-12. © 2023-2024 School.",
      today,
    );
    assert.deepEqual(
      found.map((f) => f.reason),
      ["school year 2024-25 (current is 2026-27)", "school year 2025-26 (current is 2026-27)"],
    );
  });

  it("flags forward-looking season phrases for past terms", () => {
    const found = findStaleSchoolYears("Now enrolling for Fall 2025! Founded in Fall 2019. Applications open for Fall 2027.", today);
    assert.deepEqual(found.map((f) => f.reason), ["Fall 2025 has passed"]);
  });

  it("flags past dates in forward-looking phrases only", () => {
    const found = findPastDatedPhrases(
      "Enrollment opens January 16, 2026. Posted on March 3, 2025. Open house Dec. 5th, 2026. Tour day: Feb 2, 2026.",
      today,
    );
    assert.deepEqual(found.map((f) => f.reason), ["January 16, 2026 is in the past", "Feb 2, 2026 is in the past"]);
  });
});

describe("tools families juggle", () => {
  it("recognises staff pages by path or title", () => {
    for (const [url, title] of [
      [`${ORIGIN}/invoice/`, "Invoice"],
      [`${ORIGIN}/eft/`, "Electronic Funds Transfer Authorization"],
      [`${ORIGIN}/reimbursement/`, "Reimbursement Request Form"],
      [`${ORIGIN}/join-our-team/`, "Join our Team"],
      [`${ORIGIN}/info`, "Employee Tax Information"],
      [`${ORIGIN}/careers`, "Careers"],
      [`${ORIGIN}/volunteer-application`, "Volunteer"],
    ]) {
      assert.equal(isStaffPage(url, title), true, url);
    }
    for (const [url, title] of [
      [`${ORIGIN}/tuition`, "Tuition"],
      [`${ORIGIN}/left-handed-learners`, "Left-handed learners"],
      [`${ORIGIN}/our-team`, "Our Team"],
    ]) {
      assert.equal(isStaffPage(url, title), false, url);
    }
  });

  it("counts family tools, leaves staff-only ones out and groups network tools", () => {
    const pages = [
      page(`${ORIGIN}/admissions`, '<title>Admissions</title><iframe src="https://kaipodlearning.jotform.com/1"></iframe>'),
      page(`${ORIGIN}/parents`, '<title>Parents</title><a href="https://apps.apple.com/us/app/newton-by-kaipod-learning/id1">Newton</a>'),
      page(`${ORIGIN}/contact`, '<title>Contact</title><a href="https://calendar.app.google/abc">Book a call</a>'),
      page(`${ORIGIN}/camps`, '<title>Camps</title><a href="https://omella.com/x">Register</a>'),
      page(`${ORIGIN}/faq`, "<title>FAQ</title><p>We accept TEFA, find us on Odyssey!</p>"),
      page(`${ORIGIN}/invoice/`, "<title>Invoice</title><p>Staff are paid by Zelle.</p>"),
      page(`${ORIGIN}/eft/`, "<title>EFT</title><p>Or Zelle.</p>"),
    ];
    const summary = summarizeFamilyTools(pages);
    assert.deepEqual(
      summary.family.map((t) => t.name),
      ["Google Calendar booking", "Jotform", "Omella", "Odyssey", "Newton"],
    );
    assert.deepEqual(summary.staffOnly.map((t) => [t.name, t.staffPages.length]), [["Zelle", 2]]);
    assert.equal(
      summary.line,
      "Families touch 5 separate tools across the year (Google Calendar booking, Jotform, Omella, Odyssey, Newton). " +
        "MudKitchen could replace 4: 3 today, 1 we'd build. Network tools: Jotform, Newton (KaiPod).",
    );
  });

  it("counts WooCommerce product pages as the family-facing cart/checkout tool", () => {
    const product = page(
      `${ORIGIN}/product/application/`,
      `<html><head><title>Wild Hearts Application – Example School</title>
        <link rel="stylesheet" href="/wp-content/plugins/woocommerce/assets/css/woocommerce.css"></head>
        <body class="product-template-default single single-product woocommerce">
        <p class="price"><span class="woocommerce-Price-amount amount">$0.00</span> – <span class="woocommerce-Price-amount amount">$40.00</span></p>
        <form class="cart" method="post"><input type="number" name="quantity" value="1">
        <button type="submit" name="add-to-cart" value="120" class="single_add_to_cart_button button alt">Add to cart</button></form>
        </body></html>`,
    );
    const otherPayments = page(
      `${ORIGIN}/product/other-payments/`,
      '<title>Other Payments</title><div class="woocommerce"><span class="woocommerce-Price-amount amount">$25.00</span></div>',
    );
    const summary = summarizeFamilyTools([product, otherPayments]);
    const woo = summary.family.find((t) => t.name === "WooCommerce cart/checkout");
    assert.ok(woo, "WooCommerce cart/checkout missing from family tools");
    assert.equal(woo.moment, "pay");
    assert.deepEqual(woo.familyPages, [`${ORIGIN}/product/application/`, `${ORIGIN}/product/other-payments/`]);
    assert.deepEqual(woo.replacement?.replacedBy, ["parent-billing", "card-and-ach", "autopay"]);
    assert.match(woo.replacement?.note ?? "", /apply/);
  });

  it("reports a tool on both family and staff pages as a family tool", () => {
    const pages = [
      page(`${ORIGIN}/tuition`, "<title>Tuition</title><p>Pay by Zelle.</p>"),
      page(`${ORIGIN}/invoice/`, "<title>Invoice</title><p>Zelle.</p>"),
    ];
    const summary = summarizeFamilyTools(pages);
    assert.deepEqual(summary.family.map((t) => t.name), ["Zelle"]);
    assert.equal(summary.staffOnly.length, 0);
  });
});

describe("site gaps and report", () => {
  const home = page(
    `${ORIGIN}/`,
    `<html><head><title>Home</title></head><body>
      <a href="/tuition">Tuition</a><a href="/admissions">Admissions</a><a href="/old">Old</a>
      <a href="mailto:office@example-school.org">Email</a></body></html>`,
  );
  const tuition = page(
    `${ORIGIN}/tuition`,
    `<html><head><title>Tuition &amp; Fees</title><meta name="viewport" content="width=device-width"></head>
     <body><p>See our 2025-2026 tuition sheet.</p><a href="/files/tuition.pdf">Tuition sheet</a>
     <a href="http://example-school.org/admissions">Apply</a></body></html>`,
  );
  const admissions = page(
    `${ORIGIN}/admissions`,
    `<html><head><title>Admissions</title><meta name="viewport" content="width=device-width"></head>
     <body><p>Applications open January 16, 2026. Email us to apply.</p>
     <form action="https://formspree.io/f/x"><input name="name"><input name="email"><textarea></textarea></form></body></html>`,
  );
  const broken: PageResult = { url: `${ORIGIN}/old`, finalUrl: `${ORIGIN}/old`, status: 404, linkedFrom: [`${ORIGIN}/`] };
  const sample = page(`${ORIGIN}/wooden-chair-mopukh`, `<title>Wooden Chair | Example School</title><p>$45.00</p>`);
  const pages = [home, tuition, admissions, broken, sample];

  it("computes every gap kind with the page URL", () => {
    const gaps = computeGaps(pages, ORIGIN);
    const kinds = gaps.map((g) => `${g.kind} ${g.url}`);
    assert.ok(kinds.includes(`broken-link ${ORIGIN}/old`));
    assert.ok(kinds.includes(`stale-school-year ${ORIGIN}/tuition`));
    assert.ok(kinds.includes(`past-date ${ORIGIN}/admissions`));
    assert.ok(kinds.includes(`prices-in-files ${ORIGIN}/tuition`));
    assert.ok(kinds.includes(`missing-viewport ${ORIGIN}/`));
    assert.ok(kinds.includes(`http-self-link ${ORIGIN}/tuition`));
    assert.ok(kinds.includes(`no-online-application ${ORIGIN}/admissions`));
    assert.ok(kinds.includes(`template-product ${ORIGIN}/wooden-chair-mopukh`));
    assert.match(gaps.find((g) => g.kind === "broken-link")?.message ?? "", /404; linked from \//);
  });

  it("does not flag prices-in-files when the page shows $ amounts", () => {
    const priced = page(`${ORIGIN}/tuition`, `<title>Tuition</title><p>Tuition is $9,500 a year.</p><a href="/t.pdf">PDF</a>`);
    assert.ok(!computeGaps([priced], ORIGIN).some((g) => g.kind === "prices-in-files"));
  });

  it("counts a form tool or external apply link as an online application", () => {
    const withTool = page(`${ORIGIN}/apply`, `<iframe src="https://form.jotform.com/1"></iframe>`);
    assert.equal(findOnlineApplication([withTool]).found, true);
    assert.ok(!computeGaps([withTool], ORIGIN).some((g) => g.kind === "no-online-application"));
  });

  it("renders a markdown report with every section", () => {
    const report = renderReport({
      startUrl: `${ORIGIN}/`,
      siteOrigin: ORIGIN,
      label: "example-school",
      generatedOn: "2026-11-22",
      rendered: false,
      maxPages: 60,
      robots: { found: true, disallow: [] },
      sitemap: { found: false, urlCount: 0, sources: [] },
      pages,
      notCrawled: [],
      robotsBlocked: [],
    });
    for (const heading of [
      "# Site audit: example-school",
      "## Overview",
      "## Key pages",
      "## Pages",
      "## Tools found",
      "## Tools families juggle",
      "## Funding mentions",
      "## Gap flags",
      "## PDFs and flipbooks",
      "## Password-protected pages",
      "## Email and phone links",
    ]) {
      assert.ok(report.includes(heading), `missing ${heading}`);
    }
    assert.match(report, /\| \/tuition \| Tuition & Fees \|/);
    assert.match(report, /Pages by status: 200: 4, 404: 1/);
    assert.match(report, /### template-product \(1\)/);
    assert.match(report, /Tuition \/ pricing \/ fees: https:\/\/www\.example-school\.org\/tuition/);
    assert.match(report, /mailto:office@example-school\.org/);
  });
});
