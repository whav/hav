/**
 * Created by sean on 01/02/17.
 */

//  Icons
import React from "react";

import {
  DirectoryIcon,
  UploadIcon,
  ArchiveIcon,
  DatabaseIcon,
  HomeIcon,
  IngestPackageIcon
} from "./ui/icons";

import apiPrefix from "./api/urls";

// base components
import Welcome from "./home";

//import FileBrowser from "./containers/filebrowser";
const FileBrowser = React.lazy(() => import("./containers/filebrowser"));

//import HAVFileBrowser from "./containers/filebrowser/hav";
const HAVFileBrowser = React.lazy(() => import("./containers/filebrowser/hav"));

// import HAVMediaDetail from "./containers/filebrowser/mediaDetail";
const HAVMediaDetail = React.lazy(() =>
  import("./containers/filebrowser/mediaDetail")
);

import {
  HAVFolderAdd,
  HAVFolderUpdate
} from "./containers/filebrowser/folder_crud";

// import Uploads from "./containers/simpleUpload";
const Uploads = React.lazy(() => import("./containers/simpleUpload"));
// console.log(Uploads);
// import IngestionQueueList from "./containers/ingest/queues";
const IngestionQueueList = React.lazy(() =>
  import("./containers/ingest/queues")
);
// import Ingest from "./containers/ingest/queue";
const Ingest = React.lazy(() => import("./containers/ingest/queue"));

// import SaveIngestionQueue from "./containers/ingest/index";
const SaveIngestionQueue = React.lazy(() =>
  import("./containers/ingest/index")
);

// import Playground from "./ui/playground";
const Playground = React.lazy(() => import("./ui/playground"));

const routes = [
  // main views
  {
    path: "/",
    main: Welcome
  },
  // various sources
  {
    path: "/sources/upload/",
    main: Uploads
  },
  {
    path: "/sources/:repository/:path*/",
    main: FileBrowser
  },
  // Ingestion views
  {
    path: "/ingest/",
    main: IngestionQueueList
  },
  {
    path: "/ingest/create/",
    main: SaveIngestionQueue
  },
  {
    path: "/ingest/:uuid/",
    main: Ingest
  },
  // HAV specific routes
  {
    path: "/:repository(hav)/media/:media_id/",
    main: HAVMediaDetail
  },
  {
    path: "/:repository(hav)/:path?/",
    main: HAVFileBrowser
  },
  {
    path: "/:repository(hav)/:path?/add/",
    main: HAVFolderAdd
  },
  {
    path: "/:repository(hav)/:path?/edit/",
    main: HAVFolderUpdate
  },
  // Debug stuff
  {
    path: "/playground/",
    main: Playground
  }
];

const mainNav = [
  {
    title: "Home",
    icon: HomeIcon,
    menuExact: true,
    link: "/"
  },
  {
    title: "HAV",
    link: "/hav/",
    icon: ArchiveIcon,
    menuExact: false
  },
  {
    title: "Ingest",
    link: "/ingest/",
    icon: IngestPackageIcon,
    menuExact: false
  },
  {
    title: "Sources",
    sub: [
      {
        link: "/sources/incoming/",
        icon: DirectoryIcon,
        title: "Incoming",
        menuExact: false
      },
      {
        link: "/sources/whav/",
        icon: DatabaseIcon,
        title: "WHAV",
        menuExact: false
      },
      {
        icon: UploadIcon,
        title: "Uploads",
        menuExact: false,
        link: "/sources/upload/"
      }
    ]
  },
  {
    title: "Experiments",
    sub: [{ title: "Playground", link: "/playground/", menuExact: false }]
  }
];

export { mainNav, routes };

export default params => {
  const {
    repository = null,
    path = null,
    media_id = null,
    ...unknown
  } = params;
  const unknown_params = Object.keys(unknown);
  if (unknown_params.length > 0) {
    console.warn(
      `Unknown captured url param(s): ${Object.keys(unknown_params.join(", "))}`
    );
  }
  const prefix = apiPrefix.endsWith("/") ? apiPrefix.slice(0, -1) : apiPrefix;
  if (repository && path) {
    return `${prefix}/${
      repository === "hav" ? "" : "sources/"
    }${repository}/${path}/`;
  } else if (repository === "hav" && media_id) {
    return `${prefix}/${repository}/media/${media_id}/`;
  } else if (repository) {
    return `${prefix}/${repository === "hav" ? "" : "sources/"}${repository}/`;
  }
};
