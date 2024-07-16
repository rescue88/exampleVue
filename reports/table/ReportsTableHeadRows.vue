<template>
  <div class="contents">
    <!-- headers -->
    <tr>
      <slot name="firstHeaderCol" />
      <ReportsTableHeaderCell
        v-if="hasEmployeesColumn"
        :label="$tc('label.employees')"
        :icon="getSortClass('employees')"
        class="text-right"
        sortable
        uppercased-label
        @click="toggleSort('employees')"
      />
      <ReportsTableHeaderCell
        :label="$tc('label.shift', 2)"
        :icon="getSortClass('shifts')"
        class="text-right"
        sortable
        uppercased-label
        @click="toggleSort('shifts')"
      />
      <ReportsTableHeaderCell
        :label="$tc('label.hour', 2)"
        class="text-center"
        colspan="2"
        uppercased-label
      />
      <ReportsTableHeaderCell
        :label="$tc('label.cost', 2)"
        class="text-center"
        colspan="2"
        uppercased-label
      />
    </tr>
    <!-- subheaders -->
    <tr>
      <th />
      <th v-if="hasEmployeesColumn" />
      <th />
      <ReportsTableHeaderCell
        :label="$tc('label.scheduled')"
        :icon="getSortClass('hoursScheduled')"
        class="text-right"
        sortable
        subheader
        @click="toggleSort('hoursScheduled')"
      />
      <ReportsTableHeaderCell
        :label="$tc('label.worked')"
        :icon="getSortClass('hoursWorked')"
        class="text-right"
        sortable
        subheader
        @click="toggleSort('hoursWorked')"
      />
      <ReportsTableHeaderCell
        :label="$tc('label.scheduled')"
        :icon="getSortClass('costsScheduled')"
        class="text-right"
        sortable
        subheader
        @click="toggleSort('costsScheduled')"
      />
      <ReportsTableHeaderCell
        :label="$tc('label.worked')"
        :icon="getSortClass('costsWorked')"
        class="text-right"
        sortable
        subheader
        @click="toggleSort('costsWorked')"
      />
    </tr>
  </div>
</template>

<script setup lang="ts">
import ReportsTableHeaderCell from '../../ReportsTableHeaderCell.vue';

withDefaults(
  defineProps<{
    toggleSort: Function;
    getSortClass: Function;
    hasEmployeesColumn?: boolean;
  }>(),
  { hasEmployeesColumn: true },
);
</script>
