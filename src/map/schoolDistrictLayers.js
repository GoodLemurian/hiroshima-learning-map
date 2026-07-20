export const SCHOOL_DISTRICT_SOURCE_ID = 'hiroshima-school-districts-source'
export const SCHOOL_DISTRICT_FILL_LAYER_ID = 'hiroshima-school-districts-fill'
export const SCHOOL_DISTRICT_OUTLINE_LAYER_ID = 'hiroshima-school-districts-outline'
export const SCHOOL_DISTRICT_HIGHLIGHT_LAYER_ID = 'hiroshima-school-districts-highlight'
export const SCHOOL_DISTRICT_DEFAULT_FILL_COLOR = '#f2a900'

const LAYER_IDS = [
  SCHOOL_DISTRICT_FILL_LAYER_ID,
  SCHOOL_DISTRICT_OUTLINE_LAYER_ID,
  SCHOOL_DISTRICT_HIGHLIGHT_LAYER_ID,
]

export function addSchoolDistrictLayers(map, data) {
  if (!map.getSource(SCHOOL_DISTRICT_SOURCE_ID)) {
    map.addSource(SCHOOL_DISTRICT_SOURCE_ID, { type: 'geojson', data, generateId: true })
  }

  if (!map.getLayer(SCHOOL_DISTRICT_FILL_LAYER_ID)) {
    map.addLayer({
      id: SCHOOL_DISTRICT_FILL_LAYER_ID,
      type: 'fill',
      source: SCHOOL_DISTRICT_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: { 'fill-color': SCHOOL_DISTRICT_DEFAULT_FILL_COLOR, 'fill-opacity': 0.2 },
    })
  }
  if (!map.getLayer(SCHOOL_DISTRICT_OUTLINE_LAYER_ID)) {
    map.addLayer({
      id: SCHOOL_DISTRICT_OUTLINE_LAYER_ID,
      type: 'line',
      source: SCHOOL_DISTRICT_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: { 'line-color': '#d97706', 'line-width': 2, 'line-opacity': 0.95 },
    })
  }
  if (!map.getLayer(SCHOOL_DISTRICT_HIGHLIGHT_LAYER_ID)) {
    map.addLayer({
      id: SCHOOL_DISTRICT_HIGHLIGHT_LAYER_ID,
      type: 'line',
      source: SCHOOL_DISTRICT_SOURCE_ID,
      layout: { visibility: 'none' },
      filter: ['==', ['get', '名称'], ''],
      paint: { 'line-color': '#d97706', 'line-width': 5, 'line-opacity': 1 },
    })
  }
}

export function setSchoolDistrictColors(map, expression) {
  if (map.getLayer(SCHOOL_DISTRICT_FILL_LAYER_ID)) {
    map.setPaintProperty(SCHOOL_DISTRICT_FILL_LAYER_ID, 'fill-color', expression)
  }
}

export function setSchoolDistrictVisibility(map, visible) {
  LAYER_IDS.forEach((id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
  })
}
