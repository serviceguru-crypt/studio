
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCompanyProfile, updateCompanyProfile, CompanyProfile, getCurrentUser } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const user = getCurrentUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Not Authenticated",
          description: "Please log in to view your profile.",
        });
        router.push('/login');
        return;
      }
      
      try {
        const currentProfile = await getCompanyProfile();
        if (currentProfile) {
          setProfile(currentProfile);
          setName(currentProfile.name);
          setLogo(currentProfile.logo);
        } else {
          // This might be a new organization, which is a valid state
          // We can pre-fill from user registration info if needed, but for now, we'll let them enter it.
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Could not load company profile.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
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

  const handleSave = async () => {
    if (profile) {
      const updatedProfile: CompanyProfile = {
          ...profile,
          name: name,
          logo: logo || profile.logo
      };
      try {
        await updateCompanyProfile(updatedProfile);
        toast({
          title: "Profile Saved",
          description: "Your company profile has been updated.",
        });
        router.push('/dashboard');
      } catch(error: any) {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: error.message || "Could not save profile.",
        });
      }
    }
  };
  
  if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
               <Skeleton className="h-8 w-48 mx-auto" />
               <Skeleton className="h-4 w-64 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="grid gap-6">
               <div className="flex flex-col items-center gap-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-10 w-28" />
                </div>
                 <div className="grid gap-2">
                   <Skeleton className="h-4 w-24" />
                   <Skeleton className="h-10 w-full" />
                 </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-36" />
            </CardFooter>
          </Card>
        </div>
      )
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
