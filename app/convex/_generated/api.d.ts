/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminAuth from "../adminAuth.js";
import type * as blogChats from "../blogChats.js";
import type * as blogSettings from "../blogSettings.js";
import type * as blogWrite from "../blogWrite.js";
import type * as myFunctions from "../myFunctions.js";
import type * as postTweet from "../postTweet.js";
import type * as posts from "../posts.js";
import type * as seed from "../seed.js";
import type * as tweetChats from "../tweetChats.js";
import type * as tweetSettings from "../tweetSettings.js";
import type * as tweetWrite from "../tweetWrite.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminAuth: typeof adminAuth;
  blogChats: typeof blogChats;
  blogSettings: typeof blogSettings;
  blogWrite: typeof blogWrite;
  myFunctions: typeof myFunctions;
  postTweet: typeof postTweet;
  posts: typeof posts;
  seed: typeof seed;
  tweetChats: typeof tweetChats;
  tweetSettings: typeof tweetSettings;
  tweetWrite: typeof tweetWrite;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
