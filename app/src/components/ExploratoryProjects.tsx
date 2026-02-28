import * as React from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects } from "../data/projects";
import { cn } from "../lib/utils";
import type { Project } from "../data/projects";

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
          <div className="absolute inset-0 border border-primary/20 rounded-xl pointer-events-none z-20 group-hover:border-primary/50 transition-colors duration-500" />
          {/* Soft green overlay on hover */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500 pointer-events-none z-10 mix-blend-overlay" />
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

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">
      {/* Background Diagonal Element */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0 bg-primary/5 -skew-y-12 scale-150 origin-top-left"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute inset-0 z-0 bg-primary/10 -skew-y-12 translate-y-[60%] scale-150 origin-bottom-right"
      />

      <div className="container relative z-10 mx-auto px-4 md:px-8 flex flex-col gap-8 md:gap-12 max-w-4xl">
        {/* Content first - title always above photo */}
        <motion.div style={{ scale }} className="flex flex-col gap-6 relative z-20">
          <div className="flex flex-wrap gap-3 mb-4">
            {project.tags.map((tag) => (
              <span key={tag} className="text-primary bg-primary/10 font-mono text-sm tracking-wider uppercase px-3 py-1 rounded-full border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter leading-none whitespace-nowrap">
            {project.name}
          </h2>
          <p className="text-xl md:text-2xl text-foreground/80 font-light max-w-lg leading-relaxed border-l-2 border-primary/30 pl-4">
            {project.description}
          </p>
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-bold text-xl uppercase tracking-widest mt-8 hover:text-white transition-colors group w-max">
            Explore Project
            <ArrowUpRight className="w-8 h-8 group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform duration-300" />
          </a>
        </motion.div>

        {/* Screenshot - always below content so title sits above */}
        <motion.div style={{ y: y1 }} className="w-full max-w-[260px] md:max-w-lg mx-auto aspect-[9/19] md:aspect-[4/3] relative shrink-0 rounded-[2rem] md:rounded-2xl p-2 bg-black/40 border border-primary/20 shadow-2xl shadow-primary/5">
          <ProjectImage project={project} className="w-full h-full !rounded-[1.5rem] md:!rounded-xl" />
        </motion.div>
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

  const textX = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const y = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  
  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-24 bg-black border-y border-primary/10">
      
      {/* Massive Background Text */}
      <motion.div 
        style={{ x: textX }}
        className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10vw] font-black text-primary/5 uppercase pointer-events-none z-0 opacity-50"
      >
        {project.name} • {project.name} • 
      </motion.div>

      <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-5xl text-center flex flex-col items-center gap-8">
        {/* Mobile: content first, small screenshot. Desktop: screenshot hero with overlay */}
        <h3 className="text-4xl md:text-6xl font-bold text-white z-10 md:hidden uppercase tracking-widest whitespace-nowrap">{project.name}</h3>
        <motion.div style={{ y }} className="w-full max-w-[260px] md:max-w-none mx-auto aspect-[9/19] md:aspect-video p-2 md:p-4 flex flex-col items-center justify-center relative overflow-hidden mb-4 md:mb-12 rounded-[2rem] md:rounded-2xl bg-black/40 border border-primary/20 shadow-2xl shadow-primary/5">
           <ProjectImage project={project} className="absolute inset-0 w-full h-full !rounded-[1.5rem] md:!rounded-xl" />
           <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none rounded-[2rem] md:rounded-2xl" />
           <h3 className="hidden md:block text-4xl md:text-6xl font-bold text-white transition-colors duration-500 z-10 relative drop-shadow-2xl bg-black/50 px-6 py-2 border border-primary/30 uppercase tracking-widest whitespace-nowrap">{project.name}</h3>
        </motion.div>

        <div className="flex justify-center gap-3 flex-wrap w-full">
            {project.tags.map((tag) => (
              <span key={tag} className="text-primary bg-primary/10 font-mono text-sm tracking-widest uppercase px-4 py-1.5 rounded-full border border-primary/20">
                {tag}
              </span>
            ))}
        </div>
        
        <p className="text-2xl text-muted/80 font-serif italic max-w-2xl mx-auto leading-loose z-10 relative">
          "{project.description}"
        </p>

        <a href={project.url} target="_blank" rel="noopener noreferrer" className="relative mt-12 overflow-hidden px-12 py-4 border border-primary text-primary font-mono uppercase tracking-widest group z-10">
          <span className="relative z-10 group-hover:text-black transition-colors duration-300">Launch Project</span>
          <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </a>
      </div>
    </section>
  );
};

// --------------------------------------------------------
// Layout 3: Sticky Sidebar & Scrolling Content
// --------------------------------------------------------
const StickySidebarSection = ({ project }: { project: Project }) => {
  return (
    <section className="relative min-h-[100vh] py-32 container mx-auto px-4 md:px-8">
      <div className="flex flex-col md:flex-row gap-16 md:gap-32 h-full">
        {/* Sticky Left Column */}
        <div className="md:w-1/3 flex flex-col md:sticky top-32 h-max z-10">
          <h2 className="text-6xl font-black text-primary mb-6 whitespace-nowrap uppercase tracking-tighter">{project.name}</h2>
          <p className="text-xl text-foreground mb-8 border-l-4 border-primary pl-6">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            {project.tags.map((tag) => (
              <span key={tag} className="text-primary bg-primary/10 font-mono text-sm tracking-wider uppercase px-3 py-1 rounded-full border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white flex items-center gap-4 text-xl font-bold transition-colors w-max group">
            <div className="w-12 h-12 rounded-none border-2 border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="uppercase tracking-widest">Visit Site</span>
          </a>
        </div>

        {/* Scrolling Right Column */}
        <div className="md:w-2/3 flex flex-col gap-12 pt-16 md:pt-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            className="w-full max-w-[260px] md:max-w-none mx-auto aspect-[9/19] md:aspect-video relative rounded-[2rem] md:rounded-2xl p-2 bg-black/40 border border-primary/20 shadow-2xl shadow-primary/5"
          >
             <ProjectImage project={project} className="w-full h-full !rounded-[1.5rem] md:!rounded-xl" />
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};


// --------------------------------------------------------
// Main Component that maps projects to different layouts
// --------------------------------------------------------
export const ExploratoryProjects = () => {
  return (
    <div className="flex flex-col w-full">
      {projects.map((project, index) => {
        // Cycle through the 3 layouts
        const layoutType = index % 3;
        
        if (layoutType === 0) return <DiagonalSection key={project.id} project={project} />;
        if (layoutType === 1) return <CenterParallaxSection key={project.id} project={project} />;
        return <StickySidebarSection key={project.id} project={project} />;
      })}
    </div>
  );
};
