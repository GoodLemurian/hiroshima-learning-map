import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw'
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css'

const DRAW_MODES = new Set(['point', 'linestring', 'polygon', 'select'])
const DRAW_LAYER_IDS = [
  'school-draw-polygon',
  'school-draw-polygon-outline',
  'school-draw-linestring',
  'school-draw-point',
  'school-draw-point-marker',
]

export function createDrawControl({ map, state, onMessage }) {
  const control = new MaplibreTerradrawControl({
    modes: ['point', 'linestring', 'polygon', 'select'],
    open: false,
    adapterOptions: { prefixId: 'school-draw' },
  })

  try {
    map.addControl(control, 'top-right')
  } catch (error) {
    console.error('Terra Drawを初期化できませんでした。', error)
    onMessage('お絵かきの道具を読みこめませんでした。', true)
    return null
  }

  const terraDraw = control.getTerraDrawInstance()
  if (!terraDraw) {
    onMessage('お絵かきの道具を読みこめませんでした。', true)
    return null
  }

  try {
    if (!terraDraw.enabled) control.activate()
  } catch (error) {
    console.error('Terra Drawを開始できませんでした。', error)
    onMessage('お絵かきの道具を開始できませんでした。', true)
    return null
  }

  let frontFrame = null
  const bringDrawLayersToFront = () => {
    frontFrame = null
    const styleLayers = map.getStyle()?.layers ?? []
    const existingDrawLayers = DRAW_LAYER_IDS.filter((id) => map.getLayer(id))
    if (existingDrawLayers.length === 0) return

    const currentTopLayers = styleLayers
      .slice(-existingDrawLayers.length)
      .map(({ id }) => id)
    const alreadyOnTop = existingDrawLayers.every(
      (id, index) => currentTopLayers[index] === id,
    )
    if (alreadyOnTop) return

    existingDrawLayers.forEach((id) => map.moveLayer(id))
  }
  const scheduleDrawLayersToFront = () => {
    if (frontFrame !== null) return
    frontFrame = window.requestAnimationFrame(bringDrawLayersToFront)
  }

  map.on('styledata', scheduleDrawLayersToFront)
  scheduleDrawLayersToFront()

  const builtInButton = map
    .getContainer()
    .querySelector('.maplibregl-terradraw-add-point-button')
  builtInButton?.closest('.maplibregl-ctrl')?.classList.add('drawing-control--hidden')

  const getDrawnFeatureCollection = () => {
    try {
      const collection = control.getFeatures(false)
      return {
        type: 'FeatureCollection',
        features: collection?.features ? [...collection.features] : [],
      }
    } catch (error) {
      console.error('作図したものを取得できませんでした。', error)
      onMessage('かいたものを読みとれませんでした。', true)
      return { type: 'FeatureCollection', features: [] }
    }
  }

  const syncFeatures = () => {
    try {
      state.setFeatures(getDrawnFeatureCollection().features)
    } catch (error) {
      console.error('作図状態を更新できませんでした。', error)
      onMessage('かいたものの数を更新できませんでした。', true)
    }
  }

  const safeEvent = (handler) => (...args) => {
    try {
      handler(...args)
    } catch (error) {
      console.error('作図イベントの処理に失敗しました。', error)
      onMessage('うまくできませんでした。もう一度ためしてください。', true)
    }
  }

  terraDraw.on(
    'finish',
    safeEvent((id) => {
      syncFeatures()
      if (id === null || id === undefined) return

      // Keep the active drawing mode so children can place multiple features
      // of the same kind. The ID is retained only as the measurement target.
      state.setMeasurementFeature(id)
    }),
  )
  terraDraw.on('change', safeEvent(syncFeatures))
  terraDraw.on('select', safeEvent((id) => state.setSelectedFeature(id)))
  terraDraw.on('deselect', safeEvent(() => state.resetSelection()))

  const setMode = (mode) => {
    if (!DRAW_MODES.has(mode)) {
      console.warn(`未対応の作図モードです: ${mode}`)
      onMessage('その道具は使えません。', true)
      return false
    }

    try {
      if (!terraDraw.enabled) control.activate()
      terraDraw.setMode(mode)
      map.getContainer().dataset.drawingMode = mode
      state.setMode(mode)
      if (mode !== 'select') state.resetSelection()
      return true
    } catch (error) {
      console.error(`作図モード「${mode}」へ変更できませんでした。`, error)
      onMessage('道具を切りかえられませんでした。', true)
      return false
    }
  }

  const deleteSelected = () => {
    const selectedId = state.getState().selectedFeatureId
    if (selectedId === null) {
      onMessage('けすものを先にえらんでください。')
      return false
    }

    try {
      terraDraw.removeFeatures([selectedId])
      state.resetSelection()
      syncFeatures()
      onMessage('えらんだものをけしました。')
      return true
    } catch (error) {
      console.error('選択した図形を削除できませんでした。', error)
      onMessage('けすことができませんでした。', true)
      return false
    }
  }

  const clearAll = () => {
    try {
      terraDraw.clear()
      state.resetSelection()
      syncFeatures()
      onMessage('かいたものを全部けしました。')
      return true
    } catch (error) {
      console.error('作図した図形を全消去できませんでした。', error)
      onMessage('全部けすことができませんでした。', true)
      return false
    }
  }

  const setPanelOpen = (isOpen) => {
    try {
      if (!terraDraw.enabled) control.activate()
      if (isOpen) {
        const modeChanged = setMode(state.getState().mode)
        if (modeChanged) state.setPanelOpen(true)
        return modeChanged
      }

      terraDraw.setMode('default')
      map.getContainer().dataset.drawingMode = 'default'
      state.resetSelection()
      state.setPanelOpen(false)
      return true
    } catch (error) {
      console.error('作図パネルの操作状態を変更できませんでした。', error)
      onMessage('お絵かきの道具を切りかえられませんでした。', true)
      return false
    }
  }

  // The current base-map UI only changes raster visibility, so Terra Draw layers
  // survive base-map changes. If a future feature calls setStyle(), recreate this
  // control after style.load so its sources and layers are registered again.
  terraDraw.setMode('default')
  map.getContainer().dataset.drawingMode = 'default'
  syncFeatures()

  return {
    setMode,
    setPanelOpen,
    deleteSelected,
    clearAll,
    getDrawnFeatureCollection,
  }
}
