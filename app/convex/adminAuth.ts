import { v } from "convex/values";
import { internalQuery, mutation } from "./_generated/server";
import type { GenericDatabaseReader } from "convex/server";
import type { DataModel } from "./_generated/dataModel";

const TOKEN_EXPIRY_DAYS = 365;

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function validateToken(
  ctx: { db: GenericDatabaseReader<DataModel> },
  token: string
): Promise<void> {
  if (!token) {
    throw new Error("Unauthorized: missing token");
  }
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();
  if (!session) {
    throw new Error("Unauthorized: invalid token");
  }
  if (session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: token expired");
  }
}

export const checkToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token) return false;
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    return session !== null && session.expiresAt >= Date.now();
  },
});

export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      throw new Error("Admin credentials not configured");
    }

    if (args.username !== expectedUsername || args.password !== expectedPassword) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken();
    const expiresAt = Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    await ctx.db.insert("adminSessions", {
      token,
      expiresAt,
    });

    return { token };
  },
});
