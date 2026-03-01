/**
 * Unified diff patch parser and applier.
 * Parses patches in the format output by `diff -u` and applies them to text.
 */

export type ApplyResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export interface HunkLine {
  type: "context" | "remove" | "add";
  content: string;
}

export interface Hunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: HunkLine[];
}

/**
 * Parse a unified diff patch into hunks.
 * Supports the format: @@ -oldStart,oldCount +newStart,newCount @@
 */
export function parsePatch(patch: string): Hunk[] {
  const hunks: Hunk[] = [];
  const lines = patch.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const headerMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    if (headerMatch) {
      const oldStart = parseInt(headerMatch[1], 10);
      const oldCount = parseInt(headerMatch[2] ?? "1", 10);
      const newStart = parseInt(headerMatch[3], 10);
      const newCount = parseInt(headerMatch[4] ?? "1", 10);

      const hunkLines: HunkLine[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("@@")) {
        const l = lines[i];
        if (l.startsWith("-")) {
          hunkLines.push({ type: "remove", content: l.slice(1) });
        } else if (l.startsWith("+")) {
          hunkLines.push({ type: "add", content: l.slice(1) });
        } else {
          const content = l.startsWith(" ") ? l.slice(1) : l;
          hunkLines.push({ type: "context", content });
        }
        i++;
      }
      hunks.push({ oldStart, oldCount, newStart, newCount, lines: hunkLines });
    } else {
      i++;
    }
  }
  return hunks;
}

/**
 * Find the best position to apply a hunk using context-based matching.
 * Searches around the expected position (adjusted for previous hunks).
 */
function findHunkPosition(docLines: string[], hunk: Hunk, lineOffset: number): number | null {
  const { lines: hunkLines } = hunk;
  const expectedPos = hunk.oldStart - 1 + lineOffset;
  const firstContext = hunkLines.find((l) => l.type === "context");
  if (!firstContext) {
    return expectedPos >= 0 && expectedPos <= docLines.length ? expectedPos : null;
  }

  const searchStart = Math.max(0, expectedPos - 15);
  const searchEnd = Math.min(docLines.length, expectedPos + 25);
  for (let pos = searchStart; pos < searchEnd; pos++) {
    if (docLines[pos] !== firstContext.content) continue;
    if (verifyHunkAt(docLines, hunk, pos)) return pos;
  }
  return null;
}

function verifyHunkAt(docLines: string[], hunk: Hunk, startPos: number): boolean {
  let docPos = startPos;
  for (const hunkLine of hunk.lines) {
    if (hunkLine.type === "context" || hunkLine.type === "remove") {
      if (docPos >= docLines.length || docLines[docPos] !== hunkLine.content) {
        return false;
      }
      docPos++;
    }
  }
  return true;
}

/**
 * Apply a parsed hunk to a document.
 * Returns the new lines array and the shift (lines added - lines removed) for offset tracking.
 */
function applyHunk(
  docLines: string[],
  hunk: Hunk,
  lineOffset: number
): { lines: string[]; shift: number } | null {
  const targetPos = Math.max(0, (hunk.oldStart - 1) + lineOffset);
  const pos = findHunkPosition(docLines, hunk, lineOffset)
    ?? (targetPos <= docLines.length ? targetPos : null);
  if (pos === null || pos < 0) return null;

  const result: string[] = [];
  let docPos = pos;
  let addCount = 0;
  let removeCount = 0;

  for (const hunkLine of hunk.lines) {
    if (hunkLine.type === "context") {
      if (docPos >= docLines.length || docLines[docPos] !== hunkLine.content) {
        return null;
      }
      result.push(docLines[docPos]);
      docPos++;
    } else if (hunkLine.type === "remove") {
      if (docPos >= docLines.length || docLines[docPos] !== hunkLine.content) {
        return null;
      }
      removeCount++;
      docPos++;
    } else if (hunkLine.type === "add") {
      result.push(hunkLine.content);
      addCount++;
    }
  }

  const before = docLines.slice(0, pos);
  const after = docLines.slice(docPos);
  const newLines = [...before, ...result, ...after];
  const shift = addCount - removeCount;

  return { lines: newLines, shift };
}

/**
 * Apply a unified diff patch to the given text.
 * Returns the patched text or an error message.
 */
export function applyPatch(text: string, patch: string): ApplyResult {
  const trimmed = patch.trim();
  if (!trimmed) {
    return { ok: false, error: "Empty patch" };
  }

  const hunks = parsePatch(trimmed);
  if (hunks.length === 0) {
    return { ok: false, error: "No valid hunks in patch" };
  }

  let lines = text.split("\n");
  if (lines.length === 1 && lines[0] === "") {
    lines = [];
  }
  let lineOffset = 0;

  for (const hunk of hunks) {
    const result = applyHunk(lines, hunk, lineOffset);
    if (!result) {
      return {
        ok: false,
        error: `Could not apply hunk at line ${hunk.oldStart}. The document may have changed.`,
      };
    }
    lines = result.lines;
    lineOffset += result.shift;
  }

  return { ok: true, text: lines.join("\n") };
}

/**
 * Extract patch content from a markdown code block.
 * Handles ```patch ... ``` or ```diff ... ```
 */
export function extractPatchFromBlock(block: string): string {
  return block
    .replace(/^```(?:patch|diff)\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();
}
