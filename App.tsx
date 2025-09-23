import React, { useState, useCallback, useRef, useEffect } from 'react';
import { RosterControls } from './components/RosterControls';
import { RosterTable } from './components/RosterTable';
import { generateRoster } from './services/rosterService';
import { exportToImage, exportToExcel } from './services/exportService';
import { Employee, Roster, CoverageIssue, WeekOffPreference } from './types';
import { INITIAL_EMPLOYEES } from './constants';
import { LogoIcon, LoadingIcon } from './components/Icons';

const App: React.FC = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(lastDay.toISOString().split('T')[0]);
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [roster, setRoster] = useState<Roster | null>(null);
    const [coverageIssues, setCoverageIssues] = useState<CoverageIssue[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [teamAShift, setTeamAShift] = useState<1 | 2>(1);
    
    const rosterTableRef = useRef<HTMLDivElement>(null);

    const handleEmployeeUpdate = useCallback((updatedEmployees: Employee[]) => {
        const updatesById = new Map(updatedEmployees.map(e => [e.id, e]));
        setEmployees(prev => 
            prev.map(emp => updatesById.get(emp.id) || emp)
        );
    }, []);

    const handleGenerateClick = useCallback(() => {
        setIsLoading(true);
        // Use a timeout to allow the loading spinner to render before the heavy computation starts
        setTimeout(() => {
            try {
                const { schedule, issues } = generateRoster(employees, startDate, endDate, teamAShift);
                setRoster(schedule);
                setCoverageIssues(issues);
            } catch (error) {
                console.error("Error generating roster:", error);
                alert("An error occurred while generating the roster. Please check the console for details.");
            } finally {
                setIsLoading(false);
            }
        }, 50);
    }, [employees, startDate, endDate, teamAShift]);

    const handleExportImage = useCallback(() => {
        // The ref is on the scroll container. We need to capture its child, which has the full width.
        const contentToCapture = rosterTableRef.current?.firstElementChild as HTMLElement;
        if (contentToCapture) {
            exportToImage(contentToCapture, `roster-${startDate}-to-${endDate}.png`);
        }
    }, [startDate, endDate]);

    const handleExportExcel = useCallback(() => {
        if (roster && employees && startDate && endDate) {
            exportToExcel(roster, employees, startDate, endDate, `roster-${startDate}-to-${endDate}.xlsx`);
        }
    }, [roster, employees, startDate, endDate]);

    // Generate roster on initial load
    useEffect(() => {
        handleGenerateClick();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-screen-2xl mx-auto">
                <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        <LogoIcon />
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Intelligent Roster Generator</h1>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 xl:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
                        <RosterControls
                            startDate={startDate}
                            setStartDate={setStartDate}
                            endDate={endDate}
                            setEndDate={setEndDate}
                            employees={employees}
                            onEmployeeUpdate={handleEmployeeUpdate}
                            onGenerate={handleGenerateClick}
                            isLoading={isLoading}
                            teamAShift={teamAShift}
                            onShiftChange={setTeamAShift}
                        />
                    </div>

                    <div className="lg:col-span-8 xl:col-span-9">
                        {isLoading && (
                            <div className="flex justify-center items-center h-96 bg-gray-800 rounded-lg">
                               <LoadingIcon />
                               <p className="ml-4 text-xl">Generating Roster...</p>
                            </div>
                        )}
                        {!isLoading && roster && (
                             <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold mb-4 sm:mb-0">Generated Roster</h2>
                                    <div className="flex gap-3">
                                        <button onClick={handleExportImage} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75">
                                            Export as Image
                                        </button>
                                        <button onClick={handleExportExcel} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75">
                                            Export as Excel
                                        </button>
                                    </div>
                                </div>
                                <RosterTable
                                    ref={rosterTableRef}
                                    roster={roster}
                                    employees={employees}
                                    startDate={startDate}
                                    endDate={endDate}
                                    coverageIssues={coverageIssues}
                                />
                                {coverageIssues.length > 0 && (
                                    <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-lg">
                                        <h3 className="font-bold text-lg text-red-200">Coverage Warning!</h3>
                                        <p className="text-red-300 mt-2">The following asset classes have no coverage on specific dates and shifts. Please review the roster (cells marked in red) and consider adjusting leave or week-offs.</p>
                                    </div>
                                )}
                            </div>
                        )}
                         {!isLoading && !roster && (
                            <div className="flex justify-center items-center h-96 bg-gray-800 rounded-lg text-gray-500">
                                <p className="text-xl">Generate a roster to see the results.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;