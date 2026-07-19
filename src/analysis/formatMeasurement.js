const numberFormatter = new Intl.NumberFormat('ja-JP', {
  maximumFractionDigits: 1,
})

function rounded(value, digits = 0) {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

export function formatLength(kilometers) {
  if (!Number.isFinite(kilometers) || kilometers < 0) return null

  if (kilometers < 1) {
    const displayValue = rounded(kilometers * 1000)
    return {
      displayValue,
      displayUnit: 'm',
      displayText: `道の長さ：${numberFormatter.format(displayValue)} m`,
    }
  }

  const displayValue = rounded(kilometers, 1)
  return {
    displayValue,
    displayUnit: 'km',
    displayText: `道の長さ：${numberFormatter.format(displayValue)} km`,
  }
}

export function formatArea(squareMeters) {
  if (!Number.isFinite(squareMeters) || squareMeters < 0) return null

  if (squareMeters < 10_000) {
    const displayValue = rounded(squareMeters)
    return {
      displayValue,
      displayUnit: 'm²',
      displayText: `かこんだ広さ：${numberFormatter.format(displayValue)} m²`,
    }
  }

  if (squareMeters < 1_000_000) {
    const displayValue = rounded(squareMeters / 10_000, 1)
    return {
      displayValue,
      displayUnit: 'ha',
      displayText: `かこんだ広さ：${numberFormatter.format(displayValue)} ha`,
    }
  }

  const displayValue = rounded(squareMeters / 1_000_000, 1)
  return {
    displayValue,
    displayUnit: 'km²',
    displayText: `かこんだ広さ：${numberFormatter.format(displayValue)} km²`,
  }
}
