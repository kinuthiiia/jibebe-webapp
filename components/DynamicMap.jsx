import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";

import Leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

export default function DynamicMap({ mapCenter }) {
  let marker = new Leaflet.Icon({
    iconUrl: "/tractor.png",
    iconSize: [45, 35],
    iconAnchor: [32, 64],
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
  });

  return (
    <MapContainer
      center={mapCenter}
      zoom={17}
      scrollWheelZoom={false}
      style={{ height: "31vh", width: "100%", zIndex: 79 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={mapCenter} icon={marker}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}
