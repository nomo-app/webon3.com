# metamask-webons

A glue code for making MetaMask-DApps working as a WebOn

## Deploy

./deploy.sh

## Production CDN links

- https://w.nomo.app/js/index.js  
- https://w.nomo.app/js/ethers.js  
- https://w.nomo.app/js/eip712.js  

## How to use

Pass the needed JavaScript-CDN-URLs to the function `nomo.installUrlAsWebOn`, like in the following code-snippet:

```JavaScript
import {nomo} from "nomo-webon-kit";

const manifest = {
            "nomo_manifest_version": "1.1.0",
            "webon_id": "uniswap",
            "webon_name": "Uniswap",
            "webon_version": "0.1.16",
            "dependencies": [
                "https://w.nomo.app/js/ethers.js",
                "https://w.nomo.app/js/eip712.js",
                "https://w.nomo.app/js/index.js"
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
