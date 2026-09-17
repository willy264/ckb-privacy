# Obscell Privacy Protocol: Corrected V1

**Status:** Normative design and source-level foundation. No corrected-V1 testnet/mainnet deployment or independent review exists yet. Testnet deployment and mainnet release have separate gates below; source-level foundations alone are not deployable.

## Scope

Privacy Protocol defines the validity rules specified here; Privacy Core implements them through privacy primitives, state handling, cryptographic verification, and CKB scripts. Applications consume those capabilities through the Privacy SDK, whose CCC adapter uses an application-owned Client and operation-scoped Signer. CKB enforces the scripts and settles valid state transitions. The reference application is the first controlled SDK consumer, not a separate wallet product. Its fixed-denomination privacy pool validates commitments, Merkle state, nullifiers, proof authorization, CT conservation, and CKB state transitions; the pool itself is not the architectural boundary of the project.

The target V1 operation set is one CT asset and one fixed denomination per pool, one commitment per staging cell, one-note withdrawal, one recipient CT output, depth-20 Merkle membership, and optional fee-only relaying. Arbitrary values, private-to-private transfer, join-split, shielded change, and advanced stealth are outside V1. These are protocol design requirements; the unfinished genesis, acceptance, and withdrawal implementations currently reject execution.

## Identities

- `pool_id`: the unique 32-byte Type-ID value carried in the PoolState type-script args.
- `asset_id`: the exact 32-byte CT type script hash accepted by the pool.
- `poolDomain`: the field-domain hash of the full canonical PoolState type script; unlike `pool_id`, it binds the deployed code hash and hash type as well as the Type-ID args.
- `PoolStateCell`: exactly one live cell using the pool's V1 type script and identity.
- `VaultCell`: exactly one sibling cell using the exact CT type and a V1 vault covenant bound to `pool_id`.
- `StagingDepositCell`: a CT cell under the V1 staging covenant whose data commits to the target pool and refund conditions.

Code hashes, Type-IDs, and genesis state are new. Legacy deployments cannot be upgraded into or consumed by V1.

## Canonical Encoding

The Molecule schema is `schemas/obscell_v1.mol`.

1. All structures use the exact declared V1 shape; unknown versions, reserved bits, trailing bytes, wrong vector sizes, and non-minimal encodings fail.
2. `Uint*` values are fixed-width unsigned little-endian and must pass checked arithmetic.
3. Fr and Fq values are exactly 32 bytes little-endian at the contract/proof ABI.
4. Fr values must be `< 21888242871839275222246405745257275088548364400416034343698204186575808495617`.
5. Fq values must be `< 21888242871839275222246405745257275088696311157297823662689037894645226208583`.
6. Decoders reject values at or above the modulus. They never call a modulo-reducing constructor on attacker-controlled bytes.
7. SDK `FieldHex` uses a 32-byte big-endian hexadecimal numeric representation. Explicit conversion is required at the little-endian ABI boundary.

## Pool State

`PoolConfigV1` is immutable. It requires `version = 1`, `tree_depth = 20`, `reserved = 0`, a positive denomination, and a bounded `root_history_size`. `frontier` contains exactly 20 canonical Fr values. `accepted_roots` has exactly the configured bounded length policy and includes the current root.

The accounting invariant is:

```text
outstanding_value = denomination * outstanding_count
next_leaf_index = total accepted commitment count
next_leaf_index <= 2^20
```

The pool-specific empty tree is deterministic:

```text
zero[0] = Poseidon(MERKLE_EMPTY_TAG, poolDomain)
zero[level + 1] = Poseidon(MERKLE_NODE_TAG, poolDomain, level, zero[level], zero[level])
emptyRoot = zero[20]
```

The live Vault's CT value/commitment must agree with PoolState accounting under the CT conservation proof. PoolState data alone cannot mint or authorize CT.

## Domain Separation

Circuit tags are lowercase ASCII labels interpreted as unsigned little-endian integers:

- `obscell/v1/leaf`
- `obscell/v1/nullifier`
- `obscell/v1/auth`
- `obscell/v1/merkle-empty`
- `obscell/v1/merkle-node`

The remaining frozen V1 tags are:

- `obscell/v1/action`
- `obscell/v1/pool-domain`
- `obscell/v1/asset-domain`
- `obscell/v1/recipient-domain`
- `obscell/v1/recipient-commit`
- `obscell/v1/recipient-ct`

