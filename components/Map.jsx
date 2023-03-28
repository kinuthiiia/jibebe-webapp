import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./DynamicMap"), {
  ssr: false,
});

const Map = ({ mapCenter }) => {
  return (
    <div style={{ aspectRatio: 1 }}>
      <DynamicMap mapCenter={mapCenter} />
    </div>
  );
};

export default Map;
