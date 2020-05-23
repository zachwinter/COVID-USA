const filters = {
  delta (value) {
    const locale = Number(value).toLocaleString()
    if (value >= 0) {
      return `+${locale}`
    } else {
      return locale
    }
  },

  prettyNumber (value) {
    return Number(value).toLocaleString()
  }
}

export function installFilters (Vue) {
  for (let key in filters) {
    Vue.filter(key, filters[key])
  }
  Vue.filter()
}