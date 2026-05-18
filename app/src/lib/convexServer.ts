import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'

function getConvexUrl(): string {
  const url = import.meta.env.VITE_CONVEX_URL || process.env.VITE_CONVEX_URL
  if (!url) {
    throw new Error('VITE_CONVEX_URL is required')
  }
  return url
}

export function createConvexHttpClient(): ConvexHttpClient {
  return new ConvexHttpClient(getConvexUrl())
}

export async function fetchBlogPosts(): Promise<Array<Doc<'posts'>>> {
  const client = createConvexHttpClient()
  return await client.query(api.posts.list, {})
}

export async function fetchBlogPostBySlug(
  slug: string,
): Promise<Doc<'posts'> | null> {
  const client = createConvexHttpClient()
  return await client.query(api.posts.getBySlug, { slug })
}
