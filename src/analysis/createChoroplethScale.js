const DEFAULT_COLORS = ['#eff3ff', '#bdd7e7', '#6baed6', '#2171b5']
export const NO_DATA_COLOR = '#b8b8b8'

export function createChoroplethScale(values, property, colors = DEFAULT_COLORS) {
  const validValues = values.filter((value) => typeof value === 'number' && Number.isFinite(value))
  if (!validValues.length) {
    return { breaks: [], colors, expression: NO_DATA_COLOR, legendItems: [] }
  }
  const minimum = Math.min(...validValues)
  const maximum = Math.max(...validValues)
  const interval = (maximum - minimum) / colors.length
  const breaks = interval === 0
    ? [minimum, maximum]
    : Array.from({ length: colors.length + 1 }, (_, index) => minimum + interval * index)

  const valueExpression = ['get', property]
  const colorExpression = interval === 0
    ? colors[Math.floor(colors.length / 2)]
    : ['step', valueExpression, colors[0], ...breaks.slice(1, -1).flatMap((value, index) => [value, colors[index + 1]])]
  const expression = ['case', ['==', ['typeof', valueExpression], 'number'], colorExpression, NO_DATA_COLOR]
  const legendItems = interval === 0
    ? [{ minimum, maximum, color: colors[Math.floor(colors.length / 2)], singleValue: true }]
    : colors.map((color, index) => ({ minimum: breaks[index], maximum: breaks[index + 1], color, last: index === colors.length - 1 }))
  return { breaks, colors, expression, legendItems }
}
