// FIX: Import ScheduleType to resolve reference errors.
import { Employee, AssetClass, Team, WeekOffPreference, ScheduleType } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
    // Team A
    { id: 1, name: "Ankit", assetClass: AssetClass.ACE, team: Team.A, weekOffPref: WeekOffPreference.SUN_MON, vacation: [], compOff: [] },
    { id: 2, name: "Emy", assetClass: AssetClass.ACE, team: Team.A, weekOffPref: WeekOffPreference.FRI_SAT, vacation: [], compOff: [] },
    { id: 3, name: "Mohith R", assetClass: AssetClass.CDT_EQT, team: Team.A, weekOffPref: WeekOffPreference.SUN_MON, vacation: [], compOff: [] },
    { id: 4, name: "Mallesh", assetClass: AssetClass.CDT_EQT, team: Team.A, weekOffPref: WeekOffPreference.FRI_SAT, vacation: [], compOff: [] },
    { id: 5, name: "Ashwini", assetClass: AssetClass.RATES, team: Team.A, weekOffPref: WeekOffPreference.SUN_MON, vacation: [], compOff: [] },
    { id: 6, name: "Eebad", assetClass: AssetClass.RATES, team: Team.A, weekOffPref: WeekOffPreference.FRI_SAT, vacation: [], compOff: [] },
    { id: 7, name: "Swarup T", assetClass: AssetClass.RATES, team: Team.A, weekOffPref: WeekOffPreference.SUN_MON, vacation: [], compOff: [] },
    
    // Team B
    { id: 8, name: "Sasikanth", assetClass: AssetClass.ACE, team: Team.B, weekOffPref: WeekOffPreference.SUN_MON, vacation: [], compOff: [] },
    { id: 9, name: "Madhurima", assetClass: AssetClass.ACE, team: Team.B, weekOffPref: WeekOffPreference.FRI_SAT, vacation: [], compOff: [] },
    { id: 10, name: "Ramya", assetClass: AssetClass.RATES, team: Team.B, weekOffPref: WeekOffPreference.SUN_MON, vacation: [], compOff: [] },
    { id: 11, name: "Abhijit", assetClass: AssetClass.RATES, team: Team.B, weekOffPref: WeekOffPreference.FRI_SAT, vacation: [], compOff: [] },
    { id: 12, name: "Vyom", assetClass: AssetClass.CDT_EQT, team: Team.B, weekOffPref: WeekOffPreference.SUN_MON, vacation: [], compOff: [] },
    { id: 13, name: "Gaurav", assetClass: AssetClass.CDT_EQT, team: Team.B, weekOffPref: WeekOffPreference.FRI_SAT, vacation: [], compOff: [] },
    { id: 14, name: "Siva", assetClass: AssetClass.CDT_EQT, team: Team.B, isFixedShift: true, fixedShift: 2, weekOffPref: WeekOffPreference.SUN_MON, vacation: [], compOff: [], forceSatSunOff: false },
    
    // Special
    { id: 15, name: "Swarup R", assetClass: AssetClass.ALL, team: null, isFixedShift: true, fixedShift: 2, weekOffPref: WeekOffPreference.SAT_SUN, vacation: [], compOff: [], forceSatSunOff: true }
];

export const STYLE_MAP: Record<ScheduleType, string> = {
    [ScheduleType.SHIFT1]: "bg-green-800 text-green-100",
    [ScheduleType.SHIFT2]: "bg-green-700 text-green-100",
    [ScheduleType.OFF]: "bg-gray-600 text-gray-300 font-semibold",
    [ScheduleType.VACATION]: "bg-blue-600 text-blue-100 font-semibold",
    [ScheduleType.COMP_OFF]: "bg-yellow-600 text-yellow-100 font-semibold",
    [ScheduleType.COVERAGE_GAP]: "bg-red-600 text-white font-bold animate-pulse",
};