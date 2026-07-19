const DATA_URL = `${import.meta.env.BASE_URL}data/opendata_2.geojson`

export async function loadFireStations(url = DATA_URL) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`消防署所データの取得に失敗しました（HTTP ${response.status}）。`)
  const featureCollection = await response.json()
  if (featureCollection?.type !== 'FeatureCollection' || !Array.isArray(featureCollection.features)) {
    throw new Error('消防署所データがFeatureCollection形式ではありません。')
  }
  return featureCollection
}
