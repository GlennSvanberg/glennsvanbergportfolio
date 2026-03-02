import { Link, createFileRoute } from '@tanstack/react-router'
import { useAction } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { NOINDEX_ROBOTS, buildPageMeta } from '~/lib/seo'

export const Route = createFileRoute('/anotherPage')({
  head: () =>
    buildPageMeta({
      title: 'Convex demo',
      description: 'Intern demosida for Convex + TanStack Start.',
      path: '/anotherPage',
      robots: NOINDEX_ROBOTS,
    }),
  component: AnotherPage,
})

function AnotherPage() {
  const callMyAction = useAction(api.myFunctions.myAction)

  const { data } = useSuspenseQuery(
    convexQuery(api.myFunctions.listNumbers, { count: 10 }),
  )

  return (
    <main className="p-8 flex flex-col gap-16">
      <h1 className="text-4xl font-bold text-center">
        Convex + Tanstack Start
      </h1>
      <div className="flex flex-col gap-8 max-w-lg mx-auto">
        <p>Tal: {data.numbers.join(', ')}</p>
        <p>Klicka på knappen nedan för att lägga till ett slumpmässigt tal i databasen.</p>
        <p>
          <button
            className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
            onClick={() => {
              callMyAction({
                first: Math.round(Math.random() * 100),
              }).then(() => alert('Tal tillagt!'))
            }}
          >
            Lägg till ett slumpmässigt tal
          </button>
        </p>
        <Link to="/" className="text-blue-600 underline hover:no-underline">
          Tillbaka
        </Link>
      </div>
    </main>
  )
}
