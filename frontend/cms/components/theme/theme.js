import { roboto } from "@theme-ui/presets";

export default {
  breakpoints: ["40em", "52em", "64em"],
  fonts: {
    ...roboto.fonts,
    body: '"Noto Sans", system-ui, sans-serif',
    heading: '"Noto Serif", system-ui, serif',
  },
  colors: {
    ...roboto.colors,
    sidebar: "#f8b20c",
    sidebar_hover: "whitesmoke",
  },
  sizes: {
    ...(roboto.sizes || {}),
    sidebar: "20vw",
    container: {
      maxWidth: 640,
    },
  },
  layout: {
    main_nav: {
      backgroundColor: "#f8b20c",
    },
    header: {
      flex: "0 0 auto",
    },
    content: {
      flex: "1 1 auto",
    },
    content_sticky: {
      position: "relative",
      overflowY: "auto",
    },
    footer: {
      flex: "0 0 auto",
    },
    text_content: {
      maxWidth: ["80vw", "500px"],
    },
  },
  cards: {
    primary: {
      padding: 2,
      borderRadius: 4,
      boxShadow: "0 0 8px rgba(0, 0, 0, 0.125)",
    },
    compact: {
      padding: 1,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "muted",
    },
  },
  styles: {
    spinner: {
      color: "colors.text",
    },
  },
};
