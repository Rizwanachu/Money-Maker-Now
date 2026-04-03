import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { proposalsTable, usersTable } from "@workspace/db";
import { eq, and, desc, count } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateProposalBody,
  UpdateProposalBody,
  UpdateProposalStatusBody,
  ListProposalsQueryParams,
  GetProposalParams,
  UpdateProposalParams,
  DeleteProposalParams,
  GenerateProposalContentParams,
  UpdateProposalStatusParams,
} from "@workspace/api-zod";

const router = Router();

async function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;

  const clerkUser = auth?.sessionClaims;
  if (clerkUser) {
    await db
      .insert(usersTable)
      .values({
        clerkId: userId,
        email: (clerkUser.email as string) || "",
        name: ((clerkUser.firstName as string) || "") + " " + ((clerkUser.lastName as string) || ""),
      })
      .onConflictDoNothing();
  }

  next();
}

router.get("/", requireAuth, async (req: any, res: any): Promise<void> => {
  const parseResult = ListProposalsQueryParams.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { status, limit = 20, offset = 0 } = parseResult.data;

  const conditions: any[] = [eq(proposalsTable.userId, req.userId)];
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
      clientBrief: data.clientBrief,
      niche: data.niche,
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
      ...(data.clientBrief !== undefined && { clientBrief: data.clientBrief }),
      ...(data.niche !== undefined && { niche: data.niche }),
      ...(data.dealValue !== undefined && { dealValue: data.dealValue }),
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

  const systemPrompt = `You are an expert proposal writer for agencies and freelancers. Write compelling, professional proposal content that wins deals. Be specific, persuasive, and client-focused. Write in a confident, professional tone. Do not use emojis.`;

  const userPrompt = `Write a complete, winning proposal for the following:

Client: ${proposal.clientName}
Niche: ${proposal.niche}
Client Brief: ${proposal.clientBrief}

Generate all 7 sections of the proposal. For EACH section, output it in this exact format:
[SECTION:executiveSummary]
(section content here)
[/SECTION]

[SECTION:understanding]
(section content here)
[/SECTION]

[SECTION:approach]
(section content here)
[/SECTION]

[SECTION:timelinePlan]
(section content here)
[/SECTION]

[SECTION:investment]
(section content here)
[/SECTION]

[SECTION:whyUs]
(section content here)
[/SECTION]

[SECTION:nextSteps]
(section content here)
[/SECTION]

Write 2-4 paragraphs per section. Be specific to the client brief and niche provided. Do not include the section header labels in the content itself.`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sections: Record<string, string> = {};
  let currentSection = "";
  let currentContent = "";
  let buffer = "";

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (!text) continue;

    buffer += text;

    const startTagRegex = /\[SECTION:(\w+)\]/g;
    const endTag = "[/SECTION]";

    while (true) {
      if (!currentSection) {
        const match = startTagRegex.exec(buffer);
        if (!match) break;

        currentSection = match[1];
        buffer = buffer.slice(match.index + match[0].length);

        res.write(`data: ${JSON.stringify({ type: "section_start", section: currentSection })}\n\n`);
      } else {
        const endIdx = buffer.indexOf(endTag);
        if (endIdx !== -1) {
          const sectionChunk = buffer.slice(0, endIdx).trim();
          currentContent += sectionChunk;

          if (sectionChunk) {
            res.write(`data: ${JSON.stringify({ type: "content", section: currentSection, content: sectionChunk })}\n\n`);
          }

          sections[currentSection] = currentContent;
          res.write(`data: ${JSON.stringify({ type: "section_done", section: currentSection })}\n\n`);

          buffer = buffer.slice(endIdx + endTag.length);
          currentSection = "";
          currentContent = "";
          startTagRegex.lastIndex = 0;
        } else {
          const safeChunk = buffer.slice(0, -endTag.length);
          if (safeChunk) {
            currentContent += safeChunk;
            res.write(`data: ${JSON.stringify({ type: "content", section: currentSection, content: safeChunk })}\n\n`);
            buffer = buffer.slice(safeChunk.length);
          }
          break;
        }
      }
    }
  }

  await db
    .update(proposalsTable)
    .set({
      executiveSummary: sections.executiveSummary || null,
      understanding: sections.understanding || null,
      approach: sections.approach || null,
      timelinePlan: sections.timelinePlan || null,
      investment: sections.investment || null,
      whyUs: sections.whyUs || null,
      nextSteps: sections.nextSteps || null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(proposalsTable.id, idResult.data.id),
        eq(proposalsTable.userId, req.userId)
      )
    );

  res.write(`data: [DONE]\n\n`);
  res.end();
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
      ...(bodyResult.data.dealValue !== undefined && { dealValue: bodyResult.data.dealValue }),
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
