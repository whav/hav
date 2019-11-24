// example theme.js
export default {
  fonts: {
    body: "system-ui, sans-serif",
    heading: '"Avenir Next", sans-serif',
    monospace: "Menlo, monospace"
  },
  colors: {
    text: "#fff",
    background: "#000",
    primary: "#00b89c",
    sidebar: "#f8b20c"
  },
  sizes: {
    sidebar: "30%"
  },
  layout: {
    main_nav: {
      backgroundColor: "sidebar"
    },
    header: {
      flex: "0 0 auto"
    },
    content: {
      flex: "1 1 auto"
    },
    content_sticky: {
      position: "relative",
      overflowY: "auto"
    },
    footer: {
      flex: "0 0 auto"
    }
  }
};
