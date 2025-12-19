import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

export interface InvoiceData {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  items: any[];
  createdAt: string;
  dueDate: string;
  taxAmount: number;
  discountAmount: number;
}

export async function generateInvoice(orderId: string): Promise<InvoiceData> {
  // Get order details
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Order not found');
  }

  // Mock order items for now - in production, fetch from order_items table
  const orderItems = [
    {
      service_name: 'VPS Hosting',
      quantity: 1,
      unit_price: order.amount_cents / 100,
      total_price: order.amount_cents / 100
    }
  ];

  // Calculate tax and totals
  const subtotal = order.amount_cents / 100;
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const invoiceData: InvoiceData = {
    id: `INV-${orderId.slice(-8).toUpperCase()}`,
    orderId,
    userId: order.user_id,
    amount: total,
    currency: order.currency || 'USD',
    status: 'paid',
    items: order.order_items || [],
    createdAt: order.created_at,
    dueDate: order.created_at, // For immediate payment
    taxAmount,
    discountAmount: 0
  };

  return invoiceData;
}

export function generatePDFInvoice(invoice: InvoiceData): Promise<Blob> {
  return new Promise((resolve) => {
    const pdf = new jsPDF();

    // Header
    pdf.setFontSize(20);
    pdf.text('KSFoundation Invoice', 20, 30);

    pdf.setFontSize(12);
    pdf.text(`Invoice #: ${invoice.id}`, 20, 50);
    pdf.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 60);
    pdf.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 70);

    // Customer info
    pdf.text('Bill To:', 20, 90);
    pdf.text('Customer Name', 20, 100);
    pdf.text('customer@example.com', 20, 110);

    // Items table
    pdf.text('Description', 20, 140);
    pdf.text('Qty', 120, 140);
    pdf.text('Price', 150, 140);
    pdf.text('Total', 180, 140);

    let yPos = 150;
    invoice.items.forEach((item: any) => {
      pdf.text(item.service_name || 'Service', 20, yPos);
      pdf.text(item.quantity?.toString() || '1', 120, yPos);
      pdf.text(`$${(item.unit_price || 0).toFixed(2)}`, 150, yPos);
      pdf.text(`$${(item.total_price || 0).toFixed(2)}`, 180, yPos);
      yPos += 10;
    });

    // Totals
    yPos += 10;
    pdf.text(`Subtotal: $${(invoice.amount - invoice.taxAmount).toFixed(2)}`, 150, yPos);
    yPos += 10;
    pdf.text(`Tax: $${invoice.taxAmount.toFixed(2)}`, 150, yPos);
    yPos += 10;
    pdf.text(`Total: $${invoice.amount.toFixed(2)}`, 150, yPos);

    // Footer
    pdf.setFontSize(10);
    pdf.text('Thank you for your business!', 20, 250);
    pdf.text('KSFoundation - Professional Hosting Solutions', 20, 260);

    resolve(pdf.output('blob'));
  });
}

export async function downloadInvoice(orderId: string): Promise<void> {
  try {
    const invoice = await generateInvoice(orderId);
    const pdfBlob = await generatePDFInvoice(invoice);

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download invoice:', error);
    throw error;
  }
