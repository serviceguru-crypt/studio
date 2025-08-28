
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LandingHeader, FeatureCard, TestimonialCard } from '@/components/landing-page-ui';
import { Zap, Eye, BarChartHorizontalBig, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/data';


export function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // If the user is already logged in, redirect them to the dashboard.
    // The `true` argument gets the actual logged-in user, not the "view-as" user.
    if (getCurrentUser(true)) {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter !leading-[1.2]">The AI-Powered CRM for Modern Sales Teams in Africa</h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Stop juggling spreadsheets. N-CRM helps you manage leads, close deals faster, and understand your customers like never before.
              </p>
              <div className="flex gap-4 mt-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="https://picsum.photos/800/600"
                alt="CRM Dashboard Screenshot"
                width={800}
                height={600}
                className="rounded-xl shadow-2xl ring-1 ring-black/10"
                data-ai-hint="dashboard product"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-24 bg-muted/50">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">Everything you need to grow your business</h2>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Powerful features to supercharge your sales process.</p>
                </div>

                {/* Feature 1: AI Insights */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <div className="flex flex-col gap-4">
                        <Zap className="h-10 w-10 text-primary mb-2" />
                        <h3 className="text-2xl md:text-3xl font-bold">AI-Powered Insights</h3>
                        <p className="text-muted-foreground text-lg">Let AI do the heavy lifting. Automatically score leads to prioritize your hottest prospects, generate professional follow-up emails in seconds, and get deep analysis on your deal journeys to understand what's working and what's not.</p>
                        <ul className="space-y-2 mt-2">
                           <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> AI Lead Scoring</li>
                           <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> AI Email Composition</li>
                           <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Deal Journey Analysis</li>
                        </ul>
                    </div>
                     <div className="flex justify-center">
                        <Image
                            src="https://picsum.photos/600/400"
                            alt="AI analysis infographic"
                            width={600}
                            height={400}
                            className="rounded-xl shadow-xl ring-1 ring-black/10"
                            data-ai-hint="data analysis"
                        />
                    </div>
                </div>

                {/* Feature 2: Customer View */}
                 <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                     <div className="flex justify-center md:order-2">
                        <Image
                            src="https://picsum.photos/600/400"
                            alt="Customer profile screenshot"
                            width={600}
                            height={400}
                            className="rounded-xl shadow-xl ring-1 ring-black/10"
                            data-ai-hint="customer profile"
                        />
                    </div>
                    <div className="flex flex-col gap-4 md:order-1">
                        <Eye className="h-10 w-10 text-primary mb-2" />
                        <h3 className="text-2xl md:text-3xl font-bold">360° Customer View</h3>
                        <p className="text-muted-foreground text-lg">Build stronger relationships with a complete picture of every customer. See all their contact information, past interactions, and deal history in one organized view. Never lose context again.</p>
                        <ul className="space-y-2 mt-2">
                           <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Centralized Contact Info</li>
                           <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Complete Activity History</li>
                           <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Associated Deals</li>
                        </ul>
                    </div>
                </div>
                
                 {/* Feature 3: Sales Pipeline */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col gap-4">
                        <BarChartHorizontalBig className="h-10 w-10 text-primary mb-2" />
                        <h3 className="text-2xl md:text-3xl font-bold">Streamlined Sales Pipeline</h3>
                        <p className="text-muted-foreground text-lg">From new leads to closed deals, manage your entire sales process with our intuitive drag-and-drop pipeline. Visualize your workflow, identify bottlenecks, and forecast revenue with powerful analytics.</p>
                         <ul className="space-y-2 mt-2">
                           <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Visual Deal Stages</li>
                           <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> In-depth Analytics</li>
                           <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-5 w-5 text-green-500" /> Revenue Forecasting</li>
                        </ul>
                    </div>
                     <div className="flex justify-center">
                        <Image
                            src="https://picsum.photos/600/400"
                            alt="Sales pipeline dashboard"
                            width={600}
                            height={400}
                            className="rounded-xl shadow-xl ring-1 ring-black/10"
                            data-ai-hint="sales pipeline"
                        />
                    </div>
                </div>
            </div>
        </section>


        {/* Testimonials Section */}
        <section className="w-full py-20 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Loved by sales teams across the continent</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="N-CRM transformed our sales process. The AI features are a game-changer and have saved us countless hours."
                author="Adebayo Adekunle"
                role="CEO, Innovate Nigeria"
                avatar="https://picsum.photos/id/237/48/48"
              />
              <TestimonialCard
                quote="Finally, a CRM that understands the local market. The currency and integration support are exactly what we needed."
                author="Fatima Al-Hassan"
                role="Head of Sales, TechSolutions Ghana"
                avatar="https://picsum.photos/id/238/48/48"
              />
              <TestimonialCard
                quote="Our productivity has skyrocketed. The dashboard gives us a clear overview of our performance at a glance."
                author="Samuel Mwangi"
                role="Sales Manager, Kazi Enterprises"
                avatar="https://picsum.photos/id/239/48/48"
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-20 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">Ready to close more deals?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">Sign up today and experience the future of sales in Africa. Your first 25 leads are on us.</p>
            <Button size="lg" asChild>
              <Link href="/signup">Start Selling Smarter</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
