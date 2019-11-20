module.exports = {
  components: "./src/components",
  outputPath: "./dist/playroom",

  // Optional:
  // title: 'My Awesome Library',
  // themes: './src/themes',
  // frameComponent: './playroom/FrameComponent.js',
  widths: [640, 1024],
  port: 9004,
  // openBrowser: true,
  exampleCode: `
    <Button>
      Hello World!
    </Button>
  `
  // webpackConfig: () => ({
  //   // Custom webpack config goes here...
  // })
};
