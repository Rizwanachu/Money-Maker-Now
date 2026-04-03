import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, BarChart3, CheckCircle2, Quote } from "lucide-react";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const TESTIMONIALS = [
  {
    quote: "I used to spend 3 hours on every proposal. Now I have a polished, structured draft in under 5 minutes. My conversion rate went from 22% to 41% in two months.",
    name: "Riya Sharma",
    title: "Founder, Studio RS Digital",
  },
  {
    quote: "ProposAI nails the tone every time. The Executive Summary alone has convinced clients who were on the fence. It's like having a senior copywriter on call.",
    name: "Arjun Mehta",
    title: "Independent Marketing Consultant",
  },
  {
    quote: "I closed a ₹2.4L project on my very first ProposAI-generated proposal. The structured sections and professional language made all the difference.",
    name: "Priya Nair",
    title: "UI/UX Designer & Freelancer",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Describe the client",
    description: "Enter the client's name, pick your niche, and paste their brief or requirement. Takes 60 seconds.",
  },
  {
    step: "2",
    title: "AI writes the proposal",
    description: "Our AI generates 7 structured sections — Executive Summary, Approach, Timeline, Investment, and more — in under 10 seconds.",
  },
  {
    step: "3",
    title: "Refine and send",
    description: "Edit any section in-app, update the deal status as you go, and track your win rate across all proposals.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="h-16 flex items-center justify-between px-6 lg:px-12 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">P</div>
          <span>ProposAI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link href="/sign-up" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            Get Started Free
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 lg:px-12 pt-24 pb-32 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground mb-8">
              AI proposal generator for agencies &amp; freelancers
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8 leading-[1.08]">
              Close More Deals With<br className="hidden md:block" /> Proposals That Learn What Works.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop writing proposals from scratch. ProposAI uses AI to generate professional, client-specific proposals in seconds — so you spend less time writing and more time winning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up" className="inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8">
                Start Free — No Card Needed <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Free plan includes 3 proposals. No credit card required.</p>
          </motion.div>
        </section>

        {/* Stats bar */}
        <FadeIn>
          <div className="border-y border-border/40 bg-slate-50/60 py-8">
            <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-foreground">3 min</div>
                <div className="text-sm text-muted-foreground mt-1">Average proposal time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">7</div>
                <div className="text-sm text-muted-foreground mt-1">Structured sections generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">2x</div>
                <div className="text-sm text-muted-foreground mt-1">Average win rate improvement</div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* How it works */}
        <section id="how-it-works" className="py-24 max-w-6xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Automated proposal writing in three steps</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">The fastest way to write a winning business proposal. No templates, no guesswork — just results.</p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.1}>
                <div className="relative p-8 rounded-2xl border bg-card hover:shadow-md transition-shadow">
                  <div className="text-5xl font-black text-primary/10 mb-4 leading-none">{step.step}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Value Prop Section */}
        <section className="bg-slate-50 py-24 border-y border-border/40">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The freelancer proposal tool that pays for itself</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">ProposAI is built for consultants, agencies, and freelancers who want to win more clients without the overhead.</p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "Speed Without Sacrifice",
                  desc: "Generate 80% of your proposal in seconds using AI. Spend your time refining strategy — not writing boilerplate.",
                },
                {
                  icon: <Target className="h-6 w-6" />,
                  title: "Precision Messaging",
                  desc: "AI understands consulting frameworks. It crafts executive summaries and approaches that speak directly to client ROI.",
                },
                {
                  icon: <BarChart3 className="h-6 w-6" />,
                  title: "Track Your Win Rate",
                  desc: "Know what works. Mark proposals as Sent, Won, or Lost — and track your pipeline performance in real time.",
                },
              ].map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.1}>
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 max-w-6xl mx-auto px-6 lg:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by consultants who win deals</h2>
              <p className="text-lg text-muted-foreground">Real results from agencies and freelancers using AI-powered proposal writing.</p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="rounded-2xl border bg-card p-8 flex flex-col gap-6 h-full hover:shadow-md transition-shadow">
                  <Quote className="h-8 w-8 text-primary/30 -mt-1" />
                  <p className="text-foreground leading-relaxed flex-1">"{t.quote}"</p>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.title}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50 border-t border-border/40">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                <p className="text-lg text-muted-foreground">One winning proposal pays for months of ProposAI. Try free, upgrade when you're ready.</p>
              </div>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <FadeIn delay={0}>
                <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-8 flex flex-col h-full">
                  <h3 className="text-xl font-bold mb-2">Free</h3>
                  <p className="text-3xl font-bold mb-1">Free</p>
                  <p className="text-xs text-muted-foreground mb-6">Forever</p>
                  <p className="text-sm text-muted-foreground mb-6">Perfect for trying out the workflow.</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="text-sm">3 proposals per month</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="text-sm">AI generation (7 sections)</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="text-sm">Pipeline tracking</span></li>
                  </ul>
                  <Link href="/sign-up" className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 transition-colors">
                    Get Started Free
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <div className="rounded-2xl border-2 border-primary bg-card text-card-foreground shadow-md p-8 flex flex-col relative h-full">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Most Popular</div>
                  <h3 className="text-xl font-bold mb-2">Starter</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold">₹999</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">Billed monthly</p>
                  <p className="text-sm text-muted-foreground mb-6">For active freelancers and consultants.</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="text-sm font-medium">20 proposals per month</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="text-sm">Advanced AI context</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="text-sm">PDF exports</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="text-sm">Basic analytics</span></li>
                  </ul>
                  <Link href="/sign-up" className="inline-flex w-full items-center justify-center rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors">
                    Start Starter
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-8 flex flex-col h-full">
                  <h3 className="text-xl font-bold mb-2">Growth</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold">₹1999</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">Billed monthly</p>
                  <p className="text-sm text-muted-foreground mb-6">For growing teams scaling their pipeline.</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="text-sm font-medium">Unlimited proposals</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="text-sm">Priority AI processing</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="text-sm">Advanced pipeline analytics</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> <span className="text-sm">Custom branding</span></li>
                  </ul>
                  <Link href="/sign-up" className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 transition-colors">
                    Go Agency
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <FadeIn>
          <section className="py-28 px-6 lg:px-12 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Your next client is waiting for a great proposal.
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Join professionals who use ProposAI to win more business with smarter, faster automated proposal writing.
              </p>
              <Link href="/sign-up" className="inline-flex items-center justify-center rounded-md text-base font-semibold bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-10 transition-colors">
                Start Free — No Credit Card Required <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </section>
        </FadeIn>
      </main>

      <footer className="py-12 px-6 lg:px-12 border-t border-border/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <div className="h-5 w-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">P</div>
            <span>ProposAI</span>
          </div>
          <p>© {new Date().getFullYear()} ProposAI. AI proposal generator for agencies &amp; freelancers.</p>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Log in</Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
