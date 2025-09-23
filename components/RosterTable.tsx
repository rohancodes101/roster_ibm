
import React, { forwardRef } from 'react';
// FIX: Import ScheduleType to use it for accessing coverage gap style.
import { Roster, Employee, CoverageIssue, ScheduleType } from '../types';
import { getDatesInRange } from '../services/rosterService';
import { STYLE_MAP } from '../constants';

interface RosterTableProps {
    roster: Roster;
    employees: Employee[];
    startDate: string;
    endDate: string;
    coverageIssues: CoverageIssue[];
}

export const RosterTable = forwardRef<HTMLDivElement, RosterTableProps>(({ roster, employees, startDate, endDate, coverageIssues }, ref) => {
    const dates = getDatesInRange(new Date(startDate), new Date(endDate));

    const getDayInitial = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
    };
    
    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    };

    return (
        <div className="overflow-x-auto" ref={ref}>
            <div className="bg-gray-900 p-4 rounded-lg inline-block min-w-full">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="sticky left-0 bg-gray-700 z-10 p-2 border-r border-gray-600 text-left text-sm font-semibold text-gray-200">Employee</th>
                            {dates.map(date => {
                                const dateString = date.toISOString().split('T')[0];
                                const dayInitial = getDayInitial(date);
                                const dayOfMonth = date.getDate();
                                return (
                                    <th key={dateString} className={`p-2 text-center text-xs font-semibold ${isWeekend(date) ? 'bg-gray-800/50' : ''}`}>
                                        <div className="flex flex-col items-center">
                                            <span>{dayInitial}</span>
                                            <span className="text-lg">{dayOfMonth}</span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee, index) => (
                            <tr key={employee.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                <td className={`sticky left-0 z-10 p-2 border-r border-gray-700 text-sm font-medium whitespace-nowrap ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/70'}`}>{employee.name}</td>
                                {dates.map(date => {
                                    const dateString = date.toISOString().split('T')[0];
                                    const scheduleEntry = roster[employee.id]?.[dateString];
                                    const isGap = scheduleEntry?.isGap ?? false;
                                    
                                    // FIX: Correctly determine cell style, prioritizing coverage gaps.
                                    // Using STYLE_MAP[ScheduleType.COVERAGE_GAP] instead of STYLE_MAP.COVERAGE_GAP fixes the type error.
                                    const cellStyle = isGap
                                        ? STYLE_MAP[ScheduleType.COVERAGE_GAP]
                                        : (scheduleEntry ? STYLE_MAP[scheduleEntry.type] : 'bg-gray-800');

                                    return (
                                        <td key={`${employee.id}-${dateString}`} className={`p-2 text-center text-xs font-medium whitespace-nowrap border-l border-gray-700 ${cellStyle} ${isWeekend(date) ? 'bg-opacity-50' : ''}`}>
                                            {scheduleEntry?.type || ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
