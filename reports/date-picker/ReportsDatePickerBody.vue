<template>
  <div class="all:py-4 all:px-3 md:py-6 md:px-5">
    <PageTabs
      class="justify-between md:border-b-1 md:border-gray-200 all:mb-4 md:mb-0"
      :active-tab-style="ActiveTabStyleEnum.Underline"
      :tabs="tabs"
      :tab-button-size="viewport.xs ? 'md' : 'sm'"
    />
    <!-- Min height as fixed value to prevent modal from resizing when jump between tabs -->
    <div
      class="min-h-[230px]"
      :class="
        currentTab === ReportsDatePickerDialogTabsEnum.Custom
          ? 'all:pt-4 md:pt-8'
          : 'md:pt-4'
      "
    >
      <div v-if="currentTab === ReportsDatePickerDialogTabsEnum.Custom">
        <InputGroup row-at="xs">
          <FormDatePicker
            :value="props.value.startDate"
            :label-text="$tc('label.startDate')"
            :max-date="endDateToShow"
            :has-error="!!errorMessage"
            field="startDate"
            output-format="date"
            @input="updateCustomStartDate"
          />
          <FormDatePicker
            :value="endDateToShow"
            :label-text="$tc('label.endDate')"
            :min-date="props.value.startDate"
            :has-error="!!errorMessage"
            field="endDate"
            output-format="date"
            @input="updateCustomEndDate"
          />
        </InputGroup>
        <span
          v-if="errorMessage"
          class="text-red text-14"
        >
          {{ errorMessage }}
        </span>
      </div>
      <ul
        v-else
        class="pl-0 flex flex-col gap-y-2"
      >
        <li
          v-for="dateItem in dateItems"
          :key="dateItem.id"
          :class="{
            'reports-date-item--active': dateItem.id === props.value.id,
          }"
          class="reports-date-item flex justify-between items-center p-2 rounded border-b-1"
          @click="() => setLocalDateItem(dateItem)"
        >
          <div class="flex flex-col text-gray-700">
            <strong class="text-16">{{ dateItem.label }}</strong>
            <span>{{ dateItem.dateLabel }}</span>
          </div>
          <BubbleIcon
            background-class="pink-400"
            foreground-class="white"
            :icon="`${Icon.Check} font-bold`"
            :size="IconSizes.Xsmall"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputGroup from '@/components/form/InputGroup.vue';
import FormDatePicker from '@/components/inputs/FormDatePicker.vue';
import BubbleIcon from '@/components/interface/BubbleIcon.vue';
import PageTabs from '@/components/layout/PageTabs.vue';
import i18n from '@/i18n';
import { Icon } from '@/lib/enum/Icon';
import { IconSizes } from '@/lib/enum/IconSizes';
import {
  generateReportsDatePickerItem,
  getReportsDatePickerItems,
} from '@/lib/reports/reportsFunctions';
import {
  ReportsDatePickerDialogTabsEnum,
  ReportsDatePickerDialogTabsType,
  ReportsDatePickerItemType,
} from '@/lib/reports/reportsTypes';
import store from '@/store';
import { ActiveTabStyleEnum, TPageTab } from '@/types/propTypes';
import { startOfNextDay } from '@/util/dateArithmetic';
import { exclusiveDisplayDate } from '@/util/dateFunctions';
import { viewport } from '@/util/windowFunctions';
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    value: ReportsDatePickerItemType;
    errorMessage: string | null;
    setLocalDateItem: (value: ReportsDatePickerItemType) => void;
    shortDateRange?: boolean;
  }>(),
  { shortDateRange: false },
);

const timezone = computed<string>(() => store.getters.timezone);

const endDateToShow = computed<Date>(() =>
  exclusiveDisplayDate(props.value.endDate, timezone.value),
);

const currentTab = ref<ReportsDatePickerDialogTabsType>(props.value.tab);
const setTab = (tab: ReportsDatePickerDialogTabsType) => {
  currentTab.value = tab;
};
const tabs = computed<TPageTab[]>(() => [
  {
    id: 1,
    checked: currentTab.value === ReportsDatePickerDialogTabsEnum.Today,
    label: i18n.tc('enum.reportsDatePickerDialogTabs.today'),
    value: ReportsDatePickerDialogTabsEnum.Today,
    action: () => {
      setTab(ReportsDatePickerDialogTabsEnum.Today);
    },
  },
  {
    id: 2,
    checked: currentTab.value === ReportsDatePickerDialogTabsEnum.Week,
    label: i18n.tc('enum.reportsDatePickerDialogTabs.week'),
    value: ReportsDatePickerDialogTabsEnum.Week,
    action: () => {
      setTab(ReportsDatePickerDialogTabsEnum.Week);
    },
  },
  {
    id: 3,
    checked: currentTab.value === ReportsDatePickerDialogTabsEnum.Month,
    label: i18n.tc('enum.reportsDatePickerDialogTabs.month'),
    value: ReportsDatePickerDialogTabsEnum.Month,
    action: () => {
      setTab(ReportsDatePickerDialogTabsEnum.Month);
    },
  },
  {
    id: 4,
    checked: currentTab.value === ReportsDatePickerDialogTabsEnum.Custom,
    label: i18n.tc('enum.reportsDatePickerDialogTabs.custom'),
    value: ReportsDatePickerDialogTabsEnum.Custom,
    action: () => {
      setTab(ReportsDatePickerDialogTabsEnum.Custom);
    },
  },
]);

const dateItems = computed(() => getReportsDatePickerItems()[currentTab.value]);

const updateCustomStartDate = (startDate: Date) => {
  props.setLocalDateItem({
    ...generateReportsDatePickerItem(
      1,
      ReportsDatePickerDialogTabsEnum.Custom,
      i18n.tc('enum.reportsDatePickerDialogTabs.custom'),
      startDate,
      props.value.endDate,
      timezone.value,
    ),
    id: ReportsDatePickerDialogTabsEnum.Custom,
  });
};
const updateCustomEndDate = (endDate: Date) => {
  props.setLocalDateItem({
    ...generateReportsDatePickerItem(
      1,
      ReportsDatePickerDialogTabsEnum.Custom,
      i18n.tc('enum.reportsDatePickerDialogTabs.custom'),
      props.value.startDate,
      startOfNextDay(endDate, timezone.value),
      timezone.value,
    ),
    id: ReportsDatePickerDialogTabsEnum.Custom,
  });
};
</script>

<style lang="scss" scoped>
.reports-date-item {
  &--active {
    pointer-events: none;
  }
  &:not(.reports-date-item--active) {
    &:hover {
      background-color: $gray-50;
      cursor: pointer;
    }
    // hide active item icon
    > div:last-child {
      display: none;
    }
  }
}
</style>
