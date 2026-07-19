import maplibregl from 'maplibre-gl'

const HIROSHIMA_CENTER = [132.4553, 34.3853]

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
    BASE_MAPS.map(({ id, tiles }) => [
      `gsi-${id}`,
      {
        type: 'raster',
        tiles,
        tileSize: 256,
        attribution: '地理院タイル',
      },
    ]),
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
  })

  map.addControl(
    new maplibregl.NavigationControl({ showCompass: false }),
    'top-right',
  )
  map.addControl(
    new maplibregl.AttributionControl({ compact: true }),
    'bottom-right',
  )

  map.once('error', onError)

  return map
}
