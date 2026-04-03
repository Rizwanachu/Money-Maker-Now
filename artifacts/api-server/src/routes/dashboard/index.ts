import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { proposalsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { GetRecentProposalsQueryParams } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

router.get("/stats", requireAuth, async (req: any, res: any): Promise<void> => {
  const proposals = await db
    .select()
    .from(proposalsTable)
    .where(eq(proposalsTable.userId, req.userId));

  const total = proposals.length;
  const draftCount = proposals.filter((p) => p.status === "draft").length;
  const sentCount = proposals.filter((p) => p.status === "sent").length;
  const acceptedCount = proposals.filter((p) => p.status === "accepted").length;
  const declinedCount = proposals.filter((p) => p.status === "declined").length;

  const closedCount = acceptedCount + declinedCount;
  const winRate = closedCount > 0 ? (acceptedCount / closedCount) * 100 : 0;

  res.json({
    totalProposals: total,
    draftCount,
    sentCount,
    acceptedCount,
    declinedCount,
    winRate: Math.round(winRate * 10) / 10,
  });
});

router.get("/recent", requireAuth, async (req: any, res: any): Promise<void> => {
  const parseResult = GetRecentProposalsQueryParams.safeParse(req.query);
  const limit = parseResult.success ? (parseResult.data.limit ?? 5) : 5;

  const proposals = await db
    .select()
    .from(proposalsTable)
    .where(eq(proposalsTable.userId, req.userId))
    .orderBy(desc(proposalsTable.updatedAt))
    .limit(Number(limit));

  res.json(proposals);
});

export default router;
