<template>
  <Dialog
    v-if="viewport.md"
    v-model="open"
    :title="$tc('heading.dateRange')"
    :max-width="600"
  >
    <template #default>
      <ReportsDatePickerBody v-bind="reportsDatePickerBodyProps" />
    </template>
    <template #footer>
      <ReportsDatePickerFooter v-bind="reportsDatePickerFooterProps" />
    </template>
  </Dialog>
  <BottomSheet
    v-else
    v-model="open"
    persistent
  >
    <div>
      <div class="mx-3 pt-5 pb-3 border-b-1 border-gray-200">
        <h2 class="font-bold">{{ $tc('heading.dateRange') }}</h2>
      </div>
      <ReportsDatePickerBody v-bind="reportsDatePickerBodyProps" />
      <ReportsDatePickerFooter
        v-bind="reportsDatePickerFooterProps"
        class="px-3 py-2 shadow-up"
      />
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
import Dialog from '@/components/dialog/Dialog.vue';
import BottomSheet from '@/components/modal/BottomSheet.vue';
import i18n from '@/i18n';
import { useOpen } from '@/lib/composition/dialog';
import { maxDateRange } from '@/lib/forms/customValidators/dates';
import {
  ReportsDatePickerBodyPropsType,
  ReportsDatePickerFooterPropsType,
  ReportsDatePickerItemType,
} from '@/lib/reports/reportsTypes';
import store from '@/store';
import { viewport } from '@/util/windowFunctions';
import useVuelidate from '@vuelidate/core';
import { computed, reactive } from 'vue';
import ReportsDatePickerBody from './ReportsDatePickerBody.vue';
import ReportsDatePickerFooter from './ReportsDatePickerFooter.vue';

const props = withDefaults(
  defineProps<{
    value: boolean;
    parentDateItem: ReportsDatePickerItemType;
    shortDateRange?: boolean;
  }>(),
  { shortDateRange: false },
);

const emit = defineEmits<{
  (e: 'input', v: boolean): void;
  (e: 'close'): void;
  (e: 'setDateItem', dateItem: ReportsDatePickerItemType): void;
}>();

const timezone = computed<string>(() => store.getters.timezone);

const form = reactive<{
  dateItem: ReportsDatePickerItemType;
}>({
  dateItem: { ...props.parentDateItem },
});
const validators = computed(() => ({
  dateItem: {
    maxDateRange: maxDateRange(props.shortDateRange, timezone.value),
  },
}));
const v$ = useVuelidate(validators, form, { $autoDirty: true });

const open = useOpen(() => props.value, emit);

const maxDateRangeErrorMessage = computed<string>(() => {
  if (v$.value.dateItem.$error) {
    const timeUnit = props.shortDateRange
      ? i18n.tc('unit.month')
      : i18n.tc('unit.year');
    return i18n.tc('errorMessage.validation.maxDateRange', 1, {
      number: 1,
      timeUnit,
    });
  }
  return '';
});

const setLocalDateItem = (value: ReportsDatePickerItemType) => {
  form.dateItem = value;
};
const setDateItem = () => {
  emit('setDateItem', form.dateItem);
  open.value = false;
};

const reportsDatePickerBodyProps = computed<ReportsDatePickerBodyPropsType>(
  () => ({
    value: form.dateItem,
    shortDateRange: props.shortDateRange,
    errorMessage: maxDateRangeErrorMessage.value,
    setLocalDateItem,
  }),
);
const reportsDatePickerFooterProps = computed<ReportsDatePickerFooterPropsType>(
  () => ({
    applyButtonDisabled: !v$.value.$anyDirty || v$.value.$invalid,
    setDateItem,
    closeModal: () => {
      open.value = false;
    },
  }),
);
</script>
