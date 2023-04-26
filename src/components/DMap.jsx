import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Rectangle,
  Polyline,
} from "react-leaflet";

import Leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Alert, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons";

export default function DMap({ mapCenter }) {
  const [map, setMap] = useState(null);
  const [menuState, setMenuState] = useState(false);
  const [startAlert, setStartAlert] = useState(false);

  const [rectangleBounds, setRectangleBounds] = useState([]);
  const [trackCoordinates, setTrackCoordinates] = useState([]);

  useEffect(() => {
    if (map) {
      setStartAlert(true);
      map.on("click", function (e) {
        // Get clicked point coordinates
        const { latlng } = e;
        const { lat, lng } = latlng;

        setRectangleBounds((prevBounds) => [...prevBounds, [lat, lng]]);
        setMenuState(true);
      });
    }
  }, [map]);

  useEffect(() => {
    if (rectangleBounds.length > 1) {
      const tracks = generateTrackCoordinates([
        rectangleBounds[0],
        rectangleBounds[rectangleBounds.length - 1],
      ]);

      setTrackCoordinates([...tracks, [...tracks[0], mapCenter]]);
    }
  }, [rectangleBounds.length]);

  const generateTrackCoordinates = (bounds) => {
    console.log(bounds);
    const trackWidth = 0.000075;

    //   The ALGORITHM
    const trackCoordinates = [];

    const loops = ((bounds[1][1] - bounds[0][1]) / trackWidth) * 2;

    /* 
  vertical = 0
  horizontal = 1
*  */

    let _orientation = 0;
    let _position_v = "right";
    let _going = "left";

    for (let i = 0; i <= Number(loops.toFixed(0)); i++) {
      // First line
      if (i == 0) {
        trackCoordinates.push([bounds[0], [bounds[0][0], bounds[1][1]]]);
      } else {
        // Horizontal lines
        if (_orientation == 1) {
          // At the top
          if (_going == "left") {
            trackCoordinates.push([
              trackCoordinates[i - 1][1],
              [trackCoordinates[i - 1][1][0], bounds[0][1]],
            ]);
            _going = "right";
            _orientation = 0;
          } else {
            trackCoordinates.push([
              trackCoordinates[i - 1][1],
              [trackCoordinates[i - 1][1][0], bounds[1][1]],
            ]);
            _going = "left";
            _orientation = 0;
          }
        }
        // Vertical lines
        else {
          if (_position_v == "right") {
            trackCoordinates.push([
              trackCoordinates[i - 1][1],
              [trackCoordinates[i - 1][1][0] + trackWidth, bounds[1][1]],
            ]);
            _position_v = "left";
            _orientation = 1;
          }
          // Vertical to the left
          else {
            trackCoordinates.push([
              trackCoordinates[i - 1][1],
              [trackCoordinates[i - 1][1][0] + trackWidth, bounds[0][1]],
            ]);
            _position_v = "right";
            _orientation = 1;
          }
        }
      }
    }

    return trackCoordinates;
  };

  const clearMap = () => {
    setRectangleBounds([]);
    setTrackCoordinates([]);
    setMenuState(false);
  };

  const startNavigating = () => {
    notifications.show({
      title: "Tractor not paired",
      message:
        " The tractor needs to be paired with the app to start ploughing",
      color: "red",
    });
  };

  let marker = new Leaflet.Icon({
    iconUrl: "/tractor.png",
    iconSize: [40, 30],

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

        {rectangleBounds.length > 0 && (
          <Rectangle
            bounds={rectangleBounds}
            pathOptions={{ color: "purple" }}
          />
        )}
        {/* Render the tracks */}
        {trackCoordinates.length > 0 && (
          <Polyline
            positions={trackCoordinates}
            color="green"
            weight={2}
            opacity={1}
          />
        )}
      </MapContainer>

      {startAlert && (
        <div
          className=" flex gap-3 absolute top-[120px] w-full p-4"
          style={{ zIndex: 99 }}
        >
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Welcome to Jibebe App"
            color="green"
            withCloseButton
            onClose={() => setStartAlert(false)}
          >
            Plough your farm in three easy steps:
            <p className="pt-4">
              1. Click on your desired <strong>bottom left</strong> point
            </p>
            <p>
              2. Then click on your desired <strong>top right</strong> point
            </p>
            <p>3. Start ploughing</p>
          </Alert>
        </div>
      )}

      {menuState && (
        <div
          className=" flex gap-3 absolute bottom-0 lg:bottom-4 lg:w-2/5 lg:left-[50%] lg:translate-x-[-50%] lg:rounded-lg w-full p-4 bg-white"
          style={{ zIndex: 99 }}
        >
          <Button onClick={startNavigating} color="green" fullWidth uppercase>
            Start ploughing
          </Button>
          <Button
            color="orange"
            variant="outline"
            onClick={clearMap}
            fullWidth
            uppercase
          >
            {" "}
            Clear Map
          </Button>
        </div>
      )}
    </span>
  );
}
