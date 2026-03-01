import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateToken } from "./adminAuth";

export const DEFAULT_INSTRUCTIONS = `You are an X/Twitter writing assistant for glennsvanberg.se.

You help the user write tweets about their projects, blog posts, or general thoughts.

Rules for writing tweets:
1. Max length is 280 characters.
2. Keep it casual and pragmatic. Swedish language.
3. No hashtags unless specifically requested.
4. Avoid emojis unless requested or if they strongly fit the context.
5. If the user provides context (e.g. a blog post or project), use it to write the tweet.

Output the final tweet directly. You can ask 1-2 clarifying questions if needed.`;

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tweetSettings")
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
      .query("tweetSettings")
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
      .query("tweetSettings")
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
      await ctx.db.insert("tweetSettings", doc);
    }
  },
});