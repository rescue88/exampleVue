<template>
  <PageLayout :refetch-handler="refetchHandler">
    <template #datePicker>
      <ReportsPageDateRangePicker
        :date-item="dateItem"
        :set-date-item="setDateItem"
        :short-date-range="shortDateRange"
      />
    </template>
    <template #filters>
      <ReportsPageFilters
        :parent-filters="filters"
        @changeFilters="changeFilters"
      />
    </template>
    <template #table>
      <ReportsTable
        :records="records"
        :loading="tableDataIsLoading"
        :has-employees-column="hasEmployeesColumn"
      >
        <template #tableHeaders>
          <slot name="tableHeaders" />
        </template>
      </ReportsTable>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import {
  ReportsDatePickerItemType,
  ReportsFiltersType,
  ReportsRecord,
} from '@/lib/reports/reportsTypes';
import ReportsPageDateRangePicker from '../date-picker/ReportsPageDateRangePicker.vue';
import PageLayout from '../PageLayout.vue';
import ReportsPageFilters from './filters/ReportsPageFilters.vue';
import ReportsTable from './table/ReportsTable.vue';

withDefaults(
  defineProps<{
    records: ReportsRecord[];
    filters: ReportsFiltersType;
    tableDataIsLoading?: boolean;
    hasEmployeesColumn?: boolean;
    shortDateRange?: boolean;
    dateItem: ReportsDatePickerItemType;
    setDateItem: (dateItem: ReportsDatePickerItemType) => void;
    changeFilters: (filters: ReportsFiltersType) => void;
    refetchHandler: Function; // refetch button handler (in header)
  }>(),
  {
    tableDataIsLoading: false,
    shortDateRange: false,
    hasEmployeesColumn: true,
  },
);
</script>
