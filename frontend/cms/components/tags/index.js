import React from "react";

const Tag = ({ name }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2 mb-2">
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
