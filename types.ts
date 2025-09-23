
export enum AssetClass {
    ACE = "ACE",
    RATES = "RATES",
    CDT_EQT = "CDT & EQT",
    ALL = "ALL"
}

export enum Team {
    A = "A",
    B = "B"
}

export enum WeekOffPreference {
    FRI_SAT = "Fri-Sat",
    SUN_MON = "Sun-Mon",
    SAT_SUN = "Sat-Sun"
}

export interface Employee {
    id: number;
    name: string;
    assetClass: AssetClass;
    team: Team | null;
    isFixedShift?: boolean;
    fixedShift?: number;
    weekOffPref: WeekOffPreference;
    vacation: string[]; // dates in 'YYYY-MM-DD' format
    compOff: string[]; // dates in 'YYYY-MM-DD' format
    forceSatSunOff?: boolean;
}

export enum ScheduleType {
    SHIFT1 = "Shift 1",
    SHIFT2 = "Shift 2",
    OFF = "OFF",
    VACATION = "Vacation",
    COMP_OFF = "Comp Off",
    COVERAGE_GAP = "GAP"
}

export interface ScheduleEntry {
    type: ScheduleType;
    isGap: boolean;
}

export type Roster = Record<number, Record<string, ScheduleEntry>>;

export interface CoverageIssue {
    date: string;
    shift: number;
    assetClass: AssetClass;
}
