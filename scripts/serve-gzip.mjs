import { createServer } from "node:http";
import { gzipSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
};

const port = Number(process.env.PORT || 41773);
createServer((req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith("/")) path += "index.html";
  const file = join(root, path);
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("missing");
    return;
  }
  const accept = req.headers["accept-encoding"] || "";
  const compressible = [".html", ".css", ".js", ".mjs", ".json", ".svg", ".webmanifest"].includes(extname(file));
  if (accept.includes("gzip") && compressible) {
    const gz = file + ".gz";
    const body = existsSync(gz) ? readFileSync(gz) : gzipSync(readFileSync(file));
    res.writeHead(200, {
      "content-type": types[extname(file)] || "application/octet-stream",
      "content-encoding": "gzip",
      vary: "accept-encoding",
    });
    res.end(body);
    return;
  }
  res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(port, "127.0.0.1", () => {
  console.log(`gzip server http://127.0.0.1:${port}/campus/`);
});
