import * as React from "react";
import { cn } from "../lib/utils";
import type { Project } from "../data/projects";

/** px, matches Tailwind md: */
export const PROJECT_IMAGE_BREAKPOINT = 768;

export function getProjectImageUrls(project: Project): { desktop: string; mobile: string } | null {
  const desktop = project.imageUrlDesktop ?? project.imageUrl;
  const mobile = project.imageUrlMobile ?? project.imageUrl;
  return desktop ? { desktop, mobile: mobile ?? desktop } : null;
}

export function getProjectImageAlt(project: Project): string {
  return `Skarmbild av ${project.name}: ${project.description}`;
}

export function ResponsiveProjectImg({
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
  const imgClassName = cn("block w-full h-full", className);

  if (!useResponsive) {
    return (
      <img
        src={desktop}
        alt={alt}
        className={imgClassName}
        style={style}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <picture className="block w-full h-full">
      <source media={`(max-width: ${PROJECT_IMAGE_BREAKPOINT - 1}px)`} srcSet={mobile} />
      <img
        src={desktop}
        alt={alt}
        className={imgClassName}
        style={style}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
