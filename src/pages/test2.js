import { polygon, lineString, lineIntersect } from "@turf/turf";

const handleGenerateTracks = (polygonCoordinates) => {
  const trackWidth = 0.0075; // 1.5 meters in degrees

  // Create a turf polygon feature from the input polygon coordinates
  const turfPolygon = polygon([polygonCoordinates]);

  // Calculate the bounding box of the polygon
  const bbox = turfPolygon.bbox;
  const [minX, minY, maxX, maxY] = bbox;

  const tracks = [];

  for (let i = minX; i <= maxX; i += trackWidth) {
    for (let j = minY; j <= maxY; j += trackWidth) {
      // Create a turf lineString feature for the track
      const turfLineString = lineString([
        [i, j],
        [i + trackWidth, j],
      ]);

      // Check if the track intersects with the polygon
      if (lineIntersect(turfLineString, turfPolygon) === null) {
        // Convert the turf lineString to an array of coordinates
        const trackCoordinates = turfLineString.geometry.coordinates;

        // Add the track coordinates to the tracks array
        tracks.push(trackCoordinates);
      }
    }
  }

  return tracks;
};
