import { addMarkdownSubsectionBreaks } from "@/lib/admissions/markdown-textarea";

export type EnrollmentContractSection = {
  id: string;
  title: string;
  body: string;
};

const ROOTED_MEADOWS_MEDIA_TECHNOLOGY_SECTIONS_RAW: EnrollmentContractSection[] = [
  {
    id: "media-tech-1",
    title: "Media & Technology Policy",
    body: `## The Reason Why

In Waldorf education, based on the philosophy of Rudolf Steiner, the classroom is viewed as a "sacred space" for holistic development. The exclusion of screens isn't just about being "old-fashioned"; it's a deliberate pedagogical choice rooted in how children interact with the world.

It is a common misconception that Waldorf is "anti-science." In later high school years, technology is often introduced—but as a tool to be mastered and understood (how it works) rather than just a medium to be consumed.

According to Waldorf principles, child development happens in seven-year cycles. During the first two cycles (ages 0–14), the focus is on physical growth, imaginative play, and rhythmic learning. Technology is viewed as a barrier to these goals for several reasons, here are a few:

Steiner emphasized "learning through doing." Screens provide a secondary, two-dimensional representation of the world. A child learns more about gravity by dropping various objects than by watching a simulation of it. Second, early exposure to abstract, digital logic and simple unseen cause of effect activities tends to "harden" a child's blossoming imagination prematurely, pulling them out of their natural, wonder-filled state before they are developmentally ready. We also seek to nourish all the senses, whereas the flicker rate of screens and the compressed audio of digital devices are seen as overstimulating and taxing to a child's developing nervous system and reduces the development of many other senses.

## The Benefits

When children and youth leave their smartphones, smartwatches, and tablets at the door, several developmental benefits emerge:

- Deepened Social Intelligence
- Sustained "Deep Work", Attention, and Memory
- Preserves the "Inner Picture" the child imagined and then becomes an active creator rather than a passive consumer of pre-made activities and images.
- Mental Health and Autonomy due to a reduction in Cyberbullying and Comparison and False Reality Traps

## Rooted Meadows Media & Technology Policy

### Education Forum

Parents who enroll their children at the Rooted Meadows School are required to attend a Media Parent Education Forum and encouraged to give the gift of an intentional and low media filled childhood. As parents, we can be mindful and intentional about what, with whom, and how much screen time we allow our children. Teachers are available and willing to assist with transitions to reduce media use in your child's environment.

### Media

It is a school policy that media such as music and movie stars, shows, social media profiles, etc., is not discussed in the classroom or on the playground, except if it is brought in as part of a lesson in the curriculum in the Middle School. That media characters are not worn on clothing, backpacks, lunch boxes, etc. on campus grounds.

### Phones & Watches

Children of all grades are not allowed to have any smartphones on campus. The use of non-smart cell phones and smart-watches by children are not permitted during school hours 9:00 am-1:30 p.m. or during school events. If a child needs to have a cell phone or smart watch to communicate with parents after school, it must be kept in their backpack and turned off until school is dismissed. If parents need to communicate with their child for urgent matters during the school day, they should contact the teacher through the channel predesignated by the class teacher. If a child is found to be using their cellular device or smart-watch during school hours, the device will be confiscated and returned at the end of the day. A second violation will result in the loss of the privilege of bringing the device to school.

### Schoolwide Recommendation for Play Dates, Hangouts, and Sleepovers

- No media/electronics during play dates and/or sleepovers through fifth grade.
- In middle school years, we recommend open communication and agreements about screen time and content among parents prior to play dates, such as cellphones are left on a counter or in a basket during the get together. We encourage openness on the part of all parents to honor no screen time if requested by another parent. Good communication around this issue is vital for the social health of the class.

### Photography and Videography During School Events

In an effort to promote a screen-free environment for the children, we ask that adults be mindful of our cell-phone use on campus and at events.

The school requests that no videography or photography occurs during the following school events, festivals, celebrations, class plays, or ceremonies. The teacher may designate a parent or staff member to record or take pictures to share later on the class platform. This will ensure that parents have documentation and the focus of the audience is on the event. Everyone is welcome to take photos after the play, performance or event has concluded (i.e., while the children are still in costume).

Photography and videography will be allowed at events that are open to the public. The intention behind this policy is to support the pedagogical and educational purposes of plays, performances, festivals and school events in a Waldorf school. The primary purpose of these events is teaching, not performance. The goal of the event may be to learn to read and speak fluidly with good inflection or to expand on a topic of class study. To allow an opportunity to build confidence and role play through imagination. Too often children viewing themselves later in video will often become self-conscious, judging, and compare themselves to professionals or more experienced performers and lose the feelings of joy and confidence they had in the moment. The interaction between the children, and between the children and the audience, is a rich experience for the children. The audience's presence, unhindered by cameras and other recording devices, is incredibly valuable.

---

I certify that I am the parent or legal guardian and that I accept and agree to follow the Rooted Meadows Media & Technology Policy stated above.`,
  },
];

export const ROOTED_MEADOWS_MEDIA_TECHNOLOGY_SECTIONS: EnrollmentContractSection[] =
  ROOTED_MEADOWS_MEDIA_TECHNOLOGY_SECTIONS_RAW.map((section) => ({
    ...section,
    body: addMarkdownSubsectionBreaks(section.body),
  }));
