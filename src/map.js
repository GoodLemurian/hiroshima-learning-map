import maplibregl from 'maplibre-gl'
import { registerGsjTerrainProtocol } from './terrain-protocol.js'
import { registerElevationColorProtocol, setElevationColorStops } from './elevation-colors.js'

const HIROSHIMA_CENTER = [132.4553, 34.3853]
const TERRAIN_SOURCE_ID = 'gsj-elevation'
const ELEVATION_COLOR_SOURCE_ID = 'gsj-elevation-colors'
const ELEVATION_COLOR_LAYER_ID = 'gsj-elevation-colors-layer'
const ELEVATION_TILE = 'tiles.gsj.jp/tiles/elev2/mixed/{z}/{x}/{y}.webp'

registerGsjTerrainProtocol(maplibregl)
registerElevationColorProtocol(maplibregl)

export const BASE_MAPS = [
  {
    id: 'standard',
    label: '標準地図',
    tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
  },
  {
    id: 'pale',
    label: '淡色地図',
    tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],
  },
  {
    id: 'photo',
    label: '航空写真',
    tiles: [
      'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
    ],
  },
  {
    id: 'photo-1960s',
    label: '1960年代の写真',
    tiles: [
      'https://cyberjapandata.gsi.go.jp/xyz/ort_old10/{z}/{x}/{y}.png',
    ],
  },
  {
    id: 'photo-1970s',
    label: '1970年代の写真',
    tiles: [
      'https://cyberjapandata.gsi.go.jp/xyz/gazo1/{z}/{x}/{y}.jpg',
    ],
  },
  {
    id: 'photo-1980s',
    label: '1980年代の写真',
    tiles: [
      'https://cyberjapandata.gsi.go.jp/xyz/gazo4/{z}/{x}/{y}.jpg',
    ],
  },
  {
    id: 'photo-2000s',
    label: '2000年代の写真',
    tiles: [
      'https://cyberjapandata.gsi.go.jp/xyz/nendophoto2008/{z}/{x}/{y}.png',
      'https://cyberjapandata.gsi.go.jp/xyz/nendophoto2009/{z}/{x}/{y}.png',
    ],
  },
  {
    id: 'map-meiji',
    label: '明治時代の地図',
    tiles: [
      'https://ktgis.net/kjmapw/kjtilemap/hiroshima/2man/{z}/{x}/{y}.png',
    ],
    attribution: '今昔マップ on the web',
    scheme: 'tms',
    minzoom: 8,
    maxzoom: 16,
  },
  {
    id: 'map-early-showa',
    label: '昭和初期の地図',
    tiles: [
      'https://ktgis.net/kjmapw/kjtilemap/hiroshima/00/{z}/{x}/{y}.png',
    ],
    attribution: '今昔マップ on the web',
    scheme: 'tms',
    minzoom: 8,
    maxzoom: 16,
  },
  {
    id: 'map-1950s',
    label: '1950年代の地図',
    tiles: [
      'https://ktgis.net/kjmapw/kjtilemap/hiroshima/01/{z}/{x}/{y}.png',
    ],
    attribution: '今昔マップ on the web',
    scheme: 'tms',
    minzoom: 8,
    maxzoom: 16,
  },
  {
    id: 'map-1960s',
    label: '1960年代の地図',
    tiles: [
      'https://ktgis.net/kjmapw/kjtilemap/hiroshima/02/{z}/{x}/{y}.png',
    ],
    attribution: '今昔マップ on the web',
    scheme: 'tms',
    minzoom: 8,
    maxzoom: 16,
  },
  {
    id: 'map-1980s',
    label: '1980年代の地図',
    tiles: [
      'https://ktgis.net/kjmapw/kjtilemap/hiroshima/03/{z}/{x}/{y}.png',
    ],
    attribution: '今昔マップ on the web',
    scheme: 'tms',
    minzoom: 8,
    maxzoom: 16,
  },
  {
    id: 'map-1990s',
    label: '1990年代の地図',
    tiles: [
      'https://ktgis.net/kjmapw/kjtilemap/hiroshima/04/{z}/{x}/{y}.png',
    ],
    attribution: '今昔マップ on the web',
    scheme: 'tms',
    minzoom: 8,
    maxzoom: 16,
  },
]

