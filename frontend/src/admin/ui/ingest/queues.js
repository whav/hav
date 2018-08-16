import React from "react";
import classnames from "classnames";

import { DateTime } from "luxon";
import { Link } from "react-router-dom";

const IngestionQueueRow = ({ q }) => {
  const { item_count, ingested_item_count } = q;
  const remaining_items = item_count - ingested_item_count;
  return (
    <tr
      className={classnames({ "has-text-grey-light": remaining_items === 0 })}
    >
      <td>
        <Link to={`/ingest/${q.uuid}/`}>{q.name || q.uuid}</Link>
      </td>
      <td>
        {DateTime.fromISO(q.created_at).toLocaleString(DateTime.DATETIME_SHORT)}
      </td>
      <td>
        {remaining_items} / {item_count}
        {/* <pre>{JSON.stringify(q, null, 2)}</pre> */}
      </td>
    </tr>
  );
};

const IngestionQueueListing = ({ queues }) => {
  return (
    <div className="content">
      <table className="table">
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
