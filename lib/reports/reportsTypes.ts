import { FilterItem } from '@/lib/filters/filterHelpers';

export type ReportsFiltersType = {
  locationIds: FilterItem<number>[];
  employeeIds: FilterItem<number>[];
  jobRoleIds: FilterItem<number>[];
  groupIds: FilterItem<number>[];
  shiftStatus: FilterItem<boolean>[];
};

export type ReportsCommonResponseFieldsType = {
  id?: number | string; // v-for key
  employees?: number;
  shifts: number;
  hoursScheduled: number | null;
  hoursWorked: number | null;
  costsScheduled: number | null;
  costsWorked: number | null;
};

// first column data fields for reports pages
export type ReportsRecord =
  ReportsCommonResponseFieldsType & {
    date?: Date;
    name?: string; // employee full name
  };

export const ReportsDatePickerDialogTabsEnum = {
  Today: 'today',
  Week: 'week',
  Month: 'month',
  Custom: 'custom',
} as const;
export type ReportsDatePickerDialogTabsType =
  typeof ReportsDatePickerDialogTabsEnum[keyof typeof ReportsDatePickerDialogTabsEnum];

export type ReportsDatePickerItemType = {
  id?: string; // safe way to identify an active item
  tab: ReportsDatePickerDialogTabsType;
  label: string; // represents date range shortly with just words
  dateLabel: string;
  startDate: Date;
  endDate: Date;
};

export type ReportsDatePickerItemsType = Record<
  ReportsDatePickerDialogTabsType,
  ReportsDatePickerItemType[]
>;

export type ReportsDatePickerBodyPropsType = {
  value: ReportsDatePickerItemType;
  errorMessage: string | null;
  setLocalDateItem: (value: ReportsDatePickerItemType) => void;
  shortDateRange?: boolean;
};
export type ReportsDatePickerFooterPropsType = {
  applyButtonDisabled: boolean;
  closeModal: () => void;
  setDateItem: () => void;
};
