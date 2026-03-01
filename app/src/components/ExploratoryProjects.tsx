import * as React from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects } from "../data/projects";
import { cn } from "../lib/utils";
import type { Project } from "../data/projects";
import type { Doc } from "../../convex/_generated/dataModel";
import { BlogPostSection } from "./BlogPostSection";

// --------------------------------------------------------
// Responsive image: desktop (md+) vs mobile
// --------------------------------------------------------
const PROJECT_IMAGE_BREAKPOINT = 768; // px, matches Tailwind md:

function getProjectImageUrls(project: Project): { desktop: string; mobile: string } | null {
  const desktop = project.imageUrlDesktop ?? project.imageUrl;
  const mobile = project.imageUrlMobile ?? project.imageUrl;
  return desktop ? { desktop, mobile: mobile ?? desktop } : null;
}

function ResponsiveProjectImg({
  project,
  alt,
  className,
  style,
}: {
  project: Project;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const urls = getProjectImageUrls(project);
  if (!urls) return null;

  const { desktop, mobile } = urls;
  const useResponsive = desktop !== mobile;

  if (!useResponsive) {
    return <img src={desktop} alt={alt} className={className} style={style} />;
  }

  return (
    <picture>
      <source media={`(max-width: ${PROJECT_IMAGE_BREAKPOINT - 1}px)`} srcSet={mobile} />
      <img src={desktop} alt={alt} className={className} style={style} />
    </picture>
  );
}

// --------------------------------------------------------
// ProjectImage Component
// --------------------------------------------------------
const ProjectImage = ({ project, className }: { project: Project; className?: string }) => {
  const urls = getProjectImageUrls(project);

  return (
    <div className={cn("relative group overflow-hidden bg-black/50 rounded-xl shadow-2xl shadow-black/50", className)}>
      {urls ? (
        <>
          {/* Base image - clean and professional */}
          <motion.div
            initial={{ filter: "grayscale(100%)" }}
            whileInView={{ filter: "grayscale(0%)" }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            viewport={{ once: true, margin: "-10%" }}
            className="absolute inset-0 w-full h-full"
          >
            <ResponsiveProjectImg
              project={project}
              alt={project.name}
              className="w-full h-full object-contain md:object-cover object-top md:object-center"
            />
          </motion.div>
          {/* Soft inner glow/border */}
          <div className="absolute inset-0 border border-primary/20 rounded-xl pointer-events-none z-20 group-hover:border-emerald-400/50 transition-colors duration-500" />
          {/* Soft green overlay on hover */}
          <div className="absolute inset-0 bg-emerald-400/0 group-hover:bg-emerald-400/10 transition-colors duration-500 pointer-events-none z-10 mix-blend-overlay" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-12 bg-card/50 transition-all duration-500 rounded-xl border border-primary/10">
          <span className="text-primary/20 font-mono text-5xl md:text-9xl font-black -rotate-90 origin-center whitespace-nowrap">
            {project.name}
          </span>
        </div>
      )}
    </div>
  );
};

// --------------------------------------------------------
// Layout 1: Diagonal Split with Large Typography
// --------------------------------------------------------
const DiagonalSection = ({ project }: { project: Project }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col justify-center overflow-hidden py-24 md:py-32">
      {/* Background Diagonal Element */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0 bg-primary/5 -skew-y-6 scale-125 origin-top-left"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute inset-0 z-0 bg-primary/5 -skew-y-6 translate-y-[60%] scale-125 origin-bottom-right"
      />

      <div className="container relative z-10 mx-auto px-4 md:px-8 flex flex-col gap-12 md:gap-16 max-w-7xl">
        {/* Full width title */}
        <div className="w-full relative">
          <div className="inline-block relative">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-black text-foreground uppercase tracking-tighter leading-none cursor-default pb-3">
              {project.name}
            </h2>
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              viewport={{ once: true, margin: "-15%" }}
              className="absolute bottom-0 left-0 h-1.5 md:h-2 lg:h-3 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
          {/* Content */}
          <motion.div style={{ scale }} className="flex flex-col gap-8 relative z-20 order-2 md:order-1 pt-4">
            <div className="flex flex-wrap gap-3">
              {project.tags.map((tag) => (
                <span key={tag} className="text-primary bg-primary/5 font-mono text-xs tracking-widest uppercase px-3 py-1 rounded-full border border-primary/20 hover:text-emerald-400 hover:border-emerald-400 hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-300 cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          
            <div className="relative pl-6 py-1">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/30" />
              <motion.div 
                initial={{ height: "0%" }}
                whileInView={{ height: "100%" }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                viewport={{ once: true }}
                className="absolute left-0 top-0 w-[2px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              />
              <p className="text-xl md:text-2xl text-foreground/80 font-light leading-relaxed">
                {project.description}
              </p>
            </div>
            
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-primary font-mono font-bold text-lg uppercase tracking-widest mt-4 hover:text-emerald-400 hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-300 group w-max">
              Utforska projekt
              <ArrowUpRight className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </motion.div>

          {/* Screenshot */}
          <motion.div style={{ y: y1 }} className="w-full max-w-[280px] md:max-w-full mx-auto aspect-[9/19] md:aspect-[4/3] relative shrink-0 rounded-[2rem] md:rounded-2xl p-2 bg-black/40 border border-primary/20 shadow-2xl shadow-primary/5 order-1 md:order-2 group">
            <div className="absolute inset-0 bg-emerald-400/0 group-hover:bg-emerald-400/10 blur-xl transition-colors duration-500 rounded-full -z-10" />
            <ProjectImage project={project} className="w-full h-full !rounded-[1.5rem] md:!rounded-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --------------------------------------------------------
// Layout 2: Massive Center Parallax Text
// --------------------------------------------------------
const CenterParallaxSection = ({ project }: { project: Project }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const textX = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  const y = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  
  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-24 bg-black border-y border-primary/10">
      
      {/* Massive Background Text */}
      <motion.div 
        style={{ x: textX }}
        className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[12vw] font-black text-primary/5 uppercase pointer-events-none z-0 opacity-40 mix-blend-screen"
      >
        {project.name} • {project.name} • 
      </motion.div>

      <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-6xl text-center flex flex-col items-center gap-12">
        <div className="relative inline-block z-10">
          <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-black text-foreground uppercase tracking-tighter cursor-default leading-none pb-3">
            {project.name}
          </h3>
          <motion.div
            initial={{ width: "0%", left: "50%", x: "-50%" }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true, margin: "-15%" }}
            className="absolute bottom-0 h-1.5 md:h-2 lg:h-3 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
          />
        </div>
        
        <motion.div style={{ y }} className="w-full max-w-[280px] md:max-w-none mx-auto aspect-[9/19] md:aspect-video p-2 md:p-3 flex flex-col items-center justify-center relative overflow-hidden rounded-[2rem] md:rounded-2xl bg-black/40 border border-primary/20 shadow-2xl shadow-primary/5 group">
           <ProjectImage project={project} className="absolute inset-0 w-full h-full !rounded-[1.5rem] md:!rounded-xl" />
        </motion.div>

        <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto">
          <div className="flex justify-center gap-3 flex-wrap w-full">
              {project.tags.map((tag) => (
                <span key={tag} className="text-primary bg-primary/5 font-mono text-xs tracking-widest uppercase px-4 py-1.5 rounded-full border border-primary/20 hover:text-emerald-400 hover:border-emerald-400 hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-300 cursor-default">
                  {tag}
                </span>
              ))}
          </div>
          
          <p className="text-xl md:text-2xl text-muted/80 font-serif italic leading-relaxed z-10 relative">
            "{project.description}"
          </p>

          <a href={project.url} target="_blank" rel="noopener noreferrer" className="relative overflow-hidden px-10 py-4 border border-primary text-primary font-mono text-sm uppercase tracking-widest group z-10 hover:border-emerald-400 hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-300">
            <span className="relative z-10 group-hover:text-black transition-colors duration-300 font-bold">Starta projekt</span>
            <div className="absolute inset-0 bg-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </a>
        </div>
      </div>
    </section>
  );
};

// --------------------------------------------------------
// Layout 3: Sticky Sidebar & Scrolling Content
// --------------------------------------------------------
const StickySidebarSection = ({ project }: { project: Project }) => {
  return (
    <section className="relative min-h-[100vh] py-32 container mx-auto px-4 md:px-8 max-w-7xl">
      <div className="flex flex-col gap-12 md:gap-16 h-full relative">
        {/* Full width title */}
        <div className="w-full relative">
          <div className="inline-block relative">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-black text-foreground uppercase tracking-tighter leading-none cursor-default pb-3">
              {project.name}
            </h2>
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              viewport={{ once: true, margin: "-15%" }}
              className="absolute bottom-0 left-0 h-1.5 md:h-2 lg:h-3 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-16 md:gap-24">
          {/* Sticky Left Column */}
          <div className="md:w-5/12 flex flex-col md:sticky top-32 h-max z-10">
            <div className="flex flex-col gap-6 pr-4">
              <p className="text-xl md:text-2xl text-foreground/80 font-light leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-primary bg-primary/5 font-mono text-xs tracking-widest uppercase px-3 py-1 rounded-full border border-primary/20 hover:text-emerald-400 hover:border-emerald-400 hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-300 cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
              
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] hover:drop-shadow-[0_0_12px_rgba(52,211,153,0.8)] flex items-center gap-4 text-lg font-mono font-bold transition-all duration-300 w-max group mt-8">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-400/80 flex items-center justify-center group-hover:bg-emerald-400 group-hover:border-emerald-400 group-hover:text-black transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="uppercase tracking-widest">Besök webbplats</span>
              </a>
            </div>
          </div>

          {/* Scrolling Right Column */}
          <div className="md:w-7/12 flex flex-col gap-12 pt-8 md:pt-0">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-10%" }}
              className="w-full max-w-[280px] md:max-w-none mx-auto aspect-[9/19] md:aspect-[4/3] relative rounded-[2rem] md:rounded-2xl p-2 bg-black/40 border border-primary/20 shadow-2xl shadow-primary/5 group"
            >
               <div className="absolute inset-0 bg-emerald-400/0 group-hover:bg-emerald-400/10 blur-2xl transition-colors duration-700 rounded-full -z-10" />
               <ProjectImage project={project} className="w-full h-full !rounded-[1.5rem] md:!rounded-xl" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};


// --------------------------------------------------------
// Main Component that maps projects to different layouts
// --------------------------------------------------------
export const ExploratoryProjects = ({ posts = [] }: { posts?: Doc<"posts">[] }) => {
  // Build combined array
  const combinedItems: Array<{ type: 'project'; data: Project; projectIndex: number } | { type: 'post'; data: Doc<"posts"> }> = [];
  
  const N = projects.length;
  // If we have 2 posts, insert at ~1/3 and ~2/3
  const insertIndex1 = Math.floor(N / 3);
  const insertIndex2 = Math.floor((2 * N) / 3);

  let postCount = 0;
  projects.forEach((project, i) => {
    // Insert post BEFORE this project if it's the target index
    if (posts.length > postCount) {
      if (postCount === 0 && i === insertIndex1) {
        combinedItems.push({ type: 'post', data: posts[postCount] });
        postCount++;
      } else if (postCount === 1 && i === insertIndex2) {
        combinedItems.push({ type: 'post', data: posts[postCount] });
        postCount++;
      }
    }
    
    combinedItems.push({ type: 'project', data: project, projectIndex: i });
  });

  // If there are leftover posts (e.g. projects array is empty or too short), just append them
  while (postCount < posts.length) {
    combinedItems.push({ type: 'post', data: posts[postCount] });
    postCount++;
  }

  return (
    <div className="flex flex-col w-full">
      {combinedItems.map((item) => {
        if (item.type === 'post') {
          return <BlogPostSection key={item.data._id} post={item.data} />;
        }

        // Cycle through the 3 layouts for projects
        const layoutType = item.projectIndex % 3;
        
        if (layoutType === 0) return <DiagonalSection key={item.data.id} project={item.data} />;
        if (layoutType === 1) return <CenterParallaxSection key={item.data.id} project={item.data} />;
        return <StickySidebarSection key={item.data.id} project={item.data} />;
      })}
    </div>
  );
};
