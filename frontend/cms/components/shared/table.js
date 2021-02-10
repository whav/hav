import React from "react";

const tdClasses = "px-4 py-5 sm:px-6";

const Table = ({ headers = [], rows = [] }) => {
  console.log(rows);
  return (
    <table className="w-full bg-white shadow overflow-hidden sm:rounded">
      {headers.length && (
        <thead>
          <tr className={`text-left`}>
            {headers.map((h, index) => (
              <th key={index} className={tdClasses}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((r = [], index) => (
          <tr
            key={index}
            className={`${index % 2 == 0 ? "bg-gray-100" : "bg-white"}`}
          >
            {r.map((content, index) => (
              <td key={index} className={tdClasses}>
                {content}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export { Table };
