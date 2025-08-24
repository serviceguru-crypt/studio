
"use client"

import { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { generateEmail } from '@/ai/flows/generate-email-flow';
import { Skeleton } from './ui/skeleton';
import { Wand2, Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';


interface EmailComposerProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    customerName: string;
    customerCompany: string;
}

const emailFormSchema = z.object({
    emailTone: z.enum(['Formal', 'Friendly', 'Follow-up']),
    emailContent: z.string().min(10, { message: "Please provide some key points for the email." }),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

export function EmailComposer({ isOpen, onOpenChange, customerName, customerCompany }: EmailComposerProps) {
    const { toast } = useToast();
    const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailFormSchema),
        defaultValues: {
            emailTone: 'Friendly',
            emailContent: '',
        },
    });

    async function onSubmit(data: EmailFormValues) {
        setIsLoading(true);
        setGeneratedEmail(null);
        try {
            const result = await generateEmail({
                customerName,
                companyName: customerCompany,
                emailTone: data.emailTone,
                emailContent: data.emailContent,
            });
            setGeneratedEmail(result);
        } catch (error) {
            console.error("Failed to generate email:", error);
            toast({
                title: "Error",
                description: "Failed to generate email. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleCopyToClipboard = () => {
        if (generatedEmail) {
            const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
            navigator.clipboard.writeText(fullEmail);
            toast({
                title: "Copied!",
                description: "Email content copied to clipboard.",
            });
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                 <ScrollArea className="max-h-[90vh] p-6">
                    <DialogHeader className="pr-6">
                        <DialogTitle className="flex items-center gap-2"><Wand2 className="text-primary" /> Compose AI Email</DialogTitle>
                        <DialogDescription>
                            Generate a professional email to {customerName} from {customerCompany}. Just provide the tone and key points.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4 pr-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="emailTone"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Tone</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select a tone" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Friendly">Friendly</SelectItem>
                                            <SelectItem value="Formal">Formal</SelectItem>
                                            <SelectItem value="Follow-up">Follow-up</SelectItem>
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="emailContent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Key Points</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="e.g., Follow up on our last conversation, check availability for a demo next week, mention our new feature X..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Generating...' : 'Generate Email'}
                                </Button>
                            </form>
                        </Form>

                        {(isLoading || generatedEmail) && <div className="border-t pt-4 mt-4 space-y-4">
                            <h4 className="font-medium">Generated Email</h4>
                            {isLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-4/5" />
                                </div>
                            ) : generatedEmail && (
                                <div className="space-y-4">
                                    <Input value={generatedEmail.subject} readOnly />
                                    <Textarea value={generatedEmail.body} readOnly className="min-h-[200px]" />
                                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                                        <Clipboard className="h-4 w-4 mr-2" />
                                        Copy to Clipboard
                                    </Button>
                                </div>
                            )}
                        </div>}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
