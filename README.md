# MetaMask WebOns

A glue code for making MetaMask-DApps working as a WebOn.

## Manifest repository

Please add MetaMask-enabled manifests to the subfolder "webon3.com" within this repo!

## Deploy

./deploy.sh

## Production CDN links

- https://webon3.com/js/index.js  
- https://webon3.com/js/ethers.js  
- https://webon3.com/js/eip712.js  

## How to use

Pass the needed JavaScript-CDN-URLs to the function `nomo.installUrlAsWebOn`, like in the following code-snippet:

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
