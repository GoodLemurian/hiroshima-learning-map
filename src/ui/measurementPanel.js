import { measureFeature } from '../analysis/measureFeature.js'

const INITIAL_TEXT = '図形をえらぶと、長さや広さが分かります'

export function createMeasurementPanel(state) {
  const result = document.querySelector('#measurement-result')
  const content = document.querySelector('#measurement-content')
  const toggle = document.querySelector('#measurement-toggle')

  toggle.addEventListener('click', () => {
    const willOpen = content.hidden
    content.hidden = !willOpen
    toggle.setAttribute('aria-expanded', String(willOpen))
    toggle.textContent = willOpen ? 'かくす' : '見る'
  })

  return state.subscribe(({ features, measurementFeatureId }) => {
    if (measurementFeatureId === null) {
      result.textContent = INITIAL_TEXT
      result.classList.remove('has-measurement')
      return
    }

    const selectedFeature = features.find(
      (feature) => feature.id === measurementFeatureId,
    )

    if (!selectedFeature) {
      result.textContent = INITIAL_TEXT
      result.classList.remove('has-measurement')
      return
    }

    const measurement = measureFeature(selectedFeature)
    result.textContent = measurement.displayText
    result.classList.toggle(
      'has-measurement',
      measurement.measurementType !== null,
    )
  })
}
