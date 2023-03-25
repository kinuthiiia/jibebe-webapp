import { Badge, Button, Divider, Input, Text } from "@mantine/core";
import {
  GoogleMap,
  MarkerF,
  useLoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import {
  IconBatteryCharging,
  IconChartInfographic,
  IconClock,
  IconFocus2,
  IconLocation,
  IconTemperature,
  IconX,
} from "@tabler/icons";
import { useMemo, useRef, useState } from "react";
import useDimensions from "../hooks/useDimensions";
import { Joystick } from "react-joystick-component";
import { Camera } from "react-camera-pro";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { notifications } from "@mantine/notifications";

export default function Home() {
  // States and Configs
  const libraries = useMemo(() => ["places", "visualization", "geometry"], []);
  const mapCenter = useMemo(() => ({ lat: -1.18931, lng: 37.11637 }), []);
  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      clickableIcons: true,
      scrollwheel: false,
    }),
    []
  );
  const [map, setMap] = useState(null);
  const [destination, setDestination] = useState("");
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [info, setInfo] = useState(false);
  const [tractorState, setTractorState] = useState("ON");
  const [movement, setMovement] = useState({
    distance: null,
    direction: null,
    angle: null,
  });

  const { width, height } = useDimensions();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    libraries,
  });
  const camera = useRef(null);

  // Functions

  const calculateRoute = async () => {
    if (!destination) {
      notifications.show({
        title: "No destination set",
        message: "You need to set a ddestination to plan a course",
        color: "blue",
      });
      return;
    }

    notifications.show({
      title: "Maps API",
      message: "The free MAP API does not allow for showing directions",
      color: "yellow",
    });

    // const directionService = new google.maps.DirectionsService();

    // const results = await directionService.route({
    //   origin: mapCenter,
    //   destination: { lat: -1.2, lng: 38 },
    //   travelMode: google.maps.TravelMode.DRIVING,
    // });

    // console.log(results);

    // setDirectionsResponse(results);
  };

  const startMotor = async () => {
    if (tractorState == "ON") {
      return;
    }
    setTractorState("ON");
    notifications.show({
      title: "Tractor motor powered on",
      color: "green",
      message: "Ready to move",
    });
  };

  const stopMotor = async () => {
    if (tractorState == "OFF") {
      return;
    }
    setTractorState("OFF");
    notifications.show({
      title: "Tractor motor powered off",
      color: "orange",
      message: "Tractor is now inactive",
    });
  };

  const handleMove = (movement) => {
    let payload = {
      distance: movement.distance,
      angle: (Math.atan2(movement.y, movement.x) * (180 / Math.PI)).toFixed(0),
      direction: movement.direction,
    };

    if (
      parseInt(movement?.angle) + 5 <= parseInt(payload?.angle) ||
      parseInt(movement?.angle) - 5 >= parseInt(payload?.angle)
    ) {
      console.log("out of range");
    }
    setMovement(payload);
    console.log({
      prevAngle: parseInt(movement?.angle),
      newAngle: parseInt(payload.angle),
    });
  };

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  return (
    <div className="relative">
      <div className="relative h-[40vh]">
        <div className="flex p-3 w-full justify-between items-center space-x-6">
          <img src="/jibebe_logo.PNG" className="h-[48px]" />
          <Input
            variant="filled"
            placeholder="Destination"
            size={"lg"}
            className="w-4/5"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            rightSection={
              <Button.Group>
                <Button
                  onClick={calculateRoute}
                  w={36}
                  h={36}
                  p={0}
                  color="orange"
                >
                  <IconLocation size={16} />
                </Button>
                <Button
                  onClick={() => setDestination("")}
                  variant="default"
                  w={36}
                  h={36}
                  p={0}
                >
                  <IconX size={16} color="gray" />
                </Button>
              </Button.Group>
            }
          />
        </div>
        <GoogleMap
          options={mapOptions}
          zoom={17}
          center={mapCenter}
          mapTypeId={google.maps.MapTypeId.ROADMAP}
          mapContainerStyle={{ width, height: height / 2 }}
          onLoad={(map) => setMap(map)}
        >
          <MarkerF
            position={mapCenter}
            onLoad={() => console.log("Marker Loaded")}
          />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
        <Button
          onClick={() => map.panTo(mapCenter)}
          color="orange"
          variant={"light"}
          w={44}
          h={44}
          p={0}
          style={{ position: "absolute", zIndex: 99, bottom: 24, right: 24 }}
        >
          <IconFocus2 />
        </Button>
      </div>

      <div className="absolute top-[38vh] left-0" style={{ zIndex: 99 }}>
        <Button
          color="green"
          w={48}
          h={48}
          p={0}
          onClick={() => setInfo((info) => !info)}
        >
          <IconChartInfographic />
        </Button>
        <div
          className={
            info
              ? "bg-white p-3 pt-8 mt-[-12px] rounded-md"
              : "bg-white p-3 pt-8 mt-[-12px] rounded-md hidden"
          }
        >
          <Divider label="About tractor" />
          <br />
          <div className="w-[60vw] space-y-3">
            <p className="items-baseline flex space-x-3 font-bold">
              Tractor is
              {tractorState == "OFF" ? (
                <Badge color="red">OFF</Badge>
              ) : (
                <Badge color="green">ON</Badge>
              )}
            </p>
            <div className="flex justify-between">
              <div className="flex space-x-3">
                <IconBatteryCharging color="gray" size={24} />
                <Text>Battery level</Text>
              </div>
              <Text c="green" fw={700} fz={"lg"}>
                70%
              </Text>
            </div>
            <div className="flex justify-between">
              <div className="flex space-x-3">
                <IconClock color="gray" size={20} />
                <Text>Est. time left</Text>
              </div>
              <Text c="orange" fw={700} fz={"lg"}>
                2h 39m
              </Text>
            </div>
            <div className="flex justify-between">
              <div className="flex space-x-3">
                <IconTemperature color="gray" size={20} />
                <Text>Temperature</Text>
              </div>
              <Text c="red" fw={700} fz={"lg"}>
                50 °C
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute top-[42vh] right-3 w-[90px] h-[90px]"
        style={{ zIndex: 99 }}
      >
        <CircularProgressbar
          value={23}
          maxValue={90}
          text={`${23} km/h`}
          styles={buildStyles({
            rotation: 1,

            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
            strokeLinecap: "round",

            // Text size
            textSize: "16px",

            // How long animation takes to go from one percentage to another, in seconds
            pathTransitionDuration: 0.1,

            // Can specify path transition in more detail, or remove it entirely
            // pathTransition: 'none',

            // Colors
            pathColor: `#ffa800`,
            textColor: "white",
            trailColor: "#d6d6d6",
            backgroundColor: "#3e98c7",
          })}
        />
      </div>

      <div className="relative min-h-[60vh] ">
        <Camera ref={camera} />

        <div className="absolute bottom-10 left-[50%] translate-x-[-50%] flex items-baseline space-x-12">
          <Button
            uppercase
            w={64}
            h={64}
            p={0}
            onClick={startMotor}
            style={{ borderRadius: "50%", background: "green" }}
          >
            Start
          </Button>
          <Joystick
            size={100}
            sticky={false}
            baseColor="#021f36"
            stickColor="#ffa800"
            move={(val) => handleMove(val)}
            stop={(val) => handleStop(val)}
          ></Joystick>
          <Button
            uppercase
            w={64}
            h={64}
            p={0}
            onClick={stopMotor}
            style={{ borderRadius: "50%", background: "red" }}
          >
            stop
          </Button>
        </div>
      </div>
    </div>
  );
}
