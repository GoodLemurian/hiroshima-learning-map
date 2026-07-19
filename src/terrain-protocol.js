const PROTOCOL_NAME = 'gsidem'
const PROTOCOL_PREFIX = `${PROTOCOL_NAME}://`
const SIGNED_HEIGHT_OFFSET = 167772.16
const NO_DATA_VALUE = [128, 0, 0]

export function decodeGsjElevation(r, g, b, alpha) {
  let height = r * 655.36 + g * 2.56 + b * 0.01
  const isNoData =
    alpha === 0 ||
    (r === NO_DATA_VALUE[0] && g === NO_DATA_VALUE[1] && b === NO_DATA_VALUE[2])

  if (isNoData) return null
  if (r >= 128) {
    height -= SIGNED_HEIGHT_OFFSET
  }

  return height
}

function toTerrainRgb(r, g, b, alpha) {
  let height = decodeGsjElevation(r, g, b, alpha) ?? 0

  // 水面を平らに表示するため、海底などの負標高は海抜0 mとして扱う。
  height = Math.max(0, height)

  const encodedHeight = Math.round((height + 10000) * 10)

  return [
    Math.floor(encodedHeight / 65536),
    Math.floor(encodedHeight / 256) % 256,
    encodedHeight % 256,
  ]
}

async function convertGsjDem(request, abortController) {
  const tileUrl = `https://${request.url.slice(PROTOCOL_PREFIX.length)}`
  const response = await fetch(tileUrl, { signal: abortController.signal })

  if (!response.ok) {
    throw new Error(`標高タイルを読みこめませんでした: ${response.status}`)
  }

  const sourceImage = await createImageBitmap(await response.blob())
  const canvas = document.createElement('canvas')
  canvas.width = sourceImage.width
  canvas.height = sourceImage.height

  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(sourceImage, 0, 0)
  sourceImage.close()

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

  for (let index = 0; index < imageData.data.length; index += 4) {
    const [r, g, b] = toTerrainRgb(
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3],
    )

    imageData.data[index] = r
    imageData.data[index + 1] = g
    imageData.data[index + 2] = b
    // 透明な水域のRGBがImageBitmap生成時に黒へ変換されないよう不透明にする。
    imageData.data[index + 3] = 255
  }

  context.putImageData(imageData, 0, 0)

  return { data: await createImageBitmap(canvas) }
}

export function registerGsjTerrainProtocol(maplibregl) {
  maplibregl.addProtocol(PROTOCOL_NAME, convertGsjDem)
}
