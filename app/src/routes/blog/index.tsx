import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PostCard } from '../../components/PostCard'
import { motion } from 'framer-motion';

export const Route = createFileRoute('/blog/')({
  component: BlogIndex,
})

function BlogIndex() {
  const posts = useQuery(api.posts.list);

  return (
    <main className="min-h-screen flex flex-col bg-[var(--background)] py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <header className="mb-16 md:mb-24 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block relative"
          >
            <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black tracking-tighter uppercase text-foreground mb-4">
              Idéer <span className="text-muted/50">&</span> Tankar
            </h1>
            <motion.div
              initial={{ width: "0%", left: "50%", x: "-50%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="absolute -bottom-4 h-1.5 md:h-2 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
            />
          </motion.div>
          <p className="mt-12 text-xl text-muted font-mono max-w-2xl uppercase tracking-widest">
            Ett arkiv av experiment, lärdomar och funderingar.
          </p>
        </header>

        {posts === undefined ? (
          <div className="text-center text-muted font-mono animate-pulse">Laddar inlägg...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted font-mono">Inga inlägg hittades.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
