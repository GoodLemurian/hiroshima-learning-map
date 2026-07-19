export function createStatisticSelector(definitions, initialKey, onChange) {
  const select = document.querySelector('#statistic-selector')
  select.replaceChildren(...Object.entries(definitions).map(([key, { label }]) => {
    const option = document.createElement('option')
    option.value = key
    option.textContent = label
    option.selected = key === initialKey
    return option
  }))
  select.addEventListener('change', () => onChange(select.value))
}
