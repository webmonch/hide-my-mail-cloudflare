

<div align="center">

## Hide My Mail (with Cloudflare) browser extension
    
![hide-my-mail-promo](https://github.com/user-attachments/assets/2ab2ad68-3860-45b5-9bdf-e5a359b6b5f7)


</div>

## Intro

This extension allows you to create unique, random email addresses that forward to your real inbox. 

It uses Cloudflare Email Routes under the hood, so you **need to have Cloudflare account with a domain** to use it.

Thanks to [Jonghakseo](https://jonghakseo.github.io/) for his amazing [Extension Boilerplate](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite).
You can ready full documentation on how to extend this extension in his repo.



## Features

- Create up to 200 anonymous emails
- Easy step
- **Instantly** creates new mailboxes
- Works on any OS

## Getting started

1. When you're using Windows run this:
    - `git config --global core.eol lf`
    - `git config --global core.autocrlf input`

   **This will set the EOL (End of line) character to be the same as on Linux/macOS. Without this, our bash script won't
   work, and you will have conflicts with developers on Linux/macOS.**
2. Clone this repository.( ```git clone https://github.com/webmonch/hide-my-mail-cloudflare``` )
3. Ensure your node version is >= than in `.nvmrc` file, recommend to
   use [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#intro)
4. Install pnpm globally: `npm install -g pnpm` (ensure your node version >= 22.12.0)
5. Run `pnpm install`

Then, depending on the target browser:

### For Chrome: <a name="getting-started-chrome"></a>

1. Run:
    - Dev: `pnpm dev` (on Windows, you should run as administrator;
      see [issue#456](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/issues/456))
    - Prod: `pnpm build`
2. Open in browser - `chrome://extensions`
3. Check - <kbd>Developer mode</kbd>
4. Click - <kbd>Load unpacked</kbd> in the upper left corner
5. Select the `dist` directory from the project

### For Firefox: <a name="getting-started-firefox"></a>

1. Run:
    - Dev: `pnpm dev:firefox`
    - Prod: `pnpm build:firefox`
2. Open in browser - `about:debugging#/runtime/this-firefox`
3. Click - <kbd>Load Temporary Add-on...</kbd> in the upper right corner
4. Select the `./dist/manifest.json` file from the project

> [!NOTE]
> In Firefox, you load add-ons in temporary mode. That means they'll disappear after each browser close. You have to
> load the add-on on every browser launch.

## Install dependency for turborepo: <a name="install-dependency"></a>

### For root: <a name="install-dependency-for-root"></a>

1. Run `pnpm i <package> -w`

### For module: <a name="install-dependency-for-module"></a>

1. Run `pnpm i <package> -F <module name>`

`package` - Name of the package you want to install e.g. `nodemon` \
`module-name` - You can find it inside each `package.json` under the key `name`, e.g. `@extension/content-script`, you
can use only `content-script` without `@extension/` prefix

