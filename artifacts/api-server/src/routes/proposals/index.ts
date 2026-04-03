import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { proposalsTable } from "@workspace/db";
import { eq, and, desc, count, ilike } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateProposalBody,
  UpdateProposalBody,
  UpdateProposalStatusBody,
  GenerateProposalContentBody,
  ListProposalsQueryParams,
  GetProposalParams,
  UpdateProposalParams,
  DeleteProposalParams,
  GenerateProposalContentParams,
  DuplicateProposalParams,
  UpdateProposalStatusParams,
} from "@workspace/api-zod";

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

router.get("/", requireAuth, async (req: any, res: any): Promise<void> => {
  const parseResult = ListProposalsQueryParams.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { status, limit = 20, offset = 0 } = parseResult.data;

  const conditions = [eq(proposalsTable.userId, req.userId)];
  if (status) {
    conditions.push(eq(proposalsTable.status, status));
  }

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(proposalsTable)
      .where(and(...conditions))
      .orderBy(desc(proposalsTable.updatedAt))
      .limit(Number(limit))
      .offset(Number(offset)),
    db
      .select({ count: count() })
      .from(proposalsTable)
      .where(and(...conditions)),
  ]);

  res.json({
    proposals: rows,
    total: Number(totalResult[0]?.count ?? 0),
  });
});

router.post("/", requireAuth, async (req: any, res: any): Promise<void> => {
  const parseResult = CreateProposalBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const data = parseResult.data;
  const [proposal] = await db
    .insert(proposalsTable)
    .values({
      userId: req.userId,
      clientName: data.clientName,
      clientEmail: data.clientEmail ?? null,
      projectTitle: data.projectTitle,
      industry: data.industry ?? null,
      projectDescription: data.projectDescription ?? null,
      budget: data.budget ?? null,
      timeline: data.timeline ?? null,
      status: "draft",
    })
    .returning();

  res.status(201).json(proposal);
});

router.get("/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  const parseResult = GetProposalParams.safeParse({ id: Number(req.params.id) });
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid proposal ID" });
    return;
  }

  const [proposal] = await db
    .select()
    .from(proposalsTable)
    .where(
      and(
        eq(proposalsTable.id, parseResult.data.id),
        eq(proposalsTable.userId, req.userId)
      )
    );

  if (!proposal) {
    res.status(404).json({ error: "Proposal not found" });
    return;
  }

  res.json(proposal);
});

router.put("/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  const idResult = UpdateProposalParams.safeParse({ id: Number(req.params.id) });
  if (!idResult.success) {
    res.status(400).json({ error: "Invalid proposal ID" });
    return;
  }

  const bodyResult = UpdateProposalBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const existing = await db
    .select()
    .from(proposalsTable)
    .where(
      and(
        eq(proposalsTable.id, idResult.data.id),
        eq(proposalsTable.userId, req.userId)
      )
    );

  if (!existing.length) {
    res.status(404).json({ error: "Proposal not found" });
    return;
  }

  const data = bodyResult.data;
  const [updated] = await db
    .update(proposalsTable)
    .set({
      ...(data.clientName !== undefined && { clientName: data.clientName }),
      ...(data.clientEmail !== undefined && { clientEmail: data.clientEmail }),
      ...(data.projectTitle !== undefined && { projectTitle: data.projectTitle }),
      ...(data.industry !== undefined && { industry: data.industry }),
      ...(data.projectDescription !== undefined && { projectDescription: data.projectDescription }),
      ...(data.budget !== undefined && { budget: data.budget }),
      ...(data.timeline !== undefined && { timeline: data.timeline }),
      ...(data.executiveSummary !== undefined && { executiveSummary: data.executiveSummary }),
      ...(data.understanding !== undefined && { understanding: data.understanding }),
      ...(data.approach !== undefined && { approach: data.approach }),
      ...(data.timelinePlan !== undefined && { timelinePlan: data.timelinePlan }),
      ...(data.investment !== undefined && { investment: data.investment }),
      ...(data.whyUs !== undefined && { whyUs: data.whyUs }),
      ...(data.nextSteps !== undefined && { nextSteps: data.nextSteps }),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(proposalsTable.id, idResult.data.id),
        eq(proposalsTable.userId, req.userId)
      )
    )
    .returning();

  res.json(updated);
});

router.delete("/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  const parseResult = DeleteProposalParams.safeParse({ id: Number(req.params.id) });
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid proposal ID" });
    return;
  }

  const deleted = await db
    .delete(proposalsTable)
    .where(
      and(
        eq(proposalsTable.id, parseResult.data.id),
        eq(proposalsTable.userId, req.userId)
      )
    )
    .returning();

  if (!deleted.length) {
    res.status(404).json({ error: "Proposal not found" });
    return;
  }

  res.status(204).send();
});

