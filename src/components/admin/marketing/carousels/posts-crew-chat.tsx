"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { Accent, G } from "@/components/admin/marketing/ads/ad-kit";
import { YourAdminPhone, YourParentPhone } from "@/components/admin/marketing/carousels/free-preview-mocks";
import { CrewChatLayout, ReframeLayout, TaskCloudLayout } from "@/components/admin/marketing/carousels/ads-crew-chat";
import { AIRY } from "@/components/admin/marketing/carousels/crew-chat-kit";

// Organic posts in the crew-chat style (no offer, no button, just the site). `adCopy` holds the caption and a
// LinkedIn headline. Chat lines stick to what MudKitchen does: a message to every family, the shared family calendar.

export const POSTS_CREW_CHAT_CAROUSEL = {
  id: "posts-crew-chat",
  title: "Crew chat singles: organic posts (4)",
  description: "Organic single posts in the crew-chat style: Loam and Dot chats, a shame-free reframe and a to-do cloud. No offer.",
  fileSlug: "mudkitchen-posts-crew-chat",
  kind: "post",
  sizes: ["feed", "story"],
  slides: [
    {
      id: "loam-picture-day",
      fileName: "post-cc1-loam-picture-day.png",
      render: () => <LoamPost />,
      adCopy: {
        label: "Yes please",
        primaryText: "Picture day is Friday. Loam asks once, you say \"yes please\", and every family gets the message. 📸 #microschool #parentcommunication",
        headline: "Picture day? Loam's on it",
      },
      adCopyVariants: [
        {
          label: "Group chat",
          primaryText: "One message to every family, instead of three group chats and a forwarded email. 📸 What's your picture-day reminder routine? #microschool #schoollife",
          headline: "One message, every family",
        },
        {
          label: "Tag them",
          primaryText: "Tag the person who sends the picture-day reminder at your school. Loam would like to help. 📸 #microschool #parentcommunication",
          headline: "Who sends the picture-day reminder?",
        },
      ],
    },
    {
      id: "dot-calendar",
      fileName: "post-cc2-dot-calendar.png",
      render: () => <DotPost />,
      adCopy: {
        label: "Moved",
        primaryText: "The field trip moved to Thursday. Dot updated the calendar, and every family sees the new date. No \"wait, which day?\" texts. 🗓️ #microschool #schoolcalendar",
        headline: "Field trip moved? Families see it.",
      },
      adCopyVariants: [
        {
          label: "Which day",
          primaryText: "\"Wait, which day is the field trip?\" Asked again and again. Answered by one shared family calendar. 🗓️ How do your families find dates? #microschool #schoolcalendar",
          headline: "\"Wait, which day?\" Solved.",
        },
        {
          label: "Short",
          primaryText: "One calendar. Every family. The right date. 🗓️ #microschool #schoolcalendar",
          headline: "One calendar, every family",
        },
      ],
    },
    {
      id: "reframe",
      fileName: "post-cc3-not-disorganized.png",
      render: () => <ReframePost />,
      adCopy: {
        label: "Reframe",
        primaryText: "You're not disorganized. Your school just lives in nine apps. 💛 Which one would you delete first? #microschool #founderlife",
        headline: "You're not disorganized",
      },
      adCopyVariants: [
        {
          label: "Count them",
          primaryText: "Count them: the spreadsheet, the group chat, the form tool, the payment app… How many apps does your school live in? 👇 #microschool #schooladmin",
          headline: "How many apps does your school use?",
        },
        {
          label: "Kind",
          primaryText: "A gentle reminder for Monday: if admin feels messy, it's the nine apps, not you. 💛 #microschool #founderlife",
          headline: "It's the nine apps, not you",
        },
      ],
    },
    {
      id: "running",
      fileName: "post-cc4-running-a-microschool.png",
      render: () => <RunningPost />,
      adCopy: {
        label: "You teach",
        primaryText: "Running a microschool means doing all of this before 9am. You teach. The crew handles the rest. 🌱 Which one takes your mornings? #microschool #schoolfounder",
        headline: "You teach. The crew handles the rest.",
      },
      adCopyVariants: [
        {
          label: "Pick one",
          primaryText: "Pick the one that eats your week: messages, applications, tuition, the calendar or attendance. 👇 #microschool #founderlife",
          headline: "Which one eats your week?",
        },
        {
          label: "Tag a founder",
          primaryText: "Tag a microschool founder who does all five of these and still teaches. 🙌 #microschool #schoolfounder",
          headline: "Tag a founder who does all five",
        },
      ],
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

function LoamPost() {
  return (
    <CrewChatLayout
      footer="site"
      background={AIRY.blush}
      title={<>Picture day? <Accent>Loam&rsquo;s on it.</Accent></>}
      name="loam"
      view="happy"
      bigView="wave"
      ask="Picture day is Friday. Message all families?"
      reply="Yes please!"
    />
  );
}

function DotPost() {
  return (
    <CrewChatLayout
      footer="site"
      background={AIRY.sky}
      title={<>Dot keeps <Accent>the calendar.</Accent></>}
      name="dot"
      view="happy"
      bigView="thumbs"
      ask={<>Field trip&rsquo;s now Thursday. Every family can see it.</>}
      reply="Thank you, Dot!"
    />
  );
}

function ReframePost() {
  return (
    <ReframeLayout
      footer="site"
      background={AIRY.mint}
      title={<>You&rsquo;re not disorganized. <Accent color={G.forest}>Your school lives in nine apps.</Accent></>}
      phone={<YourParentPhone scale={0.78} screen="calendar" />}
      left={{ name: "loam", view: "wink" }}
      right={{ name: "dot", view: "happy" }}
    />
  );
}

function RunningPost() {
  return (
    <TaskCloudLayout
      footer="site"
      background={AIRY.lav}
      title="Running a microschool?"
      tasks={["Answer parent messages", "Track applications", "Collect tuition", "Update the calendar", "Take attendance"]}
      payoff={<>You teach. <Accent color={G.forest}>The crew handles the rest.</Accent></>}
      phone={<YourAdminPhone scale={0.36} />}
      crew={{ name: "fennel", view: "wave" }}
    />
  );
}
