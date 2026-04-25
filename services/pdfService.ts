
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Tenant } from '../types';

// Updated high-quality version of the logo for the PDF

const formatCurrency = (amount: number) => `INR ${amount.toLocaleString()}`;

export const exportTenantStatement = (tenant: Tenant) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Branding Header
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Add Logo
  try {
    doc.addImage('/images/logo.png', 'PNG', 15, 10, 25, 25);
  } catch(e) {
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.circle(27, 22, 12, 'S');
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('STATEMENT OF ACCOUNT', pageWidth - 15, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 15, 28, { align: 'right' });

  // Tenant Info
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resident Details', 15, 60);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${tenant.fullName}`, 15, 68);
  doc.text(`Contact: ${tenant.phone}`, 15, 74);
  doc.text(`Email: ${tenant.email}`, 15, 80);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Property Info', 120, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Address: ${tenant.propertyAddress}`, 120, 68);
  doc.text(`Monthly Rent: ${formatCurrency(tenant.monthlyRent)}`, 120, 74);
  doc.text(`Advance Paid: ${formatCurrency(tenant.advancePayment || 0)}`, 120, 80);

  const tableData = (tenant.paymentHistory || []).map(p => [
    new Date(p.date).toLocaleDateString(),
    p.method,
    formatCurrency(p.amount),
    p.status.toUpperCase(),
    p.reference || 'N/A'
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Date', 'Method', 'Amount', 'Status', 'Reference']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontSize: 10, halign: 'center' },
    bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'center' } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  const totalPaid = tenant.paymentHistory?.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) || 0;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Collections', pageWidth - 80, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(totalPaid), pageWidth - 15, finalY, { align: 'right' });

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('Rental Track Pro Digital Statement - Secure Asset Management', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  doc.save(`${tenant.fullName.replace(/\s+/g, '_')}_Statement.pdf`);
};

export const generateInvoicePDF = (tenant: Tenant, amount: number) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 55, 'F');
  
  try {
    doc.addImage('/images/logo.png', 'PNG', 15, 12, 30, 30);
  } catch(e) {
    doc.setDrawColor(255, 255, 255);
    doc.circle(30, 27, 15, 'S');
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RENT INVOICE', pageWidth - 15, 25, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ref: INV-${Math.floor(Date.now() / 100000)}`, pageWidth - 15, 35, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 15, 42, { align: 'right' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To:', 15, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(tenant.fullName, 15, 83);
  doc.text(tenant.propertyAddress, 15, 90);
  doc.text(tenant.phone, 15, 97);

  autoTable(doc, {
    startY: 110,
    head: [['Description', 'Period', 'Total Amount']],
    body: [
      ['Monthly Rent Charge', `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`, formatCurrency(amount)],
      ['Property Maintenance', 'Cycle Period', 'INR 0.00'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
    columnStyles: { 2: { halign: 'right' } }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', pageWidth - 100, finalY);
  doc.text(formatCurrency(amount), pageWidth - 15, finalY, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Remittance Details:', 15, finalY + 30);
  doc.setFont('helvetica', 'normal');
  doc.text('Beneficiary: RENTAL TRACK ASSETS PVT LTD', 15, finalY + 38);
  doc.text('Bank: HDFC Bank | Account: XXXXXXXXXX', 15, finalY + 44);
  doc.text('IFSC Code: HDFC0001234', 15, finalY + 50);

  doc.save(`Invoice_${tenant.fullName.split(' ')[0]}.pdf`);
};
