import React from "react";
import * as icons from "../icons";
import { Card, Text, Box, Container } from "../components";

export default {
  title: "Icons"
};

export const allIcons = () => {
  let allIcons = Object.entries(icons).sort();
  return (
    <div>
      <h1>All currently exported Icons</h1>
      <div style={{ display: "flex" }}>
        {allIcons.map(([name, Icon]) => (
          <Box px={"1rem"} key={name}>
            <Card key={name}>
              <Container sx={{ textAlign: "center", fontSize: "2rem" }}>
                <Icon />
              </Container>

              <Text>{name}</Text>
            </Card>
          </Box>
        ))}
      </div>
    </div>
  );
};
