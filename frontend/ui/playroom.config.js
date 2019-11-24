module.exports = {
  components: "./src/index",
  outputPath: "./dist/playroom",

  // Optional:
  title: "HAV UI components",
  frameComponent: "./src/components/theme/provider.js",
  widths: [1024, 320],
  port: 9004,
  openBrowser: false,
  exampleCode: `
    <Button>
      Hello World!
    </Button>
  `
};
