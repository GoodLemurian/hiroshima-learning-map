import 'maplibre-gl/dist/maplibre-gl.css'
import './style.css'
import { createHiroshimaMap, synchronizeMaps } from './map.js'
import { createBaseMapSelector, createComparisonMapSelector, createElevationColorEditor, createTerrainToggle } from './ui.js'
import { createDrawControl } from './drawing/createDrawControl.js'
import { downloadDrawingGeoJson, parseDrawingGeoJson } from './drawing/drawingGeoJson.js'
import { createDrawingState } from './drawing/drawingState.js'
import { createDrawingPanel } from './ui/drawingPanel.js'
import { createMeasurementPanel } from './ui/measurementPanel.js'
import { loadAdministrativeAreas } from './data/loadAdministrativeAreas.js'
import { loadWardStatistics } from './data/loadWardStatistics.js'
import { joinWardStatistics } from './data/joinWardStatistics.js'
import { DEFAULT_STATISTIC, statisticDefinitions } from './data/statisticDefinitions.js'
import { findNumericPropertyDefinitions, loadSchoolDistricts } from './data/loadSchoolDistricts.js'
import { loadSchoolLocations } from './data/loadSchoolLocations.js'
import { loadFireStations } from './data/loadFireStations.js'
import { loadFireStationJurisdictions } from './data/loadFireStationJurisdictions.js'
import { loadPoliceStations } from './data/loadPoliceStations.js'
import { loadPoliceStationJurisdictions } from './data/loadPoliceStationJurisdictions.js'
import { createChoroplethScale } from './analysis/createChoroplethScale.js'
import {
  addAdministrativeAreaLayers,
  bindAdministrativeAreaInteractions,
  fitAdministrativeAreas,
  setAdministrativeAreaColors,
  WARD_FILL_LAYER_ID,
} from './map/administrativeAreaLayers.js'
import { addSchoolDistrictLayers, SCHOOL_DISTRICT_FILL_LAYER_ID, SCHOOL_DISTRICT_SOURCE_ID, setSchoolDistrictColors, setSchoolDistrictVisibility } from './map/schoolDistrictLayers.js'
import { addSchoolLocationLayers, SCHOOL_LOCATION_LAYER_ID, setSchoolLocationVisibility } from './map/schoolLocationLayers.js'
import { addFireStationLayers, FIRE_STATION_LAYER_ID, setFireStationVisibility } from './map/fireStationLayers.js'
import {
  addFireStationJurisdictionLayers,
  bindFireStationJurisdictionInteractions,
  setFireStationJurisdictionVisibility,
} from './map/fireStationJurisdictionLayers.js'
import { bindFeaturePropertyPopup } from './map/featurePropertyPopup.js'
import {
  addPoliceStationLayers,
  POLICE_JURISDICTION_FILL_LAYER_ID,
  POLICE_JURISDICTION_SOURCE_ID,
  POLICE_STATION_LAYER_ID,
  setPoliceStationVisibility,
} from './map/policeStationLayers.js'
import { createAdministrativeAreaToggle } from './ui/administrativeAreaToggle.js'
import { createStatisticSelector } from './ui/statisticSelector.js'
import { createChoroplethLegend } from './ui/choroplethLegend.js'
import { createWardPanelToggle } from './ui/wardPanelToggle.js'
import { createBaseMapPanelToggle } from './ui/baseMapPanelToggle.js'
import { createChartToggle } from './ui/chartToggle.js'
import {
  createWardStatisticsChart,
  showWardStatisticsChartError,
} from './chart/createWardStatisticsChart.js'

