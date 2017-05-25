var fs = require('fs');
var path = require('path');

const basePath = path.resolve(
    __dirname,
    '../..'
)

const semanticUiLibPath = path.resolve(basePath, 'node_modules/semantic-ui-less/')

console.log(
    semanticUiLibPath,
    path.resolve(semanticUiLibPath, 'theme.config')
)

// relocate default config
fs.writeFileSync(
  path.resolve(semanticUiLibPath, 'theme.config'),
  "@import '../../src/semantic/theme.config';\n",
  'utf8'
);

// fix well known bug with default distribution
fixFontPath(path.resolve(semanticUiLibPath, 'themes/default/globals/site.variables'));
fixFontPath(path.resolve(semanticUiLibPath, 'themes/flat/globals/site.variables'));
fixFontPath(path.resolve(semanticUiLibPath, 'themes/material/globals/site.variables'));

function fixFontPath(filename) {
    // console.log(filename)
  var content = fs.readFileSync(filename, 'utf8');
  var newContent = content.replace(
    "@fontPath  : '../../themes/",
    "@fontPath  : '../../../themes/"
  );
  fs.writeFileSync(filename, newContent, 'utf8');
}