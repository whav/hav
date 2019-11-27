import React from "react";
import { Heading, Box, Text, Image, Container } from "../components";
import LoremIpsum from "../dev/loremipsum";

import Everest from "./everest.jpg";

export default {
  title: "Typography"
};

export const HodgePodge = () => {
  return (
    <Box px={3}>
      {["h1", "h2", "h3", "h4", "h5", "h6"].map(h => (
        <Heading key={h} as={h}>{`I am an ${h} Heading`}</Heading>
      ))}
      <Container>
        <Image src={Everest} />
      </Container>
      <Text>
        <LoremIpsum paragraphs={10} />
      </Text>
    </Box>
  );
};
