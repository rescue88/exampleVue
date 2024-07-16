<template>
  <ReportsPage
    :records="dailyTotalsTable.data"
    :filters="filters"
    :table-data-is-loading="loading"
    :refetch-handler="fetchDailyTotalsDebounced"
    :date-item="dateItem"
    :set-date-item="setDateItem"
    :change-filters="changeFilters"
    short-date-range
  >
    <template #tableHeaders>
      <ReportsTableHeadRows
        :toggle-sort="dailyTotalsTable.toggleSort"
        :get-sort-class="dailyTotalsTable.getSortClass"
      >
        <template #firstHeaderCol>
          <ReportsTableHeaderCell
            :label="$tc('label.date')"
            :icon="dailyTotalsTable.getSortClass('date')"
            sortable
            uppercased-label
            @click="dailyTotalsTable.toggleSort('date')"
          />
        </template>
      </ReportsTableHeadRows>
    </template>
  </ReportsPage>
</template>

<script setup lang="ts">
import { reportsApi } from '@/api';
import i18n from '@/i18n';
import { withLoading } from '@/lib/composition/loading';
import { PlainDate } from '@/lib/date-time/PlainDate';
import MobileHeader from '@/lib/mobileHeader';
import {
  getDefaultReportsFilters,
  parseReportsFilters,
} from '@/lib/reports/reportsFilters';
import {
  getDefaultReportsDatePickerItem,
  getReportsTableSortKeys,
} from '@/lib/reports/reportsFunctions';
import {
  ReportsDatePickerItemType,
  ReportsCommonResponseFieldsType,
  ReportsFiltersType,
  ReportsRecord,
} from '@/lib/reports/reportsTypes';
import {
  createReactiveTable,
  reactiveTableFieldCompare,
  ReactiveTableSortDirection,
} from '@/lib/table/ReactiveTable';
import store from '@/store';
import debounce from 'lodash.debounce';
import spacetime from 'spacetime';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import ReportsTableHeaderCell from '../ReportsTableHeaderCell.vue';
import ReportsPage from './ReportsPage.vue';
import ReportsTableHeadRows from './table/ReportsTableHeadRows.vue';

const loading = ref(false);

const dateItem = ref<ReportsDatePickerItemType>(
  getDefaultReportsDatePickerItem(),
);
const setDateItem = (newDateItem: ReportsDatePickerItemType) => {
  dateItem.value = newDateItem;
};

const timezone = computed<string>(() => store.getters.timezone);

const dailyTotalsTable = reactive(
  createReactiveTable({
    data: [],
    sortKey: {
      date: reactiveTableFieldCompare,
      ...getReportsTableSortKeys(),
    },
    sorting: [
      { key: 'date', direction: ReactiveTableSortDirection.ASC },
    ] as const,
  }),
);

const datesInRange = computed(() => {
  return spacetime(dateItem.value.startDate, timezone.value)
    .every('day', spacetime(dateItem.value.endDate, timezone.value))
    .map((d) => d.toNativeDate());
});

const stub: ReportsCommonResponseFieldsType = {
  employees: 0,
  shifts: 0,
  hoursScheduled: 0,
  hoursWorked: 0,
  costsScheduled: 0,
  costsWorked: 0,
};

// managed by the child component
const filters = reactive<ReportsFiltersType>(
  getDefaultReportsFilters(),
);
const changeFilters = (newFilters: ReportsFiltersType) => {
  Object.assign(filters, newFilters);
};

const fetchDailyTotals = withLoading(loading, async () => {
  await reportsApi
    .listReportsByDay({
      ...parseReportsFilters(filters),
      startsAt: dateItem.value.startDate,
      endsAt: dateItem.value.endDate,
      perPage: 50,
    })
    .then((response) => {
      // as we are getting final result when mapping through 'datesInRange' but not through
      // 'response.data' then we need to set result here to be able to sort data afterwards
      dailyTotalsTable.data = datesInRange.value.map((date, idx) => {
        const dateString = PlainDate.fromDate(date, timezone.value).toString();
        const report = response.data.find(
          (r) => r.date.toString() === dateString,
        );
        return {
          ...(report || stub),
          id: `${dateString}_${idx}`,
          date,
        };
      }) as ReportsRecord[];
    });
});
const fetchDailyTotalsDebounced = debounce(fetchDailyTotals, 500) as Function;

watch([filters, dateItem], () => {
  fetchDailyTotalsDebounced();
});

onMounted(() => {
  MobileHeader.addBackButton();
  MobileHeader.setTitle(i18n.tc('route.title.DailyTotals'));
  fetchDailyTotals();
});
</script>
