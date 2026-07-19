export const FIRE_STATION_SOURCE_ID = 'hiroshima-fire-stations-source'
export const FIRE_STATION_LAYER_ID = 'hiroshima-fire-stations'

export function addFireStationLayers(map, data) {
  if (!map.getSource(FIRE_STATION_SOURCE_ID)) {
    map.addSource(FIRE_STATION_SOURCE_ID, { type: 'geojson', data })
  }

  if (!map.getLayer(FIRE_STATION_LAYER_ID)) {
    map.addLayer({
      id: FIRE_STATION_LAYER_ID,
      type: 'circle',
      source: FIRE_STATION_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': 7,
        'circle-color': '#d9382c',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
      },
    })
  }
}

export function setFireStationVisibility(map, visible) {
  if (map.getLayer(FIRE_STATION_LAYER_ID)) {
    map.setLayoutProperty(FIRE_STATION_LAYER_ID, 'visibility', visible ? 'visible' : 'none')
  }
}
