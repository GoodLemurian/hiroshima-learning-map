export const DEMARCATED_FISHERY_RIGHT_SOURCE_ID = 'msil-demarcated-fishery-rights-source'
export const DEMARCATED_FISHERY_RIGHT_FILL_LAYER_ID = 'msil-demarcated-fishery-rights-fill'
export const DEMARCATED_FISHERY_RIGHT_OUTLINE_LAYER_ID = 'msil-demarcated-fishery-rights-outline'

const LAYER_IDS = [
  DEMARCATED_FISHERY_RIGHT_FILL_LAYER_ID,
  DEMARCATED_FISHERY_RIGHT_OUTLINE_LAYER_ID,
]

export function addDemarcatedFisheryRightLayers(map, data) {
  if (!map.getSource(DEMARCATED_FISHERY_RIGHT_SOURCE_ID)) {
    map.addSource(DEMARCATED_FISHERY_RIGHT_SOURCE_ID, {
      type: 'geojson',
      data,
      attribution: '<a href="https://www.msil.go.jp/">海しる（海上保安庁）</a>',
    })
  }

  if (!map.getLayer(DEMARCATED_FISHERY_RIGHT_FILL_LAYER_ID)) {
    map.addLayer({
      id: DEMARCATED_FISHERY_RIGHT_FILL_LAYER_ID,
      type: 'fill',
      source: DEMARCATED_FISHERY_RIGHT_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: { 'fill-color': '#00a7a0', 'fill-opacity': 0.3 },
    })
  }
  if (!map.getLayer(DEMARCATED_FISHERY_RIGHT_OUTLINE_LAYER_ID)) {
    map.addLayer({
      id: DEMARCATED_FISHERY_RIGHT_OUTLINE_LAYER_ID,
      type: 'line',
      source: DEMARCATED_FISHERY_RIGHT_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: { 'line-color': '#006d68', 'line-width': 2, 'line-opacity': 0.95 },
    })
  }
}

export function setDemarcatedFisheryRightVisibility(map, visible) {
  LAYER_IDS.forEach((id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
  })
}
