const numberFormatter = (maximumFractionDigits) => new Intl.NumberFormat('ja-JP', {
  maximumFractionDigits,
})

export function showWardStatisticsChartError() {
  const container = document.querySelector('#ward-statistics-chart')
  container.classList.add('is-error')
  container.textContent = 'グラフを表示できませんでした。'
}

export function createWardStatisticsChart(records, initialDefinition) {
  const container = document.querySelector('#ward-statistics-chart')
  const title = document.querySelector('#chart-panel-title')
  const hint = document.querySelector('#chart-panel-hint')
  let definition = initialDefinition
  let selectedWardCode = null
  let activeView = null
  let renderVersion = 0

  const render = async () => {
    const currentVersion = ++renderVersion
    const formatter = numberFormatter(definition.maximumFractionDigits)
    const values = records
      .filter((record) => Number.isFinite(record[definition.key]))
      .map(({ ward_code, ward_name, ...record }) => ({
        ward_code,
        ward_name,
        value: record[definition.key],
        value_label: `${formatter.format(record[definition.key])} ${definition.unit}`,
      }))

    title.textContent = `区ごとの${definition.label}`
    hint.textContent = selectedWardCode
      ? '地図で選んだ区をオレンジ色で表示しています'
      : '棒の長さで区ごとのちがいをくらべてみよう'

    if (!values.length) {
      showWardStatisticsChartError()
      return
    }

    const chartWidth = Math.max(240, Math.floor(container.clientWidth - 10))
    const axisFormat = definition.maximumFractionDigits === 0 ? ',d' : ',.1f'
    const specification = {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
      description: `広島市8区の${definition.label}を比べる横棒グラフ`,
      width: chartWidth,
      height: { step: 25 },
      data: { values },
      mark: {
        type: 'bar',
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
          field: 'value',
          type: 'quantitative',
          title: `${definition.label}（${definition.unit}）`,
          axis: { format: axisFormat, tickCount: 4 },
        },
        color: selectedWardCode
          ? {
              condition: {
                test: `datum.ward_code === '${selectedWardCode}'`,
                value: '#c74600',
              },
              value: '#23856b',
              legend: null,
            }
          : { value: '#23856b' },
        tooltip: [
          { field: 'ward_name', type: 'nominal', title: '区' },
          { field: 'value_label', type: 'nominal', title: definition.label },
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
      if (currentVersion !== renderVersion) return
      activeView?.finalize()
      container.classList.remove('is-error')
      container.replaceChildren()
      const result = await vegaEmbed(container, specification, {
        actions: false,
        renderer: 'svg',
      })
      if (currentVersion === renderVersion) activeView = result.view
      else result.view.finalize()
    } catch (error) {
      console.error('統計グラフを表示できませんでした。', error)
      showWardStatisticsChartError()
    }
  }

  render()

  return {
    setStatistic(nextDefinition) {
      if (definition.key === nextDefinition.key) return
      definition = nextDefinition
      render()
    },
    setSelection(wardCode) {
      if (selectedWardCode === wardCode) return
      selectedWardCode = wardCode
      render()
    },
  }
}
