
"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordReset } from '@/lib/data';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setIsSent(true);
      toast({
        title: "Check your email",
        description: `A password reset link has been sent to ${email}.`,
      });
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not send password reset email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            {isSent 
                ? "You can now close this page."
                : "Enter your email and we'll send you a link to reset your password."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isSent ? (
                 <div className="text-center text-green-600 font-medium">
                    <p>Email sent successfully!</p>
                </div>
            ) : (
                <form onSubmit={handleResetPassword}>
                    <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    </div>
                </form>
            )}
            <div className="mt-4 text-center text-sm">
                <Link href="/login" className="underline flex items-center justify-center gap-1">
                 <ArrowLeft className="h-3 w-3" />
                 Back to login
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