document.querySelector('#app').innerHTML = `
  <main class="map-area">
    <div class="map-comparison is-single-map" aria-label="2種類の地図を比較">
      <section class="map-pane map-pane--primary" aria-label="左側の地図">
        <div id="map" class="map-canvas" aria-label="広島市の左側の地図"></div>
        <label class="map-type-select map-type-select--left">
          <span>左の地図</span>
          <select id="left-map-type" aria-label="左側の地図の種類"></select>
        </label>
      </section>
      <section class="map-pane map-pane--comparison" aria-label="右側の地図">
        <div id="comparison-map" class="map-canvas" aria-label="広島市の右側の地図"></div>
        <label class="map-type-select map-type-select--right">
          <span>右の地図</span>
          <select id="right-map-type" aria-label="右側の地図の種類"></select>
        </label>
      </section>
    </div>
    <div class="map-action-buttons">
      <button
        id="map-comparison-toggle"
        class="map-comparison-toggle"
        type="button"
        aria-controls="comparison-map"
        aria-pressed="false"
      >
        <span aria-hidden="true">◫</span>
        <span class="map-comparison-toggle__label">2画面をON</span>
      </button>
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
    </div>
    <section id="drawing-panel" class="drawing-panel" aria-label="地図にかく道具" hidden>
      <h2>地図にかいてみよう</h2>
      <div class="drawing-tools">
        <button type="button" data-action="mode" data-mode="point" aria-pressed="false" title="地図をおして、場所にしるしをつけます"><span aria-hidden="true">●</span>場所をしるす</button>
        <button type="button" data-action="mode" data-mode="linestring" aria-pressed="false" title="地図を何回かおして、道をかきます"><span aria-hidden="true">／</span>道をかく</button>
        <button type="button" data-action="mode" data-mode="polygon" aria-pressed="false" title="地図を何回かおして、場所をかこみます"><span aria-hidden="true">△</span>場所をかこむ</button>
        <button type="button" data-action="mode" data-mode="select" aria-pressed="true" title="かいたものをえらんで、動かしたり形を直したりします"><span aria-hidden="true">☝</span>えらんで直す</button>
        <button type="button" class="drawing-button--danger" data-action="delete" title="えらんだものをけします" disabled><span aria-hidden="true">×</span>けす</button>
        <button type="button" class="drawing-button--danger" data-action="clear" title="かいたものを全部けします" disabled><span aria-hidden="true">⌫</span>全部けす</button>
        <button type="button" data-action="export" title="かいたものをGeoJSONファイルに保存します" disabled><span aria-hidden="true">↓</span>ファイルに保存</button>
        <button type="button" data-action="import" title="GeoJSONファイルから図形を読みこみます"><span aria-hidden="true">↑</span>ファイルを読みこむ</button>
        <input id="drawing-import-input" class="drawing-file-input" type="file" accept=".geojson,.json,application/geo+json,application/json" />
      </div>
      <p id="drawing-count" class="drawing-count" aria-live="polite">かいたもの：0こ</p>
      <p id="drawing-status" class="drawing-status">かいたものをえらぶと、動かしたり形を直したりできます。</p>
      <section class="measurement-panel" aria-labelledby="measurement-title">
        <div class="measurement-panel__header">
          <h3 id="measurement-title">はかった結果</h3>
          <button id="measurement-toggle" type="button" aria-controls="measurement-content" aria-expanded="true">かくす</button>
        </div>
        <div id="measurement-content">
          <p id="measurement-result" aria-live="polite">図形をえらぶと、長さや広さが分かります</p>
          <p class="measurement-note">※ 長さや広さはおよその値です</p>
        </div>
      </section>
    </section>
    <div class="map-left-action-buttons">
      <button
        id="ward-panel-toggle"
        class="ward-panel-toggle"
        type="button"
        aria-controls="ward-panel"
        aria-expanded="false"
      >
        <span aria-hidden="true">▱</span>
        <span class="ward-panel-toggle__label">データをえらぶ</span>
      </button>
      <button
        id="base-map-panel-toggle"
        class="base-map-panel-toggle"
        type="button"
        aria-controls="base-map-panel"
        aria-expanded="false"
      >
        <span aria-hidden="true">▧</span>
        <span class="base-map-panel-toggle__label">地図の種類</span>
      </button>
    </div>
    <section id="base-map-panel" class="base-map-selector" aria-labelledby="base-map-panel-title" hidden>
      <h2 id="base-map-panel-title">地図の種類</h2>
      <div id="base-map-selector" class="base-map-options"></div>
      <section class="base-map-group terrain-group" aria-labelledby="terrain-group-title">
        <h3 id="terrain-group-title">地形</h3>
        <label class="terrain-option">
          <input id="terrain-toggle" type="checkbox" />
          <span>立体表示</span>
        </label>
        <label class="terrain-option">
          <input
            id="elevation-colors-toggle"
            type="checkbox"
            aria-controls="elevation-colors-settings"
            aria-expanded="false"
          />
          <span>色別標高図</span>
        </label>
        <div id="elevation-colors-settings" hidden>
          <div id="elevation-color-rows"></div>
          <label class="elevation-opacity">色の濃さ
            <input id="elevation-colors-opacity" type="range" min="10" max="100" value="72" />
          </label>
          <button id="elevation-colors-reset" type="button">初期設定に戻す</button>
        </div>
      </section>
    </section>
    <section id="ward-panel" class="ward-panel" aria-labelledby="ward-panel-title" hidden>
      <h2 id="ward-panel-title">データをえらぶ</h2>
      <label class="ward-toggle">
        <input name="geojson-layer" value="wards" type="radio" checked />
        <span>広島市の区を表示</span>
      </label>
      <label class="ward-toggle">
        <input name="geojson-layer" value="school-districts" type="radio" />
        <span>小学校区を表示</span>
      </label>
      <label class="ward-toggle">
        <input name="geojson-layer" value="fire-stations" type="radio" />
        <span>消防署所を表示</span>
      </label>
      <label class="ward-toggle">
        <input name="geojson-layer" value="police-stations" type="radio" />
        <span>警察署・交番を表示</span>
      </label>
      <label class="ward-toggle">
        <input name="geojson-layer" value="none" type="radio" />
        <span>なし</span>
      </label>
      <label class="statistic-control" for="statistic-selector">
        <span>色分けするもの</span>
        <select id="statistic-selector"></select>
      </label>
      <section id="choropleth-legend" class="choropleth-legend" aria-label="色分けの説明"></section>
      <button id="chart-toggle" class="chart-toggle" type="button" aria-controls="chart-panel" aria-expanded="false">
        グラフを表示する
      </button>
      <section id="chart-panel" class="chart-panel" aria-labelledby="chart-panel-title" hidden>
        <h2 id="chart-panel-title">区ごとの統計グラフ</h2>
        <p id="chart-panel-hint">棒の長さで区ごとのちがいをくらべてみよう</p>
        <div id="ward-statistics-chart" class="ward-statistics-chart" aria-live="polite">
          グラフを読みこんでいます…
        </div>
      </section>
    </section>
    <p id="map-error" class="error-message" role="alert" hidden>
      地図を読みこめませんでした。通信環境を確認して、もう一度ページを開いてください。
    </p>
  </main>
`

