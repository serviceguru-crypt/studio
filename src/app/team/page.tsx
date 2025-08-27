
"use client";

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, getCurrentUser, getUsersForOrganization, inviteUser, deleteUser as deleteUserFromDb } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const inviteFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["Admin", "Sales Rep"]),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

function InviteMemberDialog({ open, onOpenChange, onMemberInvited }: { open: boolean, onOpenChange: (open: boolean) => void, onMemberInvited: () => void }) {
    const form = useForm<InviteFormValues>({
        resolver: zodResolver(inviteFormSchema),
        defaultValues: { role: 'Sales Rep', name: '', email: '', password: '' }
    });

    const { toast } = useToast();

    async function onSubmit(data: InviteFormValues) {
        try {
            await inviteUser(data);
            toast({
                title: "Invitation Sent",
                description: `${data.name} has been invited to join the team.`,
            });
            onMemberInvited();
            onOpenChange(false);
            form.reset();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Invitation Failed',
                description: error.message || 'An unexpected error occurred.'
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite New Team Member</DialogTitle>
                    <DialogDescription>
                        Enter the details of the person you want to invite. They will receive an email to set up their account.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Tunde Ojo" {...field} disabled={form.formState.isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. tunde.ojo@example.com" {...field} disabled={form.formState.isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Temporary Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Set an initial password" {...field} disabled={form.formState.isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                     <Select onValueChange={field.onChange} value={field.value} disabled={form.formState.isSubmitting}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Sales Rep">Sales Rep</SelectItem>
                                            <SelectItem value="Admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Sending..." : "Send Invitation"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}


export default function TeamPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [teamMembers, setTeamMembers] = React.useState<User[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false);
    const [userToDelete, setUserToDelete] = React.useState<User | null>(null);


    React.useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);
        
        if (user?.tier === 'Starter') {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'Team management is a Pro feature. Please upgrade your plan.'
            });
            router.push('/dashboard');
        }
    }, [router, toast]);

    const fetchTeamMembers = React.useCallback(async () => {
        const user = getCurrentUser();
        if (user?.tier === 'Starter') return;
        
        setIsLoading(true);
        try {
            const members = await getUsersForOrganization();
            setTeamMembers(members);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Could not fetch team members.'
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchTeamMembers();
    }, [fetchTeamMembers]);

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await deleteUserFromDb(userToDelete.id);
            toast({
                title: "User Removed",
                description: `${userToDelete.name} has been removed from the organization.`,
            });
            fetchTeamMembers();
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Removal Failed',
                description: error.message || 'An unexpected error occurred.'
            });
        } finally {
            setUserToDelete(null);
        }
    }


    if (!currentUser || currentUser.tier === 'Starter') {
        return (
             <DashboardLayout>
                <div className="flex flex-col w-full">
                    <Header />
                    <main className="flex flex-1 items-center justify-center">
                        <p>Redirecting...</p>
                    </main>
                </div>
            </DashboardLayout>
        )
    }

    const getRoleBadgeVariant = (role: 'Admin' | 'Sales Rep') => {
        return role === 'Admin' ? 'default' : 'secondary';
    }

    return (
        <DashboardLayout>
             <div className="flex flex-col w-full">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                     <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Team Management</h1>
                            <p className="text-muted-foreground">Invite and manage your team members.</p>
                        </div>
                        <Button size="sm" className="h-8 gap-1" onClick={() => setIsInviteDialogOpen(true)}>
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-rap">
                            Invite Member
                            </span>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                            <CardDescription>A list of all users in your organization.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {isLoading ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="hidden w-[100px] sm:table-cell">Avatar</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead><span className="sr-only">Actions</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="hidden sm:table-cell"><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="hidden w-[100px] sm:table-cell">Avatar</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teamMembers.map(member => (
                                        <TableRow key={member.id}>
                                            <TableCell className="hidden sm:table-cell">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person avatar" />
                                                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">{member.name}</TableCell>
                                            <TableCell>{member.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={member.id === currentUser.id}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem disabled>Edit Role</DropdownMenuItem>
                                                         {currentUser.role === 'Admin' && member.id !== currentUser.id && (
                                                            <DropdownMenuItem className="text-destructive" onClick={() => setUserToDelete(member)}>Remove User</DropdownMenuItem>
                                                         )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
            <InviteMemberDialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen} onMemberInvited={fetchTeamMembers} />
            
            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to remove {userToDelete?.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently remove the user from your organization. They will no longer have access to this team's data.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUser}>Remove User</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
