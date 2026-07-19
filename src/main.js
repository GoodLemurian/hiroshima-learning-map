import 'maplibre-gl/dist/maplibre-gl.css'
import './style.css'
import { createHiroshimaMap } from './map.js'
import { createBaseMapSelector, createTerrainToggle } from './ui.js'
import { createDrawControl } from './drawing/createDrawControl.js'
import { createDrawingState } from './drawing/drawingState.js'
import { createDrawingPanel } from './ui/drawingPanel.js'
import { createMeasurementPanel } from './ui/measurementPanel.js'
import { loadAdministrativeAreas } from './data/loadAdministrativeAreas.js'
import { loadWardStatistics } from './data/loadWardStatistics.js'
import { joinWardStatistics } from './data/joinWardStatistics.js'
import { DEFAULT_STATISTIC, statisticDefinitions } from './data/statisticDefinitions.js'
import { createChoroplethScale } from './analysis/createChoroplethScale.js'
import {
  addAdministrativeAreaLayers,
  bindAdministrativeAreaInteractions,
  fitAdministrativeAreas,
  setAdministrativeAreaColors,
} from './map/administrativeAreaLayers.js'
import { createAdministrativeAreaPanel } from './ui/administrativeAreaPanel.js'
import { createAdministrativeAreaToggle } from './ui/administrativeAreaToggle.js'
import { createStatisticSelector } from './ui/statisticSelector.js'
import { createChoroplethLegend } from './ui/choroplethLegend.js'

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
    <button
      id="drawing-panel-toggle"
      class="drawing-panel-toggle"
      type="button"
      aria-controls="drawing-panel"
      aria-expanded="false"
    >
      <span aria-hidden="true">✎</span>
      <span class="drawing-panel-toggle__label">地図にかく</span>
    </button>
    <section id="drawing-panel" class="drawing-panel" aria-label="地図にかく道具" hidden>
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
      <section class="measurement-panel" aria-labelledby="measurement-title">
        <h3 id="measurement-title">はかった結果</h3>
        <p id="measurement-result" aria-live="polite">図形をえらぶと、長さや広さが分かります</p>
        <p class="measurement-note">※ 長さや広さはおよその値です</p>
      </section>
    </section>
    <fieldset class="base-map-selector">
      <legend>地図の種類</legend>
      <div id="base-map-selector" class="base-map-options"></div>
      <label class="terrain-option">
        <input id="terrain-toggle" type="checkbox" />
        <span>地形を立体にする</span>
      </label>
    </fieldset>
    <section class="ward-panel" aria-labelledby="ward-panel-title">
      <h2 id="ward-panel-title">広島市の区</h2>
      <label class="ward-toggle">
        <input id="wards-toggle" type="checkbox" checked />
        <span>広島市の区を表示</span>
      </label>
      <label class="statistic-control" for="statistic-selector">
        <span>色分けするもの</span>
        <select id="statistic-selector"></select>
      </label>
      <section id="choropleth-legend" class="choropleth-legend" aria-label="色分けの説明"></section>
      <div id="administrative-area-info" class="ward-info" aria-live="polite">
        <p>地図の区をえらんでください</p>
      </div>
    </section>
    <p id="map-error" class="error-message" role="alert" hidden>
      地図を読みこめませんでした。通信環境を確認して、もう一度ページを開いてください。
    </p>
  </main>
  <footer class="attribution">
    背景地図：<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">国土地理院</a>
    ／ 標高：<a href="https://tiles.gsj.jp/tiles/elev/tiles.html" target="_blank" rel="noreferrer">産総研地質調査総合センター</a>
    ／ 統計：<a href="https://www.city.hiroshima.lg.jp/shisei/toukei/1027844/1027845/1027846/1038153/index.html" target="_blank" rel="noreferrer">広島市 年齢別人口（区役所別）</a>（2026年5月31日、CC BY 2.1 JP）
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
  const wardPanel = createAdministrativeAreaPanel()
  const legend = createChoroplethLegend()
  const numericColumns = Object.keys(statisticDefinitions)
  Promise.all([loadAdministrativeAreas(), loadWardStatistics({ numericColumns })])
    .then(([{ featureCollection, wardCodes }, { records }]) => {
      try {
        const joined = joinWardStatistics(featureCollection, records, statisticDefinitions)
        if (wardCodes.some((code) => !joined.recordByCode.has(code))) {
          console.warn('一部の区は統計データなしとして表示します。')
        }
        addAdministrativeAreaLayers(map, joined.featureCollection)
        let selectedStatistic = DEFAULT_STATISTIC
        const updateStatistic = (key) => {
          selectedStatistic = key
          const definition = { ...statisticDefinitions[key], key }
          const values = records.map((record) => record[key])
          const scale = createChoroplethScale(values, definition.property)
          setAdministrativeAreaColors(map, scale.expression)
          legend.update(definition, scale)
          wardPanel.setStatistics(definition, joined.recordByCode)
        }
        createStatisticSelector(statisticDefinitions, selectedStatistic, updateStatistic)
        updateStatistic(selectedStatistic)
        const wardInteractions = bindAdministrativeAreaInteractions({
          map,
          isDrawingActive: () => drawingState.getState().mode !== 'select',
          onSelect: (ward) => wardPanel.showSelection(ward),
        })
        createAdministrativeAreaToggle((visible) => {
          wardInteractions.setVisible(visible)
          legend.setVisible(visible)
        })
        fitAdministrativeAreas(map, joined.featureCollection)
      } catch (error) {
        console.error('広島市の行政区レイヤーを追加できませんでした。', error)
        wardPanel.showError()
      }
    })
    .catch((error) => {
      console.error('行政区または統計データを読み込めませんでした。', error)
      wardPanel.showError()
    })

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
  createMeasurementPanel(drawingState)

  window.getDrawnFeatureCollection = drawing.getDrawnFeatureCollection
})
