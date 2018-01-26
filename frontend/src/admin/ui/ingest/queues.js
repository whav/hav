import React from "react";

import { DateTime } from "luxon";
import { Link } from "react-router-dom";

const IngestionQueueListing = ({ queues }) => {
  return (
    <table className="table">
      <tbody>
        {queues.map(q => {
          return (
            <tr key={q.uuid}>
              <td>
                <Link to={`/ingest/${q.uuid}/`}>{q.uuid}</Link>
              </td>
              <td>
                {DateTime.fromISO(q.created_at).toLocaleString(
                  DateTime.DATETIME_SHORT
                )}
              </td>
              <td>{q.item_count} assets selected</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default IngestionQueueListing;
