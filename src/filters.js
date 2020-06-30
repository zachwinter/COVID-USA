import store from '@/store'

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
  },

  pop (value, { id, bucket }) {
    let population = null

    if (bucket === 'counties') {
      population = store.state.data.counties.find(county => county.fips === id).population
    } 

    if (bucket === 'state') {
      population = store.state.data.states[id].population
    }

    if (bucket === 'country') {
      population = store.state.data.country.population
    }

    return population ? `(${((value / population) * 100).toFixed(2)}%)` : ''
  }
}

export function installFilters (Vue) {
  for (let key in filters) {
    Vue.filter(key, filters[key])
  }
  Vue.filter()
}