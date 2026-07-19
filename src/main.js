import 'maplibre-gl/dist/maplibre-gl.css'
import './style.css'
import { createHiroshimaMap } from './map.js'
import { createBaseMapSelector, createTerrainToggle } from './ui.js'
import { createDrawControl } from './drawing/createDrawControl.js'
import { createDrawingState } from './drawing/drawingState.js'
import { createDrawingPanel } from './ui/drawingPanel.js'

document.querySelector('#app').innerHTML = `
  <header class="app-header">
    <div>
      <p class="eyebrow">広島市 地域学習</p>
      <h1>ひろしまを地図で見てみよう</h1>
    </div>
    <p class="app-header__hint">地図を動かしたり、拡大したりできます</p>
  </header>
  <main class="map-area">
    <div id="map" aria-label="広島市の地図"></div>
    <section id="drawing-panel" class="drawing-panel" aria-label="地図にかく道具">
      <h2>地図にかいてみよう</h2>
      <div class="drawing-tools">
        <button type="button" data-action="mode" data-mode="point" aria-pressed="false" title="地図をおして、場所にしるしをつけます"><span aria-hidden="true">●</span>場所をしるす</button>
        <button type="button" data-action="mode" data-mode="linestring" aria-pressed="false" title="地図を何回かおして、道をかきます"><span aria-hidden="true">／</span>道をかく</button>
        <button type="button" data-action="mode" data-mode="polygon" aria-pressed="false" title="地図を何回かおして、場所をかこみます"><span aria-hidden="true">△</span>場所をかこむ</button>
        <button type="button" data-action="mode" data-mode="select" aria-pressed="true" title="かいたものをえらんで、動かしたり形を直したりします"><span aria-hidden="true">☝</span>えらんで直す</button>
        <button type="button" class="drawing-button--danger" data-action="delete" title="えらんだものをけします"><span aria-hidden="true">×</span>けす</button>
        <button type="button" class="drawing-button--danger" data-action="clear" title="かいたものを全部けします" disabled><span aria-hidden="true">⌫</span>全部けす</button>
      </div>
      <p id="drawing-count" class="drawing-count" aria-live="polite">かいたもの：0こ</p>
      <p id="drawing-status" class="drawing-status">かいたものをえらぶと、動かしたり形を直したりできます。</p>
    </section>
    <fieldset class="base-map-selector">
      <legend>地図の種類</legend>
      <div id="base-map-selector" class="base-map-options"></div>
      <label class="terrain-option">
        <input id="terrain-toggle" type="checkbox" />
        <span>地形を立体にする</span>
      </label>
    </fieldset>
    <p id="map-error" class="error-message" role="alert" hidden>
      地図を読みこめませんでした。通信環境を確認して、もう一度ページを開いてください。
    </p>
  </main>
  <footer class="attribution">
    背景地図：<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">国土地理院</a>
    ／ 標高：<a href="https://tiles.gsj.jp/tiles/elev/tiles.html" target="_blank" rel="noreferrer">産総研地質調査総合センター</a>
  </footer>
`

const map = createHiroshimaMap({
  container: 'map',
  onError: () => {
    document.querySelector('#map-error').hidden = false
  },
})

map.once('load', () => {
  createBaseMapSelector(map)
  createTerrainToggle(map)

  const drawingState = createDrawingState()
  const showDrawingMessage = (message, isError = false) => {
    const status = document.querySelector('#drawing-status')
    status.textContent = message
    status.classList.toggle('is-error', isError)
  }
  const drawing = createDrawControl({
    map,
    state: drawingState,
    onMessage: showDrawingMessage,
  })

  if (!drawing) {
    document.querySelector('#drawing-panel').classList.add('is-disabled')
    return
  }

  createDrawingPanel({
    state: drawingState,
    onMode: (mode) => {
      showDrawingMessage('')
      drawing.setMode(mode)
    },
    onDelete: drawing.deleteSelected,
    onClear: () => {
      if (
        drawingState.getState().count > 0 &&
        window.confirm('かいたものを全部けしますか？')
      ) {
        drawing.clearAll()
      }
    },
  })

  window.getDrawnFeatureCollection = drawing.getDrawnFeatureCollection
})
