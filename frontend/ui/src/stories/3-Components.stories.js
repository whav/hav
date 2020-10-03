import React from "react";
import { Box, Alert } from "@theme-ui/components";
import LoremIpsum from "../dev/loremipsum";

const DummyText = () => <LoremIpsum paragraphs={1} />;

export default {
  title: "Components",
  exludeStories: ["DummyText"],
};

const pms = { px: [1], py: [1], mx: [1] };

export const boxes = () => {
  return (
    <>
      <Box {...pms}>
        <DummyText />
      </Box>
      <hr />
      <Box {...pms} sx={{ backgroundColor: "primary" }}>
        <DummyText />
      </Box>
    </>
  );
};

export const Alerts = () => (
  <>
    <Alert variant="secondary" mb={2}>
      Secondary
    </Alert>
    <Alert variant="accent" mb={2}>
      Accent
    </Alert>
    <Alert variant="highlight" mb={2}>
      Highlight
    </Alert>
  </>
);
