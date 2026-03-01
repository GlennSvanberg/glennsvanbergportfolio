"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";
import { DEFAULT_INSTRUCTIONS } from "./tweetSettings";

export const chat = action({
  args: {
    token: v.string(),
    currentDraft: v.optional(v.string()),
    extraContext: v.optional(v.string()),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const valid = await ctx.runQuery(internal.adminAuth.checkToken, {
      token: args.token,
    });
    if (!valid) {
      throw new Error("Unauthorized: invalid or expired token");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const client = new OpenAI({ apiKey });

    const settings = await ctx.runQuery(api.tweetSettings.get);
    const instructions = settings?.instructions ?? DEFAULT_INSTRUCTIONS;
    const contextSection = settings?.context?.trim()
      ? `\n\n--- GENERAL CONTEXT ---\n${settings.context.trim()}`
      : "";
      
    let systemContent = instructions + contextSection;
    
    if (args.extraContext) {
      systemContent += `\n\n--- SPECIFIC CONTEXT FOR THIS TWEET ---\n${args.extraContext}`;
    }

    if (args.currentDraft) {
      systemContent += `\n\n--- CURRENT DRAFT ---\n${args.currentDraft}`;
    }

    const input: Array<{ role: "developer" | "user" | "assistant"; content: string }> = [
      { role: "developer", content: systemContent },
      ...args.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await client.responses.create({
      model: "gpt-5.2",
      input,
      stream: false,
    });

    const text = response.output_text ?? "";
    return { text };
  },
});