Script domains use the pool, asset, and recipient tags above. Let `B` be the canonical CKB Molecule `Script` bytes produced by the `ckb-molecule-script-v1` schema. Split `B` in order into non-padded chunks `C_i` of at most 31 bytes and interpret each chunk as an unsigned little-endian integer. Then:

```text
s[0] = Poseidon(domainTag, byteLength(B))
s[i + 1] = Poseidon(domainTag, s[i], i, LE(C_i))
scriptDomain = s[chunkCount]
```

The byte length and chunk index make boundaries and trailing zero bytes unambiguous. Every chunk is below `2^248`, so no modulo reduction occurs. Pool, asset, and recipient use distinct tags.

## Circuit Statement

The public signal order is frozen:

```text
poolDomain
assetDomain
denomination
value
root
nullifierHash
recipientDomain
actionHash
authTag
```

Private witnesses are `secret`, `nullifierSecret`, `pathElements[20]`, and `pathIndices[20]`.

```text
value = denomination

leaf = Poseidon(
  LEAF_TAG, poolDomain, assetDomain, denomination, secret, nullifierSecret
)

leafIndex = sum(pathIndices[level] * 2^level), level = 0..19

nullifierHash = Poseidon(
  NULLIFIER_TAG, poolDomain, nullifierSecret, leafIndex
)

authTag = Poseidon(AUTH_TAG, secret, recipientDomain, actionHash)

node[level] = Poseidon(
  MERKLE_NODE_TAG, poolDomain, level, left, right
)
```

Every `pathIndices` value is boolean. Level zero is the leaf level. Path bit zero places the current value left; bit one places it right.

## Protected Action

Withdrawal output positions are fixed: successor PoolState is output `0`, successor Vault is output `1`, and recipient CT is output `2`. Untyped fee change, if any, begins after the protected outputs.

The withdrawal action binds the following values through a hierarchical Poseidon hash. `vaultInputAmount` and `vaultOutputAmount` are the logical fixed-denomination accounting values derived from PoolState; the CT script separately proves the confidential commitment conservation relation.

```text
identityHash = Poseidon(
  ACTION_TAG, 2, poolDomain, assetDomain, denomination, value
)

stateHash = Poseidon(
  ACTION_TAG, root, nullifierHash, currentSequence, nextSequence
)

payoutHash = Poseidon(
  ACTION_TAG,
  recipientDomain,
  recipientCtCommitmentHash,
  recipientCtDataHash,
  2,
  recipientOutputCapacity,
  vaultInputAmount,
  vaultOutputAmount
)

actionHash = Poseidon(ACTION_TAG, identityHash, stateHash, payoutHash)
```

The action therefore binds:

- action kind/version;
- pool and asset domains;
- denomination and value;
- current accepted root;
- nullifier hash;
- current state sequence (successor is constrained to current + 1);
- current and successor Vault accounting;
- recipient lock domain;
- exact recipient CT output data/commitment domain;
- recipient output capacity reserve;
- fixed protocol output index `2`.

`recipientCtCommitmentHash` and `recipientCtDataHash` use the byte sponge above with their dedicated tags. The Pool script derives this context from actual live inputs and outputs, recomputes `actionHash`, and compares it with the public signal. Client-supplied protected fields are never authoritative. Fee-only inputs/change may vary only outside this protected set and must be untyped.

## Initialization

Initialization creates one PoolState and one Vault under fresh V1 identities. The tree uses the V1 empty-root sequence, frontier is empty, sequence/count/value/index are zero, and Vault CT value is zero. Type-ID creation rules and a deployment manifest bind the pool to exact script/circuit/CT versions.

## Staging

The user starts with a pre-existing supported CT cell. CCC constructs a transaction that the user's operation-scoped signer approves. It creates a `StagingDepositV1` output with exact pool/asset/denomination/commitment, refund-lock hash, relative timeout, and capacity reserve. Any CT change is user-controlled and exists only in this staging transaction.

Staging is not a private balance. A note becomes accepted/spendable only after the staging transaction and its PoolState/Vault acceptance are canonically confirmed.

## Acceptance

