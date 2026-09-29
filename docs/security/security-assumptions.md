# Incognito Security Assumptions

The target feature depends on correct secp256k1/ECDH operations, canonical encoding, secure randomness for actual sends, the reused lock's exact hash/argument/witness rules, and a correct signing integration. Local tests do not replace deployed-lock compatibility checks.

The application environment must protect view and spend secrets. The app selects its CCC client and signer, checks the network, and verifies final transaction outputs after input and fee completion.

A view-key match identifies a candidate addressed to that key. It does not establish chain inclusion, confirmation, an unspent cell, or authority to spend without the spending secret.

Fresh change reduces address reuse but does not hide value or graph structure. Timing, network, amount correlation, compromised clients, and metadata leakage remain risks.

The current package is unaudited, and its demo is explicitly simulated with public fixture material. No mainnet safety, guaranteed anonymity, upstream acceptance, or deployed integration is assumed.
