<template>
  <div class="contents">
    <FilterBreadcrumbs
      v-if="viewport.lg"
      :active-filters="activeFilters"
      with-add-filter-button
      @toggleFilters="toggleFilters"
      @removeItem="removeFilterItem"
    />
    <div v-else>
      <Button
        color="transparent"
        :icon-left="Icon.Filter"
        class="focus:!outline-0 h-full !border-0"
        size="xl"
        @click="toggleFilters"
      >
        <span
          v-if="activeFilters.length"
          class="rounded-full text-white bg-gray-600 px-2 text-12"
        >
          {{ activeFilters.length }}
        </span>
      </Button>
    </div>
    <FilterLayout
      :open="showFilters"
      show-reset
      with-apply-button
      @reset="resetFilters"
      @toggle="toggleFilters"
      @applyFilters="applyFilters"
    >
      <template #default>
        <LoadingOverlay :loading="initialising" />
        <InputGroup class="px-5 py-3">
          <FilterSection :label="$tc('label.location')">
            <template #input>
              <AutoComplete
                :value="getFilterValues(filters.locationIds)"
                :items="activeLocations"
                placeholder="all"
                multiple
                @input="
                  setFilters({
                    filterKey: 'locationIds',
                    value: getFilterResult(
                      $event,
                      activeLocations,
                      'locationIds',
                    ),
                  })
                "
              />
            </template>
          </FilterSection>
          <FilterSection :label="$tc('heading.team')">
            <template #input>
              <AutoComplete
                :value="getFilterValues(filters.employeeIds)"
                :items="employeesWithFullName"
                placeholder="all"
                item-text="fullName"
                multiple
                @input="
                  setFilters({
                    filterKey: 'employeeIds',
                    value: getFilterResult(
                      $event,
                      employeesWithFullName,
                      'employeeIds',
                    ),
                  })
                "
              >
                <template #prepend-item>
                  <!-- <v-list-item /> in the prepend-item slot of the v-autocomplete or v-select causes incorrect highlighting -->
                  <!-- check out https://github.com/vuetifyjs/vuetify/issues/14489 -->
                  <div
                    class="team-selector-prepend flex px-4 hover:cursor-pointer"
                    :class="{
                      'team-selector-prepend--active': includeArchivedEmployees,
                    }"
                    @click="
                      includeArchivedEmployees = !includeArchivedEmployees
                    "
                  >
                    <v-list-item-action>
                      <v-simple-checkbox
                        :value="includeArchivedEmployees"
                        color="#ec3f8c"
                      />
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ $tc('label.includeArchivedEmployees') }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </div>
                  <hr class="my-1.5" />
                </template>
              </AutoComplete>
            </template>
          </FilterSection>
          <FilterSection :label="$tc('label.jobRole')">
            <template #input>
              <AutoComplete
                :value="getFilterValues(filters.jobRoleIds)"
                :items="jobRoles.data"
                placeholder="all"
                multiple
                @input="
                  setFilters({
                    filterKey: 'jobRoleIds',
                    value: getFilterResult($event, jobRoles.data, 'jobRoleIds'),
                  })
                "
              />
            </template>
          </FilterSection>
          <FilterSection :label="$tc('label.group')">
            <template #input>
              <AutoComplete
                :value="getFilterValues(filters.groupIds)"
                :items="employeeGroups.data"
                placeholder="all"
                multiple
                @input="
                  setFilters({
                    filterKey: 'groupIds',
                    value: getFilterResult(
                      $event,
                      employeeGroups.data,
                      'groupIds',
                    ),
                  })
                "
              />
            </template>
          </FilterSection>
          <FilterSection :label="$tc('label.shiftStatus')">
            <template #input>
              <RadioButtons
                :value="filters.shiftStatus?.[0]?.value ?? null"
                :list="shiftStatusesList"
                radio-group="shiftStatus"
                @input="handleShiftStatusInput"
              />
            </template>
          </FilterSection>
        </InputGroup>
      </template>
    </FilterLayout>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/buttons/Button.vue';
