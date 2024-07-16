import i18n from '@/i18n';
import { getFilterValues, toFilterItem } from '@/lib/filters/filterHelpers';
import { ReportsFiltersType } from './reportsTypes';

const publishedShiftStatusItem = {
  name: i18n.tc('label.published'),
  value: true,
};
export const shiftStatusesList: { name: string; value: boolean | null }[] = [
  publishedShiftStatusItem,
  {
    name: i18n.tc('label.unpublished'),
    value: false,
  },
  {
    name: i18n.tc('label.publishedAndUnpublished'),
    value: null,
  },
];

export const getDefaultReportsFilters =
  (): ReportsFiltersType => ({
    locationIds: [],
    employeeIds: [],
    jobRoleIds: [],
    groupIds: [],
    shiftStatus: [
      toFilterItem(
        publishedShiftStatusItem.value,
        publishedShiftStatusItem.name,
        'shiftStatus',
      ),
    ],
  });

export const parseReportsFilters = (
  filters: ReportsFiltersType,
) => {
  const { locationIds, employeeIds, groupIds, jobRoleIds, shiftStatus } =
    filters;
  // published shifts - true
  // unpublished shifts - false
  // published and unpublished shifts - empty array (null)
  const publishedShifts = getFilterValues(shiftStatus)?.[0] ?? null;
  // reports list request payload
  return {
    ...(locationIds.length && { locationIds: getFilterValues(locationIds) }),
    ...(employeeIds.length && { employeeIds: getFilterValues(employeeIds) }),
    ...(groupIds.length && { employeeGroupIds: getFilterValues(groupIds) }),
    ...(jobRoleIds.length && { jobRoleIds: getFilterValues(jobRoleIds) }),
    ...(publishedShifts !== null && { publishedShifts }),
  };
};
