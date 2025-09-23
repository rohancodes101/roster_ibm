
import { Roster, Employee } from '../types';
import { getDatesInRange } from './rosterService';

// Note: html2canvas and xlsx are loaded from CDN in index.html,
// so we declare them here to satisfy TypeScript.
declare const html2canvas: any;
declare const XLSX: any;

export const exportToImage = (element: HTMLElement, fileName: string) => {
    html2canvas(element, {
        backgroundColor: '#111827', // Match the app's background
        scale: 2, // Higher resolution
    }).then((canvas: HTMLCanvasElement) => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = fileName;
        link.click();
    });
};

export const exportToExcel = (roster: Roster, employees: Employee[], startDate: string, endDate: string, fileName:string) => {
    // FIX: Access XLSX directly instead of via window.XLSX to avoid type errors.
    // The `declare const XLSX: any;` line makes it available as a global.
    if (typeof XLSX === 'undefined') {
        console.error("XLSX library is not loaded. Cannot export to Excel.");
        alert("Excel export library failed to load. Please check your internet connection and try again.");
        return;
    }

    const dates = getDatesInRange(new Date(startDate), new Date(endDate));
    
    // Header row: Employee, then dates
    const header = ['Employee', ...dates.map(d => d.toISOString().split('T')[0])];
    
    const data = employees.map(emp => {
        const row: { [key: string]: string } = { 'Employee': emp.name };
        dates.forEach(date => {
            const dateString = date.toISOString().split('T')[0];
            const scheduleEntry = roster[emp.id]?.[dateString];
            row[dateString] = scheduleEntry ? scheduleEntry.type : '';
        });
        return row;
    });

    // FIX: Access XLSX directly instead of via window.XLSX.
    const worksheet = XLSX.utils.json_to_sheet(data, { header: header });
    
    // Set column widths for better readability
    const colWidths = [{ wch: 20 }, ...dates.map(() => ({ wch: 12 }))];
    worksheet['!cols'] = colWidths;

    // FIX: Access XLSX directly instead of via window.XLSX.
    const workbook = XLSX.utils.book_new();
    // FIX: Access XLSX directly instead of via window.XLSX.
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Roster');
    
    // FIX: Access XLSX directly instead of via window.XLSX.
    XLSX.writeFile(workbook, fileName);
};
