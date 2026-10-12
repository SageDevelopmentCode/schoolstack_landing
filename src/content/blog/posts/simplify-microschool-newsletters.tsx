import Link from "next/link";
import NewsletterEditorBlogEmbed from "@/components/blog/embeds/NewsletterEditorBlogEmbed";
import { PRODUCTION_SITE_URL } from "@/lib/site";

export const repoBlogMeta = {
  slug: "simplify-microschool-newsletters",
};

export default function SimplifyMicroschoolNewslettersPost() {
  return (
    <>
      <p>
        Running a microschool means there&apos;s almost always something worth sharing with
        families. A classroom project, a new discovery, a fun activity, or a moment that
        reminds you why you started your school in the first place.
      </p>
      <p>
        But turning those moments into a newsletter? That can become another task on an
        already full to-do list.
      </p>
      <p>
        As the founder of{" "}
        <a href="https://sagefield.co/" target="_blank" rel="noopener noreferrer">
          Sage Field Private Microschool
        </a>{" "}
        and co-founder of MudKitchen, I think school communication should be easier than
        that. Parents want to know what&apos;s happening in their children&apos;s lives,
        and teachers want to share those experiences. The challenge is finding a simple way
        to bring it all together.
      </p>
      <h2>The Little Things Are Often Worth Sharing</h2>
      <p>Think about everything that happens in a typical school week.</p>
      <p>
        Teachers capture photos of classroom activities. Students work on projects, explore
        new ideas, and reach milestones. Important announcements and updates come up along
        the way.
      </p>
      <p>
        Individually, these moments might seem small. But together, they help parents feel
        connected to their child&apos;s learning experience.
      </p>
      <p>
        The problem is that these pieces of information can end up scattered across
        different places. Gathering everything, writing an update, finding the right
        photos, and getting it in front of families can take more effort than it should.
      </p>
      <p>
        And when you&apos;re also managing enrollment, billing, scheduling, and the
        countless other responsibilities of running a microschool, it&apos;s easy for
        communication to become one more thing you have to squeeze into your day.
      </p>
      <p>
        <strong>
          The goal isn&apos;t to create more things to share. It&apos;s to make sharing
          what already happens at your school easier.
        </strong>
      </p>
      <h2>Make Newsletters Part of Your Existing Workflow</h2>
      <p>
        I&apos;ve always believed that the tools a microschool uses should work together
        rather than create more disconnected tasks.
      </p>
      <p>That&apos;s part of the thinking behind MudKitchen&apos;s newsletter feature.</p>
      <p>
        School administrators and teachers can create, reuse, and publish newsletters in one
        convenient place. And because the feature connects with MudKitchen&apos;s Photos and
        Teacher Updates features, it fits into a broader system for capturing and sharing
        what&apos;s happening at school.
      </p>
      <NewsletterEditorBlogEmbed />
      <p>
        Instead of treating a newsletter as an entirely separate project, schools can bring
        together the information and moments they want families to see.
      </p>
      <p>That creates a few meaningful opportunities:</p>
      <ul>
        <li>
          <strong>Spend less time starting from scratch.</strong> Reuse newsletter content
          where it makes sense instead of rebuilding everything for each edition.
        </li>
        <li>
          <strong>Share more of the school experience.</strong> Bring photos, classroom
          highlights, and teacher updates into the communication you send to families.
        </li>
        <li>
          <strong>Make publishing simpler.</strong> Create and publish newsletters through
          MudKitchen, making it easier to get school updates in front of parents.
        </li>
        <li>
          <strong>Help families feel more connected.</strong> Give parents a clearer picture
          of the activities, experiences, and learning happening throughout the school
          week.
        </li>
      </ul>
      <p>
        These aren&apos;t about adding another communication obligation. They&apos;re about
        making an existing responsibility easier to manage.
      </p>
      <h2>You Don&apos;t Need a Perfect Newsletter Every Week</h2>
      <p>
        One thing I&apos;d encourage microschool founders to remember is that parents
        don&apos;t necessarily need a beautifully produced publication filled with lengthy
        updates.
      </p>
      <p>
        Often, they just want to know what their children have been doing, what the school
        has coming up, and what makes their learning experience special.
      </p>
      <p>A simple, consistent newsletter can help accomplish that.</p>
      <p>
        You might share a few classroom highlights, include some photos from the week,
        mention an upcoming event, and add a short note from a teacher. The exact format
        matters less than making the information useful and easy for families to follow.
      </p>
      <p>
        Start with a format that works for your school, reuse it when appropriate, and
        build a routine your team can realistically maintain.
      </p>
      <p>
        The easier the process is, the more manageable it becomes to keep families
        informed.
      </p>
      <h2>Less Administrative Friction, More Connection</h2>
      <p>
        Microschools are special because of the relationships they build between students,
        teachers, and families. Communication helps strengthen those relationships.
      </p>
      <p>
        At MudKitchen, we&apos;re building tools to help microschools manage their everyday
        responsibilities without losing sight of what makes their communities special.
      </p>
      <p>
        Our newsletter feature is one small part of that bigger picture: helping school teams
        bring their updates together and share them with the people who care most.
      </p>
      <p>
        If you&apos;re spending too much time putting school communications together, take
        a look at how your current process could be simplified. And if you&apos;d like your
        school operations and family communication to work together more naturally, explore
        what we&apos;re building at{" "}
        <Link href={PRODUCTION_SITE_URL}>MudKitchen</Link>.
      </p>
      <p>
        You already have meaningful things happening at your school. Sharing them with
        families shouldn&apos;t have to be the hard part.
      </p>
    </>
  );
}
