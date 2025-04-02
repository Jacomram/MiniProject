import { Component } from '@angular/core';
import { from, Observable } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header.component'; 
import { SideNavListComponent } from '../side-nav/side-nav.component';
import { Firestore, collection, getDocs, getFirestore } from '@angular/fire/firestore';
import { PDFDocument, rgb } from 'pdf-lib';
import { getAuth } from '@angular/fire/auth'; // Firebase Authentication

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    HeaderComponent,
    SideNavListComponent,
    DatePipe
  ],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent {
  sidenavOpened = false;
  invoices$: Observable<any[]>; // Observable Firebase
  selectedInvoice: any; 

  constructor() {
    this.invoices$ = from(this.queryData()) as Observable<any[]>; 
  }

  async queryData() {
    const db = getFirestore();
    const usersCollection = collection(db, 'products');
    const querySnapshot = await getDocs(usersCollection);   
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  selectInvoice(invoice: any) {
    this.selectedInvoice = invoice;
  }

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  async printInvoiceAsPDF() {
    try {
      if (!this.selectedInvoice) {
        alert('Please select an invoice to print.');
        return;
      }

      const { invoiceNumber, invoiceDate, dueDate, orderDetails, subtotal, discount, tax, total } = this.selectedInvoice;

      if (!invoiceNumber || !invoiceDate || !dueDate || !orderDetails || subtotal == null || discount == null || tax == null || total == null) {
        alert('Invoice data is incomplete. Please check the selected invoice.');
        return;
      }

      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([600, 800]);

      let yPosition = 750;
      const margin = 40;
      const lineHeight = 20;
      const cellHeight = 20;
      const columnWidths = [30, 150, 80, 80, 80, 80];

      const auth = getAuth();
      const user = auth.currentUser;
      const userName = user?.displayName || 'Unknown User'; 
      const userEmail = user?.email || 'Unknown Email'; 

      const aboutUsText = `We are Team One, composed of Hebe ChihYun Hsu, Hotaka Iwata, Donovan Mendez, Jacobo Ramirez, and Maria Castro. Together, we have the mission of creating a functional website with the help of Angular and Firebase.

If you enjoyed this website feel free to contact us.`;
      const contactInfo = [
        'a7264669@gmail.com',
        'hotakaiwata129@gmail.com',
        'jacobojoseramirezarujo@gmail.com',
        'cris.jdonovan@gmail.com',
        'mvcastrotrujillo@gmail.com',
      ];

      // Basic Information
      page.drawText(`User Name: ${userName}`, { x: margin, y: yPosition, size: 12 });
      page.drawText(`E-mail: ${userEmail}`, { x: margin, y: yPosition - lineHeight, size: 12 });
      yPosition -= lineHeight * 3;

      page.drawText('Invoice', { x: margin, y: yPosition, size: 24, color: rgb(0, 0, 0) });
      yPosition -= lineHeight * 2;
      page.drawText(`Invoice Number: ${invoiceNumber}`, { x: margin, y: yPosition, size: 12 });
      page.drawText(`Date: ${new Date(invoiceDate).toLocaleDateString()}`, { x: margin, y: yPosition - lineHeight, size: 12 });
      page.drawText(`Due Date: ${new Date(dueDate).toLocaleDateString()}`, { x: margin, y: yPosition - lineHeight * 2, size: 12 });
      yPosition -= lineHeight * 4;

      const drawTableHeader = () => {
        let xPosition = margin;
        const headers = ['#', 'Item', 'Milk', 'Syrup', 'Caffeine', 'Price'];
        headers.forEach((header, index) => {
          page.drawRectangle({
            x: xPosition,
            y: yPosition,
            width: columnWidths[index],
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
          page.drawText(header, { x: xPosition + 5, y: yPosition + 5, size: 10 });
          xPosition += columnWidths[index];
        });
        yPosition -= cellHeight;
      };

      const drawTableRow = (row: any, index: number) => {
        let xPosition = margin;
        const rowData = [
          `${index + 1}`,
          `${row.type} Drink`,
          `${row.milk}`,
          `${row.syrup}`,
          `${row.caffeine}`,
          `$${row.price.toFixed(2)}`,
        ];
        rowData.forEach((data, colIndex) => {
          page.drawRectangle({
            x: xPosition,
            y: yPosition,
            width: columnWidths[colIndex],
            height: cellHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
          page.drawText(data, { x: xPosition + 5, y: yPosition + 5, size: 10 });
          xPosition += columnWidths[colIndex];
        });
        yPosition -= cellHeight;
      };

      drawTableHeader();

      orderDetails.forEach((item: any, index: number) => {
        if (yPosition < margin + cellHeight * 4) {
          page = pdfDoc.addPage([600, 800]);
          yPosition = 750;
          drawTableHeader();
        }
        drawTableRow(item, index);
      });

      if (yPosition < margin + cellHeight * 5) {
        page = pdfDoc.addPage([600, 800]);
        yPosition = 750;
      }
      page.drawText('Price Summary:', { x: margin, y: yPosition, size: 14 });
      yPosition -= lineHeight;
      const priceSummary = [
        ['Subtotal:', `$${subtotal.toFixed(2)}`],
        ['Discount:', `$${discount.toFixed(2)}`],
        ['Tax (0.68%):', `$${tax.toFixed(2)}`],
        ['Total:', `$${total.toFixed(2)}`],
      ];
      priceSummary.forEach(([label, value]) => {
        page.drawText(label, { x: margin, y: yPosition, size: 12 });
        page.drawText(value, { x: margin + 200, y: yPosition, size: 12 });
        yPosition -= lineHeight;
      });

      // About Us
      if (yPosition < margin + lineHeight * 6) {
        page = pdfDoc.addPage([600, 800]);
        yPosition = 750;
      }
      page.drawText(aboutUsText, { x: margin, y: yPosition, size: 10, maxWidth: 520, lineHeight: 12 });
      yPosition -= lineHeight * 4;
      contactInfo.forEach((email) => {
        page.drawText(email, { x: margin, y: yPosition, size: 10 });
        yPosition -= lineHeight;
      });

      // PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Invoice-${invoiceNumber}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  }
}
