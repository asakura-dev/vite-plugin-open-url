import { execSync } from "child_process";

const AndroidEmulator = {
  openUrl: (url: string, device: string) => {
    execSync(
      `adb -s ${device} shell am start -a android.intent.action.VIEW -d ${url}`
    );
  },
  getBootedDevices: (): string[] => {
    const devices = execSync("adb devices").toString();
    return devices
      .split("\n")
      .filter(
        (line) =>
          line.includes("device") && !line.includes("List of devices attached")
      )
      .map((line) => line.split("\t")[0]);
  },
};

export const openUrlInAndroidEmulator = (url: string) => {
  console.log("\nOpening Android Emulator...");
  const bootedDevices = AndroidEmulator.getBootedDevices();
  if (bootedDevices.length > 0) {
    bootedDevices.map((device) => {
      console.log(`Open ${device}...`);
      AndroidEmulator.openUrl(url, device);
    });
  } else {
    console.error("No booted Android Emulator found.");
  }
};
