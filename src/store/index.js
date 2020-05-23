import Vue from 'vue'
import Vuex from 'vuex'
import { isMobile, isMobileLandscape } from '../util/viewport'
import { format } from 'date-fns'

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
export const SET_DATA = 'SET_DATA'
export const SET_TOPOJSON = 'SET_TOPOJSON'
export const CASES = 'CASES'
export const DEATHS = 'DEATHS'

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
    data: null
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
    [SET_DATA] (state, val) {
      state.data = val
    },
    [SET_TOPOJSON] (state, val) {
      state.topojson = val
    }
  },
  actions: {
    async fetchData ({ commit }) {
      const [data, usa] = await Promise.all([
        fetch(PRODUCTION ? '/api/data/' : 'http://localhost:8000/api/data').then(res => res.json()), // eslint-disable-line
        fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json').then(res => res.json())
      ])
      commit(SET_DATA, Object.freeze(data))
      commit(SET_TOPOJSON, Object.freeze(usa))
      commit(SET_LOADING, false)
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
      const tick = () => {
        if (state.index < state.data.days.length - 1) {
          commit(SET_INDEX, state.index + 1)
          requestAnimationFrame(tick)
        }
      }
      requestAnimationFrame(tick)
    }
  },
  getters: {
    totalDays (state) {
      return state.data.days.length - 1
    },
    caseIndex ({ dataset }) {
      return dataset === CASES ? 0 : 1
    },
    activeDay ({ data, index }) {
      return Object.freeze(data.days[index]) || null
    },
    activeDate ({ data, index }) {
      return new Date(data.days[index].meta.date)
    },
    formattedActiveDate ({ data, index }) {
      const date = new Date(data.days[index].meta.date)
      return format(date, 'MMM d')
    },
    stateModel ({ dataset, data, state }) {
      return Object.freeze(data.states[state].map(day => {
        return {
          date: day.date,
          value: day[dataset.toLowerCase()]
        }
      }))
    },
    countyModel ({ dataset, county, data }) {
      return Object.freeze(data.counties[county.fips].map(day => {
        return {
          date: day.date,
          value: day[dataset.toLowerCase()]
        }
      }))
    },
    countryModel ({ data, dataset }) {
      return Object.freeze(data.country.map(day => {
        return {
          date: day.date,
          value: day[dataset.toLowerCase()]
        }
      }))
    },
    usaStats ({ index, data, dataset }) {
      const set = dataset.toLowerCase()
      const key = set === 'deaths' ? 'deaths' : 'cases'
      return Object.freeze(data.days[index].meta)[key]
    },
    stateStats ({ state, data, index }, { caseIndex }) {
      if (!state) return []
      return Object.freeze(data.days[index][state])[caseIndex]
    },
    countyStats ({ index, data, county }, { caseIndex }) {
      if (!county) return {}
      return Object.freeze(data.days[index][county.fips])[caseIndex]
    }
  }
})