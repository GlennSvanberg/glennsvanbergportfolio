import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateToken } from "./adminAuth";

const messageValidator = v.object({
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
});

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db
      .query("blogChats")
      .withIndex("by_updated")
      .order("desc")
      .take(50);
  },
});

export const get = query({
  args: {
    token: v.string(),
    id: v.id("blogChats"),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    const now = Date.now();
    return await ctx.db.insert("blogChats", {
      title: args.title ?? "New chat",
      messages: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("blogChats"),
    title: v.optional(v.string()),
    messages: v.optional(v.array(messageValidator)),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    const chat = await ctx.db.get(args.id);
    if (!chat) {
      throw new Error("Chat not found");
    }
    const patch: { title?: string; messages?: typeof chat.messages; updatedAt: number } = {
      updatedAt: Date.now(),
    };
    if (args.title !== undefined) patch.title = args.title;
    if (args.messages !== undefined) patch.messages = args.messages;
    await ctx.db.patch(args.id, patch);
    return args.id;
  },
});

export const remove = mutation({
  args: {
    token: v.string(),
    id: v.id("blogChats"),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    await ctx.db.delete(args.id);
    return args.id;
  },
});
