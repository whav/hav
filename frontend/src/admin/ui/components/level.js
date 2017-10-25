import React from "react";

const LevelItem = ({ children }) => (
  <div className="level-item">{children}</div>
);

const Level = ({ left = null, right = null, items = [] }) => {
  return (
    <div className="level">
      <div className="level-left">{left}</div>
      {items.map((item, index) => <LevelItem key={index}>{item}</LevelItem>)}
      <div className="level-right">{right}</div>
    </div>
  );
};

export default Level;
export { LevelItem };
