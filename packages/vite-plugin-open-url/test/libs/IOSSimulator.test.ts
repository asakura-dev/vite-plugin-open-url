import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { openUrlInIOSSimulators } from '../../src/libs/IOSSimulator';

// モックの設定
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('IOSSimulator', () => {
  // コンソール出力のモック
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const mockConsoleLog = vi.fn();
  const mockConsoleError = vi.fn();

  // テスト前の準備
  beforeEach(() => {
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    vi.clearAllMocks();
  });

  // テスト後の後片付け
  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('openUrlInIOSSimulators', () => {
    it('should open URL in all booted iOS simulators', () => {
      // ブート済みのシミュレータがある場合のモック
      const mockDevicesJson = JSON.stringify({
        devices: {
          'com.apple.CoreSimulator.SimRuntime.iOS-16-0': [
            {
              lastBootedAt: '2023-01-01T00:00:00Z',
              dataPath: '/path/to/data',
              dataPathSize: 1000,
              logPath: '/path/to/log',
              udid: 'device-1-udid',
              isAvailable: true,
              logPathSize: 100,
              deviceTypeIdentifier: 'com.apple.CoreSimulator.SimDeviceType.iPhone-14',
              state: 'Booted',
              name: 'iPhone 14',
            },
            {
              lastBootedAt: '2023-01-01T00:00:00Z',
              dataPath: '/path/to/data',
              dataPathSize: 1000,
              logPath: '/path/to/log',
              udid: 'device-2-udid',
              isAvailable: true,
              logPathSize: 100,
              deviceTypeIdentifier: 'com.apple.CoreSimulator.SimDeviceType.iPhone-14-Pro',
              state: 'Booted',
              name: 'iPhone 14 Pro',
            },
          ],
        },
      });

      // execSyncのモック実装
      vi.mocked(execSync).mockImplementation((command: string) => {
        if (command === 'xcrun simctl list devices booted -j') {
          return Buffer.from(mockDevicesJson);
        }
        return Buffer.from('');
      });

      // テスト対象の関数を実行
      openUrlInIOSSimulators('https://example.com');

      // 期待される結果の検証
      expect(mockConsoleLog).toHaveBeenCalledWith('\nOpening iOS Simulator...');
      expect(mockConsoleLog).toHaveBeenCalledWith('Open iPhone 14...');
      expect(mockConsoleLog).toHaveBeenCalledWith('Open iPhone 14 Pro...');
      
      expect(execSync).toHaveBeenCalledWith('xcrun simctl list devices booted -j');
      expect(execSync).toHaveBeenCalledWith('xcrun simctl openurl device-1-udid https://example.com');
      expect(execSync).toHaveBeenCalledWith('xcrun simctl openurl device-2-udid https://example.com');
    });

    it('should show error when no booted iOS simulators found', () => {
      // ブート済みのシミュレータがない場合のモック
      const mockEmptyDevicesJson = JSON.stringify({
        devices: {},
      });

      // execSyncのモック実装
      vi.mocked(execSync).mockImplementation((command: string) => {
        if (command === 'xcrun simctl list devices booted -j') {
          return Buffer.from(mockEmptyDevicesJson);
        }
        return Buffer.from('');
      });

      // テスト対象の関数を実行
      openUrlInIOSSimulators('https://example.com');

      // 期待される結果の検証
      expect(mockConsoleLog).toHaveBeenCalledWith('\nOpening iOS Simulator...');
      expect(mockConsoleError).toHaveBeenCalledWith('No booted iOS Simulator found.');
      
      expect(execSync).toHaveBeenCalledWith('xcrun simctl list devices booted -j');
      expect(execSync).not.toHaveBeenCalledWith(expect.stringContaining('xcrun simctl openurl'));
    });
  });
});