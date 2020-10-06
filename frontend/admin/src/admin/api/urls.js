/**
 * Created by sean on 08/02/17.
 */

const djPrefix = "/d";
const apiVersion = "v1";
let apiPrefix = `${djPrefix}/api/${apiVersion}/`;

if (window && URL && window.location) {
  apiPrefix = new URL(apiPrefix, window.location.origin).href;
}

export const prefix = apiPrefix;
export const file_upload = `${apiPrefix}upload/`;
export const browser = file_upload;
export const prepareIngestion = `${apiPrefix}ingestq/`;
export const ingest = `${apiPrefix}ingest/`;
export const ingestQueueDetail = (uuid) => `${apiPrefix}ingest/q/${uuid}/`;
export const ingestOptions = `${apiPrefix}ingest/options/`;
export const ingestSingle = `${apiPrefix}ingest/single/`;
export const ingestFileEndpoint = (uuid) =>
  uuid ? `${ingestQueueDetail(uuid)}ingest/` : ingestSingle;
export const ingestQueueModifierEndpoint = (uuid) =>
  `${ingestQueueDetail(uuid)}modify/`;
export const autocompleteURL = `${apiPrefix}models/tags/`;
export const uploadURL = `${apiPrefix}sources/upload/`;

export const ingestQueueWS = (uuid) => {
  const url = new URL(document.location);
  return `${url.protocol === "https:" ? "wss" : "ws"}://${
    url.host
  }${djPrefix}/ws/admin/ingest/${uuid}/`;
};

const buildFrontendUrl = (url) => {
  return url.startsWith(apiPrefix) ? url.slice(apiPrefix.length - 1) : url;
};

const buildApiUrl = (path) => {
  return `${apiPrefix.slice(0, -1)}${path}`;
};

export { buildFrontendUrl, buildApiUrl };
export default apiPrefix;
