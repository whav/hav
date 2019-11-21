# HAV frontend projects

This folder, organised as yarn workspaces, holds the frontend parts of the HAV.

## Some hints on how to get started

List available workspaces

```
yarn workspaces
```

Run the admin frontend build server

```
yarn workspace hav-admin start
```

Start the CMS against a running django development server:

```
HAV_URL=http://127.0.0.1:8000/ yarn workspace hav-cms start
```
