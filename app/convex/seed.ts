import { internalMutation } from "./_generated/server";

const FEATURED_SLUGS = ["bygga-sma-appar-som-lar", "ideer-som-vaxer"];

const SAMPLE_POSTS = [
  {
    title: "Bygga små appar som lär",
    slug: "bygga-sma-appar-som-lar",
    excerpt:
      "Ett perspektiv på varför jag skapar experiment och små webbappar – och vad jag lär mig längs vägen.",
    body: `## Varför små projekt?

Jag tror att det bästa sättet att lära sig är att bygga. Inte genom att läsa dokumentation i timmar, utan genom att sätta igång och lösa ett konkret problem.

### Vad jag har lärt mig

- **Realtid** – WebSockets, Convex, Supabase Realtime
- **AI** – Bildgenerering, embeddings, prompt design
- **UX** – Friktionsfria flöden, mobilförst

Det här är bara sample-text. Du kan redigera eller ta bort detta inlägg i admin-studion.`,
    tags: ["Lärande", "Experiment", "Webb"],
  },
  {
    title: "Idéer som växer",
    slug: "ideer-som-vaxer",
    excerpt:
      "Hur jag hanterar idéer – från anteckning till prototyp. Ett enkelt flöde utan för mycket verktyg.",
    body: `## Från idé till verklighet

Jag skriver ner idéer i en enkel lista. När något känns rätt tar jag fram en prototyp.

### Min process

1. **Anteckna** – Kort och koncist
2. **Prioritera** – Vad vill jag bygga nu?
3. **Bygga** – Minimalt, snabbt, testa

> "The best way to predict the future is to invent it."

Det här är sample-text. Redigera eller ta bort i admin-studion.`,
    tags: ["Produktivitet", "Idéer", "Process"],
  },
];

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let inserted = 0;

    for (const post of SAMPLE_POSTS) {
      const existing = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", post.slug))
        .unique();

      if (!existing) {
        await ctx.db.insert("posts", {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          tags: post.tags,
          publishedAt: now - (SAMPLE_POSTS.length - inserted) * 86400000,
          updatedAt: now,
        });
        inserted++;
      }
    }

    return { inserted, total: SAMPLE_POSTS.length };
  },
});

export const seedFeatured = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (let i = 0; i < FEATURED_SLUGS.length; i++) {
      const slug = FEATURED_SLUGS[i];
      const order = i + 1;
      const post = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (post) {
        const existing = await ctx.db
          .query("posts")
          .filter((q) => q.eq(q.field("featuredOrder"), order))
          .first();
        if (existing && existing._id !== post._id) {
          await ctx.db.patch(existing._id, {
            featuredOrder: undefined,
            updatedAt: Date.now(),
          });
        }
        await ctx.db.patch(post._id, {
          featuredOrder: order,
          updatedAt: Date.now(),
        });
      }
    }
    return { done: true };
  },
});
