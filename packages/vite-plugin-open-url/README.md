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
import { defineConfig } from "vite";
import vitePluginOpenUrl from "@asakura-dev/vite-plugin-open-url";

export default defineConfig({
  plugins: [vitePluginOpenUrl()],
});
```

## Commands

- `i`: Open URL in iOS Simulator
- `shift + i`: Select path to open in iOS Simulator
- `a`: Open URL in Android Emulator
- `shift + a`: Select path to open in Android Emulator
- `w`: Open URL in Web browser
- `shift + w`: Select path to open in Web browser

## Options

```typescript
import { defineConfig } from "vite";
import vitePluginOpenUrl from "@asakura-dev/vite-plugin-open-url";

export default defineConfig({
  plugins: [
    vitePluginOpenUrl({
      paths: ["/", "/path1", "/path2"],
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

- `paths` (optional): An array of paths to select from.
- `url` (optional): A function that returns the URL to open based on the target (`ios`, `android`, `web`) and the default URL.

## Acknowledgement

vite-plugin-open-url was inspired by the excellent developer experience of [Expo CLI](https://github.com/expo/expo/tree/main/packages/%40expo/cli).

## License

MIT