Acceptance consumes the current PoolState, sibling Vault, and one or more confirmed staging cells. It produces exactly one successor PoolState and Vault. Staging inputs are deterministically ordered by outpoint. For each staging input, the script verifies identity/value/data and appends the exact commitment. Sequence increases by one for the whole transaction, root/frontier/index and root history update deterministically, nullifier root is unchanged, and Vault/count/value increase by the accepted total.

Any party may construct acceptance. Concurrent builders naturally conflict on the singleton PoolState/Vault inputs. Service locks are optimizations, not consensus.

## Refund

After `refund_since`, the committed refund owner may consume an unaccepted staging cell and reproduce the exact CT asset/value under the committed refund lock. Refund does not consume or modify PoolState or Vault. Before the timeout or with changed asset/value/recipient, it fails.

## Withdrawal

Withdrawal consumes the current PoolState and Vault plus optional untyped fee cells. It proves the frozen statement against a current or retained accepted root. It changes the nullifier from absent to spent, increments sequence, preserves commitment frontier/index, decrements count/value and Vault CT by exactly one denomination, and creates exactly one recipient-controlled CT output using the pool asset and capacity reserve.

The recipient must then be able to spend that output through an ordinary CCC-compatible signer. A transaction is invalid if recipient, asset, value, action, state sequence, vault delta, output index/data, root, nullifier, or proof changes.

## Proof Verification

The verifier accepts exactly nine canonical Fr inputs and one versioned proof. Every G1/G2 coordinate is canonical Fq, points at infinity are rejected, curve membership is checked, and correct subgroup membership is checked before pairings. The verifying key is pinned by deployed code/manifest. Existing legacy artifacts are incompatible.

## Confirmation And Reorg Policy

Clients and services distinguish `queued`, `validated`, `submitted`, and `committed`. Only canonical chain observation can produce `committed`. The deployment chooses a confirmation depth. Index checkpoints include block number and hash; a mismatch rolls state, notes, and operations back to the common ancestor and replays canonical events.

## Testnet Candidate Gates

Before a corrected-V1 testnet candidate is deployed, the implementation MUST pass:

1. Molecule code generation and Rust/TypeScript round-trip vectors.
2. Complete PoolState, Vault, staging/refund, proof, nullifier, and CT script tests, including successful state transitions.
3. Cross-language domain/action/Merkle/proof vectors and cryptographic verification tests.
4. Mutation, replay, stale-state, recipient-binding, and CT-inflation tests.
5. Corrected-workload proof-system benchmark and documented selection.
6. Reproducible circuit setup/artifact hashes and verifier generation.
7. Non-fixture SDK/CCC/services integration and a verified testnet manifest with fresh deployment identities.

The testnet candidate then runs the [Pudge acceptance procedure](pudge-runbook.md), including recipient spend, adversarial scenarios, and Redis rebuild. A testnet candidate is not a mainnet release.

## Mainnet Release And Deployment Gates

The five-month / approximately 20-week plan targets a working testnet implementation, validated mainnet-ready release, and mainnet deployment when acceptance and security gates pass. Mainnet deployment MUST remain blocked until:

1. Protocol, cryptographic, adversarial, cross-component, state-transition, and SDK integration tests pass against the release candidate.
2. The full Pudge runbook has independently inspectable transaction/cell evidence, including recipient subsequent spend, replay rejection, stale-state handling, reorganization recovery, and service rebuild.
3. Independent review of the circuit, CKB scripts, CT integration, and security-sensitive SDK boundaries is complete, with no unresolved critical or high security findings. Other findings and limitations are disclosed.
4. Release binaries, proof artifacts, manifests, test vectors, and their hashes are reproducible from pinned sources and tools.
5. Protocol, SDK, deployment, recovery, and operational documentation is complete.
6. A separate mainnet preflight verifies genesis/network identity, dependencies, code hashes, Type-IDs, CT configuration, capacity requirements, signer authority, and fresh initial state.

The fifth month provides the required hardening and release window for issues discovered during real testnet integration, independent review, and deployment preparation. It includes integration defects, cryptographic findings, testnet issues, remediation, and final release evidence. If mainnet gates remain unmet, deliver the validated testnet release and documented remediation state instead. A testnet candidate whose own acceptance checks remain unresolved MUST be reported as incomplete, not validated. Schedule pressure does not authorize bypassing a gate. No gate has been declared complete by this documentation revision. [Deployment details](deployment.md) distinguish scripts, SDK publication, and interface hosting.
