import csvtojson from 'csvtojson'
import census from '@/data/census.json'
import population from '@/data/population.json'

export default async function parseData() {
  let CASES = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv'
  let DEATHS = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv'
  let DAYS = null
  const AVERAGE_RECOVERY_IN_DAYS = 21 
  
  async function initialize () {
    const [cases, deaths] = await Promise.all([
      fetch(CASES).then(res => res.text()),
      fetch(DEATHS).then(res => res.text()) 
    ]) 
    CASES = await csvtojson().fromString(cases)
    DEATHS = await csvtojson().fromString(deaths)
    DAYS = Object.keys(CASES[0]).filter(key => key.includes('/'))
    CASES = await massageJSON(CASES)
    DEATHS = await massageJSON(DEATHS)
  }
  
  async function buildCountyPopulations () {
    const countyPopulations = {}
    const supplimentary = population.reduce((acc, datum) => {
      acc[parseInt(datum.us_county_fips)] = parseInt(datum.population, 10)
      return acc
    }, {})
    Object.keys(census).forEach(key => {
      countyPopulations[key] = census[key]
    })
    Object.keys(supplimentary).forEach(key => {
      countyPopulations[key] = supplimentary[key]
    })
    return countyPopulations
  }
  
  function buildStatePopulations () {
    return [...new Set(population.map(d => d.region))].reduce((acc, state) => {
      acc[state] = population.reduce((acc, datum) => {
        if (datum.region === state) {
          acc += parseInt(datum.population, 10)
        }
        return acc
      }, 0)
      return acc
    }, {})
  }
  
  async function massageJSON (json) {
    const countyPopulations = await buildCountyPopulations()
    return json.map(datum => {
      const _days = []
      DAYS.forEach(key => {
        _days.push({
          date: new Date(key),
          value: parseInt(datum[key], 10)
        })
        _days[key] = datum[key]
      })
      return {
        fips: parseInt(datum.FIPS, 10),
        lat: parseFloat(datum.Lat),
        lon: parseFloat(datum.Long_),
        county: datum.Admin2,
        state: datum.Province_State,
        days: _days,
        population: countyPopulations[parseInt(datum.FIPS, 10)] || null
      }
    }).filter(datum => !isNaN(datum.fips))
  }
  
  function mergeDatasets () {
    return CASES.map((c, i) => {
      const death = DEATHS[i]
      const days = c.days.map(({ date, value }, j) => {
        return {
          date,
          cases: [value],
          deaths: [death.days[j].value]
        }
      })
      return { ...c, days }
    })
  }
  
  function calculateCountyDeltas (data) {
    return data.map(datum => {
      for (let i = 0; i < datum.days.length; i++) {
        const caseDelta = i === 0 ? datum.days[i].cases[0] : datum.days[i].cases[0] - datum.days[i - 1].cases[0]
        const deathDelta = i === 0 ? datum.days[i].deaths[0] : datum.days[i].deaths[0] - datum.days[i - 1].deaths[0]
        datum.days[i].cases.push(caseDelta)
        datum.days[i].deaths.push(deathDelta)
      }
      return datum
    })
  }
  
  function calculateCountyProjections (counties) {
    counties.forEach(county => {
      county.days.forEach((day, i) => {
        let total = 0
        for (let k = i > AVERAGE_RECOVERY_IN_DAYS ? i - AVERAGE_RECOVERY_IN_DAYS : 0; k < i; k++) {
          total += county.days[k].cases[1]
        }
        day.cases.push(total)
      })
    })
  
    counties.forEach(county => {
      county.days.forEach((day, i) => {
        if (i === 0) {
          day.cases.push(day.cases[2])
        } else {
          const delta = day.cases[2] - county.days[i - 1].cases[2]
          day.cases.push(delta)
        }
      })
    })
  }
  
  function calculateStateCases (data) {
    return [...new Set(data.map(d => d.state))].reduce((acc, state) => {
      acc[state] = DAYS.map((date, i) => {
        const cases = data.reduce((acc, county) => {
          if (county.state === state) {
            acc += county.days[i].cases[0]
          }
          return acc
        }, 0)
        const deaths = data.reduce((acc, county) => {
          if (county.state === state) {
            acc += county.days[i].deaths[0]
          }
          return acc
        }, 0)
        return {
          date: new Date(date),
          cases: [cases],
          deaths: [deaths]
        }
      })
      return acc
    }, {})
  }
  
  function calculateStateDeltas (data) {
    for (let key in data) {
      const state = data[key]
      for (let i = 0; i < state.length; i++) {
        const day = state[i]
        const yesterday = state[i - 1]
        if (i === 0) {
          day.cases.push(day.cases[0])
          day.deaths.push(day.deaths[0])
        } else {
          day.cases.push(day.cases[0] - yesterday.cases[0])
          day.deaths.push(day.deaths[0] - yesterday.deaths[0])
        }
      }
    }
    return data
  }
  
  function calculateStateProjections (states) {
    for (let key in states) {
      const state = states[key]
      state.forEach((day, i) => {
        let total = 0
        for (let k = i > AVERAGE_RECOVERY_IN_DAYS ? i - AVERAGE_RECOVERY_IN_DAYS : 0; k < i; k++) {
          total += state[k].cases[1]
        }
        day.cases.push(total)
      })
  
      state.forEach((day, i) => {
        if (i === 0) {
          day.cases.push(day.cases[2])
        } else {
          const delta = day.cases[2] - state[i - 1].cases[2]
          day.cases.push(delta)
        }
      })
    }
  }
  
  function buildCountryData (states) {
    const statePopulations = buildStatePopulations()
    const population = Object.keys(statePopulations).reduce((acc, state) => {
      acc += statePopulations[state]
      return acc
    }, 0)
    const country = DAYS.map(d => new Date(d)).reduce((acc, date, i) => {
      const cases = Object.keys(states).reduce((acc, state) => {
        acc += states[state].days[i].cases[0]
        return acc
      }, 0)
      const deaths = Object.keys(states).reduce((acc, state) => {
        acc += states[state].days[i].deaths[0]
        return acc
      }, 0)
      acc.push({
        date,
        cases: [cases],
        deaths: [deaths]
      })
      return acc
    }, [])
    for (let i = 0; i < country.length; i++) {
      if (i === 0) {
        country[i].cases.push(country[i].cases[0])
        country[i].deaths.push(country[i].deaths[0])
      } else {
        country[i].cases.push(country[i].cases[0] - country[i - 1].cases[0])
        country[i].deaths.push(country[i].deaths[0] - country[i - 1].deaths[0])
      }
    }
    return {
      population,
      days: country
    }
  }
  
  function calculateCountryProjections (country) {
    country.days.forEach((day, i) => {
      let total = 0
      for (let k = i > AVERAGE_RECOVERY_IN_DAYS ? i - AVERAGE_RECOVERY_IN_DAYS : 0; k < i; k++) {
        total += country.days[k].cases[1]
      }
      day.cases.push(total)
    })
  
    country.days.forEach((day, i) => {
      if (i === 0) {
        day.cases.push(day.cases[2])
      } else {
        const delta = day.cases[2] - country.days[i - 1].cases[2]
        day.cases.push(delta)
      }
    })
  }
  
  function addStatePopulations (states) {
    const statePopulations = buildStatePopulations()
    return Object.keys(states).reduce((acc, key) => {
      acc[key] = {
        population: statePopulations[key],
        days: states[key]
      }
      return acc
    }, {})
  }
  
  await initialize()
  const merged = mergeDatasets()
  const counties = calculateCountyDeltas(merged)
  calculateCountyProjections(counties)
  const stateCases = calculateStateCases(counties)
  let states = calculateStateDeltas(stateCases)
  calculateStateProjections(states)
  states = addStatePopulations(states)
  const dates = DAYS.map(d => new Date(d))
  const country = buildCountryData(states)
  calculateCountryProjections(country)
  return { dates, states, counties, country }
}