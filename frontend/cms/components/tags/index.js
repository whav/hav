import React from "react";

const Tag = ({ name }) => {
  return (
    <span className="m-1 bg-gray-200 hover:bg-gray-300 rounded-full px-2 font-bold text-sm leading-loose cursor-pointer">
      {name}
    </span>
  );
};

const TagList = ({ tags = [] }) => {
  return (
    <div className="flex flex-row flex-wrap">
      {tags.map((t) => (
        <Tag key={t.id} name={t.name} />
      ))}
    </div>
  );
};

export { TagList, Tag };
