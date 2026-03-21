const PDFDocument = require('pdfkit');

const generateInvoicePDF = (order, stream) => {
  const doc = new PDFDocument({ margin: 50 });

  // Header - SMARTON Branding
  doc.fontSize(25).text('SMARTON', { align: 'center', characterSpacing: 5 });
  doc.fontSize(8).text('BY ONOFF STORE • OFFICIAL INVOICE', { align: 'center', characterSpacing: 2 });
  doc.moveDown(2);

  // Business Info
  doc.fontSize(10).text('MERCHANT: SMARTON BY ONOFF FASHION', { align: 'right' });
  doc.text('CENTRAL LOGISTICS HUB, BKC, MUMBAI', { align: 'right' });
  doc.moveDown();

  // Order Details
  doc.fontSize(12).text(`ORDER ID: #${order._id.toString().toUpperCase()}`, { bold: true });
  doc.fontSize(10).text(`DATE: ${order.createdAt.toLocaleDateString()}`);
  doc.moveDown();

  // Customer Info
  doc.fontSize(12).text('SHIPPING TO:', { bold: true });
  doc.fontSize(10).text(order.customerDetails.name);
  doc.text(order.customerDetails.email);
  doc.text(order.customerDetails.phone);
  doc.text(order.customerDetails.address);
  doc.moveDown(2);

  // Items Table Header
  doc.fontSize(12).text('ITEMS PURCHASED:', { bold: true });
  doc.moveDown();

  // Items List
  order.items.forEach((item, index) => {
    doc.fontSize(10).text(`${index + 1}. ${item.name} (QTY: ${item.quantity}) - ₹${item.price}`, { indent: 20 });
  });

  doc.moveDown(2);
  doc.fontSize(14).text(`TOTAL AMOUNT: ₹${order.totalAmount}`, { align: 'right', bold: true });

  // Footer
  doc.moveDown(4);
  doc.fontSize(8).text('Thank you for choosing SMARTON. This is a computer-generated digital bill.', { align: 'center', color: 'gray' });

  doc.end();
  doc.pipe(stream);
};

module.exports = { generateInvoicePDF };
