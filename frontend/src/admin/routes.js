/**
 * Created by sean on 01/02/17.
 */

//  Icons

import {
  DirectoryIcon,
  UploadIcon,
  ArchiveIcon,
  DatabaseIcon,
  HomeIcon,
  IngestPackageIcon
} from "./ui/icons";

// base components
import Welcome from "./home";
import FileBrowser from "./containers/filebrowser";
import HAVFileBrowser from "./containers/filebrowser/hav";
import HAVMediaDetail from "./containers/filebrowser/mediaDetail";
import Uploads from "./containers/simpleUpload";
import IngestionQueueList from "./containers/ingest/queues";
import Ingest from "./containers/ingest/queue";
import SaveIngestionQueue from "./containers/ingest/index";

const routes = [
  {
    path: "/",
    main: Welcome
  },
  {
    path: "/sources/upload/",
    main: Uploads
  },
  {
    path: "/sources/:repository/:path*/",
    main: FileBrowser
  },
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
  {
    path: "/:repository(hav)/:path?/",
    main: HAVFileBrowser
  },
  {
    path: "/:repository(hav)/media/:media_id/",
    main: HAVMediaDetail
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
        menuExact: true,
        link: "/sources/upload/"
      }
    ]
  }
];

export { mainNav, routes };
