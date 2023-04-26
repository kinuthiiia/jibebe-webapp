import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
} from "react-leaflet";
import * as turf from "@turf/turf";

import Leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export default function DynamicMap({ mapCenter, getMenuState }) {
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [map, setMap] = useState(null);
  const [menuState, setMenuState] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [start, setStart] = useState(null);

  useEffect(() => {
    if (map) {
      console.log("Map present");
      map.on("click", function (e) {
        console.log([e.latlng.lat, e.latlng.lng]);

        setMenuState(true);

        setPolygonCoords((prevCoords) => [
          ...prevCoords,
          [e.latlng.lat, e.latlng.lng],
        ]);
      });
    }
  }, [map]);

  const handleRemoveCoordinate = () => {
    if (polygonCoords.length == 0) {
      setMenuState(false);
      return;
    }
    setPolygonCoords((prevCoords) => {
      const newCoords = [...prevCoords];
      newCoords.pop();

      return newCoords;
    });
  };

  const handleGenerateTracks = (polygonCoordinates) => {
    const trackWidth = 0.000075; // 1.5 meters in degrees

    // Create a turf polygon feature from the input polygon coordinates
    const turfPolygon = turf.polygon([
      [...polygonCoordinates, polygonCoordinates[0]],
    ]);

    // Calculate the bounding box of the polygon
    const bbox = turf.bbox(turfPolygon);

    const [minX, minY, maxX, maxY] = bbox;

    for (let i = minX; i <= maxX; i += trackWidth) {
      for (let j = minY; j <= maxY; j += trackWidth) {
        // Create a turf lineString feature for the track
        const turfLineString = turf.lineString([
          [i, j],
          [i + trackWidth, j],
        ]);

        // Check if the track intersects with the polygon
        if (
          turf.lineIntersect(turfLineString, turfPolygon).features.length == 0
        ) {
          // Convert the turf lineString to an array of coordinates
          const trackCoordinates = turfLineString.geometry.coordinates;

          setTracks((prevTracks) => [...prevTracks, trackCoordinates]);
        }
      }
    }
  };

  const handleGenerateTracks2 = (polygonCoordinates) => {
    const trackWidth = 0.000075; // 1.5 meters in degrees

    // Create a turf polygon feature from the input polygon coordinates
    const turfPolygon = turf.polygon([
      [...polygonCoordinates, polygonCoordinates[0]],
    ]);

    // Calculate the bounding box of the polygon
    const bbox = turf.bbox(turfPolygon);

    const [minX, minY, maxX, maxY] = bbox;

    for (let i = minX; i <= maxX; i += trackWidth) {
      for (let j = minY; j <= maxY; j += trackWidth) {
        // Create a turf lineString feature for the track
        const turfLineString = turf.lineString([
          [i, j],
          [i + trackWidth, j],
        ]);

        // Check if the track intersects with the polygon

        console.log(turf.lineIntersect(turfLineString, turfPolygon)?.features);

        if (
          turf.lineIntersect(turfLineString, turfPolygon)?.features.length > 0
        ) {
          // Create start and end point varibles
          const startPoint = turf.point(turfLineString.geometry.coordinates[0]);
          const endPoint = turf.point(turfLineString.geometry.coordinates[1]);

          // If there is just one intersection
          if (
            turf.lineIntersect(turfLineString, turfPolygon)?.features.length ==
            1
          ) {
            // First slice
            const slice1 = turf.lineSlice(
              startPoint.geometry.coordinates,
              turf.lineIntersect(turfLineString, turfPolygon).features[0]
                .geometry.coordinates,

              turfLineString
            );

            // Second slice
            const slice2 = turf.lineSlice(
              turf.lineIntersect(turfLineString, turfPolygon).features[0]
                .geometry.coordinates,
              endPoint.geometry.coordinates,
              turfLineString
            );

            // First slice is inside polyon
            if (
              turf.booleanPointInPolygon(
                slice1.geometry.coordinates[0],
                turfPolygon
              )
            ) {
              const sliceLineString = turf.lineString([
                ...slice2.geometry.coordinates,
              ]);

              const trackCoordinates = sliceLineString.geometry.coordinates;
              setTracks((prevTracks) => [...prevTracks, trackCoordinates]);
            }
            // Second slice is inside the polygon
            else {
              const sliceLineString = turf.lineString([
                ...slice1.geometry.coordinates,
              ]);

              const trackCoordinates = sliceLineString.geometry.coordinates;
              setTracks((prevTracks) => [...prevTracks, trackCoordinates]);
            }
          }

          // If there are 2 intersections
          else if (
            turf.lineIntersect(turfLineString, turfPolygon)?.features.length ==
            2
          ) {
            const slice = turf.lineSlice(
              turf.lineIntersect(turfLineString, turfPolygon).features[0]
                .geometry.coordinates,
              turf.lineIntersect(turfLineString, turfPolygon).features[1]
                .geometry.coordinates,
              turfLineString
            );

            const sliceLineString = turf.lineString([
              ...slice.geometry.coordinates,
            ]);

            const trackCoordinates = sliceLineString.geometry.coordinates;
            setTracks((prevTracks) => [...prevTracks, trackCoordinates]);
          }

          // Slice the LineString from the start to the intersecting point
          const startSlice = turf.lineSlice(
            startPoint.geometry.coordinates,
            turf.lineIntersect(turfLineString, turfPolygon).features[0].geometry
              .coordinates,
            turfLineString
          );

          // Create a new LineString with the remaining part of the original LineString from the intersecting point to the end
          const endSlice = turf.lineSlice(
            turf.lineIntersect(turfLineString, turfPolygon).features[0].geometry
              .coordinates,
            endPoint.geometry.coordinates,
            turfLineString
          );

          const remainingLineString = turf.lineString([
            ...startSlice.geometry.coordinates,
            ...endSlice.geometry.coordinates,
          ]);

          // Convert the turf lineString to an array of coordinates
          const trackCoordinates = remainingLineString.geometry.coordinates;

          setTracks((prevTracks) => [...prevTracks, trackCoordinates]);
        }
      }
    }
  };

  let marker = new Leaflet.Icon({
    iconUrl: "/tractor.png",
    iconSize: [45, 35],
    iconAnchor: [32, 64],
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
  });

  let marker2 = new Leaflet.Icon({
    iconUrl: "/favicon.ico",
    iconSize: [45, 35],
    iconAnchor: [32, 64],
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
  });

  return (
    <span>
      <MapContainer
        center={mapCenter}
        zoom={17}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", zIndex: 79 }}
        whenCreated={(map) => setMap(map)}
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
        {start && (
          <Marker position={start} icon={marker2}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        )}
        {polygonCoords.length > 0 && (
          <Polygon
            pathOptions={{ color: "purple" }}
            positions={polygonCoords}
          />
        )}
        {/* Render the tracks */}
        {tracks.map((track, index) => (
          <Polyline key={index} positions={track} />
        ))}
      </MapContainer>
      {menuState && (
        <div
          className=" flex gap-3 absolute bottom-0 w-full p-4 bg-white"
          style={{ zIndex: 99 }}
        >
          <Button
            color="red"
            variant="outline"
            onClick={handleRemoveCoordinate}
          >
            {" "}
            &larr; Back
          </Button>
          <Button
            onClick={() => handleGenerateTracks2(polygonCoords)}
            color="green"
            loading={loading}
          >
            Generate tracks
          </Button>
          <Button color="red" variant="outline" onClick={() => setTracks([])}>
            {" "}
            Clear tracks
          </Button>
        </div>
      )}
    </span>
  );
}
