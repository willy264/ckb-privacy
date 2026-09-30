import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = folder => JSON.parse(read(path.join(folder, 'package.json')));
const folders = [...read('pnpm-workspace.yaml').matchAll(/^\s*-\s*'([^']+)'\s*$/gm)].map(match => match[1]);
const expectedPackages = new Set(['@ckb-ccc/stealth', '@ccc-incognito/demo']);
assert.equal(folders.length, expectedPackages.size, 'Only the package and its demonstration belong in the active workspace.');
const forbidden = /(?:mixer-sdk|ckb-mixer-backend|obscell-payment-example|circom|snarkjs|@waku\/)/;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

let sourceCount = 0;
for (const folder of folders) {
  assert.ok(!folder.includes('*') && !folder.includes('..') && !folder.startsWith('archive/'), 'Workspace membership must not glob archived code.');
  const project = manifest(folder);
  assert.ok(expectedPackages.delete(project.name), `Unexpected or duplicate active package: ${project.name}`);
  const dependencies = { ...project.dependencies, ...project.devDependencies, ...project.peerDependencies };
  assert.doesNotMatch(Object.keys(dependencies).join('\n'), forbidden, `${project.name} depends on a historical subsystem.`);
  for (const file of walk(path.join(root, folder, 'src'))) {
    if (!/\.[cm]?[jt]sx?$/.test(file)) continue;
    sourceCount += 1;
    const source = fs.readFileSync(file, 'utf8');
    const imports = [];
    const syntax = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    function visit(node) {
      const specifier = ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
        ? node.moduleSpecifier
        : ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
          ? node.arguments[0]
          : undefined;
      if (specifier && ts.isStringLiteral(specifier)) imports.push(specifier.text);
      ts.forEachChild(node, visit);
    }
    visit(syntax);
    for (const specifier of imports) {
      assert.doesNotMatch(specifier, forbidden, `${file}: historical runtime import`);
      if (specifier.startsWith('.')) {
        const destination = path.resolve(path.dirname(file), specifier);
        const projectRoot = path.join(root, folder) + path.sep;
        assert.ok(destination.startsWith(projectRoot), `${file}: use a declared package export, not a relative cross-project import`);
      } else {
        const dependency = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
        assert.ok(dependencies[dependency], `${file}: undeclared runtime dependency ${dependency}`);
      }
    }
  }
}
assert.equal(expectedPackages.size, 0);
assert.doesNotMatch(JSON.stringify(manifest('').dependencies ?? {}), forbidden);
const host = JSON.parse(read('vercel.json'));
assert.equal(host.outputDirectory, 'examples/incognito/dist', 'Hosting must serve the active demo build.');
assert.equal(host.buildCommand, 'npx --yes pnpm@10.32.1 build');

// Keep the maintainer reading path usable when documentation is consolidated.
const documents = [
  'README.md', 'CONTRIBUTING.md', 'CHANGELOG.md',
  ...folders.map(folder => path.join(folder, 'README.md')),
  ...walk(path.join(root, 'docs'))
    .filter(file => file.endsWith('.md') && !/proposal/i.test(path.basename(file)))
    .map(file => path.relative(root, file)),
];
let linkCount = 0;
for (const file of documents) {
  for (const [, link] of read(file).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    if (/^(?:https?:|mailto:|#)/.test(link)) continue;
    const target = path.resolve(root, path.dirname(file), decodeURIComponent(link.split('#')[0]));
    assert.ok(fs.existsSync(target), `${file}: broken local documentation link ${link}`);
    linkCount += 1;
  }
}
console.log(`Workspace boundaries passed: 2 active packages, ${sourceCount} source files, ${linkCount} documentation links; no archived runtime dependencies or cross-project source imports.`);
