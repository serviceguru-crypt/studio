
"use client"

import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { registerUser, Tier } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const tiers = [
  {
    name: 'Starter',
    price: '₦0',
    priceSuffix: '/ month',
    description: 'For individuals and small teams getting started.',
    features: [
      'Core CRM functionalities',
      'Manage customers, deals, and leads',
      'Standard dashboard analytics',
      'Calendar view',
    ],
    cta: 'Get Started',
    tier: 'Starter' as Tier,
  },
  {
    name: 'Pro',
    price: '₦8,000',
    priceSuffix: '/ month',
    description: 'For growing teams that need more power and automation.',
    features: [
      'All features from Starter',
      'AI Deal Journey Analysis',
      'AI Email Composer',
      'AI Lead Scoring',
      'Advanced analytics & data export',
    ],
    cta: 'Choose Pro',
    isPopular: true,
    tier: 'Pro' as Tier,
  },
  {
    name: 'Enterprise',
    price: '₦20,000',
    priceSuffix: '/ month',
    description: 'For large organizations with advanced needs.',
    features: [
      'All features from Pro',
      'Role-based access control',
      'Third-party integrations (WhatsApp, etc.)',
      'Priority support',
      'Single Sign-On (SSO)',
    ],
    cta: 'Choose Enterprise',
    tier: 'Enterprise' as Tier,
  },
];

function PricingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const handleSelectTier = async (tier: Tier) => {
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const password = searchParams.get('password');
        const organizationName = searchParams.get('organizationName');

        if (!name || !email || !password || !organizationName) {
            toast({
                variant: 'destructive',
                title: 'Signup Error',
                description: 'Missing user information. Please go back and try signing up again.',
            });
            router.push('/signup');
            return;
        }

        try {
            await registerUser({ name, email, password, organizationName, tier });
            toast({
                title: 'Account Created!',
                description: "Welcome to your new CRM. Let's get your profile set up.",
            });
            router.push('/profile');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Registration Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-5xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-bold tracking-tight">Choose Your Plan</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        Start for free, then upgrade as you grow.
                    </CardDescription>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
                    {tiers.map((tier) => (
                        <Card
                            key={tier.name}
                            className={cn(
                                'flex flex-col',
                                tier.isPopular && 'border-primary ring-2 ring-primary'
                            )}
                        >
                            <CardHeader>
                                {tier.isPopular && (
                                    <div className="flex justify-center mb-2">
                                        <div className="inline-flex items-center gap-x-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                            <Star className="h-4 w-4" />
                                            Most Popular
                                        </div>
                                    </div>
                                )}
                                <CardTitle>{tier.name}</CardTitle>
                                <CardDescription>{tier.description}</CardDescription>
                                <div>
                                    <span className="text-3xl font-bold">{tier.price}</span>
                                    <span className="text-muted-foreground">{tier.priceSuffix}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                {tier.features.map((feature) => (
                                    <div key={feature} className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                        <span className="text-sm text-muted-foreground">{feature}</span>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={tier.isPopular ? 'default' : 'outline'}
                                    onClick={() => handleSelectTier(tier.tier)}
                                >
                                    {tier.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PricingContent />
        </Suspense>
    )
}
