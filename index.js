// Provider Configuration Module
console.log("Loading walletjs");

var providerConfig = providerConfig || {
    rpcUrl: 'https://mainnet.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1',
    networkId: '0x1', // Default to Ethereum Mainnet
};

console.log(providerConfig);

// Utility Functions
function decodeBase64UTF16(base64EncodedString) {
    const binaryString = atob(base64EncodedString);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const decodedString = new TextDecoder("utf-8").decode(bytes);
    return decodedString;
}

function getRpcUrlByChainId(chainId) {
    const rpcUrls = {
        '0x1': 'https://mainnet.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1', // Ethereum Mainnet
        '0x89': 'https://polygon-mainnet.infura.io/v3/099fc58e0de9451d80b18d7c74caa7c1', // Polygon Mainnet
        // Add other chains and their RPC URLs here
    };
    return rpcUrls[chainId] || 'https://mainnet.infura.io/v3/'; // Fallback to Ethereum Mainnet
}

window.nomo = {
    isMetaMask: true, // Pretend to be MetaMask for compatibility
    request: async ({ method, params }) => {
        console.log(`Received request for method ${method} with params ${Object.values(params ?? {})}`);
        switch (method) {
            case 'eth_requestAccounts':
            case 'eth_accounts':
                return handleAccountRequests();
            case 'wallet_switchEthereumChain':
                return handleSwitchEthereumChain(params);
            case 'eth_chainId':
                return Promise.resolve(providerConfig.networkId);
            case 'net_version':
                return Promise.resolve(providerConfig.networkId);
            case 'eth_blockNumber':
                return window.provider.getBlockNumber();
            case 'eth_estimateGas':
                return handleEstimateGas(params);
            case 'eth_call':
                return window.provider.call(params[0], params[1]);
            case 'eth_sendTransaction':
                return handleSendTransaction(params);
            case 'eth_signTypedData_v4':
                return eth_signTypedData_v4(params[0], params[1]);
            default:
                console.error(`Method ${method} is not implemented`);
                return provider.send(method, params);
        }
    }
};

if(!window.provider) {
    var provider = new ethers.JsonRpcProvider(providerConfig.rpcUrl);
    provider.request = window.nomo.request; // Assumes window.nomo.request is defined later
    window.provider = provider;
}

// Chain Switching Logic
async function handleSwitchEthereumChain(params) {
    const chainId = params[0].chainId;
    providerConfig.networkId = chainId;
    providerConfig.rpcUrl = getRpcUrlByChainId(chainId);
    console.log(`Switching to chain ${chainId}`)
    this.provider = new ethers.JsonRpcProvider(getRpcUrlByChainId(chainId));
    window.provider = new ethers.JsonRpcProvider(getRpcUrlByChainId(chainId));
    console.log(getRpcUrlByChainId(chainId));
    console.log(provider);
    provider.request = window.nomo.request;
    window.provider = provider;
    return null; // Or the appropriate response
}

// Account Handling Logic
async function handleAccountRequests() {
    return new Promise((resolve, reject) => {
                    invokeNomoFunction("nomoGetWalletAddresses").then(wallets => {
                        // Assuming the function returns a list of wallet addresses
                        // Convert wallet addresses to the expected format if necessary
                        console.log(wallets)
                        const walletAddresses = [wallets.walletAddresses.ETH]
                        resolve(walletAddresses);
                    }).catch(error => {
                        reject(error);
                    });
                });
}

// Gas Estimation Logic
async function handleEstimateGas(params) {
    return new Promise((resolve, reject) => {
                    this.provider.estimateGas(params[0]).then(result => {
                        resolve(result);
                    }).catch(error => {
                        reject(error);
                    });
                });
}

