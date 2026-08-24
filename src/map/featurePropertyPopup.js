import maplibregl from 'maplibre-gl'

function createPopupContent(title, properties) {
  const container = document.createElement('div')
  container.className = 'feature-properties'
  const list = document.createElement('dl')
  properties.forEach(({ label, value }) => {
    const term = document.createElement('dt')
    term.textContent = label
    const description = document.createElement('dd')
    description.textContent = value
    list.append(term, description)
  })
  if (title) {
    const heading = document.createElement('strong')
    heading.textContent = title
    container.append(heading)
  }
  container.append(list)
  return container
}

export function bindFeaturePropertyPopup({
  map,
  layerId,
  sourceId,
  describeFeature,
  isEnabled = () => true,
}) {
  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: true, offset: 12 })
  let hoveredFeatureId = null
  let selectedFeatureId = null

  const clearHover = () => {
    if (!sourceId || hoveredFeatureId === null) return
    map.setFeatureState({ source: sourceId, id: hoveredFeatureId }, { hover: false })
    hoveredFeatureId = null
  }

  map.on('mousemove', layerId, (event) => {
    if (!isEnabled()) return
    const feature = event.features?.[0]
    map.getCanvas().style.cursor = 'pointer'

    if (sourceId && feature?.id !== undefined && hoveredFeatureId !== feature.id) {
      clearHover()
      hoveredFeatureId = feature.id
      map.setFeatureState({ source: sourceId, id: hoveredFeatureId }, { hover: true })
    }
  })
  let requestId = 0
  map.on('click', layerId, async (event) => {
    if (!isEnabled()) return
    const currentRequestId = ++requestId
    const feature = event.features?.[0]
    const description = await describeFeature(feature)
    if (currentRequestId !== requestId || !isEnabled()) return
    if (!description) return
    if (sourceId && feature?.id !== undefined) {
      if (selectedFeatureId !== null) {
        map.setFeatureState({ source: sourceId, id: selectedFeatureId }, { selected: false })
      }
      selectedFeatureId = feature.id
      map.setFeatureState({ source: sourceId, id: selectedFeatureId }, { selected: true })
    }
    popup
      .setLngLat(event.lngLat)
      .setDOMContent(createPopupContent(description.title, description.properties))
      .addTo(map)
  })
  map.on('mouseleave', layerId, () => {
    if (isEnabled()) map.getCanvas().style.cursor = ''
    clearHover()
  })

  return {
    remove: () => {
      requestId += 1
      clearHover()
      if (sourceId && selectedFeatureId !== null) {
        map.setFeatureState({ source: sourceId, id: selectedFeatureId }, { selected: false })
        selectedFeatureId = null
      }
      popup.remove()
    },
  }
}
