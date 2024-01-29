import fs from "fs";
import path from "path";
import { Express } from "express";

type ExpressMethods = "get" | "post" | "put" | "delete" | "patch";

export function loadRoutes(app: Express, routesDir: string) {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const fileExtension = isDevelopment ? ".ts" : ".js";
  let workingDir = process.cwd();

  if (!isDevelopment) {
    workingDir = path.join(workingDir, "dist");
  }

  const readRoutes = (dir: string, baseDir: string) => {
    const fullPath = path.join(baseDir, dir);
    const files = fs.readdirSync(fullPath);

    files.forEach((file) => {
      const filePath = path.join(fullPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readRoutes(file, fullPath);
      } else {
        const match = file.match(
          new RegExp(`^(get|post|put|delete|patch)\\${fileExtension}$`)
        );
        if (match) {
          const method = match[1] as ExpressMethods;
          // Get the relative path and replace square brackets with colon for parameters
          const relativePath = path.dirname(path.relative(routesDir, filePath));
          const route = `/${relativePath === "." ? "" : relativePath}`
            .replace(/\\/g, "/") // Replace backslashes with forward slashes (for Windows paths)
            .replace(/\[(\w+)\]/g, ":$1"); // Replace [param] with :param

          const ourModule = require(filePath);
          const handler = ourModule.default;
          let middleware = ourModule.middleware;

          // Throw error if handler is not a function
          if (typeof handler !== "function") {
            throw new Error(
              `Route ${method.toUpperCase()} ${route} does not export a function as default`
            );
          }

          // Load middleware
          if (middleware && Array.isArray(middleware)) {
            middleware.forEach((m: any) => app.use(route, m));
          }

          // Load route
          app[method](route, handler);

          if (middleware && middleware.length) {
            console.log(
              `Route ${method.toUpperCase()} ${route} loaded (${
                middleware.length
              } middleware)`
            );
          } else {
            console.log(`Route ${method.toUpperCase()} ${route} loaded`);
          }
        }
      }
    });
  };

  readRoutes(routesDir, workingDir);
}
