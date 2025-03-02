# vite-plugin-open-url

A Vite plugin that allows you to:
- Open URLs in iOS Simulator, Android Emulator, or a browser by entering commands.
- Select from a list of registered paths to open.
- Customize the URL to be opened, allowing changes based on environment variables or setting different URLs for iOS and Android.

## Installation

```sh
npm install @asakura-dev/vite-plugin-open-url
```

## Usage

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import vitePluginOpenUrl from 'vite-plugin-open-url';

export default defineConfig({
  plugins: [
    vitePluginOpenUrl({
      paths: ["/", "/path1", "/path1"],
      url: ({ target, defaultUrl }) => {
        switch (target) {
          case "android":
            return `${defaultUrl}?platform=android`;
          case "ios":
            return `${defaultUrl}?platform=ios`;
          case "web":
            return defaultUrl;
        }
      },
    }),
  ],
});
```

## Options

- `paths`: An array of paths to select from.
- `url`: A function that returns the URL to open based on the target (`ios`, `android`, `web`) and the default URL.

## Commands

- `i`: Open URL in iOS Simulator
- `shift + i`: Select path to open in iOS Simulator
- `a`: Open URL in Android Emulator
- `shift + a`: Select path to open in Android Emulator
- `w`: Open URL in Web browser
- `shift + w`: Select path to open in Web browser

## License

MIT
