import React, { useState } from 'react';
import { Employee, WeekOffPreference } from '../types';
import { CalendarIcon, UserGroupIcon, GenerateIcon, LoadingIcon, ChevronDownIcon, AddIcon, RemoveIcon, SwapIcon } from './Icons';

interface RosterControlsProps {
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    employees: Employee[];
    onEmployeeUpdate: (employees: Employee[]) => void;
    onGenerate: () => void;
    isLoading: boolean;
    teamAShift: 1 | 2;
    onShiftChange: (shift: 1 | 2) => void;
}

interface DateListInputProps {
    label: string;
    dates: string[];
    onDatesChange: (dates: string[]) => void;
    dateRange: { start: string, end: string };
}

const DateListInput: React.FC<DateListInputProps> = ({ label, dates, onDatesChange, dateRange }) => {
    const handleDateChange = (index: number, value: string) => {
        const newDates = [...dates];
        newDates[index] = value;
        onDatesChange(newDates);
    };

    const handleAddDate = () => {
        onDatesChange([...dates, '']);
    };

    const handleRemoveDate = (index: number) => {
        onDatesChange(dates.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label className="text-xs text-gray-400 block mb-1">{label}</label>
            <div className="space-y-2">
                {dates.map((date, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => handleDateChange(index, e.target.value)}
                            min={dateRange.start}
                            max={dateRange.end}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                         <button onClick={() => handleRemoveDate(index)} className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded-full">
                            <RemoveIcon />
                        </button>
                    </div>
                ))}
                 <button onClick={handleAddDate} className="w-full flex items-center justify-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 bg-indigo-900/50 hover:bg-indigo-900/80 rounded-md py-1">
                    <AddIcon /> Add {label} Day
                </button>
            </div>
        </div>
    );
}

const EmployeeControl: React.FC<{ employee: Employee; allEmployees: Employee[]; onUpdate: (employees: Employee[]) => void; dateRange: { start: string, end: string }, isExpanded: boolean, onToggle: () => void }> = ({ employee, allEmployees, onUpdate, dateRange, isExpanded, onToggle }) => {
    
    const handleDatesChange = (field: 'vacation' | 'compOff', newDates: string[]) => {
        onUpdate([{ ...employee, [field]: newDates }]);
    };

    const handleWeekOffChange = (newPref: WeekOffPreference) => {
        const selfUpdate = { ...employee, weekOffPref: newPref };
        const updates: Employee[] = [selfUpdate];

        // Only pair for Fri-Sat and Sun-Mon
        if (newPref === WeekOffPreference.FRI_SAT || newPref === WeekOffPreference.SUN_MON) {
             const oppositePref = newPref === WeekOffPreference.FRI_SAT ? WeekOffPreference.SUN_MON : WeekOffPreference.FRI_SAT;
            
            // Find a partner in the same team & asset class who isn't this employee and doesn't have a forced week-off
            const partner = allEmployees.find(e => 
                e.id !== employee.id && 
                e.team === employee.team && 
                e.assetClass === employee.assetClass && 
                !e.forceSatSunOff
            );

            if (partner) {
                const partnerUpdate = { ...partner, weekOffPref: oppositePref };
                updates.push(partnerUpdate);
            }
        }
        
        onUpdate(updates);
    };
    
    return (
        <div className="bg-gray-700/50 rounded-md transition-all duration-300">
            <button onClick={onToggle} className="w-full flex justify-between items-center p-3 text-left">
                <p className="font-bold text-white">{employee.name} <span className="text-xs font-normal text-indigo-300 bg-indigo-900/50 px-2 py-1 rounded-full ml-2">{employee.assetClass}</span></p>
                <ChevronDownIcon className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="p-4 border-t border-gray-600/50 space-y-4">
                    <DateListInput 
                        label="Vacation"
                        dates={employee.vacation}
                        onDatesChange={(newDates) => handleDatesChange('vacation', newDates)}
                        dateRange={dateRange}
                    />
                     <DateListInput 
                        label="Comp Off"
                        dates={employee.compOff}
                        onDatesChange={(newDates) => handleDatesChange('compOff', newDates)}
                        dateRange={dateRange}
                    />
                    {!employee.forceSatSunOff && (
                         <div>
                            <label className="text-xs text-gray-400 block mb-2">Week Off</label>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {[WeekOffPreference.FRI_SAT, WeekOffPreference.SUN_MON].map(pref => (
                                    <label key={pref} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`weekoff-${employee.id}`}
                                            value={pref}
                                            checked={employee.weekOffPref === pref}
                                            onChange={() => handleWeekOffChange(pref)}
                                            className="form-radio bg-gray-800 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                                        />
                                        {pref}
                                    </label>
                                ))}
                                {employee.name === "Siva" && (
                                     <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`weekoff-${employee.id}`}
                                            value={WeekOffPreference.SAT_SUN}
                                            checked={employee.weekOffPref === WeekOffPreference.SAT_SUN}
                                            onChange={() => handleWeekOffChange(WeekOffPreference.SAT_SUN)}
                                            className="form-radio bg-gray-800 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                                        />
                                        {WeekOffPreference.SAT_SUN}
                                    </label>
                                )}
                            </div>
                        </div>
                    )}
                     {employee.forceSatSunOff && (
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Week Off</label>
                            <p className="text-sm bg-gray-800 border border-gray-600 rounded-md px-2 py-1">Saturday-Sunday (Fixed)</p>
                        </div>
                     )}
                </div>
            )}
        </div>
    );
};


export const RosterControls: React.FC<RosterControlsProps> = ({ startDate, setStartDate, endDate, setEndDate, employees, onEmployeeUpdate, onGenerate, isLoading, teamAShift, onShiftChange }) => {
    const [expandedId, setExpandedId] = useState<number | null>(employees[0]?.id || null);

    const handleToggle = (id: number) => {
        setExpandedId(prevId => prevId === id ? null : id);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><CalendarIcon /> Roster Period</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full bg-gray-700 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                             min={startDate}
                            className="w-full bg-gray-700 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><SwapIcon /> Shift Assignment</h2>
                <div className="flex items-center justify-around p-3 bg-gray-700/50 rounded-lg">
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-400">Team A</p>
                        <p className="font-bold text-lg text-white">{teamAShift === 1 ? 'Shift 1' : 'Shift 2'}</p>
                    </div>
                    <button
                        onClick={() => onShiftChange(teamAShift === 1 ? 2 : 1)}
                        aria-label="Swap shifts between Team A and Team B"
                        className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-transform duration-300 transform hover:rotate-180 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                    >
                        <SwapIcon className="h-5 w-5 text-white" />
                    </button>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-400">Team B</p>
                        <p className="font-bold text-lg text-white">{teamAShift === 1 ? 'Shift 2' : 'Shift 1'}</p>
                    </div>
                </div>
            </div>

             <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><UserGroupIcon /> Employee Settings</h2>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                    {employees.map(emp => (
                        <EmployeeControl 
                            key={emp.id} 
                            employee={emp} 
                            allEmployees={employees}
                            onUpdate={onEmployeeUpdate} 
                            dateRange={{ start: startDate, end: endDate }}
                            isExpanded={expandedId === emp.id}
                            onToggle={() => handleToggle(emp.id)}
                        />
                    ))}
                </div>
            </div>

             <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
                {isLoading ? <><LoadingIcon /> Generating...</> : <><GenerateIcon/> Generate Roster</>}
            </button>
        </div>
    );
};