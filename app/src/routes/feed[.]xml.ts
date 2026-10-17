import { createFileRoute } from '@tanstack/react-router'
import { renderRssResponse } from '~/lib/rss'

export const Route = createFileRoute('/feed.xml')({
  server: {
    handlers: {
      GET: () => renderRssResponse(),
    },
  },
})
