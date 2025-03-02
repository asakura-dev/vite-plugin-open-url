import * as path from "path";
import * as readline from "readline";
import { Plugin } from "vite";
import inquirer from "inquirer";
import openBrowser from "open";

import { openUrlInIOSSimulators } from "./libs/IOSSimulator";
import { openUrlInAndroidEmulator } from "./libs/AndroidEmulator";

interface PluginOptions {
  paths?: string[];
  url?: (params: {
    target: "android" | "ios" | "web";
    defaultUrl: string;
  }) => string;
}

const vitePluginOpenUrl = (options: PluginOptions = {}): Plugin => {
  let lastSelectedPath: string;

  const openPathSelector = async () => {
    const paths = options.paths || ["/"];
    const defaultPath = lastSelectedPath || paths[0];
    const { selectedPath } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedPath",
        message: "Select Path",
        choices: paths.map((path) => ({
          name: path === lastSelectedPath ? `${path} (last selected)` : path,
          value: path,
        })),
        default: defaultPath,
      },
    ]);
    lastSelectedPath = selectedPath;
    return selectedPath;
  };

  const getUrl = (key: string, defaultUrl: string) => {
    const target =
      key === "i" || key === "I"
        ? "ios"
        : key === "a" || key === "A"
        ? "android"
        : "web";
    return options.url ? options.url({ target, defaultUrl }) : defaultUrl;
  };

  const handleInput = async (key: string, baseUrl: string) => {
    switch (key) {
      case "i": {
        const url = getUrl(key, baseUrl);
        openUrlInIOSSimulators(url);
        break;
      }
      case "I": {
        console.log("\nSelecting path for iOS Simulator...");
        const selectedPath = await openPathSelector();
        const url = getUrl(key, path.join(baseUrl, selectedPath));
        openUrlInIOSSimulators(url);
        break;
      }
      case "a":
        openUrlInAndroidEmulator(getUrl(key, baseUrl));
        break;
      case "A": {
        console.log("\nSelecting path for Android Emulator...");
        const selectedPath = await openPathSelector();
        const url = getUrl(key, path.join(baseUrl, selectedPath));
        openUrlInAndroidEmulator(url);
        break;
      }
      case "w":
        console.log("\nOpening Web...");
        const url = getUrl(key, baseUrl);
        openBrowser(url);
        break;
      case "W": {
        console.log("\nSelecting path for Web...");
        const selectedPath = await openPathSelector();
        const url = getUrl(key, path.join(baseUrl, selectedPath));
        console.log("\nOpening Web...");
        openBrowser(url);
        break;
      }
      default:
        break;
    }
  };

  return {
    name: "vite-plugin-open-url",
    apply: "serve",
    configureServer(server) {
      if (server.config.server.middlewareMode) return;

      const defaultUrl = (() => {
        const { https, host, port } = server.config.server;
        const hostname =
          host === true || host === "0.0.0.0" || host === undefined
            ? "localhost"
            : host;
        const protocol = https ? "https" : "http";
        return `${protocol}://${hostname}:${port}`;
      })();

      const bold = "\x1b[1m";
      const reset = "\x1b[0m";

      console.log(`
press ${bold}i${reset} to open iOS Simulator
${bold}shift + i${reset} to select open path in Android Emulator
press ${bold}a${reset} to open in Android Emulator
${bold}shift + a${reset} to select open path in Android Emulator
press ${bold}w${reset} to open Web
${bold}shift + w${reset} to select open path in Android Emulator
`);

      const createRl = () => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        rl.on("SIGINT", () => {
          rl.close();
          process.exit();
        });

        return rl;
      };

      const onData = (data: Buffer) => {
        rl.close();
        process.stdin.off("data", onData);
        const input = data.toString().trim();
        handleInput(input, defaultUrl).then(() => {
          rl = createRl();
          process.stdin.on("data", onData);
        });
      };

      let rl = createRl();
      process.stdin.on("data", onData);

      server.httpServer?.on("close", () => {
        rl.close();
      });
    },
  };
};

export default vitePluginOpenUrl;
