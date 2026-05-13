/**
 * Geo utility helpers for MongoDB geospatial operations.
 */

/**
 * Creates a GeoJSON Point object from longitude and latitude.
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {{ type: 'Point', coordinates: [number, number] }}
 */
const createPoint = (lng, lat) => ({
  type: 'Point',
  coordinates: [parseFloat(lng), parseFloat(lat)],
});

/**
 * Converts km to meters (MongoDB uses meters for $maxDistance).
 * @param {number} km
 * @returns {number}
 */
const kmToMeters = (km) => parseFloat(km) * 1000;

/**
 * Builds a $geoNear aggregation stage.
 * @param {number} lng
 * @param {number} lat
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {object} MongoDB $geoNear stage
 */
const buildGeoNearStage = (lng, lat, radiusKm = 50) => ({
  $geoNear: {
    near: createPoint(lng, lat),
    distanceField: 'distance',
    maxDistance: kmToMeters(radiusKm),
    spherical: true,
  },
});

module.exports = {
  createPoint,
  kmToMeters,
  buildGeoNearStage,
};
