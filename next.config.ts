import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder so a stray lockfile elsewhere
  // (e.g. an accidental npm install in the home directory) can't make
  // Turbopack index the whole home folder and exhaust memory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
