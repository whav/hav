import React from "react";
import { configure } from "@storybook/react";
import { addDecorator } from "@storybook/react";
import ThemeProvider from "../src/components/theme/provider";

// automatically import all files ending in *.stories.js
configure(require.context("../src/stories", true, /\.stories\.js$/), module);

// wrap all components in the theme context provider
const ThemeUIDecorator = storyFn => <ThemeProvider>{storyFn()}</ThemeProvider>;
addDecorator(ThemeUIDecorator);
