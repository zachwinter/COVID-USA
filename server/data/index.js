const csvtojson = require('csvtojson');
const fs = require('fs');
const path = require('path');

(async () => {
  const DAYS = [
    '1/22/20',
    '1/23/20',
    '1/24/20',
    '1/25/20',
    '1/26/20',
    '1/27/20',
    '1/28/20',
    '1/29/20',
    '1/30/20',
    '1/31/20',
    '2/1/20',
    '2/2/20',
    '2/3/20',
    '2/4/20',
    '2/5/20',
    '2/6/20',
    '2/7/20',
    '2/8/20',
    '2/9/20',
    '2/10/20',
    '2/11/20',
    '2/12/20',
    '2/13/20',
    '2/14/20',
    '2/15/20',
    '2/16/20',
    '2/17/20',
    '2/18/20',
    '2/19/20',
    '2/20/20',
    '2/21/20',
    '2/22/20',
    '2/23/20',
    '2/24/20',
    '2/25/20',
    '2/26/20',
    '2/27/20',
    '2/28/20',
    '2/29/20',
    '3/1/20',
    '3/2/20',
    '3/3/20',
    '3/4/20',
    '3/5/20',
    '3/6/20',
    '3/7/20',
    '3/8/20',
    '3/9/20',
    '3/10/20',
    '3/11/20',
    '3/12/20',
    '3/13/20',
    '3/14/20',
    '3/15/20',
    '3/16/20',
    '3/17/20',
    '3/18/20',
    '3/19/20',
    '3/20/20',
    '3/21/20',
    '3/22/20',
    '3/23/20',
    '3/24/20',
    '3/25/20',
    '3/26/20',
    '3/27/20',
    '3/28/20',
    '3/29/20',
    '3/30/20',
    '3/31/20',
    '4/1/20',
    '4/2/20',
    '4/3/20',
    '4/4/20',
    '4/5/20',
    '4/6/20',
    '4/7/20',
    '4/8/20',
    '4/9/20',
    '4/10/20',
    '4/11/20',
    '4/12/20',
    '4/13/20',
    '4/14/20',
    '4/15/20',
    '4/16/20',
    '4/17/20',
    '4/18/20',
    '4/19/20',
    '4/20/20',
    '4/21/20',
    '4/22/20',
    '4/23/20',
    '4/24/20',
    '4/25/20',
    '4/26/20',
    '4/27/20',
    '4/28/20',
    '4/29/20',
    '4/30/20',
    '5/1/20',
    '5/2/20',
    '5/3/20',
    '5/4/20',
    '5/5/20',
    '5/6/20',
    '5/7/20',
    '5/8/20',
    '5/9/20',
    '5/10/20',
    '5/11/20',
    '5/12/20',
    '5/13/20',
    '5/14/20',
    '5/15/20',
    '5/16/20',
    '5/17/20',
    '5/18/20',
    '5/19/20',
    '5/20/20',
    '5/21/20',
    '5/22/20',
    '5/23/20',
    '5/24/20',
    '5/25/20',
    '5/26/20',
    '5/27/20',
    '5/28/20',
    '5/29/20',
    '5/30/20',
    '5/31/20',
    '6/1/20',
    '6/2/20',
    '6/3/20',
    '6/4/20',
    '6/5/20',
    '6/6/20',
    '6/7/20',
    '6/8/20',
    '6/9/20',
    '6/10/20'
  ];
  
  const DATA = {
    cases: {},
    deaths: {},
    combined: {}
  }

  let days

  async function parseDataset (dataset)  {
    const file = path.join(__dirname + '/' + dataset + '.csv');
    const json = await csvtojson().fromFile(file)
    const locations = json.reduce((acc, val) => {
      if (parseFloat(val.Lat) === 0 || parseFloat(val.Long_) === 0) return acc
      const FIPS = parseInt(val.FIPS, 10)
      if (!FIPS) return acc
      acc.push({
        fips: FIPS,
        state: val.Province_State,
        name: val.Admin2,
        lat: parseFloat(val.Lat),
        lon: parseFloat(val.Long_)
      })
      return acc
    }, [])
    const arr = DAYS.reduce((acc, day, i) => {
      const obj = json.reduce((acc, val) => {
        const cases = parseInt(val[day], 10)
        const FIPS = parseInt(val.FIPS, 10)
        if (FIPS && !isNaN(cases)) acc[FIPS] = cases
        return acc
      }, {})
      let total = 0
      for (let key in obj) total += obj[key]
      obj.meta = {
        total,
        date: new Date(day)
      }
      acc.push(obj)
      return acc
    }, [])
    days = arr.map((day, i) => {
      if (i === 0) {
        day.meta.delta = 0
      } else {
        day.meta.delta = day.meta.total - arr[i - 1].meta.total
      }
      return day
    })
    const states = [...new Set(locations.map(l => l.state))]
    days.forEach((day, i) => {
      locations.forEach(({ fips }) => {
        const total = day[fips]
        const last = days[i - 1] ? days[i - 1][fips].total : 0
        const delta = total - last
        day[fips] = { total, delta }
      })
      states.forEach(s => {
        const total = locations.reduce((acc, { fips, state }) => {
          if (s === state) {
            acc += day[fips].total
          }
          return acc
        }, 0)
        day[s] = total
      })
    })
    days.forEach((day, i) => {
      states.forEach(s => {
        if (i === 0) {
          day[s] = {
            total: day[s],
            delta: 0
          }
        } else {
          day[s] = {
            total: day[s],
            delta: day[s] - days[i - 1][s].total
          }
        }
      })
    })
    DATA[dataset].days = days
    DATA[dataset].locations = locations
    DATA[dataset].states = states.reduce((acc, state) => {
      acc[state] = days.map(day => {
        return {
          date: day.meta.date,
          value: day[state].delta
        }
      })
      return acc
    }, {})
    DATA[dataset].country = days.map(day => {
      return {
        date: day.meta.date,
        value: day.meta.delta
      }
    })
    DATA[dataset].counties = locations.reduce((acc, location) => {
      acc[location.fips] = days.map(day => {
        return {
          date: day.meta.date,
          value: day[location.fips].delta
        }
      })
      return acc
    }, {})
  }
  await parseDataset('cases')
  await parseDataset('deaths')
  DATA.combined.days = DATA.cases.days.map((caseDay, i) => {
    const deathDay =  DATA.deaths.days[i]
    for (let key in caseDay) {
      if (key !== 'meta') {
        caseDay[key] = [
          [caseDay[key].total, caseDay[key].delta],
          [deathDay[key].total, deathDay[key].delta]
        ]
      } else {
        caseDay[key] = {
          ...caseDay[key],
          cases: [caseDay.meta.total, caseDay.meta.delta],
          deaths: [deathDay.meta.total, deathDay.meta.delta],
        }
      }
    }
    return caseDay
  })
  DATA.combined.country = DATA.cases.country.map((day, i) => {
    return {
      date: day.date,
      cases: day.value,
      deaths: DATA.deaths.country[i].value
    }
  })
  DATA.combined.counties = {}
  for (let county in DATA.cases.counties) {
    const day =  DATA.cases.counties[county]
    DATA.combined.counties[county] = day.map(({ date, value }, i) => {
      return {
        date,
        cases: value,
        deaths:  DATA.deaths.counties[county][i].value
      }
    })
  }
  DATA.combined.states = {}
  for (let state in DATA.cases.states) {
    const day = DATA.cases.states[state]
    DATA.combined.states[state] = day.map(({ date, value }, i) => {
      return {
        date,
        cases: value,
        deaths: DATA.deaths.states[state][i].value
      }
    })
  }
  DATA.combined.locations = DATA.cases.locations
  fs.writeFile('data.json', JSON.stringify(DATA.combined), 'utf8', err => {
    if (err) console.log(err)
  })
})()



