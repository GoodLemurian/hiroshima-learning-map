import { BASE_MAPS, setBaseMap, setElevationColors, setTerrainEnabled } from './map.js'
import { DEFAULT_ELEVATION_COLORS } from './elevation-colors.js'

export function createBaseMapSelector(map) {
  const options = BASE_MAPS.map(
    ({ id, label }, index) => `
      <label class="base-map-option">
        <input
          type="radio"
          name="base-map"
          value="${id}"
          ${index === 0 ? 'checked' : ''}
        />
        <span>${label}</span>
      </label>
    `,
  ).join('')

  const selector = document.querySelector('#base-map-selector')
  selector.innerHTML = options
  selector.addEventListener('change', (event) => {
    if (event.target.matches('input[name="base-map"]')) {
      setBaseMap(map, event.target.value)
    }
  })
}

export function createTerrainToggle(map) {
  const toggle = document.querySelector('#terrain-toggle')
  toggle.addEventListener('change', () => {
    setTerrainEnabled(map, toggle.checked)
  })
}

export function createElevationColorEditor(map) {
  const enabled = document.querySelector('#elevation-colors-toggle')
  const rows = document.querySelector('#elevation-color-rows')
  const opacity = document.querySelector('#elevation-colors-opacity')
  let stops = DEFAULT_ELEVATION_COLORS.map((stop) => ({ ...stop }))

  const render = () => {
    rows.innerHTML = stops.map((stop, index) => `
      <div class="elevation-color-row">
        <label><span class="sr-only">標高</span><input type="number" step="1" value="${stop.elevation}" data-index="${index}" data-field="elevation" /> m以上</label>
        <label><span class="sr-only">色</span><input type="color" value="${stop.color}" data-index="${index}" data-field="color" /></label>
      </div>
    `).join('')
  }
  const update = () => setElevationColors(map, {
    enabled: enabled.checked,
    opacity: Number(opacity.value) / 100,
    stops,
  })

  rows.addEventListener('change', (event) => {
    const index = Number(event.target.dataset.index)
    const field = event.target.dataset.field
    if (!Number.isInteger(index) || !field) return
    stops[index][field] = field === 'elevation' ? Number(event.target.value) : event.target.value
    update()
  })
  enabled.addEventListener('change', update)
  opacity.addEventListener('input', () => setElevationColors(map, {
    enabled: enabled.checked,
    opacity: Number(opacity.value) / 100,
    stops,
    refresh: false,
  }))
  document.querySelector('#elevation-colors-reset').addEventListener('click', () => {
    stops = DEFAULT_ELEVATION_COLORS.map((stop) => ({ ...stop }))
    opacity.value = '72'
    render()
    update()
  })
  render()
}
