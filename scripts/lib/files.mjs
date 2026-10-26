// File helpers for the content pipeline: directory trees as path-to-text maps with forward
// slashes, and JSON reads that report the file name instead of throwing.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export function isDirectory(dir) {
  return existsSync(dir) && statSync(dir).isDirectory();
}

export function listDirectories(dir) {
  if (!isDirectory(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.name !== ".DS_Store")
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    });
}

// Returns { "src/App.jsx": "...", ... } sorted by path, or null when the directory is absent.
export function readTree(dir) {
  if (!isDirectory(dir)) return null;
  const files = {};
  for (const full of walk(dir).sort()) {
    files[path.relative(dir, full).split(path.sep).join("/")] = readFileSync(full, "utf8");
  }
  return files;
}

// Returns { value } or { error } with a message suitable for a problem report.
export function readJson(file) {
  if (!existsSync(file)) return { error: "file is missing" };
  try {
    return { value: JSON.parse(readFileSync(file, "utf8")) };
  } catch (error) {
    return { error: `is not valid JSON: ${error.message}` };
  }
}
