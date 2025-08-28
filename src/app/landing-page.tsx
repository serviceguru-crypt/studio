
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LandingHeader, FeatureCard, TestimonialCard } from '@/components/landing-page-ui';
import { Zap, Eye, BarChartHorizontalBig } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">The AI-Powered CRM for Modern Sales Teams in Africa</h1>
              <p className="text-lg text-muted-foreground">
                Stop juggling spreadsheets. N-CRM helps you manage leads, close deals faster, and understand your customers like never before.
              </p>
              <div className="flex gap-4 mt-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Request a Demo</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="https://picsum.photos/600/400"
                alt="CRM Dashboard Screenshot"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
                data-ai-hint="dashboard product"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Everything you need to grow your business</h2>
              <p className="text-lg text-muted-foreground mt-2">Powerful features to supercharge your sales process.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="AI-Powered Insights"
                description="Let AI analyze your deals, score your leads, and compose professional emails so you can focus on selling."
              />
              <FeatureCard
                icon={<Eye className="h-8 w-8 text-primary" />}
                title="360° Customer View"
                description="Track every interaction, from initial lead to final sale, in one centralized place."
              />
              <FeatureCard
                icon={<BarChartHorizontalBig className="h-8 w-8 text-primary" />}
                title="Streamlined Sales Pipeline"
                description="Visualize your entire sales process, identify bottlenecks, and forecast revenue with our intuitive dashboards."
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-20 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Loved by sales teams across the continent</h2>
            </div>
            <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory">
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
        <section className="w-full py-20 md:py-24">
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
