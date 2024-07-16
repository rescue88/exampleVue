<template>
  <div
    class="reports-page__header--date-picker items-center rounded px-3"
    @click="showDatePicker = true"
  >
    <Pill
      class="bg-pink"
      :text="dateItem.label"
    />
    <div>
      <template v-for="(dateLabelItem, idx) in splittedDateLabel">
        <component
          :is="Number.isFinite(+dateLabelItem) ? 'strong' : 'span'"
          :key="`${dateLabelItem}_${idx}`"
        >
          {{ dateLabelItem }}
        </component>
      </template>
    </div>
    <i
      v-if="viewport.md"
      :class="Icon.Pen"
    />

    <ReportsDatePickerBottomSheetOrDialog
      v-if="showDatePicker"
      :value="showDatePicker"
      :parent-date-item="dateItem"
      :short-date-range="shortDateRange"
      @setDateItem="setDateItem"
      @input="showDatePicker = $event"
      @close="showDatePicker = false"
    />
  </div>
</template>

<script setup lang="ts">
import Pill from '@/components/interface/Pill.vue';
import { Icon } from '@/lib/enum/Icon';
import { ReportsDatePickerItemType } from '@/lib/reports/reportsTypes';
import { viewport } from '@/util/windowFunctions';
import { computed, ref } from 'vue';
import ReportsDatePickerBottomSheetOrDialog from './ReportsDatePickerBottomSheetOrDialog.vue';

const props = withDefaults(
  defineProps<{
    dateItem: ReportsDatePickerItemType;
    setDateItem: (dateItem: ReportsDatePickerItemType) => void;
    shortDateRange?: boolean;
  }>(),
  {
    shortDateRange: false,
  },
);

const showDatePicker = ref(false);

// to map through strings and decide whether to render <strong /> or <span />
const splittedDateLabel = computed<string[]>(() =>
  props.dateItem.dateLabel.split(' '),
);
</script>

<style lang="scss" scoped>
.reports-page__header {
  &--date-picker {
    display: flex;
    gap: 0 6px;
    &:hover {
      cursor: pointer;
      background-color: $gray-200;
    }
  }
}
</style>
