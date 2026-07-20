const INITIAL_STATE = {
  mode: 'select',
  features: [],
  selectedFeatureId: null,
  measurementFeatureId: null,
  panelOpen: false,
}

export function createDrawingState() {
  let state = { ...INITIAL_STATE }
  const listeners = new Set()

  const notify = () => {
    const snapshot = getState()
    listeners.forEach((listener) => listener(snapshot))
  }

  const getState = () => ({
    ...state,
    features: [...state.features],
    count: state.features.length,
  })

  return {
    getState,
    setMode(mode) {
      state = { ...state, mode }
      notify()
    },
    setFeatures(features) {
      state = { ...state, features: [...features] }
      notify()
    },
    setSelectedFeature(id) {
      const featureId = id ?? null
      state = {
        ...state,
        selectedFeatureId: featureId,
        measurementFeatureId: featureId,
      }
      notify()
    },
    setMeasurementFeature(id) {
      state = { ...state, measurementFeatureId: id ?? null }
      notify()
    },
    setPanelOpen(panelOpen) {
      state = { ...state, panelOpen }
      notify()
    },
    resetSelection() {
      state = {
        ...state,
        selectedFeatureId: null,
        measurementFeatureId: null,
      }
      notify()
    },
    subscribe(listener) {
      listeners.add(listener)
      listener(getState())
      return () => listeners.delete(listener)
    },
  }
}