// Transaction Sending Logic
async function handleSendTransaction(params) {

//    const allowedTransactionKeys = {
//          chainId: true,
//          data: true,
//          gasLimit: true,
//          gasPrice: true,
//          nonce: true,
//          to: true,
//          value: true,
//    }; // ethers.js enforced strict rules on what properties are allowed in unsignedTx
//    const unsignedTx = {};
//    for (const key of Object.keys(allowedTransactionKeys)) {
//      unsignedTx[key] = (transaction)[key];
//    }
//
//    unsignedTx['chainId'] = Number(providerConfig.networkId);
//
//    unsignedTx['gasPrice'] = transaction.gas;
//    // calculate gas limit
//
//    // Assume this.provider is an instance of ethers.providers.JsonRpcProvider
//    // and it has been set up previously in your code

    try {
        console.log(params);
        const trans = params[0];
        const nonce = await this.provider.getTransactionCount(params[0].from, 'pending');
        delete trans.from;

        const feeData = await this.provider.getFeeData();

        let transaction = ethers.Transaction.from(params[0]);
        transaction.nonce = nonce;
        transaction.chainId = Number(providerConfig.networkId);

        transaction.gasLimit = Math.ceil(Number(params[0].gas) * 3)
        transaction.maxFeePerGas = feeData.maxFeePerGas;
        transaction.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        transaction.gasPrice = feeData.gasPrice * 15n/10n;

        // Serialize the transaction
        // Send the serialized transaction to the native layer for signing
        const result = await invokeNomoFunction("nomoSignEvmTransaction", {
            messageHex: transaction.unsignedSerialized,
        });

        // Append the signature to the transaction
        transaction.signature = '0x' + result.sigHex;
        // const signedTransaction = appendSignatureToTx(unsignedTx, result.sigHex);
        console.log(transaction);

        // Send the signed transaction to the Ethereum network
        const txResponse = await this.provider.broadcastTransaction(transaction.serialized);
        console.log(txResponse);

        // Return the transaction response
        return txResponse.hash;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


// Event Handlers
function announceProvider() {
    console.log("Announcing provider")
    const info = {
        uuid: "350670db-19fa-4704-a166-e52e178b59d2",
        name: "Nomo Wallet",
        icon: "data:image/png;base64,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",
        rdns: "com.example.wallet"
    };
    window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", {
            detail: Object.freeze({
                info,
                provider
            }),
        })
    );
}

window.addEventListener("eip6963:requestProvider", () => {
    announceProvider();
});

// Main Entry
announceProvider();

// Also announce the provider when the page is loaded
window.addEventListener("load", () => {
    announceProvider();
});

window.pendingPromisesResolve = {};
window.pendingPromisesReject = {};

window.fulfillPromiseFromFlutter = function(base64FromFlutter) {
    const jsonFromFlutter = decodeBase64UTF16(base64FromFlutter);
    const obj = JSON.parse(jsonFromFlutter);
    const invocationID = obj.invocationID;
    const status = obj.status;
    const result = obj.result;

    if (!invocationID || !status) {
        return "Error: missing invocationID or status";
    }

    const fulfillFunction = (status === "resolve")
        ? window.pendingPromisesResolve[invocationID]
        : window.pendingPromisesReject[invocationID];

    delete window.pendingPromisesResolve[invocationID];
    delete window.pendingPromisesReject[invocationID];

    if (fulfillFunction) {
        fulfillFunction(result); // fulfill or reject the promise
    } else {
        console.error("Error: unexpected invocationID");
    }

    return "OK";
};

// Append Signature to Transaction
function appendSignatureToTx(unsignedTx, sigHexFromNative) {
    const sigHex = sigHexFromNative.startsWith("0x") ?
        sigHexFromNative :
        "0x" + sigHexFromNative;
    if (sigHex.length !== 130) {
        // throw new Error("Unexpected sigHexFromNative length");
    }
    return ethers.utils.serializeTransaction(unsignedTx, sigHex);
}

async function invokeNomoFunction(functionName, args) {
    window.invocationCounter++;
    const invocationID = window.invocationCounter.toString();
    const payload = JSON.stringify({
        functionName,
        invocationID,
        args,
    });

    // first create a Promise
    const promise = new Promise(function(resolve, reject) {
        window.pendingPromisesResolve[invocationID] = resolve;
        window.pendingPromisesReject[invocationID] = reject;
    });

    try {
        const dartBridge = getDartBridge();
        if (dartBridge) {
            dartBridge(payload);
        } else {
            throw new Error(`the function functionName does not work outside of the NOMO-app.`);
        }
    } catch (e) {
        return Promise.reject(e.message);
    }

    return promise;
};

