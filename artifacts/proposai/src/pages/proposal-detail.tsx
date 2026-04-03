import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  useGetProposal, 
  getGetProposalQueryKey,
  useUpdateProposal,
  useUpdateProposalStatus,
  Proposal
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Sparkles, ExternalLink, Save, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
  { id: "executiveSummary", title: "Executive Summary" },
  { id: "understanding", title: "Understanding Your Needs" },
  { id: "approach", title: "Our Approach" },
  { id: "timelinePlan", title: "Timeline & Plan" },
  { id: "investment", title: "Investment" },
  { id: "whyUs", title: "Why Us" },
  { id: "nextSteps", title: "Next Steps" }
] as const;

export default function ProposalDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const [localContent, setLocalContent] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  const { data: proposal, isLoading } = useGetProposal(id, {
    query: { enabled: !!id, queryKey: getGetProposalQueryKey(id) }
  });

  const updateMutation = useUpdateProposal({
    mutation: {
      onSuccess: () => {
        toast({ title: "Saved successfully", duration: 2000 });
        queryClient.invalidateQueries({ queryKey: getGetProposalQueryKey(id) });
      }
    }
  });

  const statusMutation = useUpdateProposalStatus({
    mutation: {
      onSuccess: () => {
        toast({ title: "Status updated" });
        queryClient.invalidateQueries({ queryKey: getGetProposalQueryKey(id) });
      }
    }
  });

  useEffect(() => {
    if (proposal) {
      const initial: Record<string, string> = {};
      SECTIONS.forEach(sec => {
        const val = proposal[sec.id as keyof Proposal];
        if (val !== undefined && val !== null) {
          initial[sec.id] = val as string;
        }
      });
      setLocalContent(prev => {
        const hasLocalEdits = Object.keys(prev).length > 0;
        return hasLocalEdits ? prev : initial;
      });
    }
  }, [proposal]);

  const handleSave = (sectionId: string) => {
    updateMutation.mutate({ 
      id, 
      data: { [sectionId]: localContent[sectionId] } 
    });
  };

  const handleGenerateAll = async () => {
    if (!proposal) return;
    
    setGenerating(true);
    const newContent: Record<string, string> = {};
    
    SECTIONS.forEach(s => {
      newContent[s.id] = "";
    });
    setLocalContent(prev => ({ ...prev, ...newContent }));
    
    try {
      const res = await fetch(`/api/proposals/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to generate content");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No readable stream");

      let currentSection = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6);
          if (raw === '[DONE]') continue;
          
          try {
            const data = JSON.parse(raw);
            if (data.type === 'section_start') {
              currentSection = data.section;
              setActiveSection(data.section);
            } else if (data.type === 'content' && data.section) {
              setLocalContent(prev => ({
                ...prev,
                [data.section]: (prev[data.section] || "") + data.content
              }));
            }
          } catch {
            // ignore parse errors for incomplete chunks
          }
        }
      }

      toast({ title: "All sections generated successfully" });
      queryClient.invalidateQueries({ queryKey: getGetProposalQueryKey(id) });
      
    } catch (error) {
      toast({ 
        title: "Generation failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!proposal) {
    return (
      <AppLayout>
        <div className="text-center py-20">Proposal not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
              <Link href="/proposals">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{proposal.clientName}</h1>
              <p className="text-sm text-muted-foreground">{proposal.niche}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleGenerateAll}
              disabled={generating}
              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800"
            >
              {generating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Generate All</>
              )}
            </Button>
            <Select 
              value={proposal.status} 
              onValueChange={(val: any) => statusMutation.mutate({ id, data: { status: val } })}
            >
              <SelectTrigger className={`w-[140px] h-9 ${
                proposal.status === 'won' ? 'bg-green-50 text-green-900 border-green-200' :
                proposal.status === 'sent' ? 'bg-blue-50 text-blue-900 border-blue-200' :
                proposal.status === 'lost' ? 'bg-red-50 text-red-900 border-red-200' :
                ''
              }`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/proposals/${proposal.id}/preview`}>
                <ExternalLink className="mr-2 h-4 w-4" /> Preview
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-[250px_1fr] gap-6 flex-1 min-h-0">
          <Card className="flex flex-col overflow-hidden h-fit max-h-full">
            <div className="p-4 border-b bg-slate-50/50 dark:bg-slate-900/50 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Sections
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {SECTIONS.map((section) => {
                const hasContent = !!(localContent[section.id] || "").trim();
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate">{section.title}</span>
                    {hasContent && (
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-foreground/80' : 'text-green-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="flex flex-col min-h-0">
            <CardHeader className="py-4 border-b flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-lg">
                {SECTIONS.find(s => s.id === activeSection)?.title}
              </CardTitle>
              <Button 
                size="sm"
                onClick={() => handleSave(activeSection)}
                disabled={generating || updateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative flex flex-col">
              <Textarea 
                className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 rounded-none p-6 text-base leading-relaxed bg-transparent"
                placeholder={generating
                  ? "AI is generating content..." 
                  : "Write your content here or click Generate All above to draft all sections with AI..."}
                value={localContent[activeSection] || ""}
                onChange={(e) => setLocalContent(prev => ({ ...prev, [activeSection]: e.target.value }))}
                disabled={generating}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
