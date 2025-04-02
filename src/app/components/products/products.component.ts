import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SideNavListComponent } from '../side-nav/side-nav.component';
import { Router } from '@angular/router';

import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseApp } from '../../../main';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    HeaderComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    SideNavListComponent,
    FormsModule,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  sidenavOpened = true;

  milkCount = 0;
  syrupCount = 0;
  coldMilkCount = 0;
  coldSyrupCount = 0;
  caffeineHot = false;
  caffeineCold = false;

  // Control
  visibleSections: { [key: string]: boolean } = { HOT: false, COLD: false };

  // List
  drinks: { type: string; milk: number; syrup: number; caffeine: string }[] = [];

  // Variables
  subtotal = 0;
  discount = 0;
  taxRate = 0.68;
  tax = 0;
  total = 0;
  discountCode = '';
  discountApplied = false;
  alertMessage = '';

  // Historial
  orderHistory: { invoiceNumber: string; total: number }[] = [];

  constructor(private router: Router) {}

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  toggleSection(type: string) {
    this.visibleSections[type] = !this.visibleSections[type];
  }

  isSectionVisible(type: string): boolean {
    return this.visibleSections[type];
  }

  // Milk y Syrup
  incrementMilk() {
    this.milkCount++;
  }

  decrementMilk() {
    if (this.milkCount > 0) this.milkCount--;
  }

  incrementSyrup() {
    this.syrupCount++;
  }

  decrementSyrup() {
    if (this.syrupCount > 0) this.syrupCount--;
  }

  incrementColdMilk() {
    this.coldMilkCount++;
  }

  decrementColdMilk() {
    if (this.coldMilkCount > 0) this.coldMilkCount--;
  }

  incrementColdSyrup() {
    this.coldSyrupCount++;
  }

  decrementColdSyrup() {
    if (this.coldSyrupCount > 0) this.coldSyrupCount--;
  }

    addDrink(type: string) {
    const drink = {
      type,
      milk: type === 'HOT' ? this.milkCount : this.coldMilkCount,
      syrup: type === 'HOT' ? this.syrupCount : this.coldSyrupCount,
      caffeine: type === 'HOT' ? (this.caffeineHot ? 'YES' : 'NO') : (this.caffeineCold ? 'YES' : 'NO')
    };

    this.drinks.push(drink);
    this.calculateSubtotal();

    if (type === 'HOT') {
      this.milkCount = 0;
      this.syrupCount = 0;
      this.caffeineHot = false;
    } else {
      this.coldMilkCount = 0;
      this.coldSyrupCount = 0;
      this.caffeineCold = false;
    }
  }


  calculateSubtotal() {
    this.subtotal = this.drinks.length * 3;
    this.calculateTotals();
  }

  applyDiscount() {
    if (this.discountApplied) {
      window.alert('The discount code WELCOME2025 has already been applied.');
      return;
    }

    if (this.discountCode === 'WELCOME2025') {
      this.discountApplied = true;
      this.calculateTotals();
      window.alert('The discount code WELCOME2025 has been successfully applied.');
    } else {
      window.alert('Invalid discount code. Please try again.');
    }
  }

  calculateTotals() {
    this.discount = this.discountApplied ? this.subtotal * 0.15 : 0;
    this.tax = this.subtotal * (this.taxRate / 100);
    this.total = this.subtotal - this.discount + this.tax;
  }

  removeDrink(index: number) {
    this.drinks.splice(index, 1);
    this.calculateSubtotal();
  }

  resetOrder() {
    this.drinks = [];
    this.discountApplied = false;
    this.discountCode = '';
    this.calculateSubtotal();
  }

  async confirmOrder() {
    if (this.total <= 0) {
      window.alert('Cannot generate an invoice with a total of $0. Please add items to your order.');
      return;
    }

    const invoiceNumber = `INV-${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}`;
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(invoiceDate.getDate() + 7);

    const orderDetails = this.drinks.map(drink => ({
      type: drink.type,
      milk: drink.milk,
      syrup: drink.syrup,
      caffeine: drink.caffeine,
      price: 3
    }));

    const invoiceData = {
      invoiceNumber,
      invoiceDate: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      orderDetails,
      subtotal: this.subtotal,
      discount: this.discount,
      tax: this.tax,
      total: this.total
    };

    // Invoice Firebase
    const db = getFirestore(firebaseApp);
    await addDoc(collection(db, 'products'), invoiceData);

    this.orderHistory.push(invoiceData);

    window.alert(`Order confirmed! Invoice Number: ${invoiceNumber}`);

    this.resetOrder();
  }

  viewInvoice(invoice: any) {
    window.alert(`
      Invoice Number: ${invoice.invoiceNumber}
      Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}
      Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
      Subtotal: $${invoice.subtotal.toFixed(2)}
      Discount: $${invoice.discount.toFixed(2)}
      Tax: $${invoice.tax.toFixed(2)}
      Total: $${invoice.total.toFixed(2)}

      Order Details:
      ${invoice.orderDetails
        .map(
          (item: any, index: number) =>
            `${index + 1}. ${item.type} Drink - Milk: ${item.milk}, Syrup: ${item.syrup}, Caffeine: ${item.caffeine}, Price: $${item.price.toFixed(2)}`
        )
        .join('\n')}
    `);
  }
}
