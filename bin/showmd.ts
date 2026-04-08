#!/usr/bin/env tsx

import { Command } from "commander";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";

interface DiffSpec {
  name: string;
  file: string;
  refRange: string;
  lineRange?: string;
}

interface Annotation {
  diffName: string;
  line: number;
  content: string;
}

interface DiffData {
  patch: string;
  filename: string;
  annotations?: { line: number; content: string; side: string }[];
}

function parseDiffFlag(value: string): DiffSpec {
  // Format: name:file:refrange[:linerange]
  const parts = value.split(":");
  if (parts.length < 3) {
    throw new Error(
      `Invalid --diff format: "${value}". Expected name:file:refrange[:linerange]`
    );
  }
  return {
    name: parts[0],
    file: parts[1],
    refRange: parts[2],
    lineRange: parts[3],
  };
}

function parseAnnotateFlag(value: string): Annotation {
  // Format: name:line:"comment"
  const match = value.match(/^([^:]+):(\d+):(.+)$/);
  if (!match) {
    throw new Error(
      `Invalid --annotate format: "${value}". Expected name:line:comment`
    );
  }
  return {
    diffName: match[1],
    line: parseInt(match[2], 10),
    content: match[3].replace(/^["']|["']$/g, ""),
  };
}

function runGitDiff(spec: DiffSpec): string {
  const cmd = `git diff ${spec.refRange} -- ${spec.file}`;
  try {
    const result = execSync(cmd, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    if (!result.trim()) {
      // Try git show for single-ref ranges
      const showCmd = `git show ${spec.refRange} -- ${spec.file}`;
      try {
        return execSync(showCmd, {
          encoding: "utf-8",
          maxBuffer: 10 * 1024 * 1024,
        });
      } catch {
        console.warn(`Warning: No diff output for ${spec.file} at ${spec.refRange}`);
        return "";
      }
    }
    return result;
  } catch (e) {
    throw new Error(
      `git diff failed for ${spec.file}: ${(e as Error).message}`
    );
  }
}

function trimToLineRange(patch: string, lineRange: string): string {
  if (!lineRange) return patch;
  const [startStr, endStr] = lineRange.split("-");
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr, 10) : Infinity;

  // Keep diff headers and filter hunk content to line range
  const lines = patch.split("\n");
  const result: string[] = [];
  let currentNewLine = 0;
  let inRange = false;

  for (const line of lines) {
    if (
      line.startsWith("diff ") ||
      line.startsWith("index ") ||
      line.startsWith("--- ") ||
      line.startsWith("+++ ")
    ) {
      result.push(line);
      continue;
    }

    if (line.startsWith("@@")) {
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        currentNewLine = parseInt(match[1], 10);
      }
      // We'll add a synthetic hunk header when we enter range
      continue;
    }

    if (line.startsWith("+")) {
      if (currentNewLine >= start && currentNewLine <= end) {
        if (!inRange) {
          result.push(`@@ -${start} +${start} @@`);
          inRange = true;
        }
        result.push(line);
      }
      currentNewLine++;
    } else if (line.startsWith("-")) {
      if (currentNewLine >= start && currentNewLine <= end) {
        if (!inRange) {
          result.push(`@@ -${start} +${start} @@`);
          inRange = true;
        }
        result.push(line);
      }
    } else {
      if (currentNewLine >= start && currentNewLine <= end) {
        if (!inRange) {
          result.push(`@@ -${start} +${start} @@`);
          inRange = true;
        }
        result.push(line);
      }
      currentNewLine++;
    }
  }

  return result.join("\n");
}

const program = new Command();

program
  .name("showmd")
  .description("Push interactive technical walkthroughs to showmd")
  .version("0.1.0");

program
  .command("push")
  .description("Create or update a show")
  .requiredOption("--content <file>", "Path to MDX content file")
  .option("--title <title>", "Show title")
  .option("--description <desc>", "Show description")
  .option("--id <id>", "Existing show ID (for updates)")
  .option(
    "--diff <spec>",
    "Diff spec: name:file:refrange[:linerange]",
    (val: string, prev: string[]) => [...prev, val],
    [] as string[]
  )
  .option(
    "--annotate <spec>",
    "Annotation: name:line:comment",
    (val: string, prev: string[]) => [...prev, val],
    [] as string[]
  )
  .option(
    "--base-url <url>",
    "showmd server URL",
    process.env.SHOWMD_URL || "http://localhost:3000"
  )
  .action(async (opts) => {
    const contentPath = resolve(opts.content);
    const content = readFileSync(contentPath, "utf-8");

    // Parse diff specs and run git diff for each
    const diffSpecs = (opts.diff as string[]).map(parseDiffFlag);
    const annotations = (opts.annotate as string[]).map(parseAnnotateFlag);

    const diffs: Record<string, DiffData> = {};

    for (const spec of diffSpecs) {
      let patch = runGitDiff(spec);
      if (spec.lineRange) {
        patch = trimToLineRange(patch, spec.lineRange);
      }

      const specAnnotations = annotations
        .filter((a) => a.diffName === spec.name)
        .map((a) => ({ line: a.line, content: a.content, side: "additions" }));

      diffs[spec.name] = {
        patch,
        filename: spec.file,
        ...(specAnnotations.length > 0 && { annotations: specAnnotations }),
      };
    }

    // Build request
    const body: Record<string, unknown> = { content };
    if (opts.title) body.title = opts.title;
    if (opts.description) body.description = opts.description;
    if (Object.keys(diffs).length > 0) body.diffs = diffs;

    const baseUrl = opts.baseUrl as string;

    if (opts.id) {
      // Update existing show
      const res = await fetch(`${baseUrl}/api/shows/${opts.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.error(`Error: ${res.status} ${await res.text()}`);
        process.exit(1);
      }
      const data = await res.json();
      console.log(`Updated: ${baseUrl}/s/${opts.id}`);
      console.log(`  updatedAt: ${data.updatedAt}`);
    } else {
      // Create new show
      if (!opts.title) {
        console.error("Error: --title is required for new shows");
        process.exit(1);
      }
      body.title = opts.title;

      const res = await fetch(`${baseUrl}/api/shows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.error(`Error: ${res.status} ${await res.text()}`);
        process.exit(1);
      }
      const data = await res.json();
      console.log(`Created: ${data.url}`);
      console.log(`  id: ${data.id}`);
    }
  });

program.parse();
