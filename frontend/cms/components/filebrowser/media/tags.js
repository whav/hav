import React from "react";

const Tags = ({ tags = [] }) => {
  return (
    <table>
      <tbody>
        {tags.map((tag, index) => (
          <tr key={tag.name}>
            <td>{tag.name}</td>
            <td>{tag.source}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Tags;
