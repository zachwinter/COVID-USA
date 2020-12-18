import Vue from 'vue'
import Vuex from 'vuex'
import { isMobile, isMobileLandscape } from '../util/viewport'
import { format } from 'date-fns'
import * as d3 from 'd3'
import parseData from './data'

Vue.use(Vuex)

export const SET_LOADING = 'SET_LOADING'
export const SET_IS_MOBILE = 'SET_IS_MOBILE'
export const SET_INDEX = 'SET_INDEX'
export const SET_STATE = 'SET_STATE'
export const SET_COUNTY = 'SET_COUNTY'
export const SET_MOUSE = 'SET_MOUSE'
export const SET_HOVER = 'SET_HOVER'
export const SET_IS_MOBILE_LANDSCAPE = 'SET_IS_MOBILE_LANDSCAPE'
export const SET_DATASET = 'SET_DATASET'
export const SET_DATAPOINTS = 'SET_DATAPOINTS'
export const SET_DATA = 'SET_DATA'
export const SET_TOPOJSON = 'SET_TOPOJSON'
export const CASES = 'CASES'
export const DEATHS = 'DEATHS'
export const SET_MAP = 'SET_MAP'
export const SET_TRANSFORM = 'SET_TRANSFORM'
export const SET_PROJECTION = 'SET_PROJECTION'
export const POPULATION = 'POPULATION'
export const VALUES = 'VALUES'

export default new Vuex.Store({
  state: {
    loading: true,
    isMobile: isMobile(),
    isMobileLandscape: isMobileLandscape(),
    index: 0,
    state: null,
    county: null,
    mouse: [0, 0],
    hover: null,
    dataset: CASES,
    datapoints: VALUES,
    map: '2',
    data: null,
    transform: d3.zoomIdentity,
    projection: () => {}
  },
  mutations: {
    [SET_LOADING] (state, val) {
      state.loading = val
    },
    [SET_IS_MOBILE] (state, val) {
      state.isMobile = val
    },
    [SET_IS_MOBILE_LANDSCAPE] (state, val) {
      state.isMobileLandscape = val
    },
    [SET_INDEX] (state, val) {
      state.index = val
    },
    [SET_STATE] (state, val) {
      state.state = val
    },
    [SET_COUNTY] (state, val) {
      state.county = val
    },
    [SET_MOUSE] (state, val) {
      state.mouse = val
    },
    [SET_HOVER] (state, val) {
      state.hover = val
    },
    [SET_DATASET] (state, val) {
      state.dataset = val
    },
    [SET_DATAPOINTS] (state, val) {
      state.datapoints = val
    },
    [SET_DATA] (state, val) {
      state.data = val
    },
    [SET_TOPOJSON] (state, val) {
      state.topojson = val
    },
    [SET_MAP] (state, val) {
      state.map = val
    },
    [SET_TRANSFORM] (state, val) {
      state.transform = val
    },
    [SET_PROJECTION] (state, val) {
      state.projection = val
    }
  },
  actions: {
    async fetchData ({ commit }) {
      try {
        const [data, usa] = await Promise.all([
          parseData(), // eslint-disable-line
          fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json').then(res => res.json())
        ])
        commit(SET_DATA, Object.freeze(data))
        commit(SET_TOPOJSON, Object.freeze(usa))
        commit(SET_LOADING, false)
      } catch (e) {
        console.log(e)
      }
    },
    detectMobile ({ commit }) {
      commit(SET_IS_MOBILE, isMobile())
      commit(SET_IS_MOBILE_LANDSCAPE, isMobileLandscape())
    },
    showCases ({ commit }) {
      commit(SET_DATASET, CASES)
    },
    showDeaths ({ commit }) {
      commit(SET_DATASET, DEATHS)
    },
    animate ({ state, commit }) {
      commit(SET_INDEX, 0)
      const tick = () => {
        if (state.index < state.data.dates.length - 1) {
          commit(SET_INDEX, state.index + 1)
          requestAnimationFrame(tick)
        }
      }
      requestAnimationFrame(tick)
    },
    next ({ state, commit }) {
      if (state.index < state.data.dates.length - 1) {
        commit(SET_INDEX, state.index + 1)
      }
    },
    previous ({ state, commit }) {
      if (state.index > 0) {
        commit(SET_INDEX, state.index - 1)
      }
    }
  },
  getters: {
    totalDays (state) {
      return state.data.dates.length - 1
    },
    caseIndex ({ dataset }) {
      return dataset === CASES ? 0 : 1
    },
    activeDate ({ data, index }) {
      return new Date(data.dates[index])
    },
    formattedActiveDate ({ data, index }) {
      return format(new Date(data.dates[index]), 'MMM d')
    },
    datapoints ({ datapoints, data, dataset, index, map }) {
      if (!data) return []
      return Object.freeze(data.counties.map(datum => {
        return {
          datum,
          value: datapoints === POPULATION
            ? (datum.days[index][dataset.toLowerCase()][map] / datum.population) * 100
            : datum.days[index][dataset.toLowerCase()][map]
        }
      }))
    },
    activeCounty ({ data, county }) {
      return Object.freeze(data.counties.find(d => d.fips === county)) || null
    },
    stateModel ({ dataset, data, state, map }) {
      return Object.freeze(data.states[state].days.map(day => {
        return {
          date: day.date,
          value: day[dataset.toLowerCase()][parseInt(map, 10)]
        }
      }))
    },
    countyModel ({ dataset, map }, { activeCounty }) {
      if (!activeCounty) return []
      const model = Object.freeze(activeCounty.days.map(day => {
        return {
          date: day.date,
          value: day[dataset.toLowerCase()][parseInt(map, 10)]
        }
      }))
      return model[0].value === undefined ? [] : model
    },
    countryModel ({ data, dataset, map }) {
      return Object.freeze(data.country.days.map(day => {
        return {
          date: day.date,
          value: day[dataset.toLowerCase()][parseInt(map, 10)]
        }
      }))
    },
    usaStats ({ index, data, dataset }) {
      return data.country.days[index][dataset.toLowerCase()]
    },
    stateStats ({ state, data, index, dataset }) {
      if (!state) return []
      return data.states[state].days[index][dataset.toLowerCase()]
    },
    countyStats ({ index, data, county, dataset }) {
      const obj = data.counties.find(d => d.fips === county)
      if (!county || !obj) return []
      return obj.days[index][dataset.toLowerCase()]
    }
  }
})