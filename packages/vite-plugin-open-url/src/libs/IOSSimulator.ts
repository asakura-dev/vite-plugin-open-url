import { execSync } from "child_process";

type IOSSimulatorDevice = {
  lastBootedAt: string;
  dataPath: string;
  dataPathSize: number;
  logPath: string;
  udid: string;
  isAvailable: boolean;
  logPathSize: number;
  deviceTypeIdentifier: string;
  state: string;
  name: string;
};

type IOSSimulatorDevices = {
  devices: {
    [key: string]: IOSSimulatorDevice[];
  };
};

const IOSSimulator = {
  openUrl: (deviceId: string, url: string) => {
    execSync(`xcrun simctl openurl ${deviceId} ${url}`);
  },
  getBootedDevicces: (): IOSSimulatorDevice[] => {
    const devicesJson = execSync(
      "xcrun simctl list devices booted -j"
    ).toString();
    const devices = JSON.parse(devicesJson) as IOSSimulatorDevices;
    return Object.values(devices.devices).flat();
  },
};

export const openUrlInIOSSimulators = (url: string) => {
  console.log("\nOpening iOS Simulator...");
  const bootedDevices = IOSSimulator.getBootedDevicces();
  if (bootedDevices.length > 0) {
    bootedDevices.map((device) => {
      console.log(`Open ${device.name}...`);
      IOSSimulator.openUrl(device.udid, url);
    });
  } else {
    console.error("No booted iOS Simulator found.");
  }
};
