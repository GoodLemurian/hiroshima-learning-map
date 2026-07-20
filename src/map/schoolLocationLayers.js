export const SCHOOL_LOCATION_SOURCE_ID = 'hiroshima-school-locations-source'
export const SCHOOL_LOCATION_LAYER_ID = 'hiroshima-school-locations'

export function addSchoolLocationLayers(map, data) {
  if (!map.getSource(SCHOOL_LOCATION_SOURCE_ID)) {
    map.addSource(SCHOOL_LOCATION_SOURCE_ID, { type: 'geojson', data })
  }

  if (!map.getLayer(SCHOOL_LOCATION_LAYER_ID)) {
    map.addLayer({
      id: SCHOOL_LOCATION_LAYER_ID,
      type: 'circle',
      source: SCHOOL_LOCATION_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': 6,
        'circle-color': [
          'match',
          ['get', '分類'],
          '特別支援学校', '#7c3aed',
          '国立小学校', '#0284c7',
          '#ea580c',
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
      },
    })
  }
}

export function setSchoolLocationVisibility(map, visible) {
  if (map.getLayer(SCHOOL_LOCATION_LAYER_ID)) {
    map.setLayoutProperty(SCHOOL_LOCATION_LAYER_ID, 'visibility', visible ? 'visible' : 'none')
  }
}
