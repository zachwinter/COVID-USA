<template>
  <aside class="date-picker" :class="{ expanded }">
    <section class="years" :class="{ visible: showYears }">
      <Button
        v-for="(year, i) in years"
        :key="i"
        @click="selectYear(i)"
        :class="{ active: selectedYear === year }"
      >
        {{ year }}
      </Button>
    </section>

    <section class="months" :class="{ visible: showMonths }">
      <Button
        v-for="i in 12"
        :key="i"
        @click="selectMonth(i - 1)"
        :class="{ active: selectedMonth?.index === i - 1 }"
      >
        {{ months[i - 1].abbreviation }}
      </Button>
    </section>

    <section class="days" :class="{ visible: showDays }">
      <header>
        <Button :disabled="true" :square="true">S</Button>
        <Button :disabled="true" :square="true">M</Button>
        <Button :disabled="true" :square="true">T</Button>
        <Button :disabled="true" :square="true">W</Button>
        <Button :disabled="true" :square="true">Th</Button>
        <Button :disabled="true" :square="true">F</Button>
        <Button :disabled="true" :square="true">S</Button>
      </header>
      <Button
        v-for="i in totalDaysInMonth"
        :key="i"
        :square="true"
        :disabled="!isInRange(i)"
        :style="{
          'margin-left':
            i === 1 ? `calc(${monthStart} * var(--button-width)` : '',
        }"
        @click="selectDay(i - 1)"
        :class="{ active: isActiveDay(i) }"
      >
        {{ i }}
      </Button>
    </section>
    <button class="date" @click="toggle">
      <div>{{ format(date, 'E MMMM dd, yyyy') }}</div>
      <span>Browse</span>
      <span>Hide</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import getDaysInMonth from 'date-fns/getDaysInMonth';
import startOfMonth from 'date-fns/startOfMonth';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import format from 'date-fns/format';

import {
  generateMonthMap,
  generateYearsFromRange,
  Month,
  type Months,
} from '../util/dates';

const props = defineProps<{
  range: [Date, Date];
  date: Date;
}>();

const emit = defineEmits<{
  select: [value: Date];
}>();

watch(
  () => props.date,
  val => update(val)
);

const years = computed(() => generateYearsFromRange(props.range));
const months: Months = generateMonthMap();
const showYears = ref(true);
const showMonths = ref(true);
const showDays = ref(true);
const expanded = ref(false);
const selectedYear = ref(props.date.getFullYear());
const selectedMonth: Ref<Month | null> = ref(months[props.date.getMonth()]);
const selectedDay: Ref<number | null> = ref(props.date.getDay() - 1);
const totalDaysInMonth = computed(() => {
  const i = selectedMonth?.value?.index;
  if (typeof i !== 'number') return 0;
  return getDaysInMonth(new Date(selectedYear.value, i));
});
const monthStart = computed(() => {
  const i = selectedMonth?.value?.index;
  if (typeof i !== 'number') return 0;
  return startOfMonth(new Date(selectedYear.value, i)).getDay();
});

function update(date: Date) {
  selectedYear.value = date.getFullYear();
  selectedMonth.value = months[date.getMonth()];
  selectedDay.value = date.getDay() - 1;
}

function selectYear(i: number) {
  selectedYear.value = years.value[i];
  showMonths.value = true;
  showDays.value = true;
}

function selectMonth(i: number) {
  selectedMonth.value = months[i];
  showDays.value = true;
}

function selectDay(i: number) {
  if (!selectedYear.value || !selectedMonth.value) return;
  selectedDay.value = i;
  const date = `${selectedMonth.value.index + 1}/${selectedDay.value + 1}/${
    selectedYear.value
  }`;
  emit('select', new Date(date));
}

function isInRange(i: number) {
  if (!selectedYear.value || !selectedMonth.value) return false;
  const date = new Date(
    `${selectedMonth.value.index + 1}/${i}/${selectedYear.value}`
  );
  return !(isAfter(date, props.range[1]) || isBefore(date, props.range[0]));
}

function isActiveDay(i: number) {
  if (!selectedYear.value || !selectedMonth.value) return false;
  const value = props.date.valueOf();
  const date = new Date(
    `${selectedMonth.value.index + 1}/${i}/${selectedYear.value}`
  ).valueOf();
  return value === date;
}

function toggle() {
  expanded.value = !expanded.value;
}
</script>

<style lang="scss" scoped>
.date-picker {
  // @include position(fixed, var(--outer-padding) null null var(--outer-padding));
  @include position(fixed, 0 null null notch(left));
  @include shadow;
  z-index: 5;
  // backdrop-filter: blur(15px);
  background: rgba(darken(map-get($colors, 'purple'), 10%), 0.97);
  transform: translateY(-100%) translateY(var(--button-height));
  transition: var(--base-transition);

  &.expanded {
    transform: translateY(0%);
  }
}
.years,
.months,
.days {
  z-index: 10;
  display: none;

  &.visible {
    display: flex;
  }
}

.years {
  background: rgba(0, 0, 0, 0.15);
  width: var(--sidebar-width);

  button {
    flex: 1;
    background: transparent;
    height: px(40);
    line-height: px(40);

    &:last-child {
      border-right: 0;
    }
  }
}

.months {
  width: var(--sidebar-width);
  flex-wrap: wrap;

  button {
    width: calc(var(--sidebar-width) / 6);
    height: px(40);
    line-height: px(40);
    text-transform: uppercase;
    letter-spacing: px(1.5);
    font-size: px(14);
    background: transparent;

    &:nth-child(6n) {
      border-right: 0;
    }

    &:nth-child(n + 7) {
      border-bottom: 0;
    }
  }
}

.days {
  width: var(--sidebar-width);
  min-height: calc(8 * #{px(40)});
  flex-wrap: wrap;

  button {
    @include flex;
    background: transparent;
    font-weight: 700;
    min-height: px(40);
    max-height: px(40);
    line-height: px(40);

    &:disabled {
      opacity: 0.3;
      font-weight: 300;
    }
  }

  header {
    width: var(--sidebar-width);
    display: flex;
  }

  header button {
    width: calc(var(--sidebar-width) / 7);
    opacity: 0.5 !important;
    height: px(40);
    flex-grow: 0;
    line-height: px(40);
  }
}

.hide,
.date {
  @include strip;
  background: rgba(0, 0, 0, 0.15);
  width: 100%;
  color: rgba(255, 255, 255, 0.9);
  height: var(--button-height);
  text-transform: uppercase;

  font-weight: 700;
  font-size: px(18);
}

.hide {
  background: rgba(0, 0, 0, 0.3);
}

.date {
  font-weight: 700;
  position: relative;
  line-height: 100%;
  transition: all var(--duration) var(--easing);

  div {
    @include flex(center, flex-start, row);
    padding-left: var(--outer-padding);
  }

  span {
    @include position(absolute, 0 0 null null);
    @include flex;
    border-left: 1px solid rgba(255, 255, 255, 0.15);
    height: var(--button-height);
    padding: 0 var(--outer-padding);
    width: px(90);
    line-height: 100%;
    transition: var(--base-transition);
  }

  span + span {
    opacity: 0;
  }

  &:hover {
    background: var(--black);
  }
}

.expanded .date span {
  opacity: 0;

  & + span {
    opacity: 1;
  }
}
</style>
