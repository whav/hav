/**
 * Created by sean on 01/02/17.
 */

//  Icons
import {
  GoHome,
  GoFileDirectory,
  GoFileSubmodule,
  GoCloudUpload,
  GoDatabase,
  GoPackage
} from "react-icons/go";
import { FaArchive } from "react-icons/fa";

// base components
import Welcome from "./home";
import FileBrowser from "./containers/filebrowser";
import HAVFileBrowser from "./containers/filebrowser/hav";
import HAVMediaDetail from "./containers/filebrowser/mediaDetail";
import { Uploads } from "./containers/uploads";
import IngestionQueueList from "./containers/ingest/queues";
import IngestionQueue from "./containers/ingest/queue";
import SaveIngestionQueue from "./containers/ingest/index";

const routes = [
  {
    path: "/",
    main: Welcome
  },
  {
    path: "/sources/:repository/:path*/",
    main: FileBrowser
  },
  {
    path: "/uploads/",
    main: Uploads
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
    main: IngestionQueue
  },
  {
    path: "/:repository(hav)/:path?/",
    main: HAVFileBrowser
  },
  {
    path: "/:respository(hav)/media/:media_id/",
    main: HAVMediaDetail
  }
];

const mainNav = [
  {
    title: "Home",
    icon: GoHome,
    menuExact: true,
    link: "/"
  },
  {
    title: "HAV",
    link: "/hav/",
    icon: FaArchive,
    menuExact: false
  },
  {
    title: "Ingest",
    link: "/ingest/",
    icon: GoPackage,
    menuExact: false
  },
  {
    title: "Sources",
    icon: GoFileSubmodule,
    sub: [
      {
        link: "/sources/incoming/",
        icon: GoFileDirectory,
        title: "Incoming",
        menuExact: false
      },
      {
        link: "/sources/whav/",
        icon: GoDatabase,
        title: "WHAV",
        menuExact: false
      }
    ]
  }
  // {
  //     icon: GoCloudUpload,
  //     title: 'Uploads',
  //     menuExact: true,
  //     link: '/uploads/'
  // }
];

export { mainNav, routes };
