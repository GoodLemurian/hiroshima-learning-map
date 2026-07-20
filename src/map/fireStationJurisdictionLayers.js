export const FIRE_STATION_JURISDICTION_SOURCE_ID = 'hiroshima-fire-station-jurisdictions-source'
export const FIRE_STATION_JURISDICTION_FILL_LAYER_ID = 'hiroshima-fire-station-jurisdictions-fill'
export const FIRE_STATION_JURISDICTION_OUTLINE_LAYER_ID = 'hiroshima-fire-station-jurisdictions-outline'
export const FIRE_STATION_JURISDICTION_HIGHLIGHT_LAYER_ID = 'hiroshima-fire-station-jurisdictions-highlight'

const LAYER_IDS = [
  FIRE_STATION_JURISDICTION_FILL_LAYER_ID,
  FIRE_STATION_JURISDICTION_OUTLINE_LAYER_ID,
  FIRE_STATION_JURISDICTION_HIGHLIGHT_LAYER_ID,
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
        'fill-opacity': 0.14,
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
  if (!map.getLayer(FIRE_STATION_JURISDICTION_HIGHLIGHT_LAYER_ID)) {
    map.addLayer({
      id: FIRE_STATION_JURISDICTION_HIGHLIGHT_LAYER_ID,
      type: 'line',
      source: FIRE_STATION_JURISDICTION_SOURCE_ID,
      layout: { visibility: 'none' },
      filter: ['==', ['get', 'P17_005'], ''],
      paint: { 'line-color': '#a9221a', 'line-width': 5, 'line-opacity': 1 },
    })
  }
}

export function setFireStationJurisdictionVisibility(map, visible) {
  LAYER_IDS.forEach((id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
  })
}