router.post("/:id/generate", requireAuth, async (req: any, res: any): Promise<void> => {
  const idResult = GenerateProposalContentParams.safeParse({ id: Number(req.params.id) });
  if (!idResult.success) {
    res.status(400).json({ error: "Invalid proposal ID" });
    return;
  }

  const bodyResult = GenerateProposalContentBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [proposal] = await db
    .select()
    .from(proposalsTable)
    .where(
      and(
        eq(proposalsTable.id, idResult.data.id),
        eq(proposalsTable.userId, req.userId)
      )
    );

  if (!proposal) {
    res.status(404).json({ error: "Proposal not found" });
    return;
  }

  const { section, additionalContext } = bodyResult.data;

  const sectionLabels: Record<string, string> = {
    executiveSummary: "Executive Summary",
    understanding: "Understanding Your Needs",
    approach: "Our Approach",
    timelinePlan: "Timeline",
    investment: "Investment",
    whyUs: "Why Us",
    nextSteps: "Next Steps",
  };

  const proposalContext = `
Client: ${proposal.clientName}
Project: ${proposal.projectTitle}
Industry: ${proposal.industry || "Not specified"}
Project Description: ${proposal.projectDescription || "Not specified"}
Budget: ${proposal.budget || "Not specified"}
Timeline: ${proposal.timeline || "Not specified"}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}
`.trim();

  const generateSection = async (sectionName: string, label: string) => {
    const systemPrompt = `You are an expert proposal writer for agencies, consultants, and freelancers. Write compelling, professional proposal content that wins deals. Be specific, persuasive, and client-focused. Write in a confident, professional tone. Do not use emojis.`;

    const userPrompt = `Write the "${label}" section for a professional proposal with the following context:

${proposalContext}

Write 2-4 paragraphs of polished, persuasive content for just this section. Be specific to the project details provided. Do not include section headers or titles.`;

    return openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
    });
  };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (section === "all") {
    const sections = [
      "executiveSummary",
      "understanding",
      "approach",
      "timelinePlan",
      "investment",
      "whyUs",
      "nextSteps",
    ] as const;

    const updates: Record<string, string> = {};

    for (const s of sections) {
      const label = sectionLabels[s];
      let content = "";

      res.write(`data: ${JSON.stringify({ section: s, type: "start" })}\n\n`);

      const stream = await generateSection(s, label);
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          content += text;
          res.write(`data: ${JSON.stringify({ section: s, content: text })}\n\n`);
        }
      }

      updates[s] = content;
      res.write(`data: ${JSON.stringify({ section: s, type: "done" })}\n\n`);
    }

    await db
      .update(proposalsTable)
      .set({
        executiveSummary: updates.executiveSummary,
        understanding: updates.understanding,
        approach: updates.approach,
        timelinePlan: updates.timelinePlan,
        investment: updates.investment,
        whyUs: updates.whyUs,
        nextSteps: updates.nextSteps,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(proposalsTable.id, idResult.data.id),
          eq(proposalsTable.userId, req.userId)
        )
      );
  } else {
    const label = sectionLabels[section] || section;
    let fullContent = "";

    const stream = await generateSection(section, label);
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        fullContent += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    const fieldMap: Record<string, keyof typeof proposalsTable.$inferSelect> = {
      executiveSummary: "executiveSummary",
      understanding: "understanding",
      approach: "approach",
      timelinePlan: "timelinePlan",
      investment: "investment",
      whyUs: "whyUs",
      nextSteps: "nextSteps",
    };

    if (fieldMap[section]) {
      await db
        .update(proposalsTable)
        .set({
          [fieldMap[section]]: fullContent,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(proposalsTable.id, idResult.data.id),
            eq(proposalsTable.userId, req.userId)
          )
        );
    }
  }

  res.write(`data: [DONE]\n\n`);
  res.end();
});

router.post("/:id/duplicate", requireAuth, async (req: any, res: any): Promise<void> => {
  const parseResult = DuplicateProposalParams.safeParse({ id: Number(req.params.id) });
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid proposal ID" });
    return;
  }

  const [original] = await db
    .select()
    .from(proposalsTable)
    .where(
      and(
        eq(proposalsTable.id, parseResult.data.id),
        eq(proposalsTable.userId, req.userId)
      )
    );

  if (!original) {
    res.status(404).json({ error: "Proposal not found" });
    return;
  }

  const [duplicate] = await db
    .insert(proposalsTable)
    .values({
      userId: req.userId,
      clientName: original.clientName,
      clientEmail: original.clientEmail,
      projectTitle: `${original.projectTitle} (Copy)`,
      industry: original.industry,
      projectDescription: original.projectDescription,
      budget: original.budget,
      timeline: original.timeline,
      status: "draft",
      executiveSummary: original.executiveSummary,
      understanding: original.understanding,
      approach: original.approach,
      timelinePlan: original.timelinePlan,
      investment: original.investment,
      whyUs: original.whyUs,
      nextSteps: original.nextSteps,
    })
    .returning();

  res.status(201).json(duplicate);
});

router.patch("/:id/status", requireAuth, async (req: any, res: any): Promise<void> => {
  const idResult = UpdateProposalStatusParams.safeParse({ id: Number(req.params.id) });
  if (!idResult.success) {
    res.status(400).json({ error: "Invalid proposal ID" });
    return;
  }

  const bodyResult = UpdateProposalStatusBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const existing = await db
    .select()
    .from(proposalsTable)
    .where(
      and(
        eq(proposalsTable.id, idResult.data.id),
        eq(proposalsTable.userId, req.userId)
      )
    );

  if (!existing.length) {
    res.status(404).json({ error: "Proposal not found" });
    return;
  }

  const [updated] = await db
    .update(proposalsTable)
    .set({
      status: bodyResult.data.status,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(proposalsTable.id, idResult.data.id),
        eq(proposalsTable.userId, req.userId)
      )
    )
    .returning();

  res.json(updated);
});

export default router;
