import React from "react";
import classnames from "classnames";

import { DateTime } from "luxon";
import { Link } from "react-router-dom";

const IngestionQueueRow = ({ q }) => {
  const { item_count, ingested_item_count } = q;

  return (
    <tr className={classnames({ "has-text-grey-light": item_count === 0 })}>
      <td>
        <Link to={`/ingest/${q.uuid}/`}>{q.name || q.uuid}</Link>
      </td>
      <td>
        {DateTime.fromISO(q.created_at).toLocaleString(DateTime.DATETIME_SHORT)}
      </td>
      <td />
      <td>
        {item_count} / {ingested_item_count + item_count}
      </td>
    </tr>
  );
};

const IngestionQueueListing = ({ queues }) => {
  return (
    <div className="content">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Created</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {queues.map(q => (
            <IngestionQueueRow key={q.uuid} q={q} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IngestionQueueListing;
