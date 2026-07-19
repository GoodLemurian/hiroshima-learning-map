export const SCHOOL_DISTRICT_SOURCE_ID = 'hiroshima-school-districts-source'
export const SCHOOL_DISTRICT_FILL_LAYER_ID = 'hiroshima-school-districts-fill'
export const SCHOOL_DISTRICT_OUTLINE_LAYER_ID = 'hiroshima-school-districts-outline'

const DATA_URL = `${import.meta.env.BASE_URL}data/opendata_110/D_20240324_224453_7856009C.geojson`
const LAYER_IDS = [SCHOOL_DISTRICT_FILL_LAYER_ID, SCHOOL_DISTRICT_OUTLINE_LAYER_ID]

export function addSchoolDistrictLayers(map) {
  if (!map.getSource(SCHOOL_DISTRICT_SOURCE_ID)) {
    map.addSource(SCHOOL_DISTRICT_SOURCE_ID, { type: 'geojson', data: DATA_URL })
  }

  if (!map.getLayer(SCHOOL_DISTRICT_FILL_LAYER_ID)) {
    map.addLayer({
      id: SCHOOL_DISTRICT_FILL_LAYER_ID,
      type: 'fill',
      source: SCHOOL_DISTRICT_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: { 'fill-color': '#f2a900', 'fill-opacity': 0.2 },
    })
  }
  if (!map.getLayer(SCHOOL_DISTRICT_OUTLINE_LAYER_ID)) {
    map.addLayer({
      id: SCHOOL_DISTRICT_OUTLINE_LAYER_ID,
      type: 'line',
      source: SCHOOL_DISTRICT_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: { 'line-color': '#a34f00', 'line-width': 2, 'line-opacity': 0.95 },
    })
  }
}

export function setSchoolDistrictVisibility(map, visible) {
  LAYER_IDS.forEach((id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
  })
}
