import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Doc } from "../../convex/_generated/dataModel";

export const PostCard = ({ post }: { post: Doc<"posts"> }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-10%" }}
      className="flex flex-col gap-6 relative p-8 rounded-2xl bg-black/40 border border-primary/20 shadow-2xl shadow-primary/5 group"
    >
      <div className="absolute inset-0 bg-emerald-400/0 group-hover:bg-emerald-400/5 transition-colors duration-500 rounded-2xl -z-10" />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          {post.tags.map((tag) => (
            <span key={tag} className="text-primary bg-primary/5 font-mono text-xs tracking-widest uppercase px-3 py-1 rounded-full border border-primary/20 group-hover:border-emerald-400/50 transition-colors duration-300">
              {tag}
            </span>
          ))}
          <span className="text-muted/60 font-mono text-xs tracking-widest uppercase px-3 py-1 rounded-full border border-primary/10">
            {new Date(post.publishedAt).toLocaleDateString("sv-SE", { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tighter">
          {post.title}
        </h3>
        
        {post.excerpt && (
          <p className="text-muted/80 font-light leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </div>

      <Link to="/blog/$slug" params={{ slug: post.slug }} className="inline-flex items-center gap-3 text-primary font-mono font-bold uppercase tracking-widest mt-auto hover:text-emerald-400 transition-colors duration-300 w-max">
        Läs inlägg
        <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
      </Link>
    </motion.div>
  );
};
