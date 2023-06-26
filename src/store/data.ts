import { clone } from '../util/clone';

export type Location = {
  fips: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  values?: any[];
  population: number;
  stateFips: string;
};

export type Dataset = 'ACTIVE_CASES' | 'CUMULATIVE_CASES' | 'DEATHS';

const INITIAL_DAY = 0;

export const useData = defineStore('data', () => {
  const loaded = ref(false);

  const fipsData = ref();
  const locationData = ref();
  const statsData = ref();
  const populationData = ref();
  const usa = ref();
  const stateData = ref();
  const dayData = ref();
  const totalDays: ComputedRef<number> = computed(() => dayData.value?.length);
  const day: Ref<number> = ref(INITIAL_DAY);
  const dataset: Ref<Dataset> = ref('ACTIVE_CASES');
  const perCapita: Ref<boolean> = ref(true);
  const LOCATIONS = computed(() => Object.freeze(clone(locationData?.value)));
  const STATE_FIPS = computed(() => Object.keys(stateData?.value));
  const dates = computed(() => dayData.value?.map((d: string) => new Date(d)));
  const selectedCounties: Ref<Location[]> = ref([]);

  const DATE_MAP = computed(() =>
    dates.value.reduce((acc: any, date: any, i: number) => {
      acc[date.valueOf()] = i;
      return acc;
    }, {})
  );

  const date: ComputedRef<Date> = computed(
    () => dates.value?.[day?.value] || new Date()
  );

  const dateRange: ComputedRef<[Date, Date]> = computed(() => [
    dates.value?.[0] || null,
    dates.value?.[dates.value.length - 1] || null,
  ]);

  const datasetIndex: ComputedRef<number> = computed(() => {
    switch (dataset.value) {
      case 'ACTIVE_CASES':
        return 2;
      case 'CUMULATIVE_CASES':
        return 0;
      case 'DEATHS':
        return 1;
    }
  });

  const yesterday: ComputedRef<readonly [number, number, number][]> = computed(
    () => {
      if (Math.max(day.value, 0) === 0)
        return Object.freeze(LOCATIONS?.value.map(() => [0, 0, 0]));

      return Object.freeze(
        LOCATIONS.value?.map(
          (location: Location) =>
            (statsData.value as any)?.[
              (fipsData.value as any)?.[location.fips]
            ]?.[day.value - 1]
        )
      );
    }
  );

  const today: ComputedRef<readonly [number, number, number][]> = computed(
    () => {
      return Object.freeze(
        LOCATIONS.value?.map(
          (location: Location) =>
            (statsData.value as any)?.[
              (fipsData.value as any)?.[location.fips]
            ]?.[day.value]
        )
      );
    }
  );

  const delta: ComputedRef<readonly [number, number, number][]> = computed(
    () => {
      return Object.freeze(
        today.value.map(
          (
            [cases, deaths, active]: [number, number, number],
            i: number
          ): [number, number, number] => {
            return [
              cases - yesterday.value[i][0],
              deaths - yesterday.value[i][1],
              active - yesterday.value[i][2],
            ];
          }
        )
      );
    }
  );

  const states: ComputedRef = computed(() => {
    return Object.freeze(
      STATE_FIPS.value?.reduce((acc: any, state: any) => {
        acc[state] = [
          [0, 0, 0],
          [0, 0, 0],
        ] as any;
        (stateData.value as any)?.[state].forEach((county: any) => {
          const index = (fipsData.value as any)[county];
          acc[state][0][0] += today.value[index][0];
          acc[state][0][1] += today.value[index][1];
          acc[state][0][2] += today.value[index][2];
          acc[state][1][0] += delta.value[index][0];
          acc[state][1][1] += delta.value[index][1];
          acc[state][1][2] += delta.value[index][2];
        });
        return acc;
      }, {})
    );
  });

  function getCountyValuesByFips(fips: any): [number, number, number] {
    return today.value?.[(fipsData.value as any)?.[fips]];
  }

  function getCountyDeltasByFips(fips: any): [number, number, number] {
    return delta.value?.[(fipsData.value as any)?.[fips]];
  }

  function getHistoricalCountyValuesByFips(fips: any): any[] {
    return statsData.value?.[fipsData.value?.[fips]] || [];
  }

  function getStateValuesByFips(fips: any): [number, number, number] | null {
    return states.value?.[fips]?.[0] || null;
  }

  function getStateDeltasByFips(fips: any): [number, number, number] | null {
    return states.value?.[fips]?.[1] || null;
  }

  function getStatePopulationByFips(fips: string) {
    return (populationData.value?.states as any)?.[fips] || null;
  }

  function getStateDataByFips(fips: string) {
    return {
      values: [getStateValuesByFips(fips), getStateDeltasByFips(fips)],
      population: getStatePopulationByFips(fips),
    };
  }

  function setDateByIndex(i: number) {
    day.value = i;
  }

  function setDateByDateObject(date: Date) {
    day.value = DATE_MAP.value?.[date.valueOf()];
  }

  function getCountyByFips(fips: string): Location {
    return locationData.value?.[(fipsData.value as any)?.[fips]];
  }

  function selectCountyByFips(fips: string) {
    const county = getCountyByFips(fips);
    const index: number = selectedCounties.value.indexOf(county);

    if (index === -1) {
      selectedCounties.value.push(county);
    } else {
      selectedCounties.value.filter((v: Location) => county.fips !== v.fips);
    }
  }

  async function fetchData() {
    const { data } = await fetch(
      `http://${import.meta.env.VITE_ORIGIN}:${import.meta.env.VITE_SERVER_PORT}/api/data`
    ).then(res => res.json());

    fipsData.value = Object.freeze(data.map);
    populationData.value = Object.freeze(data.population);
    stateData.value = Object.freeze(data.states);
    locationData.value = Object.freeze(data.collection);
    dayData.value = Object.freeze(data.days);
    statsData.value = Object.freeze(data.stats);
    usa.value = data.usa;
    day.value = data.days.length - 1;

    loaded.value = true;
  }

  window.addEventListener('keydown', ({ key }: KeyboardEvent) => {
    if (key === 'ArrowLeft') {
      day.value = Math.max(0, day.value - 1);
    }

    if (key === 'ArrowRight') {
      day.value = Math.min(day.value + 1, totalDays.value);
    }
  });

  fetchData();

  return {
    totalDays,
    dataset,
    datasetIndex,
    day,
    date,
    dates,
    dateRange,
    today,
    yesterday,
    delta,
    states,
    getCountyValuesByFips,
    getCountyDeltasByFips,
    getStateValuesByFips,
    getStateDeltasByFips,
    getStateDataByFips,
    getStatePopulationByFips,
    getHistoricalCountyValuesByFips,
    setDateByIndex,
    setDateByDateObject,
    perCapita,
    fipsData,
    loaded,
    locationData,
    usa,
    selectedCounties,
    selectCountyByFips,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useData, import.meta.hot));
