import maplibregl from 'maplibre-gl'
import { registerGsjTerrainProtocol } from './terrain-protocol.js'

const HIROSHIMA_CENTER = [132.4553, 34.3853]
const TERRAIN_SOURCE_ID = 'gsj-elevation'

registerGsjTerrainProtocol(maplibregl)

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
]

const baseMapStyle = {
  version: 8,
  sources: Object.fromEntries(
    [
      ...BASE_MAPS.map(({ id, tiles }) => [
        `gsi-${id}`,
        {
          type: 'raster',
          tiles,
          tileSize: 256,
          attribution: '地理院タイル',
        },
      ]),
      [
        TERRAIN_SOURCE_ID,
        {
          type: 'raster-dem',
          tiles: [
            'gsidem://tiles.gsj.jp/tiles/elev2/mixed/{z}/{x}/{y}.webp',
          ],
          tileSize: 512,
          maxzoom: 17,
          encoding: 'mapbox',
          attribution: '産総研地質調査総合センター シームレス標高タイル',
        },
      ],
    ],
  ),
  layers: BASE_MAPS.map(({ id }, index) => ({
    id: `gsi-${id}-layer`,
    type: 'raster',
    source: `gsi-${id}`,
    layout: {
      visibility: index === 0 ? 'visible' : 'none',
    },
  })),
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

  BASE_MAPS.forEach(({ id }) => {
    map.setLayoutProperty(
      `gsi-${id}-layer`,
      'visibility',
      id === selectedId ? 'visible' : 'none',
    )
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
    new maplibregl.AttributionControl({ compact: true }),
    'bottom-right',
  )

  map.once('error', onError)

  return map
}
