import React from "react";
import { FallBackImageLoader } from "../filebrowser/index";
import {
  LoadingSpinner,
  CheckIcon,
  HourglassIcon,
  QuestionMarkIcon
} from "../icons";
import { Link } from "react-router-dom";
import { buildFrontendUrl } from "../../api/urls";

const IngestionProgressDisplay = ({ msg = [] }) => {
  const items = msg.map(m => {
    const { status, task } = m;
    let icon = null;
    switch (status) {
      case "completed":
        icon = <CheckIcon />;
        break;
      case "started":
        icon = <LoadingSpinner />;
        break;
      case "pending":
        icon = <HourglassIcon />;
        break;
      default:
        icon = <QuestionMarkIcon />;
    }
    return (
      <span>
        <span className="icon">{icon}</span>
        {task}
      </span>
    );
  });
  return (
    <ul>
      {items.map((i, index) => (
        <li key={index}>{i}</li>
      ))}
    </ul>
  );
};

const PreviouslyIngestedMedia = ({ media }) => {
  return (
    <div className="box media">
      <div className="media-left">
        <figure className="image is-128x128">
          <FallBackImageLoader
            src={media.preview_url}
            mime_type={media.mime_type}
          />
        </figure>
      </div>
      <div className="media-content">
        <h2>{media.title}</h2>

        {media.msg ? <IngestionProgressDisplay msg={media.msg} /> : null}
        {media.description ? <p>{media.description}</p> : null}
        <p>{media.tags.join(", ")}</p>
        <p>
          <Link to={buildFrontendUrl(media.url)} className="button is-small">
            View on site
          </Link>
        </p>
      </div>
    </div>
  );
};

export { PreviouslyIngestedMedia };
