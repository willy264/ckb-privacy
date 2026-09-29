# Project history

This repository now focuses on one opt-in CCC stealth-address package and its example application. Earlier designs, services, contracts, circuits, progress reports, and screenshots are historical research, not dependencies or evidence for the current package.

The earlier material remains available in Git history:

- [Before the incognito pivot — `1c076907`](https://github.com/willy264/ckb-privacy-mixer/tree/1c076907ee8fd12677e4f82a7396d30ba5834aaf): the preceding project and its original documentation.
- [Initial incognito prototype — `099c6ad`](https://github.com/willy264/ckb-privacy-mixer/tree/099c6ad): the first local package/demo implementation and the source context for the retained incognito screenshots.

The current public tree contains only the package, example, tooling, and current documentation. During cleanup, historical working files were preserved locally under ignored `.local/history/`; this directory is not required to build, test, or review the project. Personal proposal files and runtime configuration also remain outside the public tree.

To inspect an earlier revision without replacing current work:

```sh
git worktree add --detach ../obscell-history 1c076907ee8fd12677e4f82a7396d30ba5834aaf
```

Use that revision's instructions when investigating its results. Historical deployment scripts and transaction records do not demonstrate a working CCC stealth integration. Current implementation claims are recorded in [status](status.md) and [validation](validation.md).
