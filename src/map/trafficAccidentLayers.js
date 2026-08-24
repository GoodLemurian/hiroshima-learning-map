export const TRAFFIC_ACCIDENT_SOURCE_ID = 'hiroshima-traffic-accidents-source'
export const TRAFFIC_ACCIDENT_LAYER_ID = 'hiroshima-traffic-accidents'

export function addTrafficAccidentLayers(map, data) {
  if (!map.getSource(TRAFFIC_ACCIDENT_SOURCE_ID)) {
    map.addSource(TRAFFIC_ACCIDENT_SOURCE_ID, { type: 'geojson', data })
  }

  if (!map.getLayer(TRAFFIC_ACCIDENT_LAYER_ID)) {
    map.addLayer({
      id: TRAFFIC_ACCIDENT_LAYER_ID,
      type: 'circle',
      source: TRAFFIC_ACCIDENT_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': 5,
        'circle-color': '#f59e0b',
        'circle-opacity': 0.85,
        'circle-stroke-color': '#7c2d12',
        'circle-stroke-width': 1,
      },
    })
  }
}

export function setTrafficAccidentVisibility(map, visible) {
  if (map.getLayer(TRAFFIC_ACCIDENT_LAYER_ID)) {
    map.setLayoutProperty(TRAFFIC_ACCIDENT_LAYER_ID, 'visibility', visible ? 'visible' : 'none')
  }
}
