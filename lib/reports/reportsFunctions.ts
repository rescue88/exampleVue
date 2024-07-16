import i18n from '@/i18n';
import { reactiveTableFieldCompare } from '@/lib/table/ReactiveTable';
import store from '@/store';
import {
  startOfDay,
  startOfNextDay,
  subtractDays,
} from '@/util/dateArithmetic';
import {
  exclusiveDisplayDate,
  formatDatePeriod,
  getCurrentWeekPeriod,
  getMonthPeriod,
} from '@/util/dateFunctions';
import spacetime from 'spacetime';
import {
  ReportsDatePickerDialogTabsEnum,
  ReportsDatePickerDialogTabsType,
  ReportsDatePickerItemsType,
  ReportsDatePickerItemType,
  ReportsCommonResponseFieldsType,
  ReportsRecord,
} from './reportsTypes';

/**
 * Calculates highlighted 'Totals' row which is the last one in the table
 */
export const calculateSummaryRow = (
  records: ReportsRecord[],
): ReportsRecord => {
  // calculate sum for common rows
  return records.reduce(
    (current, record) => {
      current.shifts += record.shifts ?? 0;
      current.employees += record?.employees ?? 0;
      current.hoursScheduled += record.hoursScheduled ?? 0;
      current.hoursWorked += record.hoursWorked ?? 0;
      current.costsScheduled += record.costsScheduled ?? 0;
      current.costsWorked += record.costsWorked ?? 0;
      return current;
    },
    {
      shifts: 0,
      employees: 0,
      hoursScheduled: 0,
      hoursWorked: 0,
      costsScheduled: 0,
      costsWorked: 0,
    },
  );
};

export const getReportsTableSortKeys = (
  hasEmployeesColumn: boolean = true,
): Record<
  keyof Omit<ReportsCommonResponseFieldsType, 'id'>,
  typeof reactiveTableFieldCompare
> => ({
  ...(hasEmployeesColumn && { employees: reactiveTableFieldCompare }),
  shifts: reactiveTableFieldCompare,
  hoursScheduled: reactiveTableFieldCompare,
  hoursWorked: reactiveTableFieldCompare,
  costsScheduled: reactiveTableFieldCompare,
  costsWorked: reactiveTableFieldCompare,
});

export const generateReportsDatePickerItem = (
  id: number, // array index
  tab: ReportsDatePickerDialogTabsType,
  label: string,
  startDate: Date,
  endDate: Date,
  timezone: string,
): ReportsDatePickerItemType => ({
  id: `${tab}_${id}`,
  tab,
  label,
  startDate,
  endDate,
  dateLabel: formatDatePeriod(
    startDate,
    exclusiveDisplayDate(endDate, timezone),
    timezone,
    {
      day: '{date}',
      month: '{month-short}',
      year: '{year}',
    },
  ),
});

const getReportsDatePickerTodayItems = (
  now: Date,
  timezone: string,
): ReportsDatePickerItemType[] => {
  const tab = ReportsDatePickerDialogTabsEnum.Today;
  const prevDay = subtractDays(now, 1, timezone);

  return [
    generateReportsDatePickerItem(
      1,
      tab,
      i18n.tc('time.yesterday'),
      startOfDay(prevDay, timezone),
      startOfDay(now, timezone),
      timezone,
    ),
    generateReportsDatePickerItem(
      2,
      tab,
      i18n.tc('time.today'),
      startOfDay(now, timezone),
      startOfNextDay(now, timezone),
      timezone,
    ),
  ];
};
const getReportsDatePickerWeekItems = (
  now: Date,
  timezone: string,
): ReportsDatePickerItemType[] => {
  const { startOfWeek } = store.state.settings.companySettings || {};

  const tab = ReportsDatePickerDialogTabsEnum.Week;
  const sevenDaysBefore = subtractDays(now, 7, timezone);
  const [currentWeekStart, currentWeekEnd] = getCurrentWeekPeriod(
    timezone,
    startOfWeek,
    now,
  );
  const [lastWeekStart, lastWeekEnd] = getCurrentWeekPeriod(
    timezone,
    startOfWeek,
    sevenDaysBefore,
  );

  return [
    generateReportsDatePickerItem(
      1,
      tab,
      i18n.tc('time.lastSevenDays'),
      startOfDay(sevenDaysBefore, timezone),
      startOfNextDay(now, timezone),
      timezone,
    ),
    generateReportsDatePickerItem(
      2,
      tab,
      i18n.tc('time.thisWeek'),
      currentWeekStart,
      currentWeekEnd,
      timezone,
    ),
    generateReportsDatePickerItem(
      3,
      tab,
      i18n.tc('time.lastWeek'),
      lastWeekStart,
      lastWeekEnd,
      timezone,
    ),
  ];
};
const getReportsDatePickerMonthItems = (
  now: Date,
  timezone: string,
): ReportsDatePickerItemType[] => {
  const tab = ReportsDatePickerDialogTabsEnum.Month;
  const thirtyDaysBefore = subtractDays(now, 30, timezone);
  const [currentMonthStart, currentMonthEnd] = getMonthPeriod(timezone, now);
  const [lastMonthStart, lastMonthEnd] = getMonthPeriod(
    timezone,
    thirtyDaysBefore,
  );

  return [
    generateReportsDatePickerItem(
      1,
      tab,
      i18n.tc('time.lastThirtyDays'),
      startOfDay(thirtyDaysBefore, timezone),
      startOfNextDay(now, timezone),
      timezone,
    ),
    generateReportsDatePickerItem(
      2,
      tab,
      i18n.tc('time.thisMonth'),
      currentMonthStart,
      currentMonthEnd,
      timezone,
    ),
    generateReportsDatePickerItem(
      3,
      tab,
      i18n.tc('time.lastMonth'),
      lastMonthStart,
      lastMonthEnd,
      timezone,
    ),
  ];
};
export const getReportsDatePickerItems = (): ReportsDatePickerItemsType => {
  const { timezone } = store.getters;
  const now = spacetime.now(timezone).toNativeDate();

  return {
    [ReportsDatePickerDialogTabsEnum.Today]: getReportsDatePickerTodayItems(
      now,
      timezone,
    ),
    [ReportsDatePickerDialogTabsEnum.Week]: getReportsDatePickerWeekItems(
      now,
      timezone,
    ),
    [ReportsDatePickerDialogTabsEnum.Month]: getReportsDatePickerMonthItems(
      now,
      timezone,
    ),
    [ReportsDatePickerDialogTabsEnum.Custom]: [],
  };
};

export const getDefaultReportsDatePickerItem =
  (): ReportsDatePickerItemType => {
    const dateItems = getReportsDatePickerItems();
    return dateItems[ReportsDatePickerDialogTabsEnum.Month][0];
  };
