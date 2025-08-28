
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Briefcase, Star } from 'lucide-react';

export const LandingHeader = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-7 w-7 text-primary" />
                        <span className="text-xl font-bold">N-CRM</span>
                    </div>
                    <nav className="hidden md:flex gap-6 items-center">
                        <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                            Features
                        </Link>
                         <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                            Pricing
                        </Link>
                         <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                            Login
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                         <Button asChild>
                            <Link href="/signup">
                                Sign Up
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export const TestimonialCard = ({ name, role, avatar, children }: { name: string, role: string, avatar: string, children: React.ReactNode }) => (
    <Card className="flex flex-col justify-between">
        <CardContent className="pt-6">
            <div className="flex text-yellow-400 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
            </div>
            <p className="text-muted-foreground">"{children}"</p>
        </CardContent>
         <div className="p-6 bg-muted/50 rounded-b-lg">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">{role}</p>
                </div>
            </div>
        </div>
    </Card>
);
