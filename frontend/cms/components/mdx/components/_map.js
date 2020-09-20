import React from "react";
import { Map, TileLayer, LayersControl } from "react-leaflet";

const HAVMap = (props) => {
  const { lat, lng, zoom } = props;
  const viewport = {
    center: [lat, lng],
    zoom: zoom,
  };
  return (
    <Map
      {...props}
      viewport={viewport}
      style={{ width: "100%", height: "300px" }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="OSM">
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked name="Univie">
          {/* The -y in the url is needed for TMS Servers */}
          <TileLayer
            attribution="Map data &amp;copy UNI-Wien, data source: SRTM & UMD Land Cover'"
            url="http://dev.geo.univie.ac.at/projects/cirdis/TMS_CIRDIS_modern/{z}/{x}/{-y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
    </Map>
  );
};

export default HAVMap;
