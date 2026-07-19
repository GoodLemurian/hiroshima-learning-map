const API_URL = 'https://api.msil.go.jp/demarcated-fishery-right2024/v2/MapServer/3/query'
const TRIAL_API_KEY = '0e83ad5d93214e04abf37c970c32b641'
const HIROSHIMA_BOUNDS = '132.2,34.1,132.7,34.6'
const PAGE_SIZE = 1000

export async function loadDemarcatedFisheryRights({
  url = API_URL,
  apiKey = import.meta.env.VITE_MSIL_API_KEY || TRIAL_API_KEY,
  bounds = HIROSHIMA_BOUNDS,
} = {}) {
  const features = []
  let resultOffset = 0

  while (true) {
    const query = new URLSearchParams({
      f: 'geojson',
      where: '1=1',
      geometry: bounds,
      geometryType: 'esriGeometryEnvelope',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry: 'true',
      resultOffset: String(resultOffset),
      'subscription-key': apiKey,
    })
    const response = await fetch(`${url}?${query}`)
    if (!response.ok) {
      throw new Error(`区画漁業権データの取得に失敗しました（HTTP ${response.status}）。`)
    }

    const page = await response.json()
    if (page?.type !== 'FeatureCollection' || !Array.isArray(page.features)) {
      throw new Error('区画漁業権データがFeatureCollection形式ではありません。')
    }
    features.push(...page.features)
    if (!page.exceededTransferLimit || page.features.length === 0) break
    resultOffset += PAGE_SIZE
  }

  return { type: 'FeatureCollection', features }
}
