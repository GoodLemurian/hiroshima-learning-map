export const POLICE_STATION_SOURCE_ID = 'hiroshima-police-stations-source'
export const POLICE_STATION_LAYER_ID = 'hiroshima-police-stations'
export const POLICE_JURISDICTION_SOURCE_ID = 'hiroshima-police-jurisdictions-source'
export const POLICE_JURISDICTION_FILL_LAYER_ID = 'hiroshima-police-jurisdictions-fill'
export const POLICE_JURISDICTION_OUTLINE_LAYER_ID = 'hiroshima-police-jurisdictions-outline'
export const POLICE_JURISDICTION_HIGHLIGHT_LAYER_ID = 'hiroshima-police-jurisdictions-highlight'

const LAYER_IDS = [
  POLICE_JURISDICTION_FILL_LAYER_ID,
  POLICE_JURISDICTION_OUTLINE_LAYER_ID,
  POLICE_JURISDICTION_HIGHLIGHT_LAYER_ID,
  POLICE_STATION_LAYER_ID,
]

export function addPoliceStationLayers(map, stations, jurisdictions) {
  if (!map.getSource(POLICE_JURISDICTION_SOURCE_ID)) {
    map.addSource(POLICE_JURISDICTION_SOURCE_ID, {
      type: 'geojson',
      data: jurisdictions,
      generateId: true,
    })
  }
  if (!map.getLayer(POLICE_JURISDICTION_FILL_LAYER_ID)) {
    map.addLayer({
      id: POLICE_JURISDICTION_FILL_LAYER_ID,
      type: 'fill',
      source: POLICE_JURISDICTION_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.13 },
    })
  }
  if (!map.getLayer(POLICE_JURISDICTION_OUTLINE_LAYER_ID)) {
    map.addLayer({
      id: POLICE_JURISDICTION_OUTLINE_LAYER_ID,
      type: 'line',
      source: POLICE_JURISDICTION_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: { 'line-color': '#1d4ed8', 'line-width': 1.5, 'line-opacity': 0.85 },
    })
  }
  if (!map.getLayer(POLICE_JURISDICTION_HIGHLIGHT_LAYER_ID)) {
    map.addLayer({
      id: POLICE_JURISDICTION_HIGHLIGHT_LAYER_ID,
      type: 'line',
      source: POLICE_JURISDICTION_SOURCE_ID,
      layout: { visibility: 'none' },
      filter: ['==', ['get', 'P18_005'], ''],
      paint: { 'line-color': '#1d4ed8', 'line-width': 5, 'line-opacity': 1 },
    })
  }

  if (!map.getSource(POLICE_STATION_SOURCE_ID)) {
    map.addSource(POLICE_STATION_SOURCE_ID, { type: 'geojson', data: stations })
  }
  if (!map.getLayer(POLICE_STATION_LAYER_ID)) {
    map.addLayer({
      id: POLICE_STATION_LAYER_ID,
      type: 'circle',
      source: POLICE_STATION_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': 6,
        'circle-color': '#1e3a8a',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
      },
    })
  }
}

export function setPoliceStationVisibility(map, visible) {
  LAYER_IDS.forEach((id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
  })
}
