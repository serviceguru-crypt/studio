
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
import { Briefcase, User as UserIcon, LogOut, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const companyLogoInputRef = useRef<HTMLInputElement>(null);
  const userAvatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
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
    if (currentUser) {
      setIsSaving(true);
      try {
          const userUpdatePromise = updateCurrentUser({
            ...currentUser,
            name: userName,
            avatar: userAvatar || currentUser.avatar,
          });

          let companyUpdatePromise = Promise.resolve();
          if (currentUser.role === 'Admin' && companyProfile) {
              companyUpdatePromise = updateCompanyProfile({
                  ...companyProfile,
                  name: companyName,
                  logo: companyLogo || companyProfile.logo
              });
          }
          
          await Promise.all([userUpdatePromise, companyUpdatePromise]);

          toast({
            title: "Settings Saved",
            description: "Your settings have been updated successfully.",
          });
          // Optionally refresh or redirect
          window.dispatchEvent(new CustomEvent('userChanged'));

      } catch(error: any) {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: error.message || "Could not save settings.",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  if (isLoading) {
      return (
        <DashboardLayout>
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                 <div className="grid w-full max-w-4xl gap-2 mx-auto">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="grid w-full max-w-4xl gap-6 mx-auto mt-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </main>
        </DashboardLayout>
      )
  }

  return (
    <DashboardLayout>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="grid w-full max-w-4xl gap-2 mx-auto">
                <h1 className="text-3xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your account, profile, and organization settings.
                </p>
            </div>

            <div className="grid w-full max-w-4xl gap-8 mx-auto mt-8">
                {/* User Profile Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>Update your personal information and avatar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex flex-col items-center gap-4 sm:flex-row">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={userAvatar || undefined} alt={userName} />
                                <AvatarFallback>
                                    <UserIcon className="h-10 w-10"/>
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 w-full space-y-2">
                                <Label htmlFor="user-name">Your Name</Label>
                                <Input
                                    id="user-name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Your Name"
                                />
                                <input 
                                    type="file" 
                                    ref={userAvatarInputRef} 
                                    onChange={(e) => handleFileChange(e, 'user')}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <Button type="button" variant="outline" size="sm" onClick={() => userAvatarInputRef.current?.click()}>
                                   <Edit className="mr-2 h-4 w-4" /> Change Photo
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Company Profile Card */}
                {currentUser?.role === 'Admin' && companyProfile && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                            <CardDescription>Manage your organization's name and logo.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center gap-4 sm:flex-row">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={companyLogo || undefined} alt={companyName} />
                                    <AvatarFallback>
                                        <Briefcase className="h-10 w-10"/>
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 w-full space-y-2">
                                    <Label htmlFor="company-name">Organization Name</Label>
                                    <Input
                                        id="company-name"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Your Company Inc."
                                    />
                                    <input 
                                        type="file" 
                                        ref={companyLogoInputRef} 
                                        onChange={(e) => handleFileChange(e, 'company')}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <Button type="button" variant="outline" size="sm" onClick={() => companyLogoInputRef.current?.click()}>
                                        <Edit className="mr-2 h-4 w-4" /> Change Logo
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Subscription Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Plan</CardTitle>
                        <CardDescription>View your current plan details.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Your current plan:</p>
                             <Badge variant={currentUser?.tier === 'Pro' || currentUser?.tier === 'Enterprise' ? 'default' : 'secondary'} className="text-lg mt-1">
                                {currentUser?.tier}
                             </Badge>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/pricing">Manage Subscription</Link>
                        </Button>
                    </CardContent>
                </Card>

                 <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save All Changes'}
                    </Button>
                </div>
            </div>
        </main>
    </DashboardLayout>
  );
}

