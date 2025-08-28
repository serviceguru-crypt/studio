
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import React from 'react';

// --- Reusable Components ---

export const LandingHeader = () => (
    <header className="w-full px-4 md:px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">N-CRM</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground">
                Features
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                Pricing
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
                Login
            </Link>
        </nav>
        <Button asChild>
            <Link href="/signup">Get Started</Link>
        </Button>
    </header>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
    <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
        <div className="mb-4 bg-primary/10 p-3 rounded-full">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

interface TestimonialCardProps {
    quote: string;
    author: string;
    role: string;
    avatar: string;
}

export const TestimonialCard = ({ quote, author, role, avatar }: TestimonialCardProps) => (
    <Card className="flex-shrink-0 w-full">
        <CardContent className="p-6">
            <blockquote className="text-lg mb-4">"{quote}"</blockquote>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image src={avatar} alt={author} width={48} height={48} />
                </div>
                <div>
                    <p className="font-semibold">{author}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);
