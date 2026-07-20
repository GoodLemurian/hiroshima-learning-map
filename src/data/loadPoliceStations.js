const DATA_URL = `${import.meta.env.BASE_URL}data/P18-12_34_GML/P18-12_34_PoliceStation.geojson`

export async function loadPoliceStations(url = DATA_URL) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`警察署・交番データの取得に失敗しました（HTTP ${response.status}）。`)
  const featureCollection = await response.json()
  if (featureCollection?.type !== 'FeatureCollection' || !Array.isArray(featureCollection.features)) {
    throw new Error('警察署・交番データがFeatureCollection形式ではありません。')
  }
  return featureCollection
}
