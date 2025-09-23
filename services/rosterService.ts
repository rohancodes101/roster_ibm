import { Employee, Roster, CoverageIssue, ScheduleType, AssetClass, Team, WeekOffPreference } from '../types';

export const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate.toISOString().slice(0, 10) + 'T00:00:00Z');
    const finalDate = new Date(endDate.toISOString().slice(0, 10) + 'T00:00:00Z');
    
    while (currentDate <= finalDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

export const generateRoster = (employees: Employee[], startDateStr: string, endDateStr: string, teamAShift: 1 | 2): { schedule: Roster, issues: CoverageIssue[] } => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const dates = getDatesInRange(startDate, endDate);
    const schedule: Roster = {};

    // 1. Initialize schedule for all employees
    employees.forEach(emp => {
        schedule[emp.id] = {};
    });

    // 2. Assign base shifts and apply fixed leaves (Vacation, Comp Off)
    dates.forEach(date => {
        const dateString = date.toISOString().split('T')[0];
        employees.forEach(emp => {
            if (emp.vacation.includes(dateString)) {
                schedule[emp.id][dateString] = { type: ScheduleType.VACATION, isGap: false };
            } else if (emp.compOff.includes(dateString)) {
                schedule[emp.id][dateString] = { type: ScheduleType.COMP_OFF, isGap: false };
            } else {
                let shiftType = ScheduleType.OFF;
                const teamBShift = teamAShift === 1 ? 2 : 1;
                
                if (emp.fixedShift) {
                    shiftType = emp.fixedShift === 1 ? ScheduleType.SHIFT1 : ScheduleType.SHIFT2;
                } else if (emp.team === Team.A) {
                    shiftType = teamAShift === 1 ? ScheduleType.SHIFT1 : ScheduleType.SHIFT2;
                } else if (emp.team === Team.B) {
                    shiftType = teamBShift === 1 ? ScheduleType.SHIFT1 : ScheduleType.SHIFT2;
                }
                schedule[emp.id][dateString] = { type: shiftType, isGap: false };
            }
        });
    });
    
    // 3. Assign week-offs
    const getWeekIdentifier = (date: Date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return `${date.getFullYear()}-${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)}`;
    };

    const assignedWeekOffs: Record<string, number[]> = {}; // weekIdentifier: [employeeId]

    dates.forEach(date => {
        const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const dateString = date.toISOString().split('T')[0];
        const weekId = getWeekIdentifier(date);
        
        if (!assignedWeekOffs[weekId]) assignedWeekOffs[weekId] = [];

        employees.forEach(emp => {
            if (assignedWeekOffs[weekId].includes(emp.id) || schedule[emp.id][dateString].type === ScheduleType.VACATION || schedule[emp.id][dateString].type === ScheduleType.COMP_OFF) {
                return;
            }

            let takeOff = false;
            if (emp.forceSatSunOff && (day === 6 || day === 0)) {
                takeOff = true;
            } else {
                 switch (emp.weekOffPref) {
                    case WeekOffPreference.FRI_SAT:
                        if (day === 5 || day === 6) takeOff = true;
                        break;
                    case WeekOffPreference.SUN_MON:
                        if (day === 0 || day === 1) takeOff = true;
                        break;
                    case WeekOffPreference.SAT_SUN:
                         if (day === 6 || day === 0) takeOff = true;
                        break;
                }
            }

            if(takeOff) {
                schedule[emp.id][dateString] = { type: ScheduleType.OFF, isGap: false };
                // Also mark adjacent day if needed, and mark as assigned for the week
                const adjacentDate = new Date(date);
                if (emp.weekOffPref === WeekOffPreference.FRI_SAT) {
                    adjacentDate.setDate(day === 5 ? date.getDate() + 1 : date.getDate() - 1);
                } else if (emp.weekOffPref === WeekOffPreference.SUN_MON) {
                    adjacentDate.setDate(day === 0 ? date.getDate() + 1 : date.getDate() - 1);
                } else if (emp.weekOffPref === WeekOffPreference.SAT_SUN || emp.forceSatSunOff) {
                    adjacentDate.setDate(day === 6 ? date.getDate() - 6 : date.getDate() + 1); // Sunday -> Sat, Sat -> Sun. Logic is tricky with week ends
                }
                const adjDateString = adjacentDate.toISOString().split('T')[0];
                 if(schedule[emp.id][adjDateString] && schedule[emp.id][adjDateString].type !== ScheduleType.VACATION && schedule[emp.id][adjDateString].type !== ScheduleType.COMP_OFF){
                    schedule[emp.id][adjDateString] = { type: ScheduleType.OFF, isGap: false };
                 }

                assignedWeekOffs[weekId].push(emp.id);
            }
        });
    });


    // 4. Validate coverage and find issues
    const issues: CoverageIssue[] = [];
    const assetClasses: AssetClass[] = [AssetClass.ACE, AssetClass.RATES, AssetClass.CDT_EQT];
    
    dates.forEach(date => {
        const dateString = date.toISOString().split('T')[0];
        
        for (let shift of [1, 2]) {
            assetClasses.forEach(ac => {
                const employeesOnShift = employees.filter(emp => {
                    const entry = schedule[emp.id][dateString];
                    if (!entry || [ScheduleType.OFF, ScheduleType.VACATION, ScheduleType.COMP_OFF].includes(entry.type)) {
                        return false;
                    }
                    const onDuty = (shift === 1 && entry.type === ScheduleType.SHIFT1) || (shift === 2 && entry.type === ScheduleType.SHIFT2);
                    const coversAsset = emp.assetClass === ac || emp.assetClass === AssetClass.ALL;
                    return onDuty && coversAsset;
                });

                if (employeesOnShift.length === 0) {
                    issues.push({ date: dateString, shift, assetClass: ac });
                }
            });
        }
    });

    // 5. Mark gaps in the schedule for visual feedback
    issues.forEach(issue => {
        // Find a placeholder employee cell to mark the gap
        const empToMark = employees.find(e => {
            const coversAsset = e.assetClass === issue.assetClass || e.assetClass === AssetClass.ALL;
            
            const teamAShiftType = teamAShift === 1 ? ScheduleType.SHIFT1 : ScheduleType.SHIFT2;
            const teamBShiftType = teamAShift === 1 ? ScheduleType.SHIFT2 : ScheduleType.SHIFT1;
            const issueShiftType = issue.shift === 1 ? ScheduleType.SHIFT1 : ScheduleType.SHIFT2;
            
            const correctShiftTeam = (issueShiftType === teamAShiftType && e.team === Team.A) || 
                                     (issueShiftType === teamBShiftType && e.team === Team.B) || 
                                     e.assetClass === AssetClass.ALL; // Keep ALL as a catch-all

            return coversAsset && correctShiftTeam;
        });

        if (empToMark && schedule[empToMark.id][issue.date].type !== ScheduleType.VACATION) {
             schedule[empToMark.id][issue.date].isGap = true;
        }
    });


    return { schedule, issues };
};