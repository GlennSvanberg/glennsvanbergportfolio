import { createFileRoute } from '@tanstack/react-router'
import { ExploratoryProjects } from '../components/ExploratoryProjects'
import { ArrowDown } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-[var(--background)]">
      {/* Hero Section */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative px-4 text-center">
        <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter uppercase text-white mb-6">
          Glenn <span className="text-primary block md:inline">Svanberg</span>
        </h1>
        <p className="text-xl md:text-3xl text-muted font-mono max-w-3xl lowercase tracking-widest border-b border-primary/30 pb-4">
          Experiments / Apps / Games
        </p>
        
        <div className="absolute bottom-12 animate-bounce text-primary flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-mono">Scroll</span>
          <ArrowDown />
        </div>
      </section>

      {/* Projects */}
      <ExploratoryProjects />
    </main>
  )
}
