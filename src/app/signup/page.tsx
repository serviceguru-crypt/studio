
"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { registerUser, signInWithGoogle } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.82,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async () => {
        setIsLoading(true);
        try {
            await registerUser({
                name,
                email,
                password,
                organizationName,
            });
            toast({
                title: "Account Created",
                description: "Welcome! Please set up your company profile.",
            });
            router.push('/profile');
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Signup Failed",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const { user, isNewUser } = await signInWithGoogle();
             if (isNewUser) {
                toast({
                    title: "Account Created",
                    description: "Welcome! Please set up your company profile.",
                });
                router.push('/profile');
            } else {
                // This case is unlikely on signup page, but handle it gracefully
                toast({
                    title: "Login Successful",
                    description: `Welcome back, ${user.name}!`,
                });
                router.push('/dashboard');
            }
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Google Sign-Up Failed",
                description: error.message || "Could not sign up with Google. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
            Enter your information to create an account
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="organization-name">Organization Name</Label>
                    <Input id="organization-name" placeholder="Acme Inc." required value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}/>
                </div>
                <Button type="submit" className="w-full" onClick={handleSignup} disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create an account"}
                </Button>
                <Separator className="my-2" />
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Sign up with Google
                </Button>
            </div>
            <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
                Login
            </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  )
}
