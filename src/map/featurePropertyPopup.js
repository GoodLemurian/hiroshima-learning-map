import maplibregl from 'maplibre-gl'

function createPopupContent(title, properties) {
  const container = document.createElement('div')
  container.className = 'feature-properties'
  const heading = document.createElement('strong')
  heading.textContent = title
  const list = document.createElement('dl')
  properties.forEach(({ label, value }) => {
    const term = document.createElement('dt')
    term.textContent = label
    const description = document.createElement('dd')
    description.textContent = value
    list.append(term, description)
  })
  container.append(heading, list)
  return container
}

export function bindFeaturePropertyPopup({ map, layerId, describeFeature, isEnabled = () => true }) {
  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })

  map.on('mousemove', layerId, (event) => {
    if (!isEnabled()) return
    const description = describeFeature(event.features?.[0])
    if (!description) return
    map.getCanvas().style.cursor = 'pointer'
    popup
      .setLngLat(event.lngLat)
      .setDOMContent(createPopupContent(description.title, description.properties))
      .addTo(map)
  })
  map.on('mouseleave', layerId, () => {
    map.getCanvas().style.cursor = ''
    popup.remove()
  })

  return { remove: () => popup.remove() }
}
