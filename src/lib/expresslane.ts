import fs from "fs";
import { Express } from "express";
import { loadMiddleware } from "./loaders/middleware";
import { loadRoutes } from "./loaders/route";
import { loadConfig } from "./loaders/config";

interface ExpresslaneOptions {
  express: Express;
}

export function initialize(options: ExpresslaneOptions) {
  const app = options.express;
  const config = loadConfig();

  // If routes directory does not exist, create it
  if (!fs.existsSync(config.routesDir)) {
    fs.mkdirSync(config.routesDir, { recursive: true });
  }

  loadMiddleware(app, config.routesDir);
  loadRoutes(app, config.routesDir);

  return app;
}
