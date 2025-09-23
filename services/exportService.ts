import { Roster, Employee } from '../types';
import { getDatesInRange } from './rosterService';

/**
 * Polls for a globally available library on the window object.
 * @param name The name of the library on the window object (e.g., 'XLSX').
 * @param timeout The maximum time to wait in milliseconds.
 * @returns A promise that resolves with the library object.
 */
function waitForGlobal<T>(name: string, timeout = 3000): Promise<T> {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            const lib = (window as any)[name];
            if (lib) {
                resolve(lib as T);
            } else if (Date.now() - start > timeout) {
                reject(new Error(`${name} library not loaded after ${timeout}ms.`));
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

export const exportToImage = async (element: HTMLElement, fileName: string) => {
    let stickyElements: Element[] = [];
    try {
        const html2canvas = await waitForGlobal<any>('html2canvas');

        // Temporarily remove sticky positioning to prevent rendering issues
        stickyElements = Array.from(element.querySelectorAll('.sticky'));
        stickyElements.forEach(el => el.classList.remove('sticky'));
        
        // Allow a tick for the DOM to update before capturing
        await new Promise(resolve => setTimeout(resolve, 0));

        const canvas = await html2canvas(element, {
            backgroundColor: '#111827',
            scale: 2,
            useCORS: true, // Attempt to load images from other origins
        });

        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Failed to export to image:", error);
        alert("Image export failed. The required library might be blocked or failed to load. Please check your network and browser console.");
    } finally {
        // Ensure sticky positioning is always restored
        stickyElements.forEach(el => el.classList.add('sticky'));
    }
};

export const exportToExcel = async (roster: Roster, employees: Employee[], startDate: string, endDate: string, fileName: string) => {
    try {
        const XLSX = await waitForGlobal<any>('XLSX');

        const dates = getDatesInRange(new Date(startDate), new Date(endDate));
        
        const header = ['Employee', ...dates.map(d => d.toISOString().split('T')[0])];
        
        const dataRows = employees.map(emp => {
            const rowData: string[] = [emp.name];
            dates.forEach(date => {
                const dateString = date.toISOString().split('T')[0];
                const scheduleEntry = roster[emp.id]?.[dateString];
                rowData.push(scheduleEntry ? scheduleEntry.type : '');
            });
            return rowData;
        });

        const worksheetData = [header, ...dataRows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Set column widths for better readability
        const colWidths = [{ wch: 20 }, ...dates.map(() => ({ wch: 12 }))];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Roster');
        
        XLSX.writeFile(workbook, fileName);

    } catch (error) {
        console.error("Failed to export to Excel:", error);
        alert("Excel export failed. The required library might be blocked or failed to load. Please check your network and browser console.");
    }
};