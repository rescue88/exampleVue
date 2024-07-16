<template>
  <tr :class="{ 'font-bold': summaryRow }">
    <!-- First column depends on which of Shift Cost Reports tables do we render  -->
    <td>
      <!-- Last row with summary -->
      <span v-if="summaryRow">{{ $tc('label.total', 2) }}</span>
      <!-- Shift Daily Totals -->
      <div
        v-else-if="record.date"
        class="flex justify-between pr-10 gap-x-3"
      >
        <span class="all:hidden md:inline">{{ weekdayShort }}</span>
        <span>{{ dayMonthYear }}</span>
      </div>
      <!-- Shift Totals by Employee -->
      <span v-else-if="record.name">{{ record.name }}</span>
    </td>
    <!-- Shift Totals by Employee table is missing this column -->
    <td
      v-if="hasEmployeesColumn"
      class="text-right"
    >
      {{ record.employees }}
    </td>
    <td class="text-right">{{ record.shifts }}</td>
    <td class="text-right">
      {{ formatNumberValue(record.hoursScheduled) }}
    </td>
    <td class="text-right">
      {{ formatNumberValue(record.hoursWorked) }}
    </td>
    <td class="text-right">
      {{ formatNumberValue(record.costsScheduled, true) }}
    </td>
    <td class="text-right">
      {{ formatNumberValue(record.costsWorked, true) }}
    </td>
  </tr>
</template>

<script setup lang="ts">
import i18n from '@/i18n';
import { dateTimeFormats } from '@/lang/dateTimeFormats';
import { ReportsRecord } from '@/lib/reports/reportsTypes';
import { formatCurrency } from '@/util/formatFunctions';
import { round } from '@/util/mathFunctions';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    record: ReportsRecord;
    hasEmployeesColumn: boolean;
    summaryRow?: boolean;
  }>(),
  {
    summaryRow: false,
  },
);

const weekdayShort = computed<string>(() =>
  i18n.d(props.record.date, dateTimeFormats.weekdayShort),
);
const dayMonthYear = computed<string>(() => i18n.d(props.record.date));

// 'employees' and 'shifts' fields are always presented as number so no need to use this method for the corresponding columns
const formatNumberValue = (value: number, isCurrency: boolean = false) => {
  const valueToShow = value ?? 0;
  return isCurrency ? formatCurrency(valueToShow) : round(valueToShow, 2);
};
</script>
