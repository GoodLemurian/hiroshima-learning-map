export function createStatisticSelector(definitions, initialKey, onChange) {
  const select = document.querySelector('#statistic-selector')
  const setOptions = (nextDefinitions, selectedKey) => {
    select.replaceChildren(...Object.entries(nextDefinitions).map(([key, { label }]) => {
      const option = document.createElement('option')
      option.value = key
      option.textContent = label
      option.selected = key === selectedKey
      return option
    }))
  }
  setOptions(definitions, initialKey)
  select.addEventListener('change', () => onChange(select.value))
  return { setOptions }
}
