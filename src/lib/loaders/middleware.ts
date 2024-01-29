import fs from "fs";
import path from "path";
import { Express } from "express";

export function loadMiddleware(app: Express, routesDir: string) {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const fileExtension = isDevelopment ? ".ts" : ".js";
  let workingDir = process.cwd();

  if (!isDevelopment) {
    workingDir = path.join(workingDir, "dist");
  }

  const readMiddleware = (dir: string, baseDir: string) => {
    const fullPath = path.join(baseDir, dir);
    const files = fs.readdirSync(fullPath);

    files.forEach((file) => {
      const filePath = path.join(fullPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readMiddleware(file, fullPath);
      } else if (
        stat.isFile() &&
        file.match(new RegExp(`^middleware\\${fileExtension}$`))
      ) {
        const relativePath = path.dirname(path.relative(routesDir, filePath));
        const route = `/${relativePath === "." ? "" : relativePath}`
          .replace(/\\/g, "/") // Replace backslashes with forward slashes (for Windows paths)
          .replace(/\[(\w+)\]/g, ":$1"); // Replace [param] with :param
        const ourModule = require(filePath);
        const middleware = ourModule.middleware;

        if (middleware) {
          if (!Array.isArray(middleware)) {
            throw new Error(
              `Route ${route} does not export a middleware array`
            );
          }

          middleware.forEach((m: any) => app.use(route, m));
        }
      }
    });
  };

  readMiddleware(routesDir, workingDir);
}
