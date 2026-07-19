import { decodeGsjElevation } from './terrain-protocol.js'

const PROTOCOL_NAME = 'gsielevationcolor'
const PROTOCOL_PREFIX = `${PROTOCOL_NAME}://`

export const DEFAULT_ELEVATION_COLORS = [
  { elevation: 0, color: '#2c7bb6' },
  { elevation: 20, color: '#abd9e9' },
  { elevation: 100, color: '#ffffbf' },
  { elevation: 300, color: '#fdae61' },
  { elevation: 600, color: '#d7191c' },
]

let colorStops = DEFAULT_ELEVATION_COLORS

function hexToRgb(hex) {
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16))
}

function colorForElevation(elevation, stops) {
  let selected = stops[0]
  for (const stop of stops) {
    if (elevation < stop.elevation) break
    selected = stop
  }
  return hexToRgb(selected.color)
}

async function createElevationColorTile(request, abortController) {
  const sourceUrl = `https://${request.url.slice(PROTOCOL_PREFIX.length).split('?')[0]}`
  const response = await fetch(sourceUrl, { signal: abortController.signal })
  if (!response.ok) {
    throw new Error(`標高タイルを読みこめませんでした: ${response.status}`)
  }

  const stops = colorStops.map((stop) => ({ ...stop }))
  const sourceImage = await createImageBitmap(await response.blob())
  const canvas = document.createElement('canvas')
  canvas.width = sourceImage.width
  canvas.height = sourceImage.height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(sourceImage, 0, 0)
  sourceImage.close()

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  for (let index = 0; index < imageData.data.length; index += 4) {
    const elevation = decodeGsjElevation(
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3],
    )
    if (elevation === null) {
      imageData.data[index + 3] = 0
      continue
    }
    const [r, g, b] = colorForElevation(elevation, stops)
    imageData.data[index] = r
    imageData.data[index + 1] = g
    imageData.data[index + 2] = b
    imageData.data[index + 3] = 255
  }
  context.putImageData(imageData, 0, 0)
  return { data: await createImageBitmap(canvas) }
}

export function registerElevationColorProtocol(maplibregl) {
  maplibregl.addProtocol(PROTOCOL_NAME, createElevationColorTile)
}

export function setElevationColorStops(stops) {
  colorStops = [...stops].sort((a, b) => a.elevation - b.elevation)
}