const map = createHiroshimaMap({
  container: 'map',
  onError: () => {
    document.querySelector('#map-error').hidden = false
  },
})
const comparisonMap = createHiroshimaMap({
  container: 'comparison-map',
  navigationPosition: 'top-right',
  onError: () => {
    document.querySelector('#map-error').hidden = false
  },
})

synchronizeMaps(map, comparisonMap)

const comparisonToggle = document.querySelector('#map-comparison-toggle')
const mapComparison = document.querySelector('.map-comparison')
comparisonToggle.addEventListener('click', () => {
  const enabled = !mapComparison.classList.contains('is-single-map')
  mapComparison.classList.toggle('is-single-map', enabled)
  if (!enabled) {
    document.dispatchEvent(new CustomEvent('map-panel-open', {
      detail: { panelId: 'map-comparison' },
    }))
  }
  comparisonToggle.classList.toggle('is-active', !enabled)
  comparisonToggle.setAttribute('aria-pressed', String(!enabled))
  comparisonToggle.querySelector('.map-comparison-toggle__label').textContent = enabled
    ? '2画面をON'
    : '2画面をOFF'
  requestAnimationFrame(() => {
    map.resize()
    if (!enabled) comparisonMap.resize()
  })
})

comparisonMap.once('load', () => {
  createComparisonMapSelector(comparisonMap, document.querySelector('#right-map-type'), 'photo')
})

