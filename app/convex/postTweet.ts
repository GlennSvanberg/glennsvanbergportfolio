"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { TwitterApi } from "twitter-api-v2";

export const post = action({
  args: {
    token: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const valid = await ctx.runQuery(internal.adminAuth.checkToken, {
      token: args.token,
    });
    if (!valid) {
      throw new Error("Unauthorized: invalid or expired token");
    }

    const appKey = process.env.X_API_APP_KEY;
    const appSecret = process.env.X_API_APP_SECRET;
    const accessToken = process.env.X_API_ACCESS_TOKEN;
    const accessSecret = process.env.X_API_ACCESS_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      throw new Error(
        "X API credentials are not configured in environment variables. Missing one or more of: X_API_APP_KEY, X_API_APP_SECRET, X_API_ACCESS_TOKEN, X_API_ACCESS_SECRET"
      );
    }

    const client = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret,
    });

    try {
      // POST to X API v2
      const { data } = await client.v2.tweet(args.text);
      return { success: true, id: data.id, text: data.text };
    } catch (error: any) {
      console.error("Error posting to X:", error);
      const code = error?.code ?? error?.data?.code;
      const title = error?.data?.title;
      if (code === 402 || title === "CreditsDepleted") {
        throw new Error(
          "X API credits depleted. Purchase credits at console.x.com (Billing) to post tweets."
        );
      }
      throw new Error(`Failed to post tweet: ${error.message || "Unknown error"}`);
    }
  },
});
