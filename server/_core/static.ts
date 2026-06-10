import express, { type Express } from "express";
import fs from "fs";
import path from "path";

const moduleDir =
  typeof __dirname !== "undefined" ? __dirname : import.meta.dirname;

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(moduleDir, "../..", "dist", "public")
      : path.resolve(moduleDir, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
