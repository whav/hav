/*
* A small collection of helpers to deal with frontend and 
* API urls, their generation and  interpretation.
*/

import { buildAPIUrl } from "../../api/browser";

export const normalizePath = path => {
  return path.replace(/\/\//g, `/`);
};

const stripSlashes = p => {
  p = p.replace(/^\/+/, "");
  p = p.replace(/\/+$/, "");
  return p;
};

const joinRepoAndPath = (repository, path) => {
  if (path === null || path === undefined) {
    path = ``;
  }
  return [stripSlashes(repository), stripSlashes(path)]
    .filter(s => s !== ``)
    .join("/");
};

const resolveKeyFromMatch = match => {
  const { repository, path } = match.params;
  return resolveKey(repository, path);
};

const resolveKey = (repository, path) => {
  const joined = joinRepoAndPath(repository, path);
  return buildAPIUrl(joined);
};

export default {
  resolveKeyFromMatch,
  resolveKey,
  stripSlashes,
  joinRepoAndPath
};
