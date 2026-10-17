import { createFileRoute } from '@tanstack/react-router'
import { renderRssResponse } from '~/lib/rss'

export const Route = createFileRoute('/rss.xml')({
  server: {
    handlers: {
      GET: () => renderRssResponse(),
    },
  },
})
