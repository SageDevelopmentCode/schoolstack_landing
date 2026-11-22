"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { GardenMessagesWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  At,
  MascotHookSlide,
  MascotOutroSlide,
  MascotProductSlide,
  MascotTurnSlide,
  NotificationReactionSlide,
  ReactionListSlide,
  SAMPLE_NOTIFS,
  SpeechBubble,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Jokes are original; product facts are word for word from download-app-slides.ts
// and FloatingStickers.tsx.

const H = 920;

export const MASCOT_LOAM_MESSAGES_CAROUSEL = {
  id: "mascot-loam-messages",
  title: "Loam and the wrong group chat (Messages)",
  description: "Mascot carousel: Loam's group-chat mishaps, then the Garden messages inbox.",
  fileSlug: "mudkitchen-loam-messages",
  slides: [
    {
      id: "hook",
      fileName: "01-wrong-group-chat-again.png",
      adCopy: {
        label: "Wrong group chat",
        primaryText: "Loam sent it to the wrong group chat. \"Class parents 2\" will never recover. 🫣\n\nSwipe for every parent message in one inbox, one thread per family →\n\n#microschool #parentcommunication #schoolfounder",
        headline: "Loam and the wrong group chat",
      },
      adCopyVariants: [
        {
          label: "9pm",
          primaryText: "9pm: \"quick question\" (it is not quick). 11:48pm: \"sorry for the late text!\" Swipe for what Loam did about it →\n\n#microschool #parentcommunication",
          headline: "\"Quick question\" at 9pm",
        },
        {
          label: "Confess",
          primaryText: "Confess: have you ever sent a school message to the wrong group chat? 👇 Loam has. Swipe →\n\n#microschool #schoollife",
          headline: "Ever sent it to the wrong chat?",
        },
      ],
      render: () => (
        <MascotHookSlide
          kicker="Meet Loam, who delivers the messages"
          headline={
            <>
              Loam delivering a message to the <Accent>wrong group chat</Accent> (again)
            </>
          }
          name="loam"
          view="oops"
          background="#E3EDFB"
          aside="“class parents 2” will never recover."
          mascot={{ x: 250, y: 660, width: 560 }}
        >
          <At x={60} y={520} rotate={-3} z={5}>
            <SpeechBubble size={36} tail="bottom-left" width={430}>
              who&rsquo;s bringing snacks friday?
            </SpeechBubble>
          </At>
          <At x={560} y={600} rotate={3} z={5}>
            <SpeechBubble size={36} tail="bottom-right" width={440} bg="#FFF7DA">
              wrong chat!! sorry!!
            </SpeechBubble>
          </At>
        </MascotHookSlide>
      ),
    },
    {
      id: "nine-pm",
      fileName: "02-types-of-parent-messages-at-9pm.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              Types of parent messages <Accent>at 9pm</Accent>
            </>
          }
          name="loam"
          rows={[
            { label: "“quick question”", aside: "(it is not quick)", view: "thinking" },
            { label: "“sorry for the late text!”", aside: "sent at 11:48pm", view: "shy" },
            { label: "The 14-paragraph email", aside: "with a PS. and a PPS.", view: "sleepy" },
            { label: "Just a thumbs up", aside: "to what. to what.", view: "confused" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-what-if-every-message-had-a-home.png",
      render: () => (
        <MascotTurnSlide
          name="loam"
          view="curious"
          background="#EEF5E9"
          bubble={
            <>
              what if every message <Accent>had a home?</Accent>
            </>
          }
          aside="(and stayed there.)"
        />
      ),
    },
    {
      id: "inbox",
      fileName: "04-one-inbox-for-every-family.png",
      render: () => (
        <MascotProductSlide
          kicker="Messages"
          title="One inbox for every family."
          aside="loam knows where everything is."
          note="Families message teachers directly. Nothing gets lost in email."
          noteAt={{ x: 630, y: 960, rotate: 3, width: 390 }}
          mascot={{ name: "loam", view: "point", width: 420, x: -60, y: 900 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenMessagesWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "thread",
      fileName: "05-conversations-not-chaos.png",
      render: () => (
        <MascotProductSlide
          kicker="Conversations"
          title="Real conversations, not group-chat chaos."
          note="Each family has its own thread with the school."
          background="#F3EEF8"
          noteAt={{ x: 60, y: 990, rotate: -3, width: 380 }}
          mascot={{ name: "loam", view: "thumbs", width: 400, x: 660, y: 910 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0.13, originY: 0 }}
        >
          <GardenMessagesWindow contentHeight={H} threadId="thread-rivera" />
        </MascotProductSlide>
      ),
    },
    {
      id: "reaction",
      fileName: "06-the-satchel-is-lighter-now.png",
      render: () => (
        <NotificationReactionSlide
          headline={
            <>
              Loam&rsquo;s mailbag is <Accent>lighter now</Accent>
            </>
          }
          aside="loam delivers to the right place. every time."
          name="loam"
          view="happy"
          background="#FDEBDD"
          notifs={[SAMPLE_NOTIFS.newMessage, SAMPLE_NOTIFS.parentReplied]}
        />
      ),
    },
    {
      id: "outro",
      fileName: "07-every-message-in-the-right-place.png",
      render: () => <MascotOutroSlide name="loam" view="celebrate" lead="Every message," accent="in the right place." aside="the wrong group chat has been archived" />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