import FilterBreadcrumbs from '@/components/filter/FilterBreadcrumbs.vue';
import FilterLayout from '@/components/filter/FilterLayout.vue';
import FilterSection from '@/components/filter/FilterSection.vue';
import InputGroup from '@/components/form/InputGroup.vue';
import AutoComplete from '@/components/inputs/AutoComplete.vue';
import RadioButtons from '@/components/inputs/RadioButtons.vue';
import LoadingOverlay from '@/components/loaders/LoadingOverlay.vue';
import {
  employeeArchived,
  EmployeeWithFullName,
  withFullName,
} from '@/lib/employee/employeeFunctions';
import { Icon } from '@/lib/enum/Icon';
import {
  FilterItem,
  getFilterResult,
  getFilterValues,
  toFilterItem,
} from '@/lib/filters/filterHelpers';
import { realtimeQuery } from '@/lib/realtime/weak/realtimeFunctions';
import {
  getDefaultReportsFilters,
  shiftStatusesList,
} from '@/lib/reports/reportsFilters';
import { ReportsFiltersType } from '@/lib/reports/reportsTypes';
import { Entity } from '@/lib/store/realtimeEntities';
import store from '@/store';
import { viewport } from '@/util/windowFunctions';
import { computed, reactive, ref, watch } from 'vue';
import { Employee, EmployeeStatusEnum } from '@/api/v1';

const props = defineProps<{
  parentFilters: ReportsFiltersType;
}>();

const emit = defineEmits<{
  (e: 'changeFilters', filters: ReportsFiltersType): void;
}>();

const showFilters = ref(false);
const filters = reactive<ReportsFiltersType>({
  ...props.parentFilters,
});
watch(showFilters, (newValue) => {
  // sync local 'filters' with 'parentFilters' if modal had been closed
  if (!newValue) {
    Object.assign(filters, props.parentFilters);
  }
});
// use 'parentFilters' values here (local 'filters' could be different before we click 'Apply Filters' and sync both variables)
const activeFilters = computed<FilterItem<number | boolean>[]>(() =>
  Object.values(props.parentFilters).some((values) => values.length)
    ? [
        ...props.parentFilters.locationIds,
        ...props.parentFilters.employeeIds,
        ...props.parentFilters.jobRoleIds,
        ...props.parentFilters.groupIds,
        ...props.parentFilters.shiftStatus,
      ]
    : [],
);

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};
const resetFilters = () => {
  Object.assign(filters, getDefaultReportsFilters());
};
const setFilters = (item: {
  filterKey: string;
  value: FilterItem<number | boolean>[];
}) => {
  filters[item.filterKey] = item.value;
};
const removeFilterItem = (item: FilterItem<number | boolean>) => {
  setFilters({
    filterKey: item.field,
    value: filters[item.field].filter((i) => i.value !== item.value),
  });
  emit('changeFilters', filters);
};
const applyFilters = () => {
  emit('changeFilters', filters);
  toggleFilters();
};

const employees = realtimeQuery(Entity.Employee)
  .whereIn('status', [EmployeeStatusEnum.Active, EmployeeStatusEnum.Archived])
  .fetch();
const archivedEmployeeIds = computed<number[]>(() =>
  employees.data.filter(employeeArchived).map((e) => e.id),
);
const includeArchivedEmployees = ref<boolean>(false);
// remove archived employees that are potentially checked when excluding them from the select list
watch(includeArchivedEmployees, (newValue) => {
  if (!newValue) {
    setFilters({
      filterKey: 'employeeIds',
      value: filters.employeeIds.filter(
        (filterItem) => !archivedEmployeeIds.value.includes(filterItem.value),
      ),
    });
  }
});
const employeesList = computed<Employee[]>(() =>
  includeArchivedEmployees.value
    ? employees.data
    : employees.data.filter((e) => !archivedEmployeeIds.value.includes(e.id)),
);
const employeesWithFullName = computed<EmployeeWithFullName[]>(() =>
  employeesList.value.map(withFullName),
);

const jobRoles = realtimeQuery(Entity.JobRole).fetch();
const employeeGroups = realtimeQuery(Entity.EmployeeGroup).fetch();

const initialising = computed<boolean>(
  () => employees.isLoading || jobRoles.isLoading || employeeGroups.isLoading,
);

const activeLocations = computed<Location[]>(
  () => store.state.locations.activeLocations.data,
);

const handleShiftStatusInput = (value: boolean | null) => {
  const shiftStatusItem = shiftStatusesList.find(
    (item) => item.value === value,
  );
  const shiftStatusFilterResult =
    value === null
      ? []
      : [toFilterItem(value, shiftStatusItem.name, 'shiftStatus')];
  setFilters({
    filterKey: 'shiftStatus',
    value: shiftStatusFilterResult,
  });
};
</script>

<style lang="scss" scoped>
// v-list-item like styling for the prepend item
@mixin highlight-list-item($opacity, $color) {
  &::before {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: $opacity;
    background: $color;
  }
}

.team-selector-prepend {
  position: relative;
  &:not(&--active):hover {
    @include highlight-list-item(0.04, currentColor);
  }

  &--active {
    & .v-list-item__title {
      color: $blue;
    }
    @include highlight-list-item(0.15, $blue);
  }
}
</style>
