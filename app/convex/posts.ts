import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { validateToken } from "./adminAuth";

async function clearFeaturedSlot(ctx: MutationCtx, order: number) {
  const existing = await ctx.db
    .query("posts")
    .filter((q) => q.eq(q.field("featuredOrder"), order))
    .first();
  if (existing) {
    await ctx.db.patch(existing._id, {
      featuredOrder: undefined,
      updatedAt: Date.now(),
    });
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_published")
      .order("desc")
      .collect();
  },
});

export const listFeatured = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("posts").collect();
    const featured = all
      .filter((p) => p.featuredOrder === 1 || p.featuredOrder === 2)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
    return featured;
  },
});

export const listForAdmin = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db
      .query("posts")
      .withIndex("by_published")
      .order("desc")
      .collect();
  },
});

export const listTitlesForTweetContext = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published")
      .order("desc")
      .take(10);
    return posts.map(p => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
    }));
  },
});

export const listForSitemap = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published")
      .order("desc")
      .collect();
    return posts.map((p) => ({
      slug: p.slug,
      updatedAt: p.updatedAt ?? p.publishedAt,
    }));
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getForAdmin = query({
  args: {
    token: v.string(),
    id: v.id("posts"),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    slug: v.string(),
    excerpt: v.optional(v.string()),
    body: v.string(),
    tags: v.array(v.string()),
    relatedProjectId: v.optional(v.string()),
    featuredOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    const now = Date.now();
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {
      throw new Error("A post with this slug already exists");
    }
    if (args.featuredOrder != null) {
      await clearFeaturedSlot(ctx, args.featuredOrder);
    }
    return await ctx.db.insert("posts", {
      title: args.title,
      slug: args.slug,
      excerpt: args.excerpt,
      body: args.body,
      tags: args.tags,
      publishedAt: now,
      updatedAt: now,
      relatedProjectId: args.relatedProjectId,
      featuredOrder: args.featuredOrder,
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    body: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    relatedProjectId: v.optional(v.string()),
    featuredOrder: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }
    const patch: Partial<typeof post> = {
      updatedAt: Date.now(),
    };
    if (args.title !== undefined) patch.title = args.title;
    if (args.slug !== undefined) patch.slug = args.slug;
    if (args.excerpt !== undefined) patch.excerpt = args.excerpt;
    if (args.body !== undefined) patch.body = args.body;
    if (args.tags !== undefined) patch.tags = args.tags;
    if (args.relatedProjectId !== undefined)
      patch.relatedProjectId = args.relatedProjectId;
    if (args.featuredOrder !== undefined) {
      const order = args.featuredOrder === null ? undefined : args.featuredOrder;
      if (order != null && (order === 1 || order === 2)) {
        await clearFeaturedSlot(ctx, order);
      }
      patch.featuredOrder = order;
    }
    await ctx.db.patch(args.id, patch);
    return args.id;
  },
});

export const setFeaturedOrder = mutation({
  args: {
    token: v.string(),
    postId: v.id("posts"),
    featuredOrder: v.union(v.literal(1), v.literal(2), v.null()),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const order = args.featuredOrder === null ? undefined : args.featuredOrder;
    if (order != null) {
      await clearFeaturedSlot(ctx, order);
    }
    await ctx.db.patch(args.postId, {
      featuredOrder: order,
      updatedAt: Date.now(),
    });
    return args.postId;
  },
});

export const remove = mutation({
  args: {
    token: v.string(),
    id: v.id("posts"),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.delete(args.id);
  },
});
