
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCompanyProfile, updateCompanyProfile, CompanyProfile, getCurrentUser, User, updateCurrentUser } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  
  const companyLogoInputRef = useRef<HTMLInputElement>(null);
  const userAvatarInputRef = useRef<HTMLInputElement>(null);

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
      setCurrentUser(user);
      setUserName(user.name);
      setUserAvatar(user.avatar);
      
      try {
        const currentProfile = await getCompanyProfile();
        if (currentProfile) {
          setCompanyProfile(currentProfile);
          setCompanyName(currentProfile.name);
          setCompanyLogo(currentProfile.logo);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'user' | 'company') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if(type === 'user') {
            setUserAvatar(reader.result as string);
        } else {
            setCompanyLogo(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (companyProfile && currentUser) {
      const updatedCompanyProfile: CompanyProfile = {
          ...companyProfile,
          name: companyName,
          logo: companyLogo || companyProfile.logo
      };
      
      const updatedUser: User = {
          ...currentUser,
          name: userName,
          avatar: userAvatar || currentUser.avatar,
      };

      try {
        await updateCompanyProfile(updatedCompanyProfile);
        await updateCurrentUser(updatedUser);
        toast({
          title: "Profile Saved",
          description: "Your profile has been updated.",
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
          <Card className="w-full max-w-lg">
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
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Profile Settings</CardTitle>
          <CardDescription>
            Update your personal and company details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            {/* User Profile Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Your Profile</h3>
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={userAvatar || undefined} alt={userName} />
                        <AvatarFallback>
                            <UserIcon className="h-10 w-10"/>
                        </AvatarFallback>
                    </Avatar>
                    <input 
                        type="file" 
                        ref={userAvatarInputRef} 
                        onChange={(e) => handleFileChange(e, 'user')}
                        accept="image/*"
                        className="hidden"
                    />
                    <Button type="button" variant="outline" onClick={() => userAvatarInputRef.current?.click()}>
                        Upload Photo
                    </Button>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="user-name">Your Name</Label>
                    <Input
                        id="user-name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Your Name"
                    />
                </div>
            </div>

            {/* Company Profile Section */}
             {currentUser?.role === 'Admin' && (
             <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium">Company Profile</h3>
                 <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={companyLogo || undefined} alt={companyName} />
                        <AvatarFallback>
                            <Briefcase className="h-10 w-10"/>
                        </AvatarFallback>
                    </Avatar>
                    <input 
                        type="file" 
                        ref={companyLogoInputRef} 
                        onChange={(e) => handleFileChange(e, 'company')}
                        accept="image/*"
                        className="hidden"
                    />
                    <Button type="button" variant="outline" onClick={() => companyLogoInputRef.current?.click()}>
                        Upload Logo
                    </Button>
                </div>
                <div className="grid gap-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company Inc."
                />
                </div>
            </div>
             )}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>Cancel</Button>
            <Button onClick={handleSave}>Save Profile</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
