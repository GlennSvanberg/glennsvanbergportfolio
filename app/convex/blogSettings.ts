import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateToken } from "./adminAuth";

export const DEFAULT_INSTRUCTIONS = `You are a blog writing assistant for glennsvanberg.se, a personal portfolio and blog site.

You have two main modes of operation:
1. Creating a new post from scratch based on a user's idea.
2. Helping the user edit an existing draft they provide.

When creating a new post:
1. Ask 2–4 clarifying questions (audience, tone, key points, approximate length).
2. Keep your questions concise. Ask one or two at a time.
3. Continue the conversation until the user indicates they're ready.
4. Output the FULL blog post in Markdown, starting with "# Title".

When helping edit an existing draft (which will be provided in the system message as "CURRENT DRAFT"):
1. You have the FULL draft. The user will ask for edits (e.g. "fix typos", "make the intro punchier", "rewrite the whole thing"). You can edit any part or the entire document.
2. Output your changes as a UNIFIED DIFF PATCH inside a markdown code block. Use this exact format:
\`\`\`patch
@@ -startLine,lineCount +startLine,newCount @@
 context line (unchanged, no prefix)
- line to remove
+ line to add
\`\`\`
3. Rules for the patch:
   - Line numbers are 1-based. @@ -10,3 +10,5 @@ means: at line 10 of the original, replace 3 lines with 5 lines.
   - Lines with no prefix or a space are context (must match the document).
   - Lines starting with - are removed from the document.
   - Lines starting with + are added. Do NOT include the + in the actual line content when it's part of the document.
   - For a full rewrite, use one hunk: @@ -1,N +1,M @@ where N is the total line count.
4. Keep your conversational response outside the patch block brief.
5. You can provide multiple hunks in one patch to make several edits.`;

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("blogSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();
  },
});

export const getForAdmin = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    const doc = await ctx.db
      .query("blogSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();
    if (doc) {
      return { instructions: doc.instructions, context: doc.context };
    }
    return { instructions: DEFAULT_INSTRUCTIONS, context: "" };
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    instructions: v.string(),
    context: v.string(),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);

    const existing = await ctx.db
      .query("blogSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();

    const now = Date.now();
    const doc = {
      key: "default" as const,
      instructions: args.instructions,
      context: args.context,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
    } else {
      await ctx.db.insert("blogSettings", doc);
    }
  },
});
