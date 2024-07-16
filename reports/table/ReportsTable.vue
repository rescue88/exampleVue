<template>
  <div
    ref="tableScrollerRef"
    class="table-scroller md:mx-4 lg:mx-0"
    @scroll="handleScroll"
  >
    <div
      v-if="loading"
      class="all:flex flex-col gap-5"
    >
      <template v-for="row in 5">
        <div
          :key="`row-${row}`"
          class="all:flex gap-4 items-center py-4"
        >
          <v-skeleton-loader
            v-for="col in viewport.md ? 5 : 3"
            :key="`col-${col}`"
            type="text"
            class="grow"
          />
        </div>
      </template>
    </div>
    <template v-else>
      <Table
        v-if="records.length"
        class="reports-table"
        :class="{
          'reports-table--scrolled': tableContentScrolled,
          'reports-table--scrollable': tableContentCanScroll,
        }"
        :hide-header-on-mobile="false"
        sticky-header
        condensed
      >
        <template #tableHeaders>
          <slot name="tableHeaders" />
        </template>
        <template #tableRows>
          <ReportsTableRow
            v-for="record in records"
            :key="record.id"
            :record="record"
            :has-employees-column="hasEmployeesColumn"
          />
        </template>
        <template
          v-if="summaryRow"
          #tableFooterRows
        >
          <ReportsTableRow
            summary-row
            :record="summaryRow"
            :has-employees-column="hasEmployeesColumn"
          />
        </template>
      </Table>
      <NoData
        v-else
        :header="$tc('noData.noEntries')"
        :info="$tc('noData.tryAdjustingDateRangeOrFilters')"
      >
        <template #illustration>
          <EmployeeEmptyFolderSvg class="w-32" />
        </template>
      </NoData>
    </template>
  </div>
</template>

<script setup lang="ts">
import EmployeeEmptyFolderSvg from '@/assets/fallback/EmployeeEmptyFolderSvg.vue';
import NoData from '@/components/placeholders/NoData.vue';
import Table from '@/components/table/Table.vue';
import { calculateSummaryRow } from '@/lib/reports/reportsFunctions';
import { ReportsRecord } from '@/lib/reports/reportsTypes';
import { elementIsScrolledToBottom, viewport } from '@/util/windowFunctions';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import ReportsTableRow from './ReportsTableRow.vue';

const ScrollTopDistance = 10;

const props = withDefaults(
  defineProps<{
    records: ReportsRecord[];
    loading: boolean;
    hasEmployeesColumn: boolean;
  }>(),
  {},
);

const tableScrollerRef = ref<HTMLElement | null>(null);
const resizeObserver = ref<ResizeObserver | null>(null);

const tableContentScrolled = ref<boolean>(false); // handle table header styles when scrolling
const tableContentCanScroll = ref<boolean>(false); // handle table footer styles when scrolling

const summaryRow = computed<ReportsRecord>(() =>
  props.records.length ? calculateSummaryRow(props.records) : null,
);

const handleResize = () => {
  tableContentScrolled.value =
    tableScrollerRef.value.scrollTop > ScrollTopDistance;
  tableContentCanScroll.value = !elementIsScrolledToBottom(
    tableScrollerRef.value,
  );
};

const handleScroll = ({ target }) => {
  tableContentScrolled.value = target.scrollTop > ScrollTopDistance;
  tableContentCanScroll.value = !elementIsScrolledToBottom(target);
};

onMounted(() => {
  resizeObserver.value = new ResizeObserver(handleResize);
  resizeObserver.value.observe(tableScrollerRef.value);
});

onBeforeUnmount(() => {
  resizeObserver.value.unobserve(tableScrollerRef.value);
});
</script>

<style lang="scss">
.reports-page {
  &__content {
    & .table-scroller {
      $main-header-padding-right: 32px;
      $padding-x: calc(
        (100vw - (1600px + 4rem)) / 2 + #{$main-header-padding-right}
      );
      $header-breakpoint: 1665px; // header max width (1600px) + navbar (65px)

      overflow-y: auto;
      overscroll-behavior: none;
      padding: 0 $padding-x;

      @media screen and (max-width: $header-breakpoint) {
        padding: 0 $main-header-padding-right;
      }
      max-height: 98%;
      @media screen and (max-width: $lg) {
        padding: 0;
      }
    }

    .reports-table {
      min-width: 800px;
      // border and box-shadow still visible when another element overflow content
      @mixin fake-border-right($right: 0) {
        position: absolute;
        content: '';
        top: 0;
        right: $right;
        width: 1px;
        height: 100%;
      }
      @mixin fake-border-bottom($bottom: 0) {
        position: absolute;
        content: '';
        left: 0;
        bottom: $bottom;
        width: 100%;
        height: 1px;
        background: $gray-300;
      }
      @mixin reports-table-box-shadow($top) {
        box-shadow: 0px $top 6px -6px rgba(59, 39, 88, 0.08);
      }

      /* sticky elements */
      thead {
        top: -1px; // cover gap on top in case topbar warning appears
        @media screen and (min-width: $lg) {
          &::before {
            @include fake-border-bottom(50%);
          }
        }
      }
      // add styles only if table being scrolled
      &--scrolled thead {
        @include reports-table-box-shadow(8px);
      }
      // sticky for thead is set by 'stickyHeader' prop in <Table />
      thead,
      tfoot {
        z-index: 3;
      }
      // row in the table footer in the last one and represents summary of all totals [special styling]
      tfoot {
        position: sticky;
        bottom: -1px;

        // set white background colour directly because even rows styling could set it to $gray-50
        tr,
        tr td:first-child {
          background-color: white;
        }
      }
      &--scrollable tfoot {
        @include reports-table-box-shadow(-8px);
      }
      /* sticky elements */

      tr {
        // every even row should be gray
        &:nth-child(even) {
          background-color: $gray-50;
          // handle first column (sticky) background colour to overflow scrolled content
          th,
          td {
            &:first-child {
              background-color: $gray-50;
            }
          }
        }
        &:nth-child(odd) {
          th,
          td {
            &:first-child {
              background-color: white !important;
            }
          }
        }
      }

      // selecting with just 'tr' would also apply styles for the 'thead' rows
      tbody {
        td {
          &:first-child {
            color: #303030;
          }
          &:not(:first-child) {
            color: #676767;
          }
        }
      }

      th,
      td {
        // fix first col and make it overflow other table content
        &:first-child {
          position: sticky;
          left: 0;
          z-index: 2;

          &::before {
            @include fake-border-right(3px);
            box-shadow: 3px 0 3px rgba(0, 0, 0, 0.12);
          }
        }

        // border for inner cells (first column has a box-shadow instead, last column has no border)
        &:not(:first-child) {
          position: relative;
          &:not(:last-child)::before {
            @include fake-border-right();
            background-color: $gray-300;
          }
        }

        &::after {
          @include fake-border-bottom();
        }
      }
    }
  }
}
</style>
