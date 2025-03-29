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

  // Variables para el contenido dinámico
  milkCount = 0;
  syrupCount = 0;
  coldMilkCount = 0;
  coldSyrupCount = 0;
  caffeineHot = false;
  caffeineCold = false;

  // Control de visibilidad de secciones
  visibleSections: { [key: string]: boolean } = { HOT: false, COLD: false };

  // Lista de bebidas
  drinks: { type: string; milk: number; syrup: number; caffeine: string }[] = [];

  // Variables para el resumen de precios
  subtotal = 0;
  discount = 0;
  taxRate = 0.68; // Porcentaje de impuestos
  tax = 0;
  total = 0;
  discountCode = '';
  discountApplied = false; // Para verificar si el código ya fue aplicado
  alertMessage = ''; // Mensaje de alerta

  // Historial de órdenes
  orderHistory: { invoiceNumber: string; total: number }[] = [];

  constructor(private router: Router) {}

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  // Métodos para manejar la visibilidad de las secciones
  toggleSection(type: string) {
    this.visibleSections[type] = !this.visibleSections[type];
  }

  isSectionVisible(type: string): boolean {
    return this.visibleSections[type];
  }

  // Métodos para manejar los contadores de Milk y Syrup
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

  // Método para agregar una bebida al resumen
  addDrink(type: string) {
    const drink = {
      type,
      milk: type === 'HOT' ? this.milkCount : this.coldMilkCount,
      syrup: type === 'HOT' ? this.syrupCount : this.coldSyrupCount,
      caffeine: type === 'HOT' ? (this.caffeineHot ? 'YES' : 'NO') : (this.caffeineCold ? 'YES' : 'NO')
    };

    this.drinks.push(drink);
    this.calculateSubtotal();

    // Reinicia los contadores
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

  // Método para calcular el subtotal
  calculateSubtotal() {
    this.subtotal = this.drinks.length * 3; // Cada bebida cuesta $3
    this.calculateTotals();
  }

  // Método para aplicar un descuento basado en un código
  applyDiscount() {
    if (this.discountApplied) {
      window.alert('The discount code WELCOME2025 has already been applied.');
      return;
    }

    if (this.discountCode === 'WELCOME2025') {
      this.discountApplied = true; // Marca el descuento como aplicado
      this.calculateTotals(); // Recalcula los totales con el descuento
      window.alert('The discount code WELCOME2025 has been successfully applied.');
    } else {
      window.alert('Invalid discount code. Please try again.');
    }
  }

  // Método para calcular los totales
  calculateTotals() {
    // Aplica el descuento solo si el código fue aplicado
    this.discount = this.discountApplied ? this.subtotal * 0.15 : 0;
    this.tax = this.subtotal * (this.taxRate / 100);
    this.total = this.subtotal - this.discount + this.tax;
  }

  // Método para eliminar una bebida del resumen
  removeDrink(index: number) {
    this.drinks.splice(index, 1);
    this.calculateSubtotal();
  }

  // Método para resetear la orden
  resetOrder() {
    this.drinks = [];
    this.discountApplied = false;
    this.discountCode = '';
    this.calculateSubtotal();
  }

  // Método para confirmar la orden
  async confirmOrder() {
    if (this.total <= 0) {
      window.alert('Cannot generate an invoice with a total of $0. Please add items to your order.');
      return;
    }

    const invoiceNumber = `INV-${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}`;
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(invoiceDate.getDate() + 7); // Fecha de vencimiento en 7 días

    const orderDetails = this.drinks.map(drink => ({
      type: drink.type,
      milk: drink.milk,
      syrup: drink.syrup,
      caffeine: drink.caffeine,
      price: 3 // Precio fijo por bebida
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

    // Guardar la factura en Firebase
    const db = getFirestore(firebaseApp);
    await addDoc(collection(db, 'products'), invoiceData);

    // Agregar la factura al historial local
    this.orderHistory.push(invoiceData);

    // Mostrar mensaje de confirmación
    window.alert(`Order confirmed! Invoice Number: ${invoiceNumber}`);

    // Reiniciar la orden actual
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
