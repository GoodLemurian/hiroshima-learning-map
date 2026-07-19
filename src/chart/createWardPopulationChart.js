const numberFormatter = new Intl.NumberFormat('ja-JP')

export function showWardPopulationChartError() {
  const container = document.querySelector('#ward-population-chart')
  container.classList.add('is-error')
  container.textContent = 'グラフを表示できませんでした。'
}

export async function createWardPopulationChart(records) {
  const container = document.querySelector('#ward-population-chart')
  const values = records
    .filter(({ population }) => Number.isFinite(population))
    .map(({ ward_code, ward_name, population }) => ({
      ward_code,
      ward_name,
      population,
      population_label: `${numberFormatter.format(population)}人`,
    }))

  if (!values.length) {
    showWardPopulationChartError()
    return
  }

  const chartWidth = Math.max(240, Math.floor(container.clientWidth - 10))
  const specification = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    description: '広島市8区の人口を比べる横棒グラフ',
    width: chartWidth,
    height: { step: 25 },
    data: { values },
    mark: {
      type: 'bar',
      color: '#23856b',
      cornerRadiusEnd: 3,
      tooltip: true,
    },
    encoding: {
      y: {
        field: 'ward_name',
        type: 'nominal',
        title: null,
        sort: '-x',
        axis: { labelFontSize: 12, labelFontWeight: 'bold' },
      },
      x: {
        field: 'population',
        type: 'quantitative',
        title: '人口（人）',
        axis: { format: ',d', tickCount: 4 },
      },
      tooltip: [
        { field: 'ward_name', type: 'nominal', title: '区' },
        { field: 'population_label', type: 'nominal', title: '人口' },
      ],
    },
    config: {
      background: null,
      font: 'system-ui',
      view: { stroke: null },
    },
  }

  try {
    const { default: vegaEmbed } = await import('vega-embed')
    container.replaceChildren()
    await vegaEmbed(container, specification, {
      actions: false,
      renderer: 'svg',
    })
  } catch (error) {
    console.error('人口グラフを表示できませんでした。', error)
    showWardPopulationChartError()
  }
}
