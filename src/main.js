import 'maplibre-gl/dist/maplibre-gl.css'
import './style.css'
import { createHiroshimaMap } from './map.js'
import { createBaseMapSelector, createTerrainToggle } from './ui.js'

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
})
