import maplibregl from 'maplibre-gl'

export const WARD_SOURCE_ID = 'hiroshima-wards-source'
export const WARD_FILL_LAYER_ID = 'hiroshima-wards-fill'
export const WARD_OUTLINE_LAYER_ID = 'hiroshima-wards-outline'
export const WARD_HIGHLIGHT_LAYER_ID = 'hiroshima-wards-highlight'

const LAYER_IDS = [WARD_FILL_LAYER_ID, WARD_OUTLINE_LAYER_ID, WARD_HIGHLIGHT_LAYER_ID]
const emptyHighlight = () => ['==', ['get', 'N03_007'], '']
const wardFilter = (wardCode) => ['==', ['get', 'N03_007'], wardCode || '']

export function addAdministrativeAreaLayers(map, data) {
  if (!map.getSource(WARD_SOURCE_ID)) {
    map.addSource(WARD_SOURCE_ID, { type: 'geojson', data })
  }

  if (!map.getLayer(WARD_FILL_LAYER_ID)) {
    map.addLayer({
      id: WARD_FILL_LAYER_ID,
      type: 'fill',
      source: WARD_SOURCE_ID,
      paint: { 'fill-color': '#2c8f72', 'fill-opacity': 0.25 },
    })
  }
  if (!map.getLayer(WARD_OUTLINE_LAYER_ID)) {
    map.addLayer({
      id: WARD_OUTLINE_LAYER_ID,
      type: 'line',
      source: WARD_SOURCE_ID,
      paint: { 'line-color': '#145846', 'line-width': 2, 'line-opacity': 0.9 },
    })
  }
  if (!map.getLayer(WARD_HIGHLIGHT_LAYER_ID)) {
    map.addLayer({
      id: WARD_HIGHLIGHT_LAYER_ID,
      type: 'line',
      source: WARD_SOURCE_ID,
      filter: emptyHighlight(),
      paint: { 'line-color': '#c74600', 'line-width': 5, 'line-opacity': 1 },
    })
  }
}

export function fitAdministrativeAreas(map, featureCollection) {
  const bounds = new maplibregl.LngLatBounds()
  const visit = (coordinates) => {
    if (typeof coordinates?.[0] === 'number') bounds.extend(coordinates)
    else coordinates?.forEach(visit)
  }
  featureCollection.features.forEach((feature) => visit(feature.geometry.coordinates))
  if (!bounds.isEmpty()) {
    const { clientWidth, clientHeight } = map.getContainer()
    const narrowScreen = clientWidth < 700
    const verticalPadding = Math.max(24, Math.min(70, clientHeight / 5))
    map.fitBounds(bounds, {
      padding: narrowScreen
        ? { top: verticalPadding, right: 24, bottom: verticalPadding, left: 24 }
        : { top: verticalPadding, right: 240, bottom: verticalPadding, left: 190 },
      maxZoom: 11.5,
      duration: 800,
    })
  }
}

export function bindAdministrativeAreaInteractions({ map, isDrawingActive, onSelect }) {
  let selectedWard = null
  let hoveredWardCode = null
  let visible = true

  const updateHighlight = () => {
    if (!map.getLayer(WARD_HIGHLIGHT_LAYER_ID)) return
    map.setFilter(WARD_HIGHLIGHT_LAYER_ID, wardFilter(hoveredWardCode || selectedWard?.wardCode))
  }
  const readWard = (feature) => {
    const wardName = feature?.properties?.N03_005
    const wardCode = feature?.properties?.N03_007
    return wardName && wardCode ? { wardName, wardCode } : null
  }

  map.on('mousemove', WARD_FILL_LAYER_ID, (event) => {
    if (!visible || isDrawingActive()) return
    const ward = readWard(event.features?.[0])
    hoveredWardCode = ward?.wardCode || null
    map.getCanvas().style.cursor = ward ? 'pointer' : ''
    updateHighlight()
  })
  map.on('mouseleave', WARD_FILL_LAYER_ID, () => {
    hoveredWardCode = null
    map.getCanvas().style.cursor = ''
    updateHighlight()
  })
  map.on('click', WARD_FILL_LAYER_ID, (event) => {
    if (!visible || isDrawingActive()) return
    const ward = readWard(event.features?.[0])
    if (!ward) {
      console.warn('クリックした行政区Featureの属性が不完全です。')
      return
    }
    selectedWard = ward
    updateHighlight()
    onSelect(ward)
  })

  return {
    setVisible(nextVisible) {
      visible = nextVisible
      LAYER_IDS.forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
      })
      if (!visible) {
        hoveredWardCode = null
        map.getCanvas().style.cursor = ''
      }
      updateHighlight()
    },
    clearSelection() {
      selectedWard = null
      hoveredWardCode = null
      updateHighlight()
      onSelect(null)
    },
    getSelection: () => selectedWard,
  }
}
