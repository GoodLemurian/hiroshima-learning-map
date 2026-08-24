const DATA_URL = `${import.meta.env.BASE_URL}data/2024_traffic-accident.geojson`

export async function loadTrafficAccidents() {
  const response = await fetch(DATA_URL)
  if (!response.ok) throw new Error(`交通事故データの取得に失敗しました（HTTP ${response.status}）。`)
  const data = await response.json()
  if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    throw new Error('交通事故データがFeatureCollection形式ではありません。')
  }
  return data
}
