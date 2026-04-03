import { useParams } from "wouter";
import { useGetProposal, getGetProposalQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function ProposalPreviewPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);

  const { data: proposal, isLoading } = useGetProposal(id, {
    query: { enabled: !!id, queryKey: getGetProposalQueryKey(id) }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium">Proposal not found</div>
      </div>
    );
  }

  const sections = [
    { id: "executiveSummary", title: "Executive Summary", content: proposal.executiveSummary },
    { id: "understanding", title: "Understanding Your Needs", content: proposal.understanding },
    { id: "approach", title: "Our Approach", content: proposal.approach },
    { id: "timelinePlan", title: "Timeline & Plan", content: proposal.timelinePlan },
    { id: "investment", title: "Investment", content: proposal.investment },
    { id: "whyUs", title: "Why Choose Us", content: proposal.whyUs },
    { id: "nextSteps", title: "Next Steps", content: proposal.nextSteps }
  ].filter(s => !!s.content && s.content.trim() !== "");

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-serif">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-none">
        
        {/* Cover Page */}
        <div className="min-h-[800px] flex flex-col justify-center items-center text-center p-12 sm:p-24 border-b print:min-h-screen print:border-none">
          <div className="h-16 w-16 rounded bg-slate-900 text-white flex items-center justify-center text-2xl font-sans font-bold mb-16">
            P
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight font-sans">
            {proposal.projectTitle}
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 mb-16">
            Prepared for {proposal.clientName}
          </p>
          <div className="mt-auto text-slate-500 text-sm font-sans tracking-widest uppercase">
            {format(new Date(proposal.updatedAt), "MMMM do, yyyy")}
          </div>
        </div>

        {/* Content Pages */}
        <div className="p-8 sm:p-16 space-y-16">
          {sections.length === 0 ? (
            <div className="text-center text-slate-500 py-20 font-sans">
              This proposal doesn't have any content yet.
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.id} className="print:break-inside-avoid">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 font-sans border-b pb-4">
                  {section.title}
                </h2>
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-serif">
                  {section.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t text-center text-sm text-slate-500 font-sans print:hidden">
          Powered by ProposAI
        </div>
      </div>
    </div>
  );
}
