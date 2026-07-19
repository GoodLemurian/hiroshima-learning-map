import { BASE_MAPS, setBaseMap, setTerrainEnabled } from './map.js'

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
