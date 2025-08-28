
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LandingHeader, FeatureCard, TestimonialCard } from '@/components/landing-page-components';
import { Zap, Users, BarChart } from 'lucide-react';
import Image from 'next/image';


export default function LandingPage() {
    return (
        <div className="bg-white text-gray-800">
            <LandingHeader />

            <main>
                {/* Hero Section */}
                <section className="pt-32 pb-20 text-center bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                            The AI-Powered CRM for Modern Sales Teams
                        </h1>
                        <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground">
                            Stop juggling spreadsheets. N-CRM helps you manage deals, understand customers, and close sales faster with intelligent insights.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Button size="lg" asChild>
                                <Link href="/signup">Get Started for Free</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="#features">Learn More</Link>
                            </Button>
                        </div>
                        <div className="mt-12">
                             <Image
                                src="https://picsum.photos/1200/600"
                                alt="CRM Dashboard Screenshot"
                                width={1200}
                                height={600}
                                className="rounded-lg shadow-2xl mx-auto"
                                data-ai-hint="dashboard product"
                            />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold">Everything you need, nothing you don't.</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                                Powerful features designed to help you focus on what matters: closing deals.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-8 md:grid-cols-3">
                            <FeatureCard 
                                icon={<Zap className="h-6 w-6" />}
                                title="AI-Powered Insights"
                                description="Get AI-generated summaries of your dashboard, deal analysis, and lead scores to prioritize your efforts."
                            />
                             <FeatureCard 
                                icon={<Users className="h-6 w-6" />}
                                title="360° Customer View"
                                description="Track every interaction, log activities, and manage customer relationships from one central place."
                            />
                            <FeatureCard 
                                icon={<BarChart className="h-6 w-6" />}
                                title="Streamlined Sales Pipeline"
                                description="Visually track deals from lead to close. Understand your sales funnel and identify bottlenecks."
                            />
                        </div>
                    </div>
                </section>

                 {/* Testimonials Section */}
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold">Loved by Sales Teams Everywhere</h2>
                             <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                                Don't just take our word for it. Here's what our customers are saying.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                             <TestimonialCard 
                                name="Aisha Bello" 
                                role="Sales Manager, TechSavvy Inc."
                                avatar="https://picsum.photos/100/100?person1"
                                >
                                N-CRM's AI insights are a game-changer. We've cut down on analysis time and can focus on the hottest leads. Our closing rate is up 20%!
                            </TestimonialCard>
                             <TestimonialCard 
                                name="Chidi Okoro" 
                                role="Founder, Innovate Solutions"
                                avatar="https://picsum.photos/100/100?person2"
                                >
                                As a startup, we need a tool that's powerful but easy to use. N-CRM is perfect. We were up and running in a day and managing our pipeline like pros.
                            </TestimonialCard>
                            <TestimonialCard 
                                name="Fatima Yusuf" 
                                role="Account Executive, Enterprise West"
                                avatar="https://picsum.photos/100/100?person3"
                                >
                                The deal journey analysis helped me save a major account. I was able to pinpoint where the deal stalled and re-engage effectively. Highly recommend!
                            </TestimonialCard>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                 <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                         <h2 className="text-3xl font-bold">Ready to Supercharge Your Sales?</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Join hundreds of teams building better relationships and closing more deals.
                        </p>
                        <div className="mt-8">
                            <Button size="lg" asChild>
                                <Link href="/signup">
                                    Sign Up Now - It's Free
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} N-CRM. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
