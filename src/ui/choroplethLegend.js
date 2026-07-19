import { NO_DATA_COLOR } from '../analysis/createChoroplethScale.js'

const formatNumber = (value, definition) => new Intl.NumberFormat('ja-JP', {
  maximumFractionDigits: definition.maximumFractionDigits,
}).format(value)

export function createChoroplethLegend() {
  const legend = document.querySelector('#choropleth-legend')
  return {
    update(definition, scale) {
      legend.replaceChildren()
      const title = document.createElement('h3')
      title.textContent = `${definition.label}（${definition.unit}）`
      const list = document.createElement('ul')
      scale.legendItems.forEach((item) => {
        const row = document.createElement('li')
        const swatch = document.createElement('span')
        swatch.className = 'legend-swatch'
        swatch.style.backgroundColor = item.color
        const label = item.singleValue
          ? `${formatNumber(item.minimum, definition)} ${definition.unit}`
          : `${formatNumber(item.minimum, definition)} 〜 ${formatNumber(item.maximum, definition)} ${definition.unit}${item.last ? '（最大）' : ''}`
        row.append(swatch, label)
        list.append(row)
      })
      const noData = document.createElement('li')
      const noDataSwatch = document.createElement('span')
      noDataSwatch.className = 'legend-swatch legend-swatch--no-data'
      noDataSwatch.style.backgroundColor = NO_DATA_COLOR
      noData.append(noDataSwatch, 'データなし')
      list.append(noData)
      legend.append(title, list)
    },
    setVisible(visible) { legend.hidden = !visible },
  }
}
