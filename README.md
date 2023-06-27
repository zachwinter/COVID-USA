# COVID-USA
An interactive timeseries built with `Vue 3`, `TypeScript`, `D3` and the `2D Canvas API`. 

## Overview

The [John Hopkins University COVID-19 Dashboard](https://coronavirus.jhu.edu/map.html) stood as source of truth for many of us following the COVID-19 pandemic, right up until the university's cessation of data collection on March 10, 2023. Their dataset, [archived on GitHub](https://github.com/CSSEGISandData/COVID-19), contains total *cumulative* cases per county in the United States. When visualizing this data over time, it quickly resembles the shape of a population map – providing little value or insight with regards to the movement of the virus.

This visualization attempts to augment the JHU dataset in two ways:

1) The inclusion of county-level census data for visualizing data per-capita. 
2) Visualizing *active* cases instead of *cumulative* cases.


In the absence of a reliable dataset for active cases on a county level, I'm deriving the data based on the assumption that it takes, on average, 21 days to recover from COVID-19.

Although ultimately an approximation, the results are fascinating:

* [`Nov. 05, 2020`](https://covid-usa.herokuapp.com#11052020)
* [`Aug. 17, 2021`](https://covid-usa.herokuapp.com/#08172021)
* [`Dec. 25, 2021`](https://covid-usa.herokuapp.com/#12252021)
* [`Sep. 01, 2022`](https://covid-usa.herokuapp.com#09012022)