const baseMapLayerId = (id, index) => `gsi-${id}-${index}-layer`

const baseMapStyle = {
  version: 8,
  sources: Object.fromEntries(
    [
      ...BASE_MAPS.flatMap(({
        id,
        tiles,
        attribution = '地理院タイル',
        scheme = 'xyz',
        minzoom = 0,
        maxzoom = 22,
      }) => tiles.map((tile, index) => [
        `gsi-${id}-${index}`,
        {
          type: 'raster',
          tiles: [tile],
          tileSize: 256,
          attribution,
          scheme,
          minzoom,
          maxzoom,
        },
      ])),
      [
        TERRAIN_SOURCE_ID,
        {
          type: 'raster-dem',
          tiles: [
            `gsidem://${ELEVATION_TILE}`,
          ],
          tileSize: 512,
          maxzoom: 17,
          encoding: 'mapbox',
          attribution: '産総研地質調査総合センター シームレス標高タイル',
        },
      ],
      [
        ELEVATION_COLOR_SOURCE_ID,
        {
          type: 'raster',
          tiles: [`gsielevationcolor://${ELEVATION_TILE}?revision=0`],
          tileSize: 512,
          maxzoom: 17,
          attribution: '産総研地質調査総合センター シームレス標高タイル',
        },
      ],
    ],
  ),
  layers: [
    ...BASE_MAPS.flatMap(({ id, tiles }, mapIndex) => tiles.map((_, tileIndex) => ({
      id: baseMapLayerId(id, tileIndex),
      type: 'raster',
      source: `gsi-${id}-${tileIndex}`,
      layout: {
        visibility: mapIndex === 0 ? 'visible' : 'none',
      },
    }))),
    {
      id: ELEVATION_COLOR_LAYER_ID,
      type: 'raster',
      source: ELEVATION_COLOR_SOURCE_ID,
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 0.72, 'raster-fade-duration': 0 },
    },
  ],
}

let elevationColorRevision = 0

export function setElevationColors(map, { enabled, opacity, stops, refresh = true }) {
  setElevationColorStops(stops)
  map.setLayoutProperty(ELEVATION_COLOR_LAYER_ID, 'visibility', enabled ? 'visible' : 'none')
  map.setPaintProperty(ELEVATION_COLOR_LAYER_ID, 'raster-opacity', opacity)
  if (enabled && refresh) {
    elevationColorRevision += 1
    map.getSource(ELEVATION_COLOR_SOURCE_ID).setTiles([
      `gsielevationcolor://${ELEVATION_TILE}?revision=${elevationColorRevision}`,
    ])
  }
}

export function setTerrainEnabled(map, enabled) {
  map.setTerrain(enabled ? { source: TERRAIN_SOURCE_ID, exaggeration: 1.3 } : null)
  map.easeTo({
    pitch: enabled ? 60 : 0,
    duration: 800,
  })
}

export function setBaseMap(map, selectedId) {
  if (!BASE_MAPS.some(({ id }) => id === selectedId)) {
    return
  }

  BASE_MAPS.forEach(({ id, tiles }) => {
    tiles.forEach((_, index) => {
      map.setLayoutProperty(
        baseMapLayerId(id, index),
        'visibility',
        id === selectedId ? 'visible' : 'none',
      )
    })
  })
}

export function createHiroshimaMap({ container, onError }) {
  const map = new maplibregl.Map({
    container,
    style: baseMapStyle,
    center: HIROSHIMA_CENTER,
    zoom: 11,
    attributionControl: false,
    // MapLibre defaults to "high-performance", which can fail to create a
    // WebGL context on otherwise WebGL-capable integrated GPUs.
    canvasContextAttributes: {
      powerPreference: 'default',
    },
  })

  map.addControl(
    new maplibregl.NavigationControl({ showCompass: true }),
    'top-right',
  )
  map.addControl(
    new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }),
    'bottom-left',
  )
  map.addControl(
    new maplibregl.AttributionControl({ compact: true }),
    'bottom-right',
  )

  map.once('error', onError)

  return map
}
