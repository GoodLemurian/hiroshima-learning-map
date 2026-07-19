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
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          '#d32f2f',
          '#a9221a',
        ],
        'line-width': [
          'case',
          ['any',
            ['boolean', ['feature-state', 'selected'], false],
            ['boolean', ['feature-state', 'hover'], false],
          ],
          5,
          1.5,
        ],
        'line-opacity': 0.8,
      },
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
  let selectedFeatureId = null

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
    const feature = event.features?.[0]
    const name = feature?.properties?.P17_005
    if (!name) return
    if (feature.id !== undefined) {
      if (selectedFeatureId !== null) {
        map.setFeatureState(
          { source: FIRE_STATION_JURISDICTION_SOURCE_ID, id: selectedFeatureId },
          { selected: false },
        )
      }
      selectedFeatureId = feature.id
      map.setFeatureState(
        { source: FIRE_STATION_JURISDICTION_SOURCE_ID, id: selectedFeatureId },
        { selected: true },
      )
    }
    const content = document.createElement('div')
    content.className = 'feature-properties'
    const label = document.createElement('strong')
    label.textContent = '消防署管轄の属性'
    const properties = document.createElement('dl')
    const term = document.createElement('dt')
    term.textContent = 'P17_005'
    const value = document.createElement('dd')
    value.textContent = String(name)
    properties.append(term, value)
    content.append(label, properties)
    popup.setLngLat(event.lngLat).setDOMContent(content).addTo(map)
  })

  return {
    remove: () => {
      clearHover()
      if (selectedFeatureId !== null) {
        map.setFeatureState(
          { source: FIRE_STATION_JURISDICTION_SOURCE_ID, id: selectedFeatureId },
          { selected: false },
        )
        selectedFeatureId = null
      }
      popup.remove()
    },
  }
}
