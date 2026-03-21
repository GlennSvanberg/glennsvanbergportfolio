import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { ResponsiveProjectImg, getProjectImageAlt, getProjectImageUrls } from "./projectMedia";
import type { Project } from "../data/projects";

/** Visible project cards before user expands the full grid */
const GRID_PREVIEW_COUNT = 4;

function scrollToProjectAnchor(projectId: string, reduceMotion: boolean) {
  const el = document.getElementById(`project-${projectId}`);
  el?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

export type ProjectDirectoryProps = {
  /** Projects matching current filters (grid + count) */
  filteredProjects: Array<Project>;
  totalProjectCount: number;
  uniqueTags: Array<string>;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  activeTag: string | null;
  onActiveTagChange: (tag: string | null) => void;
  onClearFilters: () => void;
  hasActiveFilter: boolean;
};

export function ProjectDirectory({
  filteredProjects,
  totalProjectCount,
  uniqueTags,
  searchQuery,
  onSearchQueryChange,
  activeTag,
  onActiveTagChange,
  onClearFilters,
  hasActiveFilter,
}: ProjectDirectoryProps) {
  const reduceMotion = useReducedMotion();
  const searchId = React.useId();
  const [gridExpanded, setGridExpanded] = React.useState(false);

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      onActiveTagChange(null);
    } else {
      onActiveTagChange(tag);
    }
  };

  const resultsKey = `${searchQuery.trim()}\0${activeTag ?? ""}`;

  const canExpandGrid = filteredProjects.length > GRID_PREVIEW_COUNT;
  const visibleProjects =
    gridExpanded || !canExpandGrid ? filteredProjects : filteredProjects.slice(0, GRID_PREVIEW_COUNT);

  return (
    <section
      id="project-directory"
      className="relative w-full scroll-mt-24 border-y border-primary/10 bg-[var(--background)] py-20 md:py-28 md:scroll-mt-28"
      aria-label="Projektkatalog"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-400/[0.03] via-transparent to-transparent" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 md:mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Projekt</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tighter text-foreground md:text-4xl lg:text-5xl">
              Utforska arbeten
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
              Filtrera efter intresse eller sök — hoppa sedan ned till varje case i full längd.
            </p>
            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted">
              <Link
                to="/blog"
                className="text-emerald-400/90 underline decoration-emerald-400/30 underline-offset-4 transition-colors hover:text-emerald-400 hover:decoration-emerald-400/60"
              >
                Se bloggen
              </Link>
              <span className="text-muted/50"> · </span>
              <span>
                {hasActiveFilter
                  ? `${filteredProjects.length} träff${filteredProjects.length === 1 ? "" : "ar"}`
                  : `${totalProjectCount} projekt`}
              </span>
            </p>
          </div>

          <div className="w-full max-w-md shrink-0">
            <label htmlFor={searchId} className="sr-only">
              Sök bland projekt
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                id={searchId}
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Sök bland projekt…"
                autoComplete="off"
                className={cn(
                  "w-full rounded-lg border bg-card/80 py-3.5 pl-11 pr-4 font-mono text-sm text-foreground shadow-inner shadow-black/20 outline-none backdrop-blur-sm transition-[border-color,box-shadow] placeholder:text-muted/60 focus:ring-2",
                  searchQuery.trim()
                    ? "border-emerald-400/40 ring-1 ring-emerald-400/15 focus:border-emerald-400/60 focus:ring-emerald-400/25"
                    : "border-primary/20 focus:border-emerald-400/50 focus:ring-emerald-400/20",
                )}
              />
            </div>
          </div>
        </div>

        <div className="mb-10 md:mb-12">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted">Taggar</p>
          <div
            className={cn(
              "flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none]",
              "[&::-webkit-scrollbar]:hidden",
            )}
          >
            <button
              type="button"
              onClick={() => onActiveTagChange(null)}
              aria-pressed={activeTag === null}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-300",
                activeTag === null
                  ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                  : "border-primary/20 bg-primary/5 text-muted hover:border-emerald-400/40 hover:text-foreground",
              )}
            >
              Alla
            </button>
            {uniqueTags.map((tag) => {
              const selected = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  aria-pressed={selected}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-300",
                    selected
                      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                      : "border-primary/20 bg-primary/5 text-muted hover:border-emerald-400/40 hover:text-foreground",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key="empty"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-card/40 py-20 text-center"
            >
              <p className="max-w-md text-lg text-muted">Inga projekt matchar din sökning eller tagg.</p>
              <button
                type="button"
                onClick={onClearFilters}
                className="mt-6 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-emerald-400 transition-colors hover:bg-emerald-400/20"
              >
                Rensa filter
              </button>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="relative">
            {hasActiveFilter ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8 rounded-xl border border-emerald-400/25 bg-gradient-to-r from-emerald-400/[0.08] via-card/60 to-transparent px-5 py-4 md:px-6 md:py-5"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/90">Resultat</p>
                <p className="mt-2 text-sm text-foreground/90 md:text-base">
                  {searchQuery.trim() ? (
                    <>
                      Sökning:{" "}
                      <span className="font-semibold text-emerald-400/95">&ldquo;{searchQuery.trim()}&rdquo;</span>
                    </>
                  ) : null}
                  {searchQuery.trim() && activeTag ? <span className="text-muted"> · </span> : null}
                  {activeTag ? (
                    <>
                      Tagg: <span className="font-semibold text-emerald-400/95">{activeTag}</span>
                    </>
                  ) : null}
                </p>
                <p className="mt-1 font-mono text-xs text-muted">
                  {filteredProjects.length} projekt — klicka på ett kort för att läsa mer nedan
                </p>
              </motion.div>
            ) : null}

            <motion.div layout={!reduceMotion} className="relative rounded-2xl border border-primary/10 bg-card/20 p-1 md:p-2">
              {hasActiveFilter ? (
                <div
                  className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full bg-emerald-400/70 shadow-[0_0_12px_rgba(52,211,153,0.45)]"
                  aria-hidden
                />
              ) : null}
              <div className="relative">
                <ul
                  id="project-directory-grid"
                  key={resultsKey}
                  aria-label={
                    canExpandGrid && !gridExpanded
                      ? `Förhandsvisning, ${GRID_PREVIEW_COUNT} av ${filteredProjects.length} projekt`
                      : "Alla projekt i katalogen"
                  }
                  className={cn(
                    "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6",
                    hasActiveFilter && "pl-2 md:pl-3",
                  )}
                >
                  {visibleProjects.map((project, i) => (
                    <li key={project.id}>
                      <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                          duration: 0.4,
                          delay: reduceMotion ? 0 : Math.min(i, 12) * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => scrollToProjectAnchor(project.id, !!reduceMotion)}
                          trackaton-on-click="directory-jump"
                          className={cn(
                            "group relative flex w-full flex-col overflow-hidden rounded-xl border text-left shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                            hasActiveFilter
                              ? "border-emerald-400/25 bg-card/50 hover:border-emerald-400/50 hover:shadow-[0_0_28px_rgba(52,211,153,0.14)]"
                              : "border-primary/15 bg-card/40 hover:border-emerald-400/40 hover:shadow-[0_0_32px_rgba(52,211,153,0.12)]",
                          )}
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/60">
                            {getProjectImageUrls(project) ? (
                              <>
                                <ResponsiveProjectImg
                                  project={project}
                                  alt={getProjectImageAlt(project)}
                                  className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              </>
                            ) : (
                              <div className="flex h-full items-center justify-center p-4">
                                <span className="text-center font-mono text-xs uppercase tracking-widest text-primary/30">
                                  {project.name}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 p-4">
                            <span className="font-black uppercase tracking-tight text-foreground transition-colors group-hover:text-emerald-400">
                              {project.name}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {project.tags.slice(0, 2).map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted"
                                >
                                  {t}
                                </span>
                              ))}
                              {project.tags.length > 2 ? (
                                <span className="self-center font-mono text-[10px] text-muted/70">
                                  +{project.tags.length - 2}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    </li>
                  ))}
                </ul>
                {canExpandGrid && !gridExpanded ? (
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 rounded-b-[calc(1rem-4px)] bg-gradient-to-t from-[var(--color-slate-card)] via-[var(--color-slate-card)]/85 to-transparent md:h-24"
                    aria-hidden
                  />
                ) : null}
              </div>

              {canExpandGrid ? (
                <div className="mt-4 flex flex-col items-center gap-2 border-t border-primary/10 pt-4 md:mt-5 md:pt-5">
                  <button
                    type="button"
                    onClick={() => setGridExpanded((e) => !e)}
                    aria-expanded={gridExpanded}
                    aria-controls="project-directory-grid"
                    trackaton-on-click={gridExpanded ? "directory-grid-collapse" : "directory-grid-expand"}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-emerald-400 transition-all hover:border-emerald-400/70 hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
                  >
                    {gridExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" aria-hidden />
                        Visa färre
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" aria-hidden />
                        Visa alla {filteredProjects.length} projekt
                      </>
                    )}
                  </button>
                  {!gridExpanded ? (
                    <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted">
                      Visar {GRID_PREVIEW_COUNT} av {filteredProjects.length}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
