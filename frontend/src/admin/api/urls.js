/**
 * Created by sean on 08/02/17.
 */

const apiVersion = "v1";
let apiPrefix = `/api/${apiVersion}/`;

if (window && URL && window.location) {
  apiPrefix = new URL(apiPrefix, window.location.origin).href;
}

export const prefix = apiPrefix;
export const file_upload = `${apiPrefix}upload/`;
export const browser = file_upload;
export const prepareIngestion = `${apiPrefix}ingestq/`;
export const ingest = `${apiPrefix}ingest/`;
export const ingestQueueDetail = uuid => `${apiPrefix}ingest/${uuid}/`;
export const ingestOptions = `${apiPrefix}ingest/options/`;
