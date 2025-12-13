// src/pages/InvoicePrintTemplate.tsx
import { format } from "date-fns";

// --- Helper: Amount in Words ---
function numberToWords(amount: number) {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(amount).replace("₹", "") + " Only"; 
}

// --- Helper: Safe Date ---
function safeDate(date: any) {
  try {
    if (!date) return "";
    return format(new Date(date), "dd/MM/yyyy");
  } catch (e) {
    return "";
  }
}

export default function printInvoice(
  invoiceData: any, 
  parties: any[] = [], 
  signatureFile: File | null = null,
  assetsPath = "/assets"
) {
  // 1. Resolve Party Data
  const party = invoiceData.party_id && typeof invoiceData.party_id === 'object' 
    ? invoiceData.party_id 
    : parties.find(p => p._id === invoiceData.party_id) || {};

  // 2. Prepare Data
  const items = invoiceData.items || [];
  const totals = invoiceData.totals || { 
    subtotal: 0, discount: 0, tax: 0, total: 0 
  };
  
  // Custom Fields (PT Name, DOS) passed from main page
  const ptName = invoiceData.ptName || "";
  const dos = invoiceData.dos || "";

  // Total Qty
  const totalQty = items.reduce((acc: number, it: any) => acc + Number(it.quantity || 0), 0);

  // Logo & Signature
  let signatureUrl = invoiceData.signature_url || "";
  if (!signatureUrl && signatureFile) {
    signatureUrl = URL.createObjectURL(signatureFile);
  }
  const logoUrl = `${assetsPath}/logo.png`; 

  // 3. Build HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice #${invoiceData.invoice_number}</title>
      <style>
        @page { margin: 20px; size: A4; }
        body { 
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
          font-size: 11px; 
          color: #000;
          margin: 0; 
          padding: 10px; 
          line-height: 1.3;
        }

        /* UTILS */
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .font-bold { font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .uppercase { text-transform: uppercase; }
        .mb-1 { margin-bottom: 4px; }
        .text-blue { color: #1e40af; }
        .bg-blue { background-color: #dbeafe !important; -webkit-print-color-adjust: exact; }
        
        /* HEADER */
        .header-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .logo-img { height: 70px; width: auto; margin-right: 15px; }
        .company-title { font-size: 22px; font-weight: bold; color: #1e40af; margin-bottom: 4px; }
        .doc-title { font-size: 16px; font-weight: bold; text-align: right; margin-bottom: 10px; }
        
        .meta-table { float: right; width: auto; border-collapse: collapse; }
        .meta-table td { padding: 2px 0 2px 10px; font-weight: bold; }
        .meta-label { font-weight: normal !important; }

        /* ADDRESS GRID */
        .address-grid { display: flex; gap: 20px; margin-bottom: 20px; }
        .addr-box { flex: 1; }
        .addr-header { 
          background-color: #dbeafe; 
          font-weight: bold; 
          padding: 4px 8px; 
          margin-bottom: 5px; 
          display: inline-block;
          -webkit-print-color-adjust: exact;
        }

        /* ITEMS TABLE */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
        .items-table th { 
          background-color: #dbeafe !important; 
          padding: 6px; 
          font-size: 11px; 
          font-weight: bold; 
          text-align: left;
          -webkit-print-color-adjust: exact;
        }
        .items-table td { padding: 6px; border-bottom: 1px solid #ddd; vertical-align: top; }
        
        /* SUBTOTAL BAR */
        .subtotal-bar { 
          background-color: #dbeafe !important; 
          padding: 6px; 
          font-weight: bold; 
          display: flex; 
          justify-content: space-between; 
          -webkit-print-color-adjust: exact;
          margin-bottom: 20px;
        }

        /* FOOTER */
        .footer-container { display: flex; gap: 30px; }
        .left-footer { flex: 1.5; }
        .right-footer { flex: 1; text-align: right; }
        
        .bank-box { margin-top: 10px; border: 1px solid #eee; padding: 5px; }
        .total-row { font-size: 14px; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0; margin: 5px 0; }
        
        .stamp-box { 
          height: 80px; 
          display: flex; align-items: end; justify-content: end; 
          margin-top: 20px;
        }
      </style>
    </head>
    <body>

      <div class="header-section">
        <div class="flex">
          <img src="${logoUrl}" class="logo-img" onerror="this.style.display='none'"/>
          
          <div>
            <div class="company-title">GNR SURGICALS</div>
            <div>10-4-70 ANNAPURANAMMA HOSPITAL LINE</div>
            <div>PALANADUROAD, NARASARAOPET</div>
            <div>Andhra Pradesh, 522601</div>
            <div style="margin-top: 5px;">
              <strong>GSTIN:</strong> 37BDBPG4519D1ZY<br/>
              <strong>Mobile:</strong> 9704063929<br/>
              <strong>Email:</strong> gnrsurgicals@gmail.com<br/>
              <strong>DL NO:</strong> 20B: AP/07/03/2016-133377
            </div>
          </div>
        </div>

        <div>
          <div class="doc-title">DELIVERY CHALLAN</div>
          <table class="meta-table">
            <tr><td class="meta-label">Challan No.</td><td>: ${invoiceData.invoice_number}</td></tr>
            <tr><td class="meta-label">Challan Date</td><td>: ${safeDate(invoiceData.invoice_date)}</td></tr>
            <tr><td class="meta-label">Due Date</td><td>: ${safeDate(invoiceData.due_date)}</td></tr>
            <tr><td class="meta-label">PT NAME</td><td>: ${ptName}</td></tr>
            <tr><td class="meta-label">DOS</td><td>: ${dos}</td></tr>
          </table>
        </div>
      </div>

      <div class="address-grid">
        <div class="addr-box">
          <div class="addr-header">BILL TO</div>
          <div class="font-bold">${party.name || ""}</div>
          <div>${party.address || ""}</div>
          <div><strong>Mobile:</strong> ${party.mobile || ""}</div>
          <div><strong>GSTIN:</strong> ${party.gstin || ""}</div>
          <div>Place of Supply: Andhra Pradesh</div>
        </div>
        <div class="addr-box">
          <div class="addr-header">SHIP TO</div>
          <div class="font-bold">${party.name || ""}</div>
          <div>${party.address || ""}</div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th width="5%">S.NO.</th>
            <th width="35%">ITEMS</th>
            <th width="10%">HSN</th>
            <th width="10%">QTY.</th>
            <th width="10%" class="text-right">RATE</th>
            <th width="10%" class="text-right">DISC.</th>
            <th width="10%" class="text-right">TAX</th>
            <th width="10%" class="text-right">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it: any, i: number) => {
            const amount = ((it.quantity * it.unit_price) - (it.discount_amount || 0));
            return `
            <tr>
              <td>${i + 1}</td>
              <td>
                <div class="font-bold">${it.name}</div>
                <div style="font-size: 9px; color: #555;">${it.description || ""}</div>
              </td>
              <td>${it.hsn || ""}</td>
              <td>${it.quantity} ${it.unit || "UNT"}</td>
              <td class="text-right">${Number(it.unit_price).toLocaleString()}</td>
              <td class="text-right">${it.discount_amount > 0 ? it.discount_amount : "-"}</td>
              <td class="text-right">${it.tax_percent > 0 ? it.tax_percent + "%" : "-"}</td>
              <td class="text-right font-bold">${amount.toLocaleString()}</td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="subtotal-bar">
        <div>SUBTOTAL</div>
        <div style="width: 250px; display: flex; justify-content: space-between;">
          <span>${totalQty}</span>
          <span class="text-right">₹ ${Number(totals.subtotal).toLocaleString()}</span>
        </div>
      </div>

      <div class="footer-container">
        
        <div class="left-footer">
          <div class="font-bold mb-1">TERMS AND CONDITIONS</div>
          <div style="font-size: 10px; margin-bottom: 10px;">
            1. Goods once sold will not be taken back.<br/>
            2. Interest @ 18% p.a. will be charged if bill is not paid by due date.<br/>
            3. Subject to Narasaraopet Jurisdiction.
          </div>

          <div class="font-bold mb-1">BANK DETAILS</div>
          <div class="bank-box" style="font-size: 11px;">
            <div><strong>Name:</strong> GNR SURGICALS</div>
            <div><strong>IFSC Code:</strong> HDFC0001034</div>
            <div><strong>Account No:</strong> 50200021977447</div>
            <div><strong>Bank:</strong> HDFC Bank, NARSARAOPETA</div>
          </div>
        </div>

        <div class="right-footer">
          <table style="width: 100%; font-size: 11px;">
            ${totals.discount > 0 ? `<tr><td>Discount</td><td>(-) ₹${totals.discount}</td></tr>` : ''}
            ${totals.tax > 0 ? `<tr><td>Tax</td><td>(+) ₹${totals.tax}</td></tr>` : ''}
          </table>

          <div class="total-row flex justify-between">
            <span>Total Amount</span>
            <span>₹ ${Number(totals.total).toLocaleString()}</span>
          </div>

          <div style="font-size: 10px; font-style: italic; margin-bottom: 20px;">
            Total Amount (in words):<br/>
            <strong>${numberToWords(totals.total)}</strong>
          </div>

          <div class="stamp-box">
            <div class="text-center">
              ${signatureUrl ? `<img src="${signatureUrl}" height="50" style="margin-bottom:5px"/>` : '<div style="height:50px"></div>'}
              <div style="border-top: 1px solid #000; padding-top: 2px;">Authorised Signature</div>
              <div class="font-bold">GNR SURGICALS</div>
            </div>
          </div>
        </div>

      </div>

    </body>
    </html>
  `;

  // 4. Open Window
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}