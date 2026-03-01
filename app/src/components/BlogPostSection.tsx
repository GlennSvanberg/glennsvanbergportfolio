import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Doc } from "../../convex/_generated/dataModel";

export const BlogPostSection = ({ post }: { post: Doc<"posts"> }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  return (
    <section ref={ref} className="relative min-h-[70vh] flex flex-col justify-center overflow-hidden py-24 md:py-32 border-y border-primary/10 bg-black/20">
      {/* Background Diagonal Element */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0 bg-primary/5 -skew-y-3 scale-125 origin-top-left"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute inset-0 z-0 bg-primary/5 -skew-y-3 translate-y-[60%] scale-125 origin-bottom-right"
      />

      <div className="container relative z-10 mx-auto px-4 md:px-8 flex flex-col gap-8 md:gap-12 max-w-5xl">
        <div className="flex flex-col gap-6 md:gap-8 items-start">
          <motion.div style={{ scale }} className="flex flex-col gap-6 relative z-20 w-full pt-4">
            <div className="flex flex-col gap-2">
               <span className="text-primary font-mono text-sm tracking-widest uppercase mb-2">Blogg / Idéer</span>
               <div className="inline-block relative w-max">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground uppercase tracking-tighter leading-tight pb-2">
                    {post.title}
                  </h2>
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                    viewport={{ once: true, margin: "-15%" }}
                    className="absolute bottom-0 left-0 h-1 md:h-1.5 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                  />
               </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-primary bg-primary/5 font-mono text-xs tracking-widest uppercase px-3 py-1 rounded-full border border-primary/20 hover:text-emerald-400 hover:border-emerald-400 hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-300 cursor-default">
                  {tag}
                </span>
              ))}
              <span className="text-muted/60 font-mono text-xs tracking-widest uppercase px-3 py-1 rounded-full border border-primary/10">
                {new Date(post.publishedAt).toLocaleDateString("sv-SE", { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          
            {post.excerpt && (
              <div className="relative pl-6 py-1 max-w-3xl mt-4">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/30" />
                <motion.div 
                  initial={{ height: "0%" }}
                  whileInView={{ height: "100%" }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                  viewport={{ once: true }}
                  className="absolute left-0 top-0 w-[2px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                />
                <p className="text-xl md:text-2xl text-foreground/80 font-light leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            )}
            
            <Link to="/blog/$slug" params={{ slug: post.slug }} className="inline-flex items-center gap-3 text-primary font-mono font-bold text-lg uppercase tracking-widest mt-6 hover:text-emerald-400 hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-300 group w-max">
              Läs mer
              <ArrowUpRight className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
