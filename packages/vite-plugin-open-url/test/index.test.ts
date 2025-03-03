import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import vitePluginOpenUrl from "../src/index";

// Mock settings
vi.mock("inquirer");
vi.mock("open");
vi.mock("../src/libs/IOSSimulator", () => ({
  openUrlInIOSSimulators: vi.fn(),
}));
vi.mock("../src/libs/AndroidEmulator", () => ({
  openUrlInAndroidEmulator: vi.fn(),
}));
vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

describe("vitePluginOpenUrl", () => {
  // Mock console output
  const originalConsoleLog = console.log;
  const mockConsoleLog = vi.fn();

  beforeEach(() => {
    console.log = mockConsoleLog;
    vi.clearAllMocks();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  it("should create a plugin with the correct name", () => {
    const plugin = vitePluginOpenUrl();
    expect(plugin.name).toBe("vite-plugin-open-url");
  });

  describe("configureServer", () => {
    it("should not configure server in middleware mode", () => {
      const plugin = vitePluginOpenUrl();
      const server = {
        config: {
          server: {
            middlewareMode: true,
          },
        },
      };

      // @ts-ignore: Simplified server type
      plugin.configureServer(server);
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it("should configure server in normal mode", () => {
      const plugin = vitePluginOpenUrl();
      const server = {
        config: {
          server: {
            https: false,
            host: "localhost",
            port: 3000,
          },
        },
        httpServer: {
          on: vi.fn(),
        },
      };

      // Mock readline module
      const mockReadlineInterface = {
        on: vi.fn(),
        close: vi.fn(),
      };

      // Use spyOn instead of vi.mock as vi.mock must be called at the top of the file
      vi.spyOn(process.stdin, "on").mockImplementation((_event, _listener) => {
        return process.stdin;
      });
      vi.spyOn(process.stdin, "off").mockImplementation((_event, _listener) => {
        return process.stdin;
      });

      // Override mock readline module
      const readlineMock = {
        createInterface: vi.fn().mockReturnValue(mockReadlineInterface),
      };
      vi.stubGlobal("readline", readlineMock);

      // @ts-ignore: Simplified server type
      plugin.configureServer(server);
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(server.httpServer.on).toHaveBeenCalledWith(
        "close",
        expect.any(Function)
      );

      vi.unstubAllGlobals();
    });
  });
});
