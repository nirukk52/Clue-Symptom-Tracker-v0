/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';

import { citations, tocItems } from '@/content/blog/spoonies-data';

import { PainPointsTable } from './PainPointsTable';
import { SourcesSection } from './SourcesSection';
import { TableOfContents } from './TableOfContents';

/**
 * SpooniesBlogContent - Full article content for spoonies pain points post
 *
 * Why this exists: Contains all the research content, structured for
 * readability with interactive elements, citations, and navigation.
 */

function Cite({ n }: { n: string }) {
  const cite = citations[n];
  if (!cite) return <sup className="text-accent-purple">[{n}]</sup>;
  return (
    <a
      href={cite.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 inline-flex items-center justify-center rounded px-1 py-0.5 text-[10px] font-semibold no-underline transition-colors"
      title={cite.text}
    >
      [{n}]
    </a>
  );
}

function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-accent-purple/30 bg-accent-purple/5 text-text-muted relative my-6 rounded-r-lg border-l-4 py-4 pl-6 pr-4 italic">
      <span className="text-accent-purple/20 absolute -left-3 -top-2 text-4xl">
        "
      </span>
      {children}
    </blockquote>
  );
}

export function SpooniesBlogContent() {
  return (
    <>
      {/* Hero Header */}
      <header className="relative overflow-hidden px-4 pb-16 pt-28 md:px-6 md:pb-20 md:pt-36">
        <div className="from-accent-purple/10 via-accent-blue/5 to-accent-mint/10 absolute inset-0 bg-gradient-to-br" />
        <div className="bg-accent-purple/10 absolute -right-20 -top-20 size-64 rounded-full blur-3xl" />
        <div className="bg-accent-blue/15 absolute -left-20 bottom-0 size-48 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className="bg-accent-purple/20 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
              Research
            </span>
            <span className="text-text-muted text-sm">25 min read</span>
            <span className="text-text-muted text-sm">•</span>
            <span className="text-text-muted text-sm">January 2026</span>
          </div>

          <h1 className="font-display text-primary text-3xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            Experiences of Spoonies with Symptom Tracking Apps
          </h1>

          <p className="text-text-muted mx-auto mt-6 max-w-2xl text-lg md:text-xl">
            A deep dive into the challenges, pain points, and wishlist of
            chronic illness patients when it comes to symptom tracking — based
            on firsthand accounts from Reddit, forums, and patient communities.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              'Spoonie Community',
              'User Research',
              'Pain Points',
              'Product Design',
            ].map((tag) => (
              <span
                key={tag}
                className="border-primary/10 text-text-muted rounded-full border bg-white/80 px-3 py-1 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
        <div className="flex gap-12">
          {/* Table of Contents - Desktop Sidebar */}
          <TableOfContents items={tocItems} />

          {/* Article Content */}
          <article className="prose prose-lg mx-auto max-w-3xl flex-1">
            {/* Who Are Spoonies */}
            <section id="who-are-spoonies" className="mb-12">
              <h2 className="font-display text-primary mb-6 text-2xl font-semibold md:text-3xl">
                Who are "Spoonies"?
              </h2>

              <p className="text-text-muted leading-relaxed">
                The term "Spoonies" refers to people with chronic illnesses who
                relate to the{' '}
                <strong className="text-primary">spoon theory</strong> — a
                metaphor for living with limited daily energy (spoons) due to
                chronic conditions
                <Cite n="1" />
                <Cite n="2" />. Spoonie communities (often women in their
                20s-40s, though inclusive of all ages and genders) have formed
                online to share experiences and coping strategies
                <Cite n="3" />
                <Cite n="4" />.
              </p>

              <p className="text-text-muted mt-4 leading-relaxed">
                One common strategy is symptom tracking: logging daily symptoms,
                triggers, and treatments to find patterns or communicate with
                doctors. However,{' '}
                <em className="text-primary">
                  firsthand accounts from Reddit, forums, and patient groups
                  reveal that many Spoonies struggle with current symptom
                  tracking apps.
                </em>{' '}
                Below we explore their qualitative insights — what challenges
                they face, the most frequent pain points, and what features or
                designs they are asking for in a better solution.
              </p>
            </section>

            {/* Challenges Section */}
            <section id="challenges-pain-points" className="mb-12">
              <h2 className="font-display text-primary mb-6 text-2xl font-semibold md:text-3xl">
                Challenges and Pain Points in Symptom Tracking
              </h2>

              {/* Tracking Exhausting */}
              <div id="tracking-exhausting" className="mb-10">
                <h3 className="font-display text-primary mb-4 text-xl font-semibold">
                  "Tracking symptoms feels like a full-time job."
                </h3>

                <p className="text-text-muted leading-relaxed">
                  A recurring theme is that tracking every symptom every day is{' '}
                  <em>exhausting and overwhelming</em>. Spoonies often juggle
                  dozens of symptoms across multiple chronic conditions, making
                  comprehensive tracking extremely labor-intensive. One patient
                  with five chronic illnesses described having "a page long list
                  of symptoms" daily, plus extra symptoms on flare days
                  <Cite n="5" />.
                </p>

                <Blockquote>
                  Symptom tracking alone could be a full-time job... Trying to
                  log everything in detail left me feeling that I just couldn't
                  keep up. Eventually I quit tracking because it became
                  "mentally too much to track" each day.
                </Blockquote>

                <p className="text-text-muted leading-relaxed">
                  In a Reddit rant titled{' '}
                  <em>"Symptom tracking alone is a full time job,"</em> the
                  author eventually quit tracking because it became mentally too
                  much
                  <Cite n="6" />. Another Spoonie who attempted a bullet journal
                  tracker said writing down everything "would be a full time
                  job… It took so much time and space… I just have too much
                  going on"
                  <Cite n="7" />. This{' '}
                  <strong className="text-primary">
                    sheer burden of effort
                  </strong>{' '}
                  — especially on low-energy days — causes many Spoonies to give
                  up on tracking despite their initial motivation.
                </p>
              </div>

              {/* Fatigue Brain Fog */}
              <div id="fatigue-brain-fog" className="mb-10">
                <h3 className="font-display text-primary mb-4 text-xl font-semibold">
                  Fatigue, brain fog, and pain make tracking hard.
                </h3>

                <p className="text-text-muted leading-relaxed">
                  By definition, Spoonies have limited energy ("spoons"), and
                  many also suffer cognitive symptoms like <em>brain fog</em>.
                  Tracking apps that demand lots of manual input or cognitive
                  attention can be unusable on bad days. As one strategy
                  document noted,{' '}
                  <em>
                    "users with chronic illness... judge cognitive and energy
                    expenditure instantly"
                  </em>{' '}
                  — if an app feels too demanding, they will skip it
                  <Cite n="8" />
                  <Cite n="9" />.
                </p>

                <Blockquote>
                  When your energy is precious, every task costs a spoon. We get
                  it.
                </Blockquote>

                <p className="text-text-muted mt-4 leading-relaxed">
                  Community members say they need{' '}
                  <strong className="text-primary">
                    low-effort tracking options
                  </strong>{' '}
                  for flare days. For example, one person described a{' '}
                  <strong>"low-friction, I'm wiped"</strong> mode — a quick
                  30-second check-in for days when brain fog and exhaustion make
                  complex logging impossible
                  <Cite n="9" />. Without such accommodations, many simply don't
                  track during severe episodes, creating gaps in their records.
                </p>
              </div>

              {/* Forgetting */}
              <div id="forgetting-inconsistency" className="mb-10">
                <h3 className="font-display text-primary mb-4 text-xl font-semibold">
                  Forgetting to log and inconsistency.
                </h3>

                <p className="text-text-muted leading-relaxed">
                  Memory issues and inconsistent routines pose another
                  challenge. Brain fog and busy schedules mean Spoonies often{' '}
                  <em>forget to log symptoms in real time</em>.{' '}
                  <em>
                    "I don't have the best memory so I often lose track of how
                    things change,"
                  </em>{' '}
                  one patient admitted
                  <Cite n="11" />.
                </p>

                <p className="text-text-muted mt-4 leading-relaxed">
                  Unfortunately, if the app isn't extremely easy to access and
                  use, data gets missed. A user of a pain tracking app said,{' '}
                  <em>
                    "It's the best one I've used so far, and typically my only
                    complaint is that I forget to use it."
                  </em>
                  <Cite n="12" />
                </p>

                <p className="text-text-muted mt-4 leading-relaxed">
                  Regular reminders can help, but only if done right. Spoonies
                  appreciate gentle reminders or notifications to log data, yet
                  they dislike when apps nag or make it complicated. In one
                  case, a user noted that Bearable reminded them to take
                  medications but would not allow one-tap logging from the
                  notification — they had to open the app, which frustrated them
                  <Cite n="13" />. In short,{' '}
                  <strong className="text-primary">
                    busy and brain-fogged users need unobtrusive prompts and
                    ultra-simple logging
                  </strong>
                  .
                </p>
              </div>

              {/* Emotional Toll */}
              <div id="emotional-toll" className="mb-10">
                <h3 className="font-display text-primary mb-4 text-xl font-semibold">
                  Emotional toll: anxiety, guilt, and feeling judged.
                </h3>

                <p className="text-text-muted leading-relaxed">
                  Ironically, tracking health can sometimes{' '}
                  <em>make mental health worse</em>. Many Spoonies report
                  feeling{' '}
                  <strong className="text-primary">
                    discouraged, anxious, or guilty
                  </strong>{' '}
                  when using symptom trackers.
                </p>

                <Blockquote>
                  On days I am near giving up on life, the last thing I need is
                  an app giving me all red and sad faces… It makes me feel
                  horrible and gives me major anxiety. I found myself avoiding
                  the app on my worst days because the visual feedback was so
                  demoralizing.
                </Blockquote>

                <p className="text-text-muted mt-4 leading-relaxed">
                  For example, one user shared that Bearable's interface felt{' '}
                  <em>"judgmental"</em> — the app shows color-coded scores and
                  sad-face emojis on bad days
                  <Cite n="14" />
                  <Cite n="15" />. Another chronic pain sufferer agreed that
                  Bearable's standard scale didn't fit their reality: a 6/10
                  might be a <strong>good</strong> day for them, yet the app
                  still displayed a "meh" face as if it wasn't good enough
                  <Cite n="16" />.{' '}
                  <strong className="text-primary">
                    Such one-size-fits-all scales can alienate patients
                  </strong>{' '}
                  who have recalibrated what "okay" means in their life.
                </p>

                <p className="text-text-muted mt-4 leading-relaxed">
                  Beyond app design, the very act of focusing on symptoms can
                  induce anxiety for some. In a POTS forum, one user confessed{' '}
                  <em>
                    "I stopped tracking [my heart rate] because it was giving me
                    too much anxiety"
                  </em>
                  <Cite n="17" />. The{' '}
                  <strong className="text-primary">
                    guilt of missing logs
                  </strong>{' '}
                  is another emotional weight. Over time, many learn to be
                  kinder to themselves:{' '}
                  <em>
                    "I stopped tracking streaks or aiming for consistency just
                    for the sake of it,"
                  </em>{' '}
                  writes one blogger
                  <Cite n="18" />.{' '}
                  <strong className="text-primary">
                    Tracking tools must be emotionally intelligent
                  </strong>{' '}
                  — offering a neutral, supportive tone and flexibility. Users
                  have suggested options like <em>"a neutral mode"</em> with no
                  colors or emoji judgments
                  <Cite n="14" />
                  <Cite n="19" />.
                </p>
              </div>

              {/* Can't capture whole picture */}
              <div id="cant-capture-whole-picture" className="mb-10">
                <h3 className="font-display text-primary mb-4 text-xl font-semibold">
                  Apps can't capture the whole picture.
                </h3>

                <p className="text-text-muted leading-relaxed">
                  Another pain point is that many symptom trackers are too{' '}
                  <strong className="text-primary">
                    inflexible or limited
                  </strong>{' '}
                  to handle the complexity of chronic illnesses. Spoonies report
                  frustration with apps that only allow tracking a few symptoms
                  or that have only preset symptom lists.{' '}
                  <em>
                    "Every app I've used so far either has a limit for how many
                    symptoms I can add, or doesn't include the symptoms I need,"
                  </em>{' '}
                  one user lamented
                  <Cite n="20" />.
                </p>

                <p className="text-text-muted mt-4 leading-relaxed">
                  One Redditor said{' '}
                  <em>
                    "I have an ever growing list of symptoms… keeping them in my
                    notes app just ain't cutting it anymore"
                  </em>
                  <Cite n="21" />
                  <Cite n="22" />. They specifically asked for a tool where{' '}
                  <em>
                    "you can add your own symptoms you want to keep track of."
                  </em>{' '}
                  Lack of customization drove some to creative extremes:{' '}
                  <em>
                    "I couldn't find a single [app] as fully customizable as I
                    wanted, so I asked an Etsy seller to customize [a journal]
                    exactly to my specifications,"
                  </em>{' '}
                  admitted one Spoonie
                  <Cite n="23" />. Others resort to Excel or Google Sheets to
                  create personalized tracking spreadsheets
                  <Cite n="24" />.
                </p>

                <p className="text-text-muted mt-4 leading-relaxed">
                  Even when apps do allow custom symptoms, the <em>process</em>{' '}
                  of setting up dozens of trackers can itself be daunting. A
                  data-savvy patient praised Bearable's flexibility —{' '}
                  <em>
                    "the app is an answer to my prayers; anything I want to
                    analyze I can create a tracker for"
                  </em>{' '}
                  — yet she also confessed that configuring so many data points
                  became overwhelming
                  <Cite n="25" />
                  <Cite n="26" />.{' '}
                  <em>
                    "With lots of data points comes a lot of time in the app,
                    and what ends up happening is I just don't log data… after
                    about a year with the app I'm still setting it up."
                  </em>
                  <Cite n="26" />
                </p>

                <div className="bg-accent-yellow/10 border-accent-yellow/20 my-6 rounded-xl border p-5">
                  <p className="text-primary mb-2 font-medium">
                    💡 Key Insight
                  </p>
                  <p className="text-text-muted text-sm">
                    <strong>
                      Spoonies crave highly customizable tools, but they also
                      struggle with the cognitive load of too many options.
                    </strong>{' '}
                    If an app is a blank slate where the user must manually
                    define every symptom, it can lead to "analysis paralysis."
                    The ideal solution needs to balance flexibility with
                    guidance — e.g. offering templates for common conditions,
                    which users can then tweak.
                  </p>
                </div>
              </div>

              {/* Lack of Insight */}
              <div id="lack-of-insight" className="mb-10">
                <h3 className="font-display text-primary mb-4 text-xl font-semibold">
                  Lack of insight and useful output.
                </h3>

                <p className="text-text-muted leading-relaxed">
                  Many Spoonies endure the tedious task of logging for weeks or
                  months, only to be disappointed by the{' '}
                  <em>lack of actionable insights</em> provided by the app. They
                  want to see patterns, trends, and correlations in their data —
                  otherwise, what is the point of tracking?
                </p>

                <p className="text-text-muted mt-4 leading-relaxed">
                  A common complaint is that some apps <em>collect</em> data but
                  don't truly <em>analyze</em> it in meaningful ways.{' '}
                  <em>
                    "It's been ok for keeping track of things… but not great for
                    insights,"
                  </em>{' '}
                  one long-term user wrote, noting that correlation reports
                  showed relationships but{' '}
                  <em>"does not give correlation values,"</em> making it hard to
                  gauge strength or significance
                  <Cite n="27" />.
                </p>

                <p className="text-text-muted mt-4 leading-relaxed">
                  This user also noted that because the app lumped events into
                  broad 6-hour time blocks, they couldn't tell the sequence of
                  symptom → treatment → outcome within a day.{' '}
                  <strong className="text-primary">
                    Such coarse data resolution frustrated users
                  </strong>{' '}
                  who were trying to pinpoint cause and effect
                  <Cite n="27" />.
                </p>

                <p className="text-text-muted mt-4 leading-relaxed">
                  On the positive side, many <em>love</em> when an app does
                  provide clear charts and graphs.{' '}
                  <em>
                    "I mostly want to record my symptoms and see graphs of how
                    severe or common they are over time,"
                  </em>{' '}
                  wrote one user
                  <Cite n="20" />. Another mentioned,{' '}
                  <em>
                    "I really like the graphs on [the app]; some of them I don't
                    use but most are useful!"
                  </em>
                  <Cite n="28" />
                </p>

                <p className="text-text-muted mt-4 leading-relaxed">
                  Another much-desired insight is{' '}
                  <strong className="text-primary">correlation</strong>:
                  identifying what factors might be making symptoms better or
                  worse.{' '}
                  <em>
                    "It takes away so much stress for me that I don't have to be
                    the one unpacking what is leading to flare ups — I can log
                    everything and it gives me metrics,"
                  </em>{' '}
                  one user said
                  <Cite n="30" />. The bottom line:{' '}
                  <strong className="text-primary">
                    Spoonies want symptom trackers to do more than record data —
                    they want them to crunch the data and highlight useful
                    knowledge.
                  </strong>
                </p>
              </div>

              {/* Doctors don't listen */}
              <div id="doctors-dont-listen" className="mb-10">
                <h3 className="font-display text-primary mb-4 text-xl font-semibold">
                  "Doctors still don't listen to me."
                </h3>

                <p className="text-text-muted leading-relaxed">
                  A driving motivation for many Spoonies to track symptoms is to{' '}
                  <em>provide evidence to healthcare providers</em> — yet this
                  goal is often stymied. Patients frequently report feeling
                  dismissed or not believed by doctors (
                  <em>"no one seems to know what to do with me"</em>
                  <Cite n="32" />
                  ).
                </p>

                <p className="text-text-muted mt-4 leading-relaxed">
                  Sometimes it works:{' '}
                  <em>
                    "Now I have empirical data all in one place… so my doctors
                    can see an accurate assessment of my moods and symptoms,"
                  </em>{' '}
                  wrote one user, who had previously been accused of{' '}
                  <em>"not taking my medication"</em> until they showed
                  objective logs
                  <Cite n="33" />. One migraine patient said,{' '}
                  <em>
                    "My doctor loves when I walk in with the reports since our
                    last visit — he can see how things are going at a glance"
                  </em>
                  <Cite n="35" />.
                </p>

                <Blockquote>
                  I tried bringing extensive data to medical appointments, but
                  f*cking drs would look at my data and say 'why are you here?
                  there's nothing wrong with you!'
                </Blockquote>

                <p className="text-text-muted mt-4 leading-relaxed">
                  However, not all providers are receptive
                  <Cite n="36" />. This kind of <em>medical gaslighting</em> —
                  being told "it's all in your head" despite evidence — is
                  unfortunately common in chronic illness
                  <Cite n="37" />
                  <Cite n="2" />. It leaves patients feeling disheartened: why
                  bother tracking if the doctor ignores it?
                </p>

                <p className="text-text-muted mt-4 leading-relaxed">
                  To combat this, Spoonies express a need for{' '}
                  <strong className="text-primary">
                    better ways to summarize and communicate their tracked data
                  </strong>
                  . They don't want to hand a doctor a raw diary of hundreds of
                  entries; they want concise charts or summaries that{' '}
                  <em>highlight the key patterns</em>. For example, Migraine
                  Buddy app allows sharing data with a specialist
                  <Cite n="38" />. Without good export features, patients either
                  spend their own spoons manually creating charts or risk having
                  their data dismissed.{' '}
                  <strong className="text-primary">
                    Bridging the gap between patient-tracked data and doctor
                    communication is a major unmet need.
                  </strong>
                </p>
              </div>

              {/* Usability Shortcomings */}
              <div id="usability-shortcomings" className="mb-10">
                <h3 className="font-display text-primary mb-4 text-xl font-semibold">
                  Usability and design shortcomings.
                </h3>

                <p className="text-text-muted mb-4 leading-relaxed">
                  Spoonies often critique specific UX/design aspects of current
                  apps that don't align with their needs:
                </p>

                <div className="space-y-4">
                  <div className="border-primary/10 rounded-xl border bg-white p-5">
                    <h4 className="text-primary mb-2 font-semibold">
                      🧠 Cognitive overload & distraction
                    </h4>
                    <p className="text-text-muted text-sm">
                      Those with conditions like ME/CFS or ADHD can be easily
                      overwhelmed by busy interfaces.{' '}
                      <em>
                        "I have to be able to zero in on my main reason for
                        using an app… Apps put community stuff very prominently…
                        extra complexity or steps is just exhausting for my
                        brain,"
                      </em>{' '}
                      wrote one Spoonie
                      <Cite n="42" />
                      <Cite n="13" />.{' '}
                      <strong>Minimalist, focus-first design</strong> is
                      preferred.
                    </p>
                  </div>

                  <div className="border-primary/10 rounded-xl border bg-white p-5">
                    <h4 className="text-primary mb-2 font-semibold">
                      👆 Too many clicks to log data
                    </h4>
                    <p className="text-text-muted text-sm">
                      Speed is of the essence. If logging takes several screens
                      or lots of typing, many won't keep up. Apps that implement{' '}
                      <strong>
                        widgets, one-tap check-ins, voice input, or shortcuts
                      </strong>{' '}
                      earn praise
                      <Cite n="45" />
                      <Cite n="46" />. One emerging solution is{' '}
                      <em>voice-based tracking</em> — letting users simply speak
                      their symptoms instead of navigating a UI.
                    </p>
                  </div>

                  <div className="border-primary/10 rounded-xl border bg-white p-5">
                    <h4 className="text-primary mb-2 font-semibold">
                      👁️ Accessibility and visual design
                    </h4>
                    <p className="text-text-muted text-sm">
                      Chronic illness can involve migraines, vision issues, or
                      sensory sensitivities. Bright or cluttered visuals can be
                      literally painful. Spoonies appreciate{' '}
                      <strong>
                        dark modes, large text options, and simple graphics
                      </strong>
                      . One user troubled by red sad-face icons is a reminder
                      that color and iconography matter
                      <Cite n="14" />.
                    </p>
                  </div>

                  <div className="border-primary/10 rounded-xl border bg-white p-5">
                    <h4 className="text-primary mb-2 font-semibold">
                      ⚙️ Technical issues and reliability
                    </h4>
                    <p className="text-text-muted text-sm">
                      If an app is buggy, crashes, or loses data, it's
                      essentially disqualified. Chronic illness patients have
                      limited patience for tools that <em>cost</em> spoons
                      instead of saving them
                      <Cite n="27" />. Even minor glitches can be magnified when
                      cognitive resources are low. Spoonies value{' '}
                      <strong>reliability and trustworthiness</strong>.
                    </p>
                  </div>

                  <div className="border-primary/10 rounded-xl border bg-white p-5">
                    <h4 className="text-primary mb-2 font-semibold">
                      🔒 Privacy concerns
                    </h4>
                    <p className="text-text-muted text-sm">
                      Privacy is on many people's minds, especially around
                      sensitive data. One user praised that an app's{' '}
                      <em>
                        "period tracking feature rollout included an
                        acknowledgment for the sensitive nature of that data, in
                        a way that was very reassuring."
                      </em>
                      <Cite n="29" /> An app that is transparent about data
                      security builds trust.
                    </p>
                  </div>
                </div>

                <p className="text-text-muted mt-6 leading-relaxed">
                  Finally, it's worth noting that{' '}
                  <strong className="text-primary">preferences can vary</strong>{' '}
                  among Spoonies — some love all-in-one solutions, while others
                  prefer niche tools.{' '}
                  <em>
                    "I'm all for complex apps that eliminate the need for
                    multiple apps, but I also appreciate a solid niche
                    experience,"
                  </em>{' '}
                  one user mused
                  <Cite n="49" />.
                </p>
              </div>
            </section>

            {/* What Spoonies Want */}
            <section id="what-spoonies-want" className="mb-12">
              <h2 className="font-display text-primary mb-6 text-2xl font-semibold md:text-3xl">
                What Spoonies Want in a Symptom Tracking Solution
              </h2>

              <p className="text-text-muted leading-relaxed">
                Despite the struggles, Spoonies are actively sharing ideas for a{' '}
                <em>better</em> symptom tracking experience.{' '}
                <strong className="text-primary">
                  In general, they seek tools that reduce the burden of tracking
                  while increasing the usefulness of the data.
                </strong>{' '}
                Key desires include:
              </p>

              <div className="mt-8 space-y-6">
                <div className="from-accent-purple/10 to-accent-blue/10 rounded-xl bg-gradient-to-r p-6">
                  <h4 className="text-primary mb-3 font-semibold">
                    🎨 High customizability without complexity
                  </h4>
                  <p className="text-text-muted text-sm">
                    Users want to track <em>everything relevant to them</em> —
                    whether that's an uncommon symptom, a specific trigger like
                    "humidity above 80%," or a particular therapy. This requires{' '}
                    <strong>user-defined symptom and factor lists</strong>
                    <Cite n="5" />
                    <Cite n="50" />. At the same time, they need the app to be
                    easy to set up. Many suggest providing{' '}
                    <strong>default templates</strong> for conditions like
                    fibromyalgia, migraine, etc. that can be personalized. The
                    ability to add new symptoms on the fly is crucial
                    <Cite n="51" />
                    <Cite n="52" />.
                  </p>
                </div>

                <div className="from-accent-mint/10 to-accent-blue/10 rounded-xl bg-gradient-to-r p-6">
                  <h4 className="text-primary mb-3 font-semibold">
                    ⚡ Low-effort, spoon-conserving input methods
                  </h4>
                  <p className="text-text-muted text-sm">
                    Spoonies are very clear that input must be quick and easy,
                    especially on low-energy days. Desired features include{' '}
                    <strong>
                      one-tap logging, voice entry, predictive text
                    </strong>
                    , and the ability to log multiple items in one entry
                    <Cite n="44" />
                    <Cite n="35" />. The key is that reminders should simplify
                    logging, not just nag — enabling direct logging from the
                    notification itself
                    <Cite n="13" />.
                  </p>
                </div>

                <div className="from-accent-rose/10 to-accent-yellow/10 rounded-xl bg-gradient-to-r p-6">
                  <h4 className="text-primary mb-3 font-semibold">
                    🛌 Adaptive to "bad days"
                  </h4>
                  <p className="text-text-muted text-sm">
                    Spoonies want an app that <em>understands bad days</em>.
                    This means having a <strong>"low-energy mode"</strong> — a
                    super-simplified daily log interface for flare days: maybe
                    just a few quick questions
                    <Cite n="9" />. Users also want{' '}
                    <strong>forgiveness for missed days</strong> — no loss of
                    streaks, no punitive messages. Celebrating consistency is
                    fine, but the app should reassure users on return.
                  </p>
                </div>

                <div className="from-accent-blue/10 to-accent-purple/10 rounded-xl bg-gradient-to-r p-6">
                  <h4 className="text-primary mb-3 font-semibold">
                    📊 Meaningful insights and pattern recognition
                  </h4>
                  <p className="text-text-muted text-sm">
                    A top request is for apps to <em>do the heavy lifting</em>{' '}
                    of data analysis. Spoonies want{' '}
                    <strong>analytics features</strong> like: trend charts over
                    custom timeframes; correlation matrices that actually
                    quantify relationships
                    <Cite n="27" />; notifications of potential triggers or
                    improvements; and the ability to distinguish sequences of
                    events. Some are looking for{' '}
                    <strong>predictive insights</strong> — warning when a flare
                    might be coming
                    <Cite n="54" />. Data visualization should be simple enough
                    for brain-fog days but detailed enough for "data nerd"
                    patients.
                  </p>
                </div>

                <div className="from-accent-yellow/10 to-accent-mint/10 rounded-xl bg-gradient-to-r p-6">
                  <h4 className="text-primary mb-3 font-semibold">
                    🔗 Integration with other tools and data sources
                  </h4>
                  <p className="text-text-muted text-sm">
                    Because managing chronic illness often involves{' '}
                    <em>multiple apps and devices</em>, Spoonies want{' '}
                    <strong>consolidation of data</strong>. Many want the app to
                    tie into{' '}
                    <strong>Apple Health, Google Fit, or wearables</strong> to
                    automatically import relevant metrics
                    <Cite n="55" />
                    <Cite n="56" />.{' '}
                    <em>"Why can't [the app] use Apple Health data?"</em> one
                    user asked in frustration. The broader theme: Spoonies are
                    tired of juggling five different apps for pain, mood, sleep,
                    meds, etc.
                  </p>
                </div>

                <div className="from-accent-purple/10 to-accent-rose/10 rounded-xl bg-gradient-to-r p-6">
                  <h4 className="text-primary mb-3 font-semibold">
                    👨‍⚕️ Better ways to share with doctors
                  </h4>
                  <p className="text-text-muted text-sm">
                    Spoonies envision a{' '}
                    <strong>"doctor report" generator</strong>: an export that
                    includes graphs of symptom severity over time, a concise
                    list of top correlated triggers, and perhaps a brief
                    narrative summary they can edit
                    <Cite n="60" />
                    <Cite n="61" />. They also appreciate options to share data
                    digitally — for instance, a PDF report or read-only
                    dashboard.{' '}
                    <strong>
                      Having the option to bridge tracking data to healthcare
                      providers is key.
                    </strong>
                  </p>
                </div>

                <div className="from-accent-mint/10 to-accent-yellow/10 rounded-xl bg-gradient-to-r p-6">
                  <h4 className="text-primary mb-3 font-semibold">
                    💰 Affordability and sustainability
                  </h4>
                  <p className="text-text-muted text-sm">
                    Chronic illness often impacts finances (medical bills,
                    reduced work capacity), so cost is a factor. Many look for
                    apps that are free or low-cost, or at least offer a generous
                    free tier
                    <Cite n="44" />
                    <Cite n="35" />. One user explicitly said they liked that an
                    app was <em>"free… it's the best one I've used so far"</em>
                    <Cite n="60" />. Essential tracking and reviewing features
                    should be accessible without forcing a high subscription
                    fee.
                  </p>
                </div>

                <div className="from-accent-blue/10 to-accent-purple/10 rounded-xl bg-gradient-to-r p-6">
                  <h4 className="text-primary mb-3 font-semibold">
                    👥 Community and support (with opt-out)
                  </h4>
                  <p className="text-text-muted text-sm">
                    Feedback on community features is <strong>mixed</strong>.
                    Some like to know they're "not alone" and share tips. But
                    many voiced that they{' '}
                    <strong>
                      do not want social content within their tracking app
                    </strong>
                    .{' '}
                    <em>
                      "Sufferers on social media tend to complain and vent; I
                      need to be in a specific frame of mind to handle that"
                    </em>
                    <Cite n="63" />. A good compromise: offering an optional tab
                    for community that can be hidden or turned off
                    <Cite n="64" />
                    <Cite n="65" />. Patients do value an{' '}
                    <em>active developer presence</em>
                    <Cite n="66" />
                    <Cite n="67" />.
                  </p>
                </div>
              </div>
            </section>

            {/* Pain Points Table */}
            <section id="pain-points-table" className="mb-12">
              <h2 className="font-display text-primary mb-6 text-2xl font-semibold md:text-3xl">
                Pain Points & Solutions Summary
              </h2>

              <p className="text-text-muted mb-6 leading-relaxed">
                The table below highlights the{' '}
                <strong className="text-primary">
                  most common pain points
                </strong>{' '}
                Spoonies report with current symptom trackers, alongside the{' '}
                <strong className="text-primary">solutions or features</strong>{' '}
                they most desire:
              </p>

              <PainPointsTable />

              <p className="text-text-muted mt-4 text-sm italic">
                Sources: Compiled from firsthand user reports on Reddit and
                health forums, app store reviews, and chronic illness community
                discussions.
              </p>
            </section>

            {/* Demographic Insights */}
            <section id="demographic-insights" className="mb-12">
              <h2 className="font-display text-primary mb-6 text-2xl font-semibold md:text-3xl">
                Demographic and Community Insights
              </h2>

              <p className="text-text-muted leading-relaxed">
                It's notable that many Spoonie voices online appear to be{' '}
                <strong className="text-primary">
                  young to middle-aged adults
                </strong>
                , and a large proportion are female. This likely reflects the
                demographics of conditions like autoimmune diseases, ME/CFS,
                fibromyalgia, POTS, and others which often affect women in their
                20s to 40s
                <Cite n="3" />
                <Cite n="4" />. For example, lupus predominantly strikes women
                of childbearing age, and POTS patients are about 80-90% female.
                That said, there are certainly male and older Spoonies as well —
                the community is diverse.
              </p>

              <p className="text-text-muted mt-4 leading-relaxed">
                One cross-cutting factor is that many Spoonies are{' '}
                <strong className="text-primary">
                  tech-savvy out of necessity
                </strong>{' '}
                — they've become "experts" in self-tracking and researching
                their conditions. As one user put it,{' '}
                <em>
                  "I'm a data analyst by nature, and [this app's] flexibility is
                  an answer to my prayers"
                </em>
                <Cite n="25" />. These users often hack together solutions to
                achieve what they need. They represent a community of "health
                detectives" eager for an app that truly <em>gets</em> their
                needs
                <Cite n="70" />.
              </p>

              <p className="text-text-muted mt-4 leading-relaxed">
                Another insight is the{' '}
                <strong className="text-primary">
                  emotional community ethos
                </strong>
                : Spoonies emphasize that{' '}
                <em>it's not laziness or lack of will</em> that sometimes things
                don't get done — it's the illness. The community often reminds
                each other <em>"we are not our diseases,"</em> and to release
                the guilt when the body can't keep up
                <Cite n="3" />. A symptom tracker that aligns with this ethos
                would not punish missed logs or push unrealistic goals, but
                rather adapt to the user's capacity.
              </p>

              <p className="text-text-muted mt-4 leading-relaxed">
                Finally,{' '}
                <strong className="text-primary">trust is crucial</strong>:
                Spoonies tend to share app recommendations by word-of-mouth in
                their forums, and an app that consistently listens to user
                feedback can quickly gain a loyal following
                <Cite n="71" />. On the flip side, any missteps spread fast
                among these tight-knit communities. Thus,{' '}
                <em>building alongside the Spoonie community</em> — through beta
                testing, soliciting stories, and iterating on their input — is
                perhaps one of the smartest moves for anyone creating a new
                symptom tracking solution.
              </p>
            </section>

            {/* Conclusion */}
            <section id="conclusion" className="mb-12">
              <h2 className="font-display text-primary mb-6 text-2xl font-semibold md:text-3xl">
                Conclusion
              </h2>

              <p className="text-text-muted leading-relaxed">
                Spoonies are united by the daily challenge of managing chronic
                illnesses, and symptom tracking is one tool that can empower
                them — but only if it's designed with their realities in mind.
                The research above highlights that{' '}
                <strong className="text-primary">
                  current apps often fall short
                </strong>
                : they can be too labor-intensive, not personalized enough,
                emotionally taxing, and not integrative of the bigger health
                picture.
              </p>

              <p className="text-text-muted mt-4 leading-relaxed">
                Yet, Spoonies are also very clear about what they <em>want</em>{' '}
                in a better solution. They envision a tracker that is{' '}
                <strong className="text-primary">
                  flexible but easy, powerful in analysis but gentle in
                  interface
                </strong>
                , one that saves them energy rather than consuming it. Features
                like quick logging, unlimited custom symptom lists, automatic
                pattern-finding, and professional reporting capabilities stand
                out.
              </p>

              <Blockquote>
                I genuinely like this app, I just… want it to be so good that I
                rarely need to open it except to view correlations.
              </Blockquote>

              <p className="text-text-muted mt-4 leading-relaxed">
                This sentiment
                <Cite n="72" /> captures the dream:{' '}
                <strong className="text-primary">
                  a low-effort, high-impact tool that quietly does the heavy
                  lifting in the background
                </strong>
                , freeing patients to spend their limited spoons on living life
                rather than incessantly tracking it.
              </p>

              <p className="text-text-muted mt-4 leading-relaxed">
                In essence, Spoonies are looking for a symptom tracker that
                feels less like a strict ledger and more like a{' '}
                <strong className="text-primary">helpful companion</strong> —
                one that adapts to their needs, validates their experiences, and
                ultimately helps turn the chaos of chronic illness into clearer
                data and informed action.
              </p>

              <div className="from-accent-purple/10 via-accent-blue/10 to-accent-mint/10 border-primary/5 mt-8 rounded-2xl border bg-gradient-to-r p-8">
                <p className="text-primary font-display mb-3 text-xl font-semibold">
                  The Bottom Line
                </p>
                <p className="text-text-muted">
                  <strong>
                    Spoonies need symptom tracking tools that truly understand
                    the spoon theory life
                  </strong>{' '}
                  — simplifying tasks, respecting limitations, and empowering
                  them with insights without adding burden. By learning from
                  their lived experiences, we can prioritize the features and
                  design choices that matter most to this community
                  <Cite n="76" />
                  <Cite n="35" />.
                </p>
              </div>
            </section>

            {/* Sources */}
            <section id="sources" className="mb-12">
              <h2 className="font-display text-primary mb-6 text-2xl font-semibold md:text-3xl">
                Sources
              </h2>
              <SourcesSection />
            </section>
          </article>
        </div>
      </div>

      {/* CTA Section */}
      <section className="from-accent-purple/10 via-accent-blue/10 to-accent-mint/10 bg-gradient-to-r px-4 py-20 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-primary text-3xl font-semibold md:text-4xl">
            Built for the Spoonie community
          </h2>
          <p className="text-text-muted mt-4 text-lg">
            Chronic Life is designed with everything we learned from this
            research. Quick check-ins, no judgment, real insights.
          </p>
          <Link
            href="/"
            className="bg-primary hover:bg-primary/90 mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-white transition-all hover:shadow-lg"
          >
            Get Early Access
            <span>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
