import { useEffect } from "react";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetRecentProposals, getGetRecentProposalsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, Send, CheckCircle, XCircle, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function DashboardPage() {
  useEffect(() => { document.title = "Dashboard — ProposAI"; }, []);

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });

  const { data: recent, isLoading: recentLoading } = useGetRecentProposals({ limit: 5 }, {
    query: { queryKey: getGetRecentProposalsQueryKey({ limit: 5 }) }
  });

  const recentList = Array.isArray(recent) ? recent : [];

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Here's an overview of your pipeline.</p>
          </div>
          <Button asChild>
            <Link href="/proposals/new">
              <Plus className="mr-2 h-4 w-4" /> New Proposal
            </Link>
          </Button>
        </div>

        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-1/3 bg-muted rounded"></div>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-1/4 bg-muted rounded mt-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProposals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sent</CardTitle>
                <Send className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sentCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Won</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.wonCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.winRate.toFixed(1)}% win rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lost</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lostCount}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/proposals">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/4 bg-muted rounded"></div>
                        <div className="h-3 w-1/3 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No proposals yet. Start by creating your first one.</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/proposals/new">Create Proposal</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentList.map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between group">
                      <div className="flex flex-col gap-1">
                        <Link href={`/proposals/${proposal.id}`} className="font-medium hover:underline">
                          {proposal.clientName}
                        </Link>
                        <span className="text-sm text-muted-foreground">
                          {proposal.niche}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(proposal.updatedAt), "MMM d, yyyy")}
                        </span>
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium w-20 text-center capitalize
                          ${proposal.status === 'won' ? 'bg-green-100 text-green-800' :
                            proposal.status === 'lost' ? 'bg-red-100 text-red-800' :
                            proposal.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }
                        `}>
                          {proposal.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
