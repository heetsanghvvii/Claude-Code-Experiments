import { useRef, useState, type FormEvent, type ReactNode } from "react"
import { ArrowRight, Check, ArrowDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const CTA = "Get my target list"

function goToIntake(e?: React.MouseEvent) {
  e?.preventDefault()
  const el = document.getElementById("intake")
  if (!el) return
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  window.setTimeout(() => document.getElementById("f-name")?.focus({ preventScroll: true }), reduce ? 0 : 600)
  history.replaceState(null, "", "#intake")
}

function CtaButton({ variant = "ink", className, children = CTA }: { variant?: "ink" | "brass"; className?: string; children?: ReactNode }) {
  return (
    <a href="#intake" onClick={goToIntake} className={cn(variant === "ink" ? "btn-primary" : "btn-brass", "group", className)}>
      {children}
      <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  )
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-serif text-[22px] font-semibold tracking-tight", light ? "text-paper" : "text-ink")}>
      <svg aria-hidden width="20" height="26" viewBox="0 0 20 26" fill="none">
        <path d="M1 25V10a9 9 0 0 1 18 0v15" stroke="currentColor" strokeWidth="2" />
        <path d="M5 25V11.5L13 9v16" fill={light ? "#D4A458" : "#87591A"} />
        <circle cx="11" cy="17" r="1.2" fill={light ? "#14302A" : "#F6F1E7"} />
      </svg>
      Knock
    </span>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <a href="#top" aria-label="Knock, back to top"><Logo /></a>
        <nav aria-label="Main" className="hidden items-center gap-8 text-[15px] text-moss md:flex">
          <a className="hover:text-ink" href="#how">How it works</a>
          <a className="hover:text-ink" href="#example">Example</a>
          <a className="hover:text-ink" href="#packages">Packages</a>
          <a className="hover:text-ink" href="#faq">FAQ</a>
        </nav>
        <CtaButton className="px-4 py-2.5 text-sm sm:px-5" />
      </div>
    </header>
  )
}

function Door() {
  return (
    <div aria-hidden className="relative mx-auto w-[210px] sm:w-[250px] lg:w-[300px]">
      <div className="relative aspect-[5/8]">
        {/* frame */}
        <div className="absolute inset-0 rounded-t-full border-[10px] border-b-0 border-[#0D221D] bg-[#0D221D] shadow-[0_0_0_1px_rgba(212,164,88,.25)]" />
        {/* doorway with light */}
        <div className="absolute inset-[10px] bottom-0 overflow-hidden rounded-t-full [perspective:900px]">
          <div className="door-light absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_60%,#FBE3B0_0%,#E8B868_38%,#B47E35_75%,#6E4A1C_100%)]" />
          {/* leaf */}
          <div className="door-leaf-3d absolute inset-0 origin-left rounded-t-full bg-[linear-gradient(90deg,#1E4038,#183831)] shadow-[inset_-1px_0_0_rgba(212,164,88,.35)]">
            <div className="absolute inset-x-[16%] top-[22%] h-[30%] rounded-t-full border border-brass/25" />
            <div className="absolute inset-x-[16%] bottom-[8%] h-[30%] rounded-sm border border-brass/25" />
            <div className="absolute right-[12%] top-[56%] h-3 w-3 rounded-full bg-brass shadow-[0_0_0_3px_rgba(212,164,88,.25)]" />
          </div>
        </div>
      </div>
      {/* light spilling onto the floor */}
      <div className="door-light mx-auto h-24 w-[86%] bg-[linear-gradient(180deg,rgba(232,184,104,.55),rgba(232,184,104,0))] [clip-path:polygon(8%_0,92%_0,100%_100%,-20%_100%)]" />
    </div>
  )
}

