import fs from "fs";
import path from "path";

export interface Config {
  routesDir: string;
  srcDir: string;
}

export function loadConfig(): Config {
  const configFile = path.join(process.cwd(), "expresslane.json");
  if (!fs.existsSync(configFile)) {
    throw new Error("Config file expresslane.json not found");
  }

  let config = require(configFile);

  if (!config.routesDir) {
    throw new Error("Config file expresslane.json must contain routesDir");
  }

  if (!config.srcDir) {
    throw new Error("Config file expresslane.json must contain srcDir");
  }

  return config as Config;
}
