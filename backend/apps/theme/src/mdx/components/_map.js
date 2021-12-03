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
      style={{ width: "100%", height: "450px" }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="OSM">
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked name="Humanitarian OSM">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
    </Map>
  );
};

export default HAVMap;
