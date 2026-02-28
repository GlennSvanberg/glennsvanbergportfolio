import * as React from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Project } from "../data/projects";
import { projects } from "../data/projects";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../lib/utils";

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
// GlitchProjectImage Component
// --------------------------------------------------------
const GlitchProjectImage = ({ project, className }: { project: Project; className?: string }) => {
  const urls = getProjectImageUrls(project);

  return (
    <div className={cn("relative group overflow-hidden border-2 border-primary/30 bg-black", className)}>
      {/* Scanlines */}
      <div className="absolute inset-0 z-10 scanlines pointer-events-none opacity-50 mix-blend-overlay" />
      
      {urls ? (
        <>
          {/* Base grayscale image - object-contain on mobile (portrait) so full screenshot visible, object-cover on desktop */}
          <ResponsiveProjectImg
            project={project}
            alt={project.name}
            className="absolute inset-0 w-full h-full object-contain md:object-cover object-top object-left md:object-center filter grayscale contrast-125 brightness-75 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 transition-all duration-0"
          />
          {/* Glitch layers visible on hover */}
          <ResponsiveProjectImg
            project={project}
            alt=""
            className="absolute inset-0 w-full h-full object-contain md:object-cover object-top object-left md:object-center opacity-0 group-hover:opacity-100 mix-blend-screen glitch-clip-1 translate-x-1"
            style={{ filter: 'drop-shadow(2px 0 0 red)' }}
          />
          <ResponsiveProjectImg
            project={project}
            alt=""
            className="absolute inset-0 w-full h-full object-contain md:object-cover object-top object-left md:object-center opacity-0 group-hover:opacity-100 mix-blend-screen glitch-clip-2 -translate-x-1"
            style={{ filter: 'drop-shadow(-2px 0 0 cyan)' }}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-12 bg-card filter grayscale contrast-125 brightness-75 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 transition-all duration-0">
          <span className="text-primary/20 font-mono text-5xl md:text-9xl font-black -rotate-90 origin-center whitespace-nowrap">
            {project.name}
          </span>
        </div>
      )}

      {/* Harsh Neon Border glow on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary transition-colors duration-0 z-20 shadow-[inset_0_0_20px_rgba(57,255,20,0)] group-hover:shadow-[inset_0_0_20px_rgba(57,255,20,0.5)] pointer-events-none" />
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

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <section ref={ref} className="relative min-h-[120vh] flex items-center justify-center overflow-hidden py-32">
      {/* Background Diagonal Element */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0 bg-primary/5 -skew-y-12 scale-150 origin-top-left"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute inset-0 z-0 bg-primary/10 -skew-y-12 translate-y-[60%] scale-150 origin-bottom-right"
      />

      <div className="container relative z-10 mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        {/* Content first on mobile, left on desktop */}
        <motion.div style={{ scale }} className="order-1 md:order-1 flex flex-col gap-6">
          <div className="flex flex-wrap gap-3 mb-4">
            {project.tags.map((tag) => (
              <span key={tag} className="text-primary font-mono text-sm tracking-wider uppercase border border-primary/30 px-3 py-1 rounded-none">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-foreground uppercase tracking-tighter leading-none">
            {project.name}
          </h2>
          <p className="text-xl md:text-2xl text-muted font-light max-w-lg leading-relaxed">
            {project.description}
          </p>
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-bold text-xl uppercase tracking-widest mt-8 hover:text-white transition-colors group w-max">
            Explore Project
            <ArrowUpRight className="w-8 h-8 group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform duration-300" />
          </a>
        </motion.div>

        {/* Screenshot - compact preview on mobile, full on desktop */}
        <motion.div style={{ y: y1 }} className="order-2 md:order-2 w-full max-w-[220px] md:max-w-none mx-auto aspect-[9/19] md:aspect-[4/3] relative shrink-0">
          <GlitchProjectImage project={project} className="w-full h-full" />
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

  const textX = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const y = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  
  return (
    <section ref={ref} className="relative min-h-[150vh] flex flex-col items-center justify-center overflow-hidden py-32 bg-black border-y border-primary/10">
      
      {/* Massive Background Text */}
      <motion.div 
        style={{ x: textX }}
        className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[15vw] font-black text-primary/5 uppercase pointer-events-none z-0"
      >
        {project.name} • {project.name} • 
      </motion.div>

      <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-5xl text-center flex flex-col items-center gap-8">
        {/* Mobile: content first, small screenshot. Desktop: screenshot hero with overlay */}
        <h3 className="text-4xl md:text-6xl font-bold text-white z-10 md:hidden uppercase tracking-widest">{project.name}</h3>
        <motion.div style={{ y }} className="w-full max-w-[200px] md:max-w-none mx-auto aspect-[9/19] md:aspect-video p-4 flex flex-col items-center justify-center relative overflow-hidden mb-4 md:mb-12">
           <GlitchProjectImage project={project} className="absolute inset-0 w-full h-full border-primary/20" />
           <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />
           <h3 className="hidden md:block text-4xl md:text-6xl font-bold text-white transition-colors duration-500 z-10 relative drop-shadow-2xl bg-black/50 px-6 py-2 border border-primary/30 uppercase tracking-widest">{project.name}</h3>
        </motion.div>

        <div className="flex justify-center gap-4 flex-wrap w-full">
            {project.tags.map((tag) => (
              <span key={tag} className="text-white bg-primary/10 text-sm tracking-widest uppercase px-6 py-2 rounded-none border-l-4 border-primary">
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
          <h2 className="text-6xl font-black text-primary mb-6 break-words uppercase tracking-tighter">{project.name}</h2>
          <p className="text-xl text-foreground mb-8 border-l-4 border-primary pl-6">
            {project.description}
          </p>
          <div className="flex flex-col gap-2 mb-12">
            {project.tags.map((tag) => (
              <span key={tag} className="text-muted font-mono uppercase text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-primary inline-block" /> {tag}
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
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            className="w-full max-w-[220px] md:max-w-none mx-auto aspect-[9/19] md:aspect-video relative"
          >
             <GlitchProjectImage project={project} className="w-full h-full" />
          </motion.div>
          
          {/* Decorative second box to maintain scrolling rhythm */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            className="w-4/5 ml-auto aspect-video bg-black border-2 border-primary/20 overflow-hidden relative group"
          >
             <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
             <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                 <div className="w-full h-[2px] bg-primary/20 group-hover:bg-primary/50 transition-colors" />
                 <div className="w-full h-[2px] bg-primary/20 group-hover:bg-primary/50 transition-colors" />
                 <div className="w-full h-[2px] bg-primary/20 group-hover:bg-primary/50 transition-colors" />
             </div>
             <div className="absolute bottom-4 right-4 text-primary/30 font-mono text-xs uppercase tracking-widest group-hover:text-primary transition-colors">
               SYS.MODULE // {project.id.toUpperCase()}
             </div>
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
