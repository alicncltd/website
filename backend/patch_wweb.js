import fs from "fs";
import path from "path";

const authStorePath = path.join("node_modules", "whatsapp-web.js", "src", "util", "Injected", "AuthStore", "AuthStore.js");
const clientPath = path.join("node_modules", "whatsapp-web.js", "src", "Client.js");

console.log("Patching AuthStore.js...");
if (!fs.existsSync(authStorePath)) {
  console.error("AuthStore.js not found at:", authStorePath);
  process.exit(1);
}

const replacementCode = `'use strict';

exports.ExposeAuthStore = () => {
    window.AuthStore = {};
    
    const safeRequire = (name) => {
        try {
            return window.require(name);
        } catch (e) {
            console.warn(\`AuthStore: Module \${name} not available yet.\`);
            return null;
        }
    };
    
    Object.defineProperty(window.AuthStore, 'AppState', {
        get: () => {
            const m = safeRequire('WAWebSocketModel');
            return m ? m.Socket : null;
        },
        configurable: true,
        enumerable: true
    });
    
    Object.defineProperty(window.AuthStore, 'Cmd', {
        get: () => {
            const m = safeRequire('WAWebCmd');
            return m ? m.Cmd : null;
        },
        configurable: true,
        enumerable: true
    });
    
    Object.defineProperty(window.AuthStore, 'Conn', {
        get: () => {
            const m = safeRequire('WAWebConnModel');
            return m ? m.Conn : null;
        },
        configurable: true,
        enumerable: true
    });
    
    Object.defineProperty(window.AuthStore, 'OfflineMessageHandler', {
        get: () => {
            const m = safeRequire('WAWebOfflineHandler');
            return m ? m.OfflineMessageHandler : null;
        },
        configurable: true,
        enumerable: true
    });
    
    Object.defineProperty(window.AuthStore, 'PairingCodeLinkUtils', {
        get: () => {
            return safeRequire('WAWebAltDeviceLinkingApi');
        },
        configurable: true,
        enumerable: true
    });
    
    Object.defineProperty(window.AuthStore, 'Base64Tools', {
        get: () => {
            return safeRequire('WABase64');
        },
        configurable: true,
        enumerable: true
    });
    
    Object.defineProperty(window.AuthStore, 'RegistrationUtils', {
        get: () => {
            const utils = {};
            const m1 = safeRequire('WAWebCompanionRegClientUtils'); if (m1) Object.assign(utils, m1);
            const m2 = safeRequire('WAWebAdvSignatureApi'); if (m2) Object.assign(utils, m2);
            const m3 = safeRequire('WAWebUserPrefsInfoStore'); if (m3) Object.assign(utils, m3);
            const m4 = safeRequire('WAWebSignalStoreApi'); if (m4) Object.assign(utils, m4);
            return utils;
        },
        configurable: true,
        enumerable: true
    });
};
`;

try {
  fs.writeFileSync(authStorePath, replacementCode, "utf8");
  console.log("Successfully patched AuthStore.js!");
} catch (err) {
  console.error("Failed to patch AuthStore.js:", err);
  process.exit(1);
}

console.log("Patching Client.js...");
if (!fs.existsSync(clientPath)) {
  console.error("Client.js not found at:", clientPath);
  process.exit(1);
}

try {
  let clientCode = fs.readFileSync(clientPath, "utf8");
  
  // 1. Patch the outer while loop in Client.js if needed
  if (clientCode.includes("while (!window.AuthStore.PairingCodeLinkUtils) {")) {
    clientCode = clientCode.replace(
      "while (!window.AuthStore.PairingCodeLinkUtils) {",
      "while (!window.AuthStore || !window.AuthStore.PairingCodeLinkUtils) {"
    );
    console.log("Applied outer waiting loop patch to Client.js.");
  }

  // 2. Patch the inner getCode function to wait for Socket state UNPAIRED or UNPAIRED_IDLE
  const targetSnippet = `const getCode = async () => {
                    while (!window.AuthStore || !window.AuthStore.PairingCodeLinkUtils) {
                        await new Promise((resolve) =>
                            setTimeout(resolve, 250),
                        );
                    }
                    window.AuthStore.PairingCodeLinkUtils.setPairingType(`;

  const robustSnippet = `const getCode = async () => {
                    while (!window.AuthStore || !window.AuthStore.PairingCodeLinkUtils) {
                        await new Promise((resolve) =>
                            setTimeout(resolve, 250),
                        );
                    }
                    while (true) {
                        try {
                            const state = window.require('WAWebSocketModel').Socket.state;
                            if (state === 'UNPAIRED' || state === 'UNPAIRED_IDLE') {
                                break;
                            }
                        } catch (e) {}
                        await new Promise((resolve) =>
                            setTimeout(resolve, 250),
                        );
                    }
                    window.AuthStore.PairingCodeLinkUtils.setPairingType(`;

  if (clientCode.includes(targetSnippet)) {
    clientCode = clientCode.replace(targetSnippet, robustSnippet);
    console.log("Successfully patched Client.js getCode with socket state check!");
  } else if (clientCode.includes("const state = window.require('WAWebSocketModel').Socket.state;")) {
    console.log("Client.js getCode seems to be already patched.");
  } else {
    console.warn("WARNING: target getCode snippet not found in Client.js. Skipping getCode patch.");
  }
  
  fs.writeFileSync(clientPath, clientCode, "utf8");
} catch (err) {
  console.error("Failed to patch Client.js:", err);
  process.exit(1);
}
