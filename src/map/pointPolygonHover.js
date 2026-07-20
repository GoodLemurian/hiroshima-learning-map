const emptyFilter = (property) => ['==', ['get', property], '']

export function bindPointPolygonHover({
  map,
  pointLayerId,
  polygonHighlightLayerId,
  polygonProperty,
  polygonFeatures,
  getPointName,
  normalizeName = (name) => String(name || '').trim(),
  isEnabled = () => true,
}) {
  const polygonNames = polygonFeatures
    .map((feature) => feature.properties?.[polygonProperty])
    .filter(Boolean)
    .map((name) => ({ name, normalizedName: normalizeName(name) }))
    .sort((left, right) => right.normalizedName.length - left.normalizedName.length)

  const clearHighlight = () => {
    if (map.getLayer(polygonHighlightLayerId)) {
      map.setFilter(polygonHighlightLayerId, emptyFilter(polygonProperty))
    }
  }

  map.on('mousemove', pointLayerId, (event) => {
    if (!isEnabled()) return
    const pointName = getPointName(event.features?.[0])
    const normalizedPointName = normalizeName(pointName)
    const polygonName = polygonNames.find(({ normalizedName }) => (
      normalizedPointName === normalizedName || normalizedPointName.startsWith(normalizedName)
    ))?.name
    map.setFilter(
      polygonHighlightLayerId,
      polygonName ? ['==', ['get', polygonProperty], polygonName] : emptyFilter(polygonProperty),
    )
  })
  map.on('mouseleave', pointLayerId, clearHighlight)

  return { remove: clearHighlight }
}
