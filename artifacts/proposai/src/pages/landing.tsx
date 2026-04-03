import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, BarChart3, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="h-16 flex items-center justify-between px-6 lg:px-12 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">P</div>
          <span>ProposAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link href="/sign-up" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 lg:px-12 pt-24 pb-32 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
            Proposals designed for professionals
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8 leading-[1.1]">
            Close More Deals With <br className="hidden md:block" /> Proposals That Learn What Works.
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop starting from scratch. ProposAI combines your expertise with AI to generate precision-crafted proposals that respect your clients' time and win their business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8">
              Start Building Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <p className="text-sm text-muted-foreground sm:ml-4">No credit card required.</p>
          </div>
        </section>

        {/* Value Prop Section */}
        <section className="bg-slate-50 py-24 border-y border-border/40">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Speed Without Sacrifice</h3>
                <p className="text-muted-foreground leading-relaxed">Generate 80% of your proposal in seconds. Spend your valuable time refining the strategy, not writing boilerplate.</p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Precision Messaging</h3>
                <p className="text-muted-foreground leading-relaxed">Our AI understands consulting frameworks. It crafts executive summaries and approaches that speak directly to ROI.</p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Track & Improve</h3>
                <p className="text-muted-foreground leading-relaxed">Know what works. Track win rates, analyze pipeline status, and refine your pitch based on real data.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">Invest in the tool that pays for itself with one won deal.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-3xl font-bold mb-6">Free</p>
              <p className="text-sm text-muted-foreground mb-6">Perfect for trying out the workflow.</p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> <span className="text-sm">3 proposals per month</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> <span className="text-sm">Basic AI generation</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> <span className="text-sm">Standard templates</span></li>
              </ul>
              <Link href="/sign-up" className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Get Started
              </Link>
            </div>
            
            {/* Starter */}
            <div className="rounded-xl border-2 border-primary bg-card text-card-foreground shadow-md p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">₹999</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">For active freelancers and consultants.</p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> <span className="text-sm font-medium">20 proposals per month</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> <span className="text-sm">Advanced AI context</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> <span className="text-sm">PDF exports</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> <span className="text-sm">Basic analytics</span></li>
              </ul>
              <Link href="/sign-up" className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Upgrade to Pro
              </Link>
            </div>

            {/* Growth */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Growth</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">₹1999</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">For growing teams scaling output.</p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> <span className="text-sm font-medium">Unlimited proposals</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> <span className="text-sm">Priority AI processing</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> <span className="text-sm">Advanced pipeline analytics</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> <span className="text-sm">Custom branding</span></li>
              </ul>
              <Link href="/sign-up" className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Go Agency
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 lg:px-12 border-t border-border/40 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} ProposAI. Built for professionals.</p>
      </footer>
    </div>
  );
}
