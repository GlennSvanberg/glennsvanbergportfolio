import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { validateToken } from "./adminAuth";
import type { MutationCtx } from "./_generated/server";

async function clearFeaturedSlot(ctx: MutationCtx, order: number) {
  const existing = await ctx.db
    .query("posts")
    .filter((q) => q.eq(q.field("featuredOrder"), order))
    .first();
  if (existing) {
    await ctx.db.patch("posts", existing._id, {
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
    return await ctx.db.get("posts", args.id);
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
    const post = await ctx.db.get("posts", args.id);
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
    await ctx.db.patch("posts", args.id, patch);
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
    const post = await ctx.db.get("posts", args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const order = args.featuredOrder === null ? undefined : args.featuredOrder;
    if (order != null) {
      await clearFeaturedSlot(ctx, order);
    }
    await ctx.db.patch("posts", args.postId, {
      featuredOrder: order,
      updatedAt: Date.now(),
    });
    return args.postId;
  },
});

const importResultValidator = v.object({
  id: v.id("posts"),
  slug: v.string(),
  status: v.union(v.literal("created"), v.literal("updated")),
});

/**
 * Create or update a post by slug. Internal only: callable from
 * `npx convex run` and the Convex dashboard/MCP, not from the public client.
 * Does not require the admin session token. Leaves featuredOrder and
 * relatedProjectId untouched.
 */
export const upsertFromImport = internalMutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.optional(v.string()),
    body: v.string(),
    tags: v.array(v.string()),
    publishedAt: v.optional(v.number()),
  },
  returns: importResultValidator,
  handler: async (ctx, args) => {
    const title = args.title.trim();
    const slug = args.slug.trim();
    const body = args.body.trim();
    if (title.length === 0) {
      throw new Error("Title is required");
    }
    if (body.length === 0) {
      throw new Error("Body is required");
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(
        "Slug must be lowercase letters, numbers, and single hyphens",
      );
    }
    const tags = args.tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    const excerpt = args.excerpt?.trim();
    const now = Date.now();

    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (existing) {
      const patch: {
        title: string;
        slug: string;
        body: string;
        tags: Array<string>;
        updatedAt: number;
        excerpt?: string;
        publishedAt?: number;
      } = {
        title,
        slug,
        body,
        tags,
        updatedAt: now,
      };
      if (excerpt !== undefined) {
        patch.excerpt = excerpt;
      }
      if (args.publishedAt !== undefined) {
        patch.publishedAt = args.publishedAt;
      }
      await ctx.db.patch("posts", existing._id, patch);
      return { id: existing._id, slug, status: "updated" as const };
    }

    const id = await ctx.db.insert("posts", {
      title,
      slug,
      body,
      tags,
      excerpt: excerpt && excerpt.length > 0 ? excerpt : undefined,
      publishedAt: args.publishedAt ?? now,
      updatedAt: now,
    });
    return { id, slug, status: "created" as const };
  },
});

export const remove = mutation({
  args: {
    token: v.string(),
    id: v.id("posts"),
  },
  handler: async (ctx, args) => {
    await validateToken(ctx, args.token);
    return await ctx.db.delete("posts", args.id);
  },
});
