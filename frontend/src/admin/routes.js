/**
 * Created by sean on 01/02/17.
 */

//  Icons
import GoHome from "react-icons/go/home";
import GoFileDirectory from "react-icons/go/file-directory";
import GoFileSubmodule from "react-icons/go/file-submodule";
import GoCloudUpload from "react-icons/go/cloud-upload";
import FaArchive from "react-icons/lib/fa/archive";
import GoDatabase from "react-icons/go/database";

// base components
import Welcome from "./home";
import FileBrowser from "./containers/filebrowser";
import HAVFileBrowser from "./containers/filebrowser/hav";
import { Uploads } from "./containers/uploads";
import Ingestion from "./containers/ingest";

const routes = [
  {
    path: "/",
    main: Welcome
  },
  {
    path: "/source/:repository/:path*/",
    main: FileBrowser
  },
  {
    path: "/uploads/",
    main: Uploads
  },
  // {
  //   path: "/ingest/step1/",
  //   main: IngestionStep1
  // },
  {
    path: "/ingest/",
    main: Ingestion
  },
  {
    path: "/:repository(hav)/:path*/",
    main: HAVFileBrowser
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
    title: "Sources",
    icon: GoFileSubmodule,
    sub: [
      {
        link: "/source/incoming/",
        icon: GoFileDirectory,
        title: "Incoming",
        menuExact: false
      },
      {
        link: "/source/whav/",
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
