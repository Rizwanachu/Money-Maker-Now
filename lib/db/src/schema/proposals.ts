import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const proposalStatusEnum = ["draft", "sent", "accepted", "declined"] as const;
export type ProposalStatus = (typeof proposalStatusEnum)[number];

export const proposalsTable = pgTable("proposals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  projectTitle: text("project_title").notNull(),
  industry: text("industry"),
  projectDescription: text("project_description"),
  budget: text("budget"),
  timeline: text("timeline"),
  status: text("status").$type<ProposalStatus>().notNull().default("draft"),
  executiveSummary: text("executive_summary"),
  understanding: text("understanding"),
  approach: text("approach"),
  timelinePlan: text("timeline_plan"),
  investment: text("investment"),
  whyUs: text("why_us"),
  nextSteps: text("next_steps"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProposalSchema = createInsertSchema(proposalsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposalsTable.$inferSelect;
