import type { Metadata } from "next"
import { PageIntro, Section } from "@/components/site/Section"
import { MailchimpNewsletterForm } from "@/components/site/forms/MailchimpNewsletterForm"

export const metadata: Metadata = {
  title: "The APEX Newsletter",
  description: "Israel's AI frontier, from the people building it. Takeaways, upcoming events, builders and open roles from the APEX community.",
  alternates: { canonical: "/newsletter" },
}

const topics = [
  { label: "What happened", text: "The sharpest takeaways from our latest sessions and evenings." },
  { label: "What's next", text: "Upcoming APEX events, with the link to request a spot." },
  { label: "Builders", text: "Milestones from APEX alumni and the founders around us." },
  { label: "Open roles", text: "Hiring calls from frontier AI teams in the community." },
]

/** The hairline that opens a section, for sections without a label. */
function SectionRule() {
  return <div aria-hidden="true" className="section-head mb-10 md:mb-14" />
}

export default function NewsletterPage() {
  return (
    <>
      <PageIntro scene="approach" label="The APEX Newsletter" titleId="newsletter-title" title="Israel's AI frontier, from the people building it.">
        <p className="lede reveal mt-8 max-w-[40ch]">Our read on what matters for Israel&apos;s AI builders, in one short email.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="#subscribe" className="btn btn-primary">
            Subscribe
          </a>
        </div>
      </PageIntro>

      <Section scene="route" labelledBy="topics-title">
        <SectionRule />
        <h2 id="topics-title" className="h-section reveal max-w-[14ch]">
          What we dive into.
        </h2>
        <ol className="hairlines reveal mt-12 border-y border-rule/15 md:mt-16">
          {topics.map((t) => (
            <li key={t.label} className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <p className="label pt-1.5">{t.label}</p>
              <p className="font-display text-[clamp(1.25rem,1.05rem+0.8vw,1.75rem)] font-medium leading-snug tracking-[-0.02em] text-ink">{t.text}</p>
            </li>
          ))}
        </ol>
        {/* CADENCE: the home page says "quarterly". Align both before launch. */}
        <p className="h-card reveal mt-12 max-w-[34ch] md:mt-16">One email, every other Sunday evening. Unsubscribe any time.</p>
      </Section>

      <Section id="subscribe" scene="summit" label="Subscribe" labelledBy="subscribe-title">
        <h2 id="subscribe-title" className="h-section reveal max-w-[14ch]">
          Get the next issue.
        </h2>
        <div className="reveal mt-12 md:mt-16">
          <MailchimpNewsletterForm />
        </div>
      </Section>
    </>
  )
}
