import { area, length } from '@turf/turf'
import { formatArea, formatLength } from './formatMeasurement.js'

const NOT_MEASURABLE_TEXT = 'この図形はまだはかれません'
const POINT_TEXT = 'この場所には長さや広さはありません'

function baseResult(geometryType = null, displayText = NOT_MEASURABLE_TEXT) {
  return {
    geometryType,
    measurementType: null,
    rawValue: null,
    rawUnit: null,
    displayValue: null,
    displayUnit: null,
    displayText,
  }
}

function isPosition(position) {
  return (
    Array.isArray(position) &&
    position.length >= 2 &&
    Number.isFinite(position[0]) &&
    Number.isFinite(position[1])
  )
}

function isLineCoordinates(coordinates) {
  return (
    Array.isArray(coordinates) &&
    coordinates.length >= 2 &&
    coordinates.every(isPosition)
  )
}

function positionsMatch(first, last) {
  return first[0] === last[0] && first[1] === last[1]
}

function isLinearRing(ring) {
  return (
    Array.isArray(ring) &&
    ring.length >= 4 &&
    ring.every(isPosition) &&
    positionsMatch(ring[0], ring[ring.length - 1])
  )
}

function isPolygonCoordinates(coordinates) {
  return (
    Array.isArray(coordinates) &&
    coordinates.length > 0 &&
    coordinates.every(isLinearRing)
  )
}

export function measureFeature(feature) {
  const geometry = feature?.geometry
  const geometryType = geometry?.type ?? null

  if (!geometry || !Array.isArray(geometry.coordinates)) {
    return baseResult(geometryType)
  }

  if (geometryType === 'Point') {
    return isPosition(geometry.coordinates)
      ? baseResult(geometryType, POINT_TEXT)
      : baseResult(geometryType)
  }

  try {
    if (geometryType === 'LineString') {
      if (!isLineCoordinates(geometry.coordinates)) return baseResult(geometryType)
      const rawValue = length(feature, { units: 'kilometers' })
      const formatted = formatLength(rawValue)
      if (!formatted) return baseResult(geometryType)
      return {
        geometryType,
        measurementType: 'length',
        rawValue,
        rawUnit: 'kilometers',
        ...formatted,
      }
    }

    if (geometryType === 'Polygon') {
      if (!isPolygonCoordinates(geometry.coordinates)) return baseResult(geometryType)
      const rawValue = area(feature)
      const formatted = formatArea(rawValue)
      if (!formatted) return baseResult(geometryType)
      return {
        geometryType,
        measurementType: 'area',
        rawValue,
        rawUnit: 'squareMeters',
        ...formatted,
      }
    }

    if (geometryType === 'MultiPolygon') {
      const valid =
        geometry.coordinates.length > 0 &&
        geometry.coordinates.every(isPolygonCoordinates)
      if (!valid) return baseResult(geometryType)
      const rawValue = area(feature)
      const formatted = formatArea(rawValue)
      if (!formatted) return baseResult(geometryType)
      return {
        geometryType,
        measurementType: 'area',
        rawValue,
        rawUnit: 'squareMeters',
        ...formatted,
      }
    }

    return baseResult(geometryType)
  } catch (error) {
    console.error('図形を計測できませんでした。', error)
    return baseResult(geometryType)
  }
}
