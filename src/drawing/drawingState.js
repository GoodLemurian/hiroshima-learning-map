const INITIAL_STATE = {
  mode: 'select',
  features: [],
  selectedFeatureId: null,
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
      state = { ...state, selectedFeatureId: id ?? null }
      notify()
    },
    resetSelection() {
      state = { ...state, selectedFeatureId: null }
      notify()
    },
    subscribe(listener) {
      listeners.add(listener)
      listener(getState())
      return () => listeners.delete(listener)
    },
  }
}
