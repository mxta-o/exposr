const fs = require('fs');
const path = require('path');

const reactRoot = path.dirname(require.resolve('react/package.json'));
const reactDomRoot = path.dirname(require.resolve('react-dom/package.json'));
const babelRoot = path.dirname(require.resolve('@babel/standalone/package.json'));

const files = [
  {
    from: path.join(reactRoot, 'umd', 'react.development.js'),
    to: path.join('public', 'vendor', 'react.development.js'),
  },
  {
    from: path.join(reactDomRoot, 'umd', 'react-dom.development.js'),
    to: path.join('public', 'vendor', 'react-dom.development.js'),
  },
  {
    from: path.join(babelRoot, 'babel.min.js'),
    to: path.join('public', 'vendor', 'babel.min.js'),
  },
];

async function ensureDir(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function copyFile(from, to) {
  await ensureDir(path.dirname(to));
  await fs.promises.copyFile(from, to);
}

async function main() {
  await Promise.all(files.map((file) => copyFile(file.from, file.to)));
  console.log('Copied vendor files to public/vendor');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
