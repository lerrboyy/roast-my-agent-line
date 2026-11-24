import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The roast line: one funny line, at most 200 characters, roasting my own
// AI agent — the tool call that never happened.
const ROAST =
  "My agent narrated the tool call it was about to make, thanked the tool, quoted its answer — and never actually called it.";

// The grader gives us /output; a local run may point elsewhere.
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "/output";

function main(): void {
  const line = ROAST.trim();

  if (line.length < 1 || line.length > 200) {
    throw new Error(`roast line must be 1-200 characters, got ${line.length}`);
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("roast line must be a single line");
  }

  // Create the directory if it is missing. Never remove it: on the grader
  // /output is a mount point, and deleting it fails the run.
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const target = join(OUTPUT_DIR, "entry.txt");
  writeFileSync(target, line + "\n", "utf8");

  // Round-trip check: the file must read back as exactly the line we meant
  // to submit, valid UTF-8, one line, inside the limit. If the write was
  // truncated or mangled, fail loudly instead of shipping a broken entry.
  const written = readFileSync(target, "utf8");
  if (written !== line + "\n") {
    throw new Error("entry.txt did not round-trip: content mismatch");
  }
  console.log(`wrote ${line.length}-character roast to ${target}`);
}

main();
