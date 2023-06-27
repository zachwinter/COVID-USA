# COVID-USA
An highly-performant, mobile-friendly interactive timeseries visualizing the spread of COVID-19 in the United States.

[https://covid-usa.herokuapp.com](https://covid-usa.herokuapp.com)

## Features

* *Novel*. Visualize derived county-level active cases (per capita) on any day between `Jan. 22, 2020` and `Mar. 9, 2023`. 
* *Fast*. Thanks to instancing techniques and a hardware-accelerated `ctx.drawImage()`, rasterization of the map and datapoints only happens once – giving you a fluid, jank-free experience even when zooming or panning.
* *Compare*. Click on any county to open a chart visualizing its data over time. Select multiple counties simultaneously and compare them within a shared, synchronized date range.
* *Mobile-friendly*. Full touch gesture interactions for both map & charts. 
* *Share*. Copy a URL to the clipboard linking directly to the visualization on a selected day.


## Overview

The [John Hopkins University COVID-19 Dashboard](https://coronavirus.jhu.edu/map.html) stood as a source of truth for many of us following the COVID-19 pandemic, right up until the university's cessation of data collection on March 10, 2023. Their dataset, [archived on GitHub](https://github.com/CSSEGISandData/COVID-19), contains total *cumulative* cases per county in the United States. When visualizing this data over time, it quickly resembles the shape of a population map – providing little value or insight with regards to the movement of the virus.

This visualization attempts to augment the JHU dataset in two ways:

1) The inclusion of county-level census data for visualizing data per-capita. 
2) Visualizing *active* cases instead of *cumulative* cases. In the absence of a reliable dataset for active cases on a county level, the values are calculated based on the assumption that it takes, on average, 21 days to recover from COVID-19 (e.g. `Σ(i = n-21 to n-1) Δi`).

These two considerations enable us to visualize *the shape of COVID-19's movement*, even if the values themselves are derived. The following are some interesting examples of some significant regional hotspots: 

* [`Nov. 05, 2020`](https://covid-usa.herokuapp.com#11052020)
* [`Aug. 17, 2021`](https://covid-usa.herokuapp.com/#08172021)
* [`Dec. 25, 2021`](https://covid-usa.herokuapp.com/#12252021)
* [`Sep. 01, 2022`](https://covid-usa.herokuapp.com#09012022)