function Hero() {
  return (
    <section id="top" className="on-ink grain relative overflow-hidden bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-6 pt-14 md:px-8 md:pt-20 lg:grid-cols-[1.25fr_1fr] lg:gap-8 lg:pb-0 lg:pt-24">
        <div className="lg:pb-24">
          <p className="eyebrow text-brass">Knock on the right door</p>
          <h1 className="mt-5 text-[44px] font-medium leading-[1.02] sm:text-6xl lg:text-[76px]">
            Stop applying.<br />
            <em className="font-normal italic text-brass">Start conversations.</em>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-paper/85">
            We find the hiring managers, team members and alumni at your target companies, research each one, and start real conversations that turn into referrals and interviews.
          </p>
          <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <CtaButton variant="brass" className="px-7 py-4 text-base" />
            <a href="#how" className="inline-flex items-center gap-2 text-[15px] text-paper/80 underline-offset-4 hover:text-paper hover:underline">
              See how it works <ArrowDown aria-hidden className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-8 max-w-md border-l border-brass/40 pl-4 text-sm leading-relaxed text-paper/75">
            For MBA graduates and people moving into product. You approve every message, and it goes from your own LinkedIn.
          </p>
        </div>
        <div className="flex justify-center lg:self-end">
          <Door />
        </div>
      </div>
    </section>
  )
}

function SectionHead({ eyebrow, title, children, light = false }: { eyebrow: string; title: ReactNode; children?: ReactNode; light?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className={cn("eyebrow", light ? "text-brass" : "text-brass-deep")}>{eyebrow}</p>
      <h2 className={cn("mt-4 text-[34px] font-medium leading-[1.1] sm:text-[44px]", light ? "text-paper" : "text-ink")}>{title}</h2>
      {children && <div className={cn("mt-5 text-lg leading-relaxed", light ? "text-paper/80" : "text-moss")}>{children}</div>}
    </div>
  )
}

function Problem() {
  const rows = ["Product Manager, consumer app", "Associate PM, fintech", "Growth PM, quick commerce", "APM programme, SaaS", "Product Analyst, edtech"]
  return (
    <section aria-labelledby="problem-h" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow text-brass-deep">The problem</p>
          <h2 id="problem-h" className="mt-4 text-[34px] font-medium leading-[1.1] text-ink sm:text-[44px]">
            Hundreds of applications. No callbacks.
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-moss">
            <p>You have tailored the CV, written the cover notes, refreshed the portals every morning. And heard nothing back.</p>
            <p>It is not you. Job portals are a queue, and the queue is long. Meanwhile the roles you want are often filled through a conversation, a nudge, a referral from someone inside.</p>
          </div>
          <p className="mt-8 font-serif text-2xl italic text-ink">People hire people.</p>
        </div>
        <figure className="relative">
          <figcaption className="sr-only">Illustration: a queue of portal applications with no response, beside one conversation that got a reply.</figcaption>
          <div aria-hidden className="space-y-2.5">
            {rows.map((r, i) => (
              <div key={r} className="flex items-center justify-between rounded-md border border-ink/10 bg-white/50 px-4 py-3 text-sm" style={{ opacity: 1 - i * 0.12 }}>
                <span className="truncate text-charcoal">{r}</span>
                <span className="ml-3 shrink-0 text-moss">Applied · no response</span>
              </div>
            ))}
          </div>
          <div aria-hidden className="relative mt-6 rounded-lg bg-ink p-5 text-paper shadow-[0_20px_40px_-20px_rgba(20,48,42,.6)] sm:ml-10">
            <div className="flex items-center justify-between text-xs">
              <span className="eyebrow text-brass">A conversation</span>
              <span className="text-paper/70">Replied</span>
            </div>
            <p className="mt-3 font-serif text-lg leading-snug">"Happy to chat. Our team is hiring for exactly this, let me put you in touch."</p>
          </div>
        </figure>
      </div>
    </section>
  )
}

const steps = [
  { t: "You pick your targets", d: "Tell us the companies and roles you want. A short form, then a quick call to understand your story." },
  { t: "We find the right people", d: "Hiring managers, team members, alumni and senior people who can introduce you, at each company." },
  { t: "We write the first message", d: "One personal note for each person, built on something you genuinely share. You approve every one." },
  { t: "We guide every reply", d: "Each response gets a drafted next step, until the conversation becomes a referral or an interview." },
]

