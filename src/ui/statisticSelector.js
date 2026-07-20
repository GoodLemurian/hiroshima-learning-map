export const NO_STATISTIC_KEY = '__none__'

export function createStatisticSelector(definitions, initialKey, onChange) {
  const select = document.querySelector('#statistic-selector')
  const setOptions = (nextDefinitions, selectedKey) => {
    const noStatisticOption = document.createElement('option')
    noStatisticOption.value = NO_STATISTIC_KEY
    noStatisticOption.textContent = 'なし'
    noStatisticOption.selected = selectedKey === NO_STATISTIC_KEY
    const statisticOptions = Object.entries(nextDefinitions).map(([key, { label }]) => {
      const option = document.createElement('option')
      option.value = key
      option.textContent = label
      option.selected = key === selectedKey
      return option
    })
    select.replaceChildren(noStatisticOption, ...statisticOptions)
  }
  setOptions(definitions, initialKey)
  select.addEventListener('change', () => onChange(select.value))
  return { setOptions }
}
