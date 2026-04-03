import { useLocation } from "wouter";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCreateProposal } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProposalNiche } from "@workspace/api-client-react";

const NICHES: ProposalNiche[] = ["Web Design", "Marketing Agency"];

const formSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  niche: z.string().min(1, "Please select a niche"),
  clientBrief: z.string().min(20, "Please provide at least 20 characters describing the project"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewProposalPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      niche: "",
      clientBrief: "",
    },
  });

  const createMutation = useCreateProposal({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Proposal created successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
        setLocation(`/proposals/${data.id}`);
      },
      onError: (error) => {
        toast({ 
          title: "Failed to create proposal", 
          description: error.message || "An unexpected error occurred",
          variant: "destructive" 
        });
      }
    }
  });

  function onSubmit(values: FormValues) {
    createMutation.mutate({ 
      data: {
        clientName: values.clientName,
        niche: values.niche as ProposalNiche,
        clientBrief: values.clientBrief,
      }
    });
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-3 text-muted-foreground">
            <Link href="/proposals">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Proposals
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create New Proposal</h1>
          <p className="text-muted-foreground mt-1">
            Provide the client details and brief — the AI will generate a winning proposal.
          </p>
        </div>

        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="pt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Service Niche <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NICHES.map((niche) => (
                            <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientBrief"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Brief <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the client's problem, what they need, their goals, and what you plan to deliver. The AI will use this to write a tailored proposal." 
                          className="h-40 resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The more detail you provide, the better the AI-generated proposal will be.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between border-t py-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl mt-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/proposals">Cancel</Link>
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Create Proposal</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AppLayout>
  );
}
