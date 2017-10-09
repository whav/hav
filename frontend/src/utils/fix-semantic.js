var fs = require("fs");
var path = require("path");

const basePath = path.resolve(__dirname, "../..");

const semanticUiLibPath = path.resolve(
  basePath,
  "node_modules/semantic-ui-less/"
);
// we need a valid theme.config in node_modules/semantic-ui-less/

const themeConfig = path.resolve(semanticUiLibPath, "theme.config");
if (!fs.existsSync(themeConfig)) {
  console.log(themeConfig);
  fs.symlinkSync(
    path.resolve(__dirname, "../semantic/theme.config"),
    themeConfig
  );
}

// fix well known bug with default distribution
fixFontPath(
  path.resolve(semanticUiLibPath, "themes/default/globals/site.variables")
);
fixFontPath(
  path.resolve(semanticUiLibPath, "themes/flat/globals/site.variables")
);
fixFontPath(
  path.resolve(semanticUiLibPath, "themes/material/globals/site.variables")
);

function fixFontPath(filename) {
  var content = fs.readFileSync(filename, "utf8");
  var newContent = content.replace(
    "@fontPath  : '../../themes/",
    "@fontPath  : '../../../themes/"
  );
  fs.writeFileSync(filename, newContent, "utf8");
}
