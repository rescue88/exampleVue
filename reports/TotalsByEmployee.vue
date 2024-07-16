<template>
  <ReportsPage
    :records="totalsByEmployeeToPresent"
    :filters="filters"
    :table-data-is-loading="loading"
    :has-employees-column="false"
    :refetch-handler="fetchTotalsByEmployeeDebounced"
    :date-item="dateItem"
    :set-date-item="setDateItem"
    :change-filters="changeFilters"
  >
    <template #tableHeaders>
      <ReportsTableHeadRows
        :has-employees-column="false"
        :toggle-sort="totalsByEmployeeTable.toggleSort"
        :get-sort-class="totalsByEmployeeTable.getSortClass"
      >
        <template #firstHeaderCol>
          <ReportsTableHeaderCell
            :label="$tc('label.employee')"
            :icon="totalsByEmployeeTable.getSortClass('name')"
            sortable
            uppercased-label
            @click="totalsByEmployeeTable.toggleSort('name')"
          />
        </template>
      </ReportsTableHeadRows>
    </template>
  </ReportsPage>
</template>

<script setup lang="ts">
import { fetchAll, reportsApi } from '@/api';
import i18n from '@/i18n';
import { withLoading } from '@/lib/composition/loading';
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
  ReportsFiltersType,
  ReportsRecord,
} from '@/lib/reports/reportsTypes';
import {
  createReactiveTable,
  reactiveTableFieldCompare,
  ReactiveTableSortDirection,
} from '@/lib/table/ReactiveTable';
import debounce from 'lodash.debounce';
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

const totalsByEmployeeTable = reactive(
  createReactiveTable({
    data: [],
    sortKey: {
      name: reactiveTableFieldCompare,
      ...getReportsTableSortKeys(false),
    },
    sorting: [
      { key: 'name', direction: ReactiveTableSortDirection.ASC },
    ] as const,
  }),
);

const totalsByEmployeeToPresent = computed<ReportsRecord[]>(() =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  totalsByEmployeeTable.data.map(({ employeeId: _, ...totalByEmployee }) => ({
    ...totalByEmployee,
    id: totalByEmployee.name,
  })),
);

// managed by the child component
const filters = reactive<ReportsFiltersType>(
  getDefaultReportsFilters(),
);
const changeFilters = (newFilters: ReportsFiltersType) => {
  Object.assign(filters, newFilters);
};

const fetchTotalsByEmployee = withLoading(loading, async () => {
  await fetchAll(reportsApi.listReportsByEmployee.bind(reportsApi), {
    ...parseReportsFilters(filters),
    startsAt: dateItem.value.startDate,
    endsAt: dateItem.value.endDate,
  }).then((response) => {
    totalsByEmployeeTable.data = response.data;
  });
});
const fetchTotalsByEmployeeDebounced = debounce(
  fetchTotalsByEmployee,
  500,
) as Function;

watch([filters, dateItem], () => {
  fetchTotalsByEmployeeDebounced();
});

onMounted(() => {
  MobileHeader.addBackButton();
  MobileHeader.setTitle(i18n.tc('route.title.TotalsByEmployee'));
  fetchTotalsByEmployee();
});
</script>
