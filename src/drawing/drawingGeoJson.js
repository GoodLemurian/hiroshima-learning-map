const SUPPORTED_GEOMETRY_MODES = {
  Point: 'point',
  LineString: 'linestring',
  Polygon: 'polygon',
}

export function parseDrawingGeoJson(text) {
  let geojson
  try {
    geojson = JSON.parse(text)
  } catch {
    throw new Error('INVALID_JSON')
  }

  if (geojson?.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    throw new Error('INVALID_FEATURE_COLLECTION')
  }

  return geojson
}

export function prepareDrawingFeatures(featureCollection, createId) {
  const features = []
  let skippedCount = 0

  featureCollection.features.forEach((feature) => {
    const mode = SUPPORTED_GEOMETRY_MODES[feature?.geometry?.type]
    if (feature?.type !== 'Feature' || !mode || !Array.isArray(feature.geometry.coordinates)) {
      skippedCount += 1
      return
    }

    features.push({
      type: 'Feature',
      id: createId(),
      geometry: structuredClone(feature.geometry),
      properties: {
        ...(feature.properties &&
        typeof feature.properties === 'object' &&
        !Array.isArray(feature.properties)
          ? structuredClone(feature.properties)
          : {}),
        mode,
      },
    })
  })

  return { features, skippedCount }
}

export function downloadDrawingGeoJson(featureCollection) {
  const contents = JSON.stringify(featureCollection, null, 2)
  const blob = new Blob([contents], { type: 'application/geo+json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `hiroshima-map-drawings-${date}.geojson`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
