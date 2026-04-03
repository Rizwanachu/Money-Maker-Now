import { useState } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  useListProposals, 
  getListProposalsQueryKey,
  useDuplicateProposal,
  useDeleteProposal
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Copy, 
  Trash2, 
  ExternalLink,
  Edit2
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type ProposalStatus = "draft" | "sent" | "accepted" | "declined" | "all";

export default function ProposalsPage() {
  const [statusFilter, setStatusFilter] = useState<ProposalStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListProposals(
    { 
      status: statusFilter !== "all" ? statusFilter as any : undefined,
      limit: 100
    },
    { query: { queryKey: getListProposalsQueryKey({ status: statusFilter !== "all" ? statusFilter as any : undefined, limit: 100 }) } }
  );

  const duplicateMutation = useDuplicateProposal({
    mutation: {
      onSuccess: () => {
        toast({ title: "Proposal duplicated successfully" });
        queryClient.invalidateQueries({ queryKey: getListProposalsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to duplicate proposal", variant: "destructive" });
      }
    }
  });

  const deleteMutation = useDeleteProposal({
    mutation: {
      onSuccess: () => {
        toast({ title: "Proposal deleted" });
        queryClient.invalidateQueries({ queryKey: getListProposalsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to delete proposal", variant: "destructive" });
      }
    }
  });

  const handleDuplicate = (id: number) => {
    duplicateMutation.mutate({ id });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this proposal?")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredProposals = data?.proposals?.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.projectTitle.toLowerCase().includes(query) ||
      p.clientName.toLowerCase().includes(query)
    );
  }) || [];

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
            <p className="text-muted-foreground mt-1">Manage your active and past proposals.</p>
          </div>
          <Button asChild>
            <Link href="/proposals/new">
              <Plus className="mr-2 h-4 w-4" /> Create Proposal
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client or project..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select 
            value={statusFilter} 
            onValueChange={(val) => setStatusFilter(val as ProposalStatus)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-5 w-3/4 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mt-4">
                    <div className="h-3 w-full bg-muted rounded"></div>
                    <div className="h-3 w-2/3 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card border-dashed">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No proposals found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filters to find what you're looking for."
                : "You haven't created any proposals yet. Create your first one to get started."}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button asChild>
                <Link href="/proposals/new">Create First Proposal</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="flex flex-col group hover:shadow-md transition-all">
                <CardHeader className="pb-2 relative">
                  <div className="flex justify-between items-start pr-6">
                    <CardTitle className="text-lg font-bold leading-tight">
                      <Link href={`/proposals/${proposal.id}`} className="hover:underline">
                        {proposal.projectTitle}
                      </Link>
                    </CardTitle>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">
                    {proposal.clientName}
                  </div>
                  
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/proposals/${proposal.id}`}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/proposals/${proposal.id}/preview`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" /> Preview
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(proposal.id)}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive" 
                          onClick={() => handleDelete(proposal.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 mt-2">
                  <div className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {proposal.projectDescription || "No description provided."}
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium">
                    {proposal.budget && (
                      <div>
                        <span className="text-muted-foreground mr-1">Budget:</span>
                        {proposal.budget}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 mt-auto rounded-b-xl">
                  <span className="text-xs text-muted-foreground font-medium">
                    {format(new Date(proposal.updatedAt), "MMM d, yyyy")}
                  </span>
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                    ${proposal.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      proposal.status === 'declined' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      proposal.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }
                  `}>
                    {proposal.status}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
