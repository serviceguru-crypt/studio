
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCompanyProfile, updateCompanyProfile, CompanyProfile } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentProfile = getCompanyProfile();
    if (currentProfile) {
      setProfile(currentProfile);
      setName(currentProfile.name);
      setLogo(currentProfile.logo);
    } else {
        // This could happen if a user navigates here without signing up
        // or if local storage is cleared.
        toast({
            variant: "destructive",
            title: "No Profile Found",
            description: "Please log in or sign up to create a profile.",
        });
        router.push('/login');
    }
  }, [router, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (profile) {
      const updatedProfile = {
          ...profile,
          name: name,
          logo: logo || profile.logo
      };
      updateCompanyProfile(updatedProfile);
      toast({
        title: "Profile Saved",
        description: "Your company profile has been updated.",
      });
      router.push('/dashboard');
    }
  };
  
  if (!profile) {
      return <div>Loading...</div>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Company Profile</CardTitle>
          <CardDescription>
            Set up your organization's details. You can change this later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={logo || undefined} alt={name} data-ai-hint="company logo"/>
                    <AvatarFallback>
                        <Briefcase className="h-10 w-10"/>
                    </AvatarFallback>
                </Avatar>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Upload Logo
                </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Company Inc."
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="link" onClick={() => router.push('/dashboard')}>Skip for now</Button>
            <Button onClick={handleSave}>Save and Continue</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
