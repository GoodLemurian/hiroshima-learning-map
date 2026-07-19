import { measureFeature } from '../analysis/measureFeature.js'

const INITIAL_TEXT = '図形をえらぶと、長さや広さが分かります'

export function createMeasurementPanel(state) {
  const result = document.querySelector('#measurement-result')

  return state.subscribe(({ features, selectedFeatureId }) => {
    if (selectedFeatureId === null) {
      result.textContent = INITIAL_TEXT
      result.classList.remove('has-measurement')
      return
    }

    const selectedFeature = features.find(
      (feature) => feature.id === selectedFeatureId,
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
