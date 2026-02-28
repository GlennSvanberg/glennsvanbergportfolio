import { createFileRoute } from '@tanstack/react-router'
import { ExploratoryProjects } from '../components/ExploratoryProjects'
import { ArrowDown } from 'lucide-react'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [activeWordIndex, setActiveWordIndex] = useState(2);
  const words = ["Experiments", "Apps", "Ideas"];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % words.length);
    }, 2000); // Change every 2 seconds
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <main className="min-h-screen flex flex-col items-center bg-[var(--background)]">
      {/* Hero Section */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative px-4 text-center">
        <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter uppercase text-white mb-6">
          Glenn <span className="block md:inline">Svanberg</span>
        </h1>
        <p className="text-xl md:text-3xl text-muted font-mono max-w-3xl lowercase tracking-widest border-b border-primary/30 pb-4 flex items-center justify-center gap-2 md:gap-4 flex-wrap">
          {words.map((word, index) => (
            <span key={word} className="flex items-center gap-2 md:gap-4">
              <span 
                className={`transition-all duration-500 ${
                  index === activeWordIndex 
                    ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] font-bold scale-110" 
                    : "text-muted font-normal scale-100"
                }`}
              >
                {word}
              </span>
              {index < words.length - 1 && <span className="text-muted/50">/</span>}
            </span>
          ))}
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
