# webon3.com MetaMask WebOns

A glue code for making MetaMask-DApps working as a WebOn.
Moreover, webon3.com enables to inject arbitrary JavaScript into WebOns.

## Manifest repository

Please add MetaMask-enabled manifests to the subfolder "webon3.com" within this repo!

## Deploy

./deploy.sh

## Production CDN links

- https://webon3.com/js/index.js  
- https://webon3.com/js/ethers.js  
- https://webon3.com/js/eip712.js  

## How to use

There exist two ways for running a WebOn with MetaMask.
Either way, you will need to create a "manifest" for your MetaMask-enabled Webon.

### Option A: Upload your manifest to webon3.com

You can deploy your manifest to `https://webon3.com/<your-webonurl>/nomo_manifest.json` .
Please fork this repo and submit a PR for doing so.

### Option B: Pass a manifest to "nomo.installUrlAsWebOn"

Pass the needed JavaScript-CDN-URLs to the function `nomo.installUrlAsWebOn`, like in the following code-snippet.
For this option, you will need an already existing WebOn for invoking this function.

```JavaScript
import {nomo} from "nomo-webon-kit";

const manifest = {
            "nomo_manifest_version": "1.1.0",
            "webon_id": "uniswap",
            "webon_name": "Uniswap",
            "webon_version": "0.1.16",
            "min_nomo_version": "0.4.0",
            "dependencies": [
                "https://webon3.com/js/ethers.js",
                "https://webon3.com/js/eip712.js",
                "https://webon3.com/js/index.js"
            ],
            "permissions": [
                "nomo.permission.GET_INSTALLED_WEBONS",
                "nomo.permission.SIGN_EVM_TRANSACTION",
                "nomo.permission.SIGN_EVM_MESSAGE"
            ],
            "webon_url": "https://app.uniswap.org/",
        };

nomo.installUrlAsWebOn({
    manifest: manifest,
    navigateBack: false,
    skipPermissionDialog: true,
});
```
