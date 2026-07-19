import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw'
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css'

const DRAW_MODES = new Set(['point', 'linestring', 'polygon', 'select'])

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

      setMode('select')
      try {
        terraDraw.selectFeature(id)
        state.setSelectedFeature(id)
      } catch (error) {
        console.warn('作図した図形を自動選択できませんでした。', error)
        state.setSelectedFeature(id)
      }
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
      terraDraw.setMode(mode)
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

  // The current base-map UI only changes raster visibility, so Terra Draw layers
  // survive base-map changes. If a future feature calls setStyle(), recreate this
  // control after style.load so its sources and layers are registered again.
  setMode('select')
  syncFeatures()

  return { setMode, deleteSelected, clearAll, getDrawnFeatureCollection }
}
