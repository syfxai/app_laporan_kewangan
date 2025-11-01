
import { Transaction, Category } from '../types';

declare const jspdf: any;
declare const XLSX: any;

export const exportToPDF = (transactions: Transaction[], categories: Category[], period: string) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF();
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  doc.text(`Laporan Kewangan - ${period}`, 14, 16);
  
  const tableColumn = ["Tarikh", "Jenis", "Keterangan", "Kategori", "Jumlah (RM)"];
  const tableRows: (string | number)[][] = [];

  transactions.forEach(transaction => {
    const transactionData = [
      transaction.date,
      transaction.type === 'income' ? 'Masuk' : 'Keluar',
      transaction.description,
      categoryMap.get(transaction.categoryId) || 'N/A',
      transaction.amount.toFixed(2),
    ];
    tableRows.push(transactionData);
  });
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  tableRows.push(['', '', '', 'Jumlah Masuk:', totalIncome.toFixed(2)]);
  tableRows.push(['', '', '', 'Jumlah Keluar:', totalExpense.toFixed(2)]);
  tableRows.push(['', '', '', 'Baki:', balance.toFixed(2)]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 24,
    theme: 'grid',
    headStyles: { fillColor: [4, 120, 87] }, // Primary-700 color
    styles: { font: 'helvetica', fontSize: 10 },
  });

  doc.save(`laporan_kewangan_${period.replace(/ /g, '_')}.pdf`);
};

export const exportToExcel = (transactions: Transaction[], categories: Category[], period: string) => {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  const data = transactions.map(transaction => ({
    Tarikh: transaction.date,
    Jenis: transaction.type === 'income' ? 'Masuk' : 'Keluar',
    Keterangan: transaction.description,
    Kategori: categoryMap.get(transaction.categoryId) || 'N/A',
    'Jumlah (RM)': transaction.amount,
  }));
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;
  
  data.push({} as any); // Spacer row
  data.push({ Keterangan: 'Jumlah Masuk:', 'Jumlah (RM)': totalIncome } as any);
  data.push({ Keterangan: 'Jumlah Keluar:', 'Jumlah (RM)': totalExpense } as any);
  data.push({ Keterangan: 'Baki:', 'Jumlah (RM)': balance } as any);

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kewangan");

  XLSX.writeFile(workbook, `laporan_kewangan_${period.replace(/ /g, '_')}.xlsx`);
};
