import { LoremIpsum } from "lorem-ipsum";
import React from "react";

const LoremIpsumText = ({ paragraphs = 10 }) => {
  const lorem = new LoremIpsum();
  const generated_paragraphs = [...Array(paragraphs).keys()].map(() =>
    lorem.generateParagraphs(1)
  );
  return (
    <React.Fragment>
      {generated_paragraphs.map((_, index) => (
        <p key={index}>{_}</p>
      ))}
    </React.Fragment>
  );
};

export default LoremIpsumText;
