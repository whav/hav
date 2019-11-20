module.exports = {
  components: "./src/components",
  outputPath: "./dist/playroom",

  // Optional:
  title: "HAV UI components",
  frameComponent: "./src/components/theme/provider.js",
  widths: [640, 1024],
  port: 9004,
  openBrowser: false,
  exampleCode: `
    <Button>
      Hello World!
    </Button>
  `
};
