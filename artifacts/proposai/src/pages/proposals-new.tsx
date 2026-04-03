import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCreateProposal } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  clientEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  projectTitle: z.string().min(5, "Project title must be at least 5 characters"),
  industry: z.string().optional(),
  projectDescription: z.string().min(10, "Please provide a brief description").optional().or(z.literal("")),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewProposalPage() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      projectTitle: "",
      industry: "",
      projectDescription: "",
      budget: "",
      timeline: "",
    },
  });

  const createMutation = useCreateProposal({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Proposal initialized successfully" });
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
    if (step === 1) {
      setStep(2);
      return;
    }
    
    createMutation.mutate({ data: values });
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
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Proposal</h1>
          <p className="text-muted-foreground mt-1">
            {step === 1 ? "Start with the client details." : "Now add the project context for the AI."}
          </p>
        </div>

        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="pt-6">
                <div className={step === 1 ? "space-y-6" : "hidden"}>
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
                    name="clientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Email (Optional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@acme.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. SaaS, Healthcare, E-commerce" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className={step === 2 ? "space-y-6" : "hidden"}>
                  <FormField
                    control={form.control}
                    name="projectTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Website Redesign & SEO Optimization" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget / Investment</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. $10,000 or $150/hr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="timeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeline</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 6-8 weeks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="projectDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Context (For AI)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Briefly describe their problem and what you will deliver. The AI will use this to write the proposal." 
                            className="h-32 resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t py-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl mt-4">
                {step === 1 ? (
                  <>
                    <Button type="button" variant="outline" asChild>
                      <Link href="/proposals">Cancel</Link>
                    </Button>
                    <Button 
                      type="button" 
                      onClick={async () => {
                        const ok = await form.trigger(["clientName", "clientEmail", "industry"]);
                        if (ok) setStep(2);
                      }}
                    >
                      Next Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                      ) : (
                        <><Sparkles className="mr-2 h-4 w-4" /> Create & Start Writing</>
                      )}
                    </Button>
                  </>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AppLayout>
  );
}
