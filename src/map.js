import maplibregl from 'maplibre-gl'

const HIROSHIMA_CENTER = [132.4553, 34.3853]

const baseMapStyle = {
  version: 8,
  sources: {
    'gsi-standard': {
      type: 'raster',
      tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '地理院タイル',
    },
  },
  layers: [
    {
      id: 'gsi-standard-layer',
      type: 'raster',
      source: 'gsi-standard',
    },
  ],
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