function getDartBridge() {
    if (typeof window === "undefined") {
        return null; // fallback mode in server-side rendering
    }
    if (window.webkit) {
        // legacy macOS
        return function(payload) {
            window.webkit.messageHandlers.NOMOJSChannel.postMessage(payload);
        };
    } else if (window.NOMOJSChannel) {
        // mobile + macOS
        return function(payload) {
            window.NOMOJSChannel.postMessage(payload);
        };
    } else if (window.chrome && window.chrome.webview) {
        // windows
        return function(payload) {
            window.chrome.webview.postMessage(payload);
        };
    } else {
        return null; // fallback mode
    }
};

async function eth_signTypedData_v4(address, typedData) {
    const objTypedData = JSON.parse(typedData);
    if(objTypedData.domain.chainId === undefined || objTypedData.domain.chainId === null || objTypedData.domain.chainId === 'NaN') {
        objTypedData.domain.chainId = 1;
    }

    const message = window.getMessage(objTypedData, true);
    // uint8 to string without hex
    const hex = ethers.utils.hexlify(message);
    console.log("message hex", message)
    const result = await invokeNomoFunction("nomoSignEvmMessage", {
                    message: hex,
                });
    console.log(result);
        return result.sigHex;
}

let abi = ethers.AbiCoder.defaultAbiCoder()

// Recursively finds all the dependencies of a type
function dependencies(primaryType, types, found = []) {
    if (found.includes(primaryType)) {
        return found;
    }
    if (types[primaryType] === undefined) {
        return found;
    }
    found.push(primaryType);
    for (let field of types[primaryType]) {
        for (let dep of dependencies(field.type, types, found)) {
            if (!found.includes(dep)) {
                found.push(dep);
            }
        }
    }
    return found;
}

function encodeType(primaryType, types) {
    let deps = dependencies(primaryType, types);
    deps = deps.filter(t => t != primaryType);
    deps = [primaryType].concat(deps.sort());

    // Format as a string with fields
    let result = '';
    for (let type of deps) {
        result += `${type}(${types[type].map(({ name, type }) => `${type} ${name}`).join(',')})`;
    }
    return result;
}

function keccakFromString(value) {
    return ethers.keccak256(ethers.toUtf8Bytes(value));
}

function typeHash(primaryType, types) {
    return keccakFromString(encodeType(primaryType, types));
}

function encodeData(primaryType, data, types) {
    let encTypes = [];
    let encValues = [];

    // Add typehash
    encTypes.push('bytes32');
    encValues.push(typeHash(primaryType, types));

    // Add field contents
    for (let field of types[primaryType]) {
        let value = data[field.name];
        if (field.type == 'string' || field.type == 'bytes') {
            encTypes.push('bytes32');
            value = keccakFromString(value);
            encValues.push(value);
        } else if (types[field.type] !== undefined) {
            encTypes.push('bytes32');
            value = ethers.keccak256(encodeData(field.type, value, types));
            encValues.push(value);
        } else if (field.type.lastIndexOf(']') === field.type.length - 1) {
            throw 'TODO: Arrays currently unimplemented in encodeData';
        } else {
            encTypes.push(field.type);
            encValues.push(value);
        }
    }
    console.log(abi.encode(encTypes, encValues));
    return abi.encode(encTypes, encValues);
}

function structHash(primaryType, data, types) {
    return ethers.keccak256(encodeData(primaryType, data, types));
}

function signHash(typedData) {
    const types = typedData.types;

    var a = Buffer.from('1901', 'hex')
    var b = structHash('EIP712Domain', typedData.domain, types)
    const bBuffer = Buffer.from(b.substring(2), 'hex')
    var c = structHash(typedData.primaryType, typedData.message, types)
    const cBuffer = Buffer.from(c.substring(2), 'hex')
    console.log(a, bBuffer, cBuffer, "aaaaa");
    return ethers.keccak256(
        Buffer.concat([
            a,
            bBuffer,
            cBuffer,
        ]),
    );
}
