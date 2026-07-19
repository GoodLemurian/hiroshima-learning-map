import maplibregl from 'maplibre-gl'

export const FIRE_STATION_JURISDICTION_SOURCE_ID = 'hiroshima-fire-station-jurisdictions-source'
export const FIRE_STATION_JURISDICTION_FILL_LAYER_ID = 'hiroshima-fire-station-jurisdictions-fill'
export const FIRE_STATION_JURISDICTION_OUTLINE_LAYER_ID = 'hiroshima-fire-station-jurisdictions-outline'

const LAYER_IDS = [
  FIRE_STATION_JURISDICTION_FILL_LAYER_ID,
  FIRE_STATION_JURISDICTION_OUTLINE_LAYER_ID,
]

export function addFireStationJurisdictionLayers(map, data) {
  if (!map.getSource(FIRE_STATION_JURISDICTION_SOURCE_ID)) {
    map.addSource(FIRE_STATION_JURISDICTION_SOURCE_ID, { type: 'geojson', data, generateId: true })
  }

  if (!map.getLayer(FIRE_STATION_JURISDICTION_FILL_LAYER_ID)) {
    map.addLayer({
      id: FIRE_STATION_JURISDICTION_FILL_LAYER_ID,
      type: 'fill',
      source: FIRE_STATION_JURISDICTION_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: {
        'fill-color': '#d9382c',
        'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.3, 0.14],
      },
    })
  }
  if (!map.getLayer(FIRE_STATION_JURISDICTION_OUTLINE_LAYER_ID)) {
    map.addLayer({
      id: FIRE_STATION_JURISDICTION_OUTLINE_LAYER_ID,
      type: 'line',
      source: FIRE_STATION_JURISDICTION_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: { 'line-color': '#a9221a', 'line-width': 1.5, 'line-opacity': 0.8 },
    })
  }
}

export function setFireStationJurisdictionVisibility(map, visible) {
  LAYER_IDS.forEach((id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
  })
}

export function bindFireStationJurisdictionInteractions({ map, isEnabled = () => true }) {
  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: true, offset: 12 })
  let hoveredFeatureId = null

  const clearHover = () => {
    if (hoveredFeatureId === null) return
    map.setFeatureState(
      { source: FIRE_STATION_JURISDICTION_SOURCE_ID, id: hoveredFeatureId },
      { hover: false },
    )
    hoveredFeatureId = null
  }

  map.on('mousemove', FIRE_STATION_JURISDICTION_FILL_LAYER_ID, (event) => {
    if (!isEnabled()) return
    const feature = event.features?.[0]
    if (feature?.id === undefined) return
    if (hoveredFeatureId !== feature.id) {
      clearHover()
      hoveredFeatureId = feature.id
      map.setFeatureState(
        { source: FIRE_STATION_JURISDICTION_SOURCE_ID, id: hoveredFeatureId },
        { hover: true },
      )
    }
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', FIRE_STATION_JURISDICTION_FILL_LAYER_ID, () => {
    clearHover()
    map.getCanvas().style.cursor = ''
  })

  map.on('click', FIRE_STATION_JURISDICTION_FILL_LAYER_ID, (event) => {
    if (!isEnabled()) return
    const name = event.features?.[0]?.properties?.P17_005
    if (!name) return
    const content = document.createElement('div')
    const label = document.createElement('strong')
    label.textContent = 'P17_005'
    const value = document.createElement('div')
    value.textContent = String(name)
    content.append(label, value)
    popup.setLngLat(event.lngLat).setDOMContent(content).addTo(map)
  })

  return {
    remove: () => {
      clearHover()
      popup.remove()
    },
  }
}
