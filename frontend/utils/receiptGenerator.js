import { jsPDF } from "jspdf";

export const downloadReceipt = (customer, txn) => {
  const doc = new jsPDF({
    unit: "mm",
    format: [80, 120] // Typical receipt dimensions
  });

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("OKCREDIT CLONE", 40, 15, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Transaction Receipt`, 40, 22, { align: "center" });
  doc.line(5, 25, 75, 25);

  // Body
  doc.text(`Customer: ${customer.name}`, 10, 35);
  doc.text(`Phone: ${customer.phone || 'N/A'}`, 10, 42);
  doc.text(`Date: ${new Date(txn.created_at).toLocaleDateString()}`, 10, 49);
  
  doc.line(10, 55, 70, 55);

  // Amount Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const label = txn.type === "CREDIT" ? "PAYMENT RECEIVED" : "CREDIT GIVEN";
  doc.text(label, 40, 65, { align: "center" });
  
  doc.setFontSize(18);
  doc.text(`Rs. ${txn.amount}`, 40, 75, { align: "center" });

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  if(txn.note) doc.text(`Note: ${txn.note}`, 10, 85);
  
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business!", 40, 105, { align: "center" });

  doc.save(`Receipt_${txn.uuid.slice(0, 8)}.pdf`);
};