map.once('load', () => {
  createBaseMapSelector(map)
  createComparisonMapSelector(map, document.querySelector('#left-map-type'), 'standard')
  createTerrainToggle(map)
  createElevationColorEditor(map)
  createBaseMapPanelToggle()
  const wardPanelToggle = createWardPanelToggle()
  const chartToggle = createChartToggle()

  const drawingState = createDrawingState()
  const isDrawingPanelOpen = () => drawingState.getState().panelOpen
  const legend = createChoroplethLegend()
  const numericColumns = Object.keys(statisticDefinitions)
  Promise.all([
    loadAdministrativeAreas(),
    loadWardStatistics({ numericColumns }),
    loadSchoolDistricts(),
    loadSchoolLocations(),
    loadFireStations(),
    loadFireStationJurisdictions(),
    loadPoliceStations(),
    loadPoliceStationJurisdictions(),
  ])
    .then(([{ featureCollection, wardCodes }, { records }, schoolDistricts, schoolLocations, fireStations, fireStationJurisdictions, policeStations, policeStationJurisdictions]) => {
      try {
        const joined = joinWardStatistics(featureCollection, records, statisticDefinitions)
        if (wardCodes.some((code) => !joined.recordByCode.has(code))) {
          console.warn('一部の区は統計データなしとして表示します。')
        }
        addAdministrativeAreaLayers(map, joined.featureCollection)
        addSchoolDistrictLayers(map, schoolDistricts)
        addSchoolLocationLayers(map, schoolLocations)
        addFireStationJurisdictionLayers(map, fireStationJurisdictions)
        addFireStationLayers(map, fireStations)
        addPoliceStationLayers(map, policeStations, policeStationJurisdictions)
        const schoolDefinitions = findNumericPropertyDefinitions(schoolDistricts)
        let activeLayer = 'wards'
        let selectedStatistic = DEFAULT_STATISTIC
        const initialDefinition = { ...statisticDefinitions[selectedStatistic], key: selectedStatistic }
        const chart = createWardStatisticsChart(records, initialDefinition)
        const updateStatistic = (key) => {
          selectedStatistic = key
          const definitions = activeLayer === 'wards' ? statisticDefinitions : schoolDefinitions
          const definition = { ...definitions[key], key }
          const values = activeLayer === 'wards'
            ? records.map((record) => record[key])
            : schoolDistricts.features.map((feature) => feature.properties?.[key])
          const scale = createChoroplethScale(values, definition.property)
          if (activeLayer === 'wards') {
            setAdministrativeAreaColors(map, scale.expression)
            chart.setStatistic(definition)
          } else {
            setSchoolDistrictColors(map, scale.expression)
          }
          legend.update(definition, scale)
        }
        const statisticSelector = createStatisticSelector(statisticDefinitions, selectedStatistic, updateStatistic)
        updateStatistic(selectedStatistic)
        const wardInteractions = bindAdministrativeAreaInteractions({
          map,
          isDrawingActive: isDrawingPanelOpen,
          onSelect: (ward) => {
            chart.setSelection(ward?.wardCode || null)
            if (ward) wardPanelToggle.open()
          },
        })
        const formatStatistic = (record, definition) => {
          const value = record?.[definition.key]
          return typeof value === 'number'
            ? `${new Intl.NumberFormat('ja-JP', { maximumFractionDigits: definition.maximumFractionDigits }).format(value)} ${definition.unit}`
            : 'データなし'
        }
        const wardPropertyPopup = bindFeaturePropertyPopup({
          map,
          layerId: WARD_FILL_LAYER_ID,
          isEnabled: () => !isDrawingPanelOpen(),
          describeFeature: (feature) => {
            const code = feature?.properties?.N03_007
            const definition = { ...statisticDefinitions[selectedStatistic], key: selectedStatistic }
            if (!code) return null
            return {
              title: feature.properties.N03_005 || '行政区',
              properties: [
                { label: '都道府県', value: feature.properties.N03_001 || '—' },
                { label: '市', value: feature.properties.N03_004 || '—' },
                { label: '区', value: feature.properties.N03_005 || '—' },
                { label: '地域コード', value: code },
                { label: definition.label, value: formatStatistic(joined.recordByCode.get(code), definition) },
              ],
            }
          },
        })
        const schoolPropertyPopup = bindFeaturePropertyPopup({
          map,
          layerId: SCHOOL_DISTRICT_FILL_LAYER_ID,
          sourceId: SCHOOL_DISTRICT_SOURCE_ID,
          isEnabled: () => !isDrawingPanelOpen(),
          describeFeature: (feature) => {
            const properties = Object.entries(feature?.properties || {})
              .filter(([, value]) => value !== null && value !== '')
              .map(([label, value]) => ({ label, value: String(value) }))
            return properties.length ? { title: '小学校区の属性', properties } : null
          },
        })
        const schoolLocationPropertyPopup = bindFeaturePropertyPopup({
          map,
          layerId: SCHOOL_LOCATION_LAYER_ID,
          isEnabled: () => !isDrawingPanelOpen(),
          describeFeature: (feature) => {
            const properties = Object.entries(feature?.properties || {})
              .filter(([, value]) => value !== null && value !== '')
              .map(([label, value]) => ({ label, value: String(value) }))
            return properties.length
              ? { title: feature.properties?.['名称'] || '学校', properties }
              : null
          },
        })
        const fireStationPropertyPopup = bindFeaturePropertyPopup({
          map,
          layerId: FIRE_STATION_LAYER_ID,
          isEnabled: () => !isDrawingPanelOpen(),
          describeFeature: (feature) => {
            const properties = Object.entries(feature?.properties || {})
              .filter(([, value]) => value !== null && value !== '')
              .map(([label, value]) => ({ label, value: String(value) }))
            return properties.length
              ? { title: feature.properties?.['名称'] || '消防署所', properties }
              : null
          },
        })
        const fireStationJurisdictionInteractions = bindFireStationJurisdictionInteractions({
          map,
          isEnabled: () => !isDrawingPanelOpen(),
        })
        const policeStationPropertyPopup = bindFeaturePropertyPopup({
          map,
          layerId: POLICE_STATION_LAYER_ID,
          isEnabled: () => !isDrawingPanelOpen(),
          describeFeature: (feature) => {
            const properties = Object.entries(feature?.properties || {})
              .filter(([, value]) => value !== null && value !== '')
              .map(([label, value]) => ({ label, value: String(value) }))
            return properties.length
              ? { title: feature.properties?.P18_001 || '警察署・交番', properties }
              : null
          },
        })
        const policeJurisdictionPropertyPopup = bindFeaturePropertyPopup({
          map,
          layerId: POLICE_JURISDICTION_FILL_LAYER_ID,
          sourceId: POLICE_JURISDICTION_SOURCE_ID,
          isEnabled: () => !isDrawingPanelOpen(),
          describeFeature: (feature) => {
            const properties = Object.entries(feature?.properties || {})
              .filter(([, value]) => value !== null && value !== '')
              .map(([label, value]) => ({ label, value: String(value) }))
            return properties.length
              ? { title: feature.properties?.P18_005 || '警察署管轄区域', properties }
              : null
          },
        })
        createAdministrativeAreaToggle((nextLayer) => {
          const wardsVisible = nextLayer === 'wards'
          const schoolsVisible = nextLayer === 'school-districts'
          const fireStationsVisible = nextLayer === 'fire-stations'
          const policeStationsVisible = nextLayer === 'police-stations'
          const definitions = wardsVisible ? statisticDefinitions : schoolsVisible ? schoolDefinitions : {}
          const statisticKeys = Object.keys(definitions)
          const hasStatistics = statisticKeys.length > 0
          activeLayer = nextLayer
          if (!wardsVisible) wardPropertyPopup.remove()
          if (!schoolsVisible) {
            schoolPropertyPopup.remove()
            schoolLocationPropertyPopup.remove()
          }
          if (!fireStationsVisible) {
            fireStationPropertyPopup.remove()
            fireStationJurisdictionInteractions.remove()
          }
          if (!policeStationsVisible) {
            policeStationPropertyPopup.remove()
            policeJurisdictionPropertyPopup.remove()
          }
          wardInteractions.setVisible(wardsVisible)
          setSchoolDistrictVisibility(map, schoolsVisible)
          setSchoolLocationVisibility(map, schoolsVisible)
          setFireStationJurisdictionVisibility(map, fireStationsVisible)
          setFireStationVisibility(map, fireStationsVisible)
          setPoliceStationVisibility(map, policeStationsVisible)
          document.querySelector('.statistic-control').hidden = !hasStatistics
          legend.setVisible(hasStatistics)
          chartToggle.setVisible(wardsVisible)
          if (hasStatistics) {
            selectedStatistic = wardsVisible ? DEFAULT_STATISTIC : statisticKeys[0]
            statisticSelector.setOptions(definitions, selectedStatistic)
            updateStatistic(selectedStatistic)
          }
        })
        fitAdministrativeAreas(map, joined.featureCollection)
      } catch (error) {
        console.error('広島市の行政区レイヤーを追加できませんでした。', error)
        showWardStatisticsChartError()
      }
    })
    .catch((error) => {
      console.error('行政区または統計データを読み込めませんでした。', error)
      showWardStatisticsChartError()
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
    onExport: () => {
      try {
        downloadDrawingGeoJson(drawing.getDrawnFeatureCollection())
        showDrawingMessage('かいたものをファイルに保存しました。')
      } catch (error) {
        console.error('作図ファイルを保存できませんでした。', error)
        showDrawingMessage('ファイルに保存できませんでした。', true)
      }
    },
    onImport: (text) => {
      try {
        return drawing.importFeatureCollection(parseDrawingGeoJson(text))
      } catch (error) {
        console.error('GeoJSONファイルを読み込めませんでした。', error)
        showDrawingMessage('GeoJSONのファイルをえらんでください。', true)
        return false
      }
    },
    onImportError: () => {
      showDrawingMessage('ファイルを読みこめませんでした。', true)
    },
    onVisibilityChange: drawing.setPanelOpen,
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
