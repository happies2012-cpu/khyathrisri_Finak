import { DataItem } from '../../types/data';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const exportToCSV = (data: DataItem[], filename: string = 'data-export.csv') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (data: DataItem[], filename: string = 'data-export.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, filename);
};

export const exportSelectedToCSV = (data: DataItem[], selectedIds: string[], filename?: string) => {
  const selectedData = data.filter(item => selectedIds.includes(item.id));
  exportToCSV(selectedData, filename);
};

export const exportSelectedToExcel = (data: DataItem[], selectedIds: string[], filename?: string) => {
  const selectedData = data.filter(item => selectedIds.includes(item.id));
  exportToExcel(selectedData, filename);
};