function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-h" className="scroll-mt-16 bg-linen">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow text-brass-deep">How it works</p>
            <h2 id="how-h" className="mt-4 text-[34px] font-medium leading-[1.1] text-ink sm:text-[44px]">Four steps from a target list to an interview.</h2>
          </div>
          <p className="inline-flex items-center gap-2 self-start rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink lg:self-auto">
            <Check aria-hidden className="h-4 w-4 text-brass-deep" /> You approve every message
          </p>
        </div>
        <ol className="mt-14 grid gap-0 md:grid-cols-4 md:gap-6">
          {steps.map((s, i) => (
            <li key={s.t} className="relative flex gap-5 pb-10 md:block md:pb-0">
              {/* connector */}
              <span aria-hidden className={cn("absolute left-[19px] top-11 h-[calc(100%-2.75rem)] w-px bg-ink/20 md:left-11 md:top-5 md:h-px md:w-[calc(100%-1.5rem)]", i === steps.length - 1 && "hidden")} />
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink bg-paper font-serif text-lg text-ink">{i + 1}</span>
              <div className="md:mt-6">
                <h3 className="text-xl font-medium text-ink">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-moss">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const reasons = [
  { k: "60", unit: "people, not 6,000 messages", d: "A hand-picked list of the people who can actually move your application, at the companies you chose." },
  { k: "1:1", unit: "every message, one reader", d: "Each note is written for one person, from real research. Nothing is a template with a name swapped in." },
  { k: "Talk", unit: "first, ask later", d: "We open with a genuine question. The referral comes once there is a relationship to ask from." },
  { k: "Proven", unit: "playbook, borrowed", d: "Built on how modern sales teams create meetings with busy people, adapted for careers." },
]

function WhyItWorks() {
  return (
    <section aria-labelledby="why-h" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <SectionHead eyebrow="Why it works" title={<span id="why-h">Fewer doors. The right ones.</span>}>
        <p>Spray-and-pray outreach gets ignored for the same reason portal applications do. Knock does the opposite.</p>
      </SectionHead>
      <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-ink/10 bg-ink/10 sm:grid-cols-2">
        {reasons.map((r) => (
          <div key={r.unit} className="bg-paper p-7 sm:p-9">
            <p className="font-serif text-ink">
              <span className="text-[44px] font-medium leading-none">{r.k}</span>
              <span className="ml-3 text-lg italic text-brass-deep">{r.unit}</span>
            </p>
            <p className="mt-4 max-w-md leading-relaxed text-moss">{r.d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Example() {
  const notes = [
    { t: "A real shared path", d: "Both moved from a large company into product. That is the reason to talk." },
    { t: "One honest question", d: "Easy to answer from a phone, in a minute, without feeling sold to." },
    { t: "No ask, yet", d: "No CV, no referral request. That comes later, if the conversation earns it." },
  ]
  return (
    <section id="example" aria-labelledby="example-h" className="on-ink scroll-mt-16 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
        <div>
          <SectionHead light eyebrow="An example first message" title={<span id="example-h">Short, specific, and actually about them.</span>}>
            <p>This is what a Knock first message looks like. Under forty words, sent from your own LinkedIn, after you approve it.</p>
          </SectionHead>
          <ul className="mt-10 space-y-6">
            {notes.map((n, i) => (
              <li key={n.t} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brass/60 text-sm text-brass">{i + 1}</span>
                <div>
                  <p className="font-semibold text-paper">{n.t}</p>
                  <p className="mt-1 leading-relaxed text-paper/75">{n.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <figure className="relative">
          <div className="rounded-xl bg-paper p-6 text-charcoal shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] sm:p-8">
            <div className="flex items-center gap-3 border-b border-ink/10 pb-5">
              <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-linen font-serif text-lg text-ink">R</span>
              <div className="min-w-0">
                <p className="font-semibold text-ink">To: Rahul</p>
                <p className="truncate text-sm text-moss">Product Manager at Zepto, previously Flipkart</p>
              </div>
            </div>
            <blockquote className="mt-6">
              <p className="font-serif text-[22px] leading-[1.45] text-ink sm:text-2xl">
                Hey Rahul, saw you moved from Flipkart into product at Zepto. I'm making a similar jump from brand management. Curious, what was the biggest adjustment for you?
              </p>
            </blockquote>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink/10 pt-5 text-sm text-moss">
              <span className="inline-flex items-center gap-1.5"><Check aria-hidden className="h-4 w-4 text-brass-deep" /> Approved by you</span>
              <span className="inline-flex items-center gap-1.5"><Check aria-hidden className="h-4 w-4 text-brass-deep" /> Sent from your LinkedIn</span>
            </div>
          </div>
          <figcaption className="mt-4 text-sm text-paper/70">Illustrative example. Names and companies change for every candidate.</figcaption>
        </figure>
      </div>
    </section>
  )
}

const packs = [
  { name: "Sprint", days: "7 days", people: "60", price: "2,499", blurb: "A focused push on a short list of companies." },
  { name: "Standard", days: "14 days", people: "120", price: "3,999", blurb: "Room for follow-ups and a broader set of targets.", popular: true },
  { name: "Full search", days: "21 days", people: "180", price: "5,499", blurb: "For a complete search across your whole shortlist." },
]
const included = ["Target list", "Research on every person", "Personal first messages", "Reply drafts for every conversation", "Weekly results report"]

function Packages() {
  return (
    <section id="packages" aria-labelledby="packages-h" className="scroll-mt-16 bg-linen">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <SectionHead eyebrow="Packages" title={<span id="packages-h">Founding member pricing.</span>}>
          <p>One payment, no subscription. Every package includes the full service; they differ in length and reach.</p>
        </SectionHead>
        <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {packs.map((p) => (
            <article key={p.name} className={cn("relative flex flex-col rounded-xl p-7 sm:p-8", p.popular ? "on-ink bg-ink text-paper shadow-[0_30px_60px_-30px_rgba(20,48,42,.7)] lg:-my-4 lg:py-12" : "border border-ink/15 bg-paper text-charcoal")}>
              {p.popular && <p className="absolute -top-3 left-7 rounded-full bg-brass px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink lg:top-5 lg:left-auto lg:right-6">Most popular</p>}
              <h3 className={cn("text-2xl font-medium", p.popular ? "text-paper" : "text-ink")}>{p.name}</h3>
              <p className={cn("mt-2", p.popular ? "text-paper/75" : "text-moss")}>{p.blurb}</p>
              <p className={cn("mt-7 font-serif", p.popular ? "text-paper" : "text-ink")}>
                <span className="text-2xl align-top">₹</span><span className="text-5xl font-medium">{p.price}</span>
                <span className="sr-only"> rupees</span>
              </p>
              <dl className={cn("mt-6 grid grid-cols-2 gap-4 border-y py-5", p.popular ? "border-paper/15" : "border-ink/10")}>
                <div><dt className={cn("text-xs uppercase tracking-wider", p.popular ? "text-paper/70" : "text-moss")}>Duration</dt><dd className="mt-1 text-lg font-semibold">{p.days}</dd></div>
                <div><dt className={cn("text-xs uppercase tracking-wider", p.popular ? "text-paper/70" : "text-moss")}>People contacted</dt><dd className="mt-1 text-lg font-semibold">{p.people}</dd></div>
              </dl>
              <div className="mt-auto pt-7">
                <CtaButton variant={p.popular ? "brass" : "ink"} className="w-full" />
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 grid gap-8 rounded-xl border border-ink/15 bg-paper/60 p-7 sm:p-9 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h3 className="text-xl font-medium text-ink">Every package includes</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {included.map((x) => (
                <li key={x} className="flex items-start gap-2.5 text-charcoal"><Check aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brass-deep" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="border-t border-ink/10 pt-7 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
            <p className="eyebrow text-brass-deep">Done for you</p>
            <p className="mt-3 text-lg leading-relaxed text-charcoal">Prefer to hand it over? We run the outreach end to end, from <span className="font-semibold text-ink">₹14,999</span>.</p>
            <a href="#intake" onClick={goToIntake} className="mt-4 inline-flex items-center gap-2 font-semibold text-ink underline decoration-brass-deep underline-offset-4 hover:decoration-2">{CTA} <ArrowRight aria-hidden className="h-4 w-4" /></a>
          </div>
        </div>
        <p className="mt-6 text-sm text-moss">We do not guarantee replies. We do guarantee the work: researched people and personal messages, every day of your package.</p>
      </div>
    </section>
  )
}

const faqs = [
  { q: "Is this spam?", a: "No. Spam is the same message to thousands of strangers. Knock contacts around 60 researched people per week, and every message is written for one person, based on something you genuinely share." },
  { q: "Will my LinkedIn get banned?", a: "We stay well under LinkedIn's limits, and you send everything from your own account at a natural pace. There is no automation tool logging into your profile." },
  { q: "Do you write as me?", a: "Yes, in your voice and from your story. You approve every message before it goes, and you can edit anything." },
  { q: "Who is this for?", a: "To start, MBA graduates and final-year students, and professionals moving into product management roles in India." },
  { q: "What if nobody replies?", a: "Founding members get a free extra week if fewer than 5 people reply." },
]

function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-h" className="scroll-mt-16 mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <SectionHead eyebrow="Questions" title={<span id="faq-h">The honest answers.</span>}>
          <p>Something else on your mind? Write to <a className="font-medium text-ink underline decoration-brass-deep underline-offset-4" href="mailto:hello@knock.careers">hello@knock.careers</a>.</p>
        </SectionHead>
        <Accordion type="single" collapsible defaultValue="item-0" className="border-t border-ink/15">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-ink/15">
              <AccordionTrigger className="py-6 text-left font-serif text-xl font-medium text-ink hover:no-underline [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-brass-deep">{f.q}</AccordionTrigger>
              <AccordionContent className="pb-6 pr-8 text-base leading-relaxed text-moss">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

type Field = { id: string; name: string; label: string; type?: string; placeholder: string; autoComplete?: string; hint?: string; wide?: boolean }
const fields: Field[] = [
  { id: "f-name", name: "name", label: "Full name", placeholder: "Ananya Rao", autoComplete: "name" },
  { id: "f-email", name: "email", label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email" },
  { id: "f-linkedin", name: "linkedin", label: "LinkedIn URL", placeholder: "linkedin.com/in/yourname", autoComplete: "url" },
  { id: "f-role", name: "role", label: "Target role", placeholder: "Associate Product Manager" },
  { id: "f-companies", name: "companies", label: "Target companies", placeholder: "Zepto, Swiggy, Razorpay, CRED", hint: "Separate with commas", wide: true },
  { id: "f-city", name: "city", label: "City", placeholder: "Bengaluru", autoComplete: "address-level2" },
]

function validate(v: Record<string, string>) {
  const e: Record<string, string> = {}
  if (!v.name?.trim()) e.name = "Please add your name."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email?.trim() || "")) e.email = "Please enter a valid email address."
  if (!/linkedin\.com\/(in|pub)\/[^\s/]+/i.test(v.linkedin?.trim() || "")) e.linkedin = "Please paste your profile link, like linkedin.com/in/yourname."
  if (!v.role?.trim()) e.role = "Which role are you aiming for?"
  if (!v.companies?.trim()) e.companies = "Add at least one company."
  if (!v.city?.trim()) e.city = "Please add your city."
  return e
}

function Intake() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState<{ name: string; email: string } | null>(null)
  const successRef = useRef<HTMLDivElement>(null)

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const data = Object.fromEntries(new FormData(ev.currentTarget)) as Record<string, string>
    const e = validate(data)
    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) {
      document.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus()
      return
    }
    setDone({ name: data.name.trim().split(/\s+/)[0], email: data.email.trim() })
    window.setTimeout(() => successRef.current?.focus(), 30)
  }

  return (
    <section id="intake" aria-labelledby="intake-h" className="on-ink grain scroll-mt-16 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div>
          <SectionHead light eyebrow="Start here" title={<span id="intake-h">Get your target list.</span>}>
            <p>Tell us where you want to work. We will come back with the people we would contact first at each company, and why.</p>
          </SectionHead>
          <ul className="mt-8 space-y-3 text-paper/80">
            {["Takes about two minutes", "No payment to see your list", "We reply within two working days"].map((x) => (
              <li key={x} className="flex items-center gap-2.5"><Check aria-hidden className="h-4 w-4 text-brass" />{x}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-paper p-6 text-charcoal sm:p-9">
          {done ? (
            <div ref={successRef} tabIndex={-1} role="status" className="flex min-h-[420px] flex-col justify-center outline-none">
              <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-brass"><Check className="h-7 w-7" /></span>
              <h3 className="mt-6 text-3xl font-medium text-ink">Thank you, {done.name}. We are on it.</h3>
              <p className="mt-4 text-lg leading-relaxed text-moss">
                We have your targets. Your list will arrive at <span className="font-semibold text-ink break-all">{done.email}</span> within two working days, with the people we would knock on first.
              </p>
              <button type="button" onClick={() => { setDone(null); setErrors({}) }} className="mt-8 self-start text-sm font-semibold text-ink underline decoration-brass-deep underline-offset-4">
                Submit another request
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
              {fields.map((f) => {
                const err = errors[f.name]
                const desc = [f.hint && `${f.id}-hint`, err && `${f.id}-err`].filter(Boolean).join(" ") || undefined
                return (
                  <div key={f.id} className={cn("flex flex-col gap-2", f.wide && "sm:col-span-2")}>
                    <Label htmlFor={f.id} className="text-sm font-semibold text-ink">{f.label}</Label>
                    <Input
                      id={f.id}
                      name={f.name}
                      type={f.type || "text"}
                      placeholder={f.placeholder}
                      autoComplete={f.autoComplete}
                      aria-invalid={err ? true : undefined}
                      aria-describedby={desc}
                      className={cn(
                        "h-12 rounded-md border-[#9C9482] bg-white px-4 text-base text-charcoal placeholder:text-[#6B716C] md:text-base focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-brass-deep focus-visible:ring-0",
                        err && "border-[#A33A22]"
                      )}
                    />
                    {f.hint && <p id={`${f.id}-hint`} className="text-sm text-moss">{f.hint}</p>}
                    {err && <p id={`${f.id}-err`} className="text-sm font-medium text-[#A33A22]">{err}</p>}
                  </div>
                )
              })}
              <div className="pt-2 sm:col-span-2">
                <button type="submit" className="btn-primary w-full py-4 text-base">
                  {CTA} <ArrowRight aria-hidden className="h-4 w-4" />
                </button>
                <p className="mt-4 text-center text-sm text-moss">We only use these details to build your list.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#0D221D] text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <Logo light />
          <p className="mt-3 font-serif text-lg italic text-paper/80">Knock on the right door.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-paper/75 md:items-end">
          <a href="mailto:hello@knock.careers" className="text-base font-medium text-paper underline decoration-brass underline-offset-4">hello@knock.careers</a>
          <p>© 2026 Knock. Made in India.</p>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-paper focus:px-4 focus:py-2 focus:text-ink">Skip to content</a>
      <Header />
      <main id="main">
        <Hero />
        <Problem />
        <HowItWorks />
        <WhyItWorks />
        <Example />
        <Packages />
        <Faq />
        <Intake />
      </main>
      <Footer />
    </>
  )
}
