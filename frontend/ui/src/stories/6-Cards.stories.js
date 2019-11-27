import React from "react";
import { Card, Image, Text, Container, Divider } from "../components";

import Everest from "./everest.jpg";

export default {
  title: "Cards"
};

export const Cards = () => (
  <Container px={4} py={4}>
    <Card
      sx={{
        maxWidth: 256
      }}
    >
      <Image src={Everest} />
      <Text>Card</Text>
    </Card>

    <Divider />
    <Card
      variant="compact"
      sx={{
        maxWidth: 256
      }}
    >
      <Image src={Everest} />
      <Text>Card</Text>
    </Card>
  </Container>
);
