import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  adminSessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),
  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.optional(v.string()),
    body: v.string(),
    tags: v.array(v.string()),
    publishedAt: v.number(),
    updatedAt: v.optional(v.number()),
    relatedProjectId: v.optional(v.string()),
    featuredOrder: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["publishedAt"])
    .index("by_tags", ["tags"])
    .index("by_featured_order", ["featuredOrder"]),
  blogChats: defineTable({
    title: v.string(),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_updated", ["updatedAt"]),
});
