import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header.component'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    HeaderComponent,
    DatePipe
  ],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {
  invoices$: Observable<any[]>; // Observable para las facturas desde Firebase
  selectedInvoice: any; // Factura seleccionada para mostrar detalles

  constructor(private firestore: Firestore) {
    // Cargar las facturas desde Firebase
    const invoicesCollection = collection(this.firestore, 'products');
    this.invoices$ = collectionData(invoicesCollection, { idField: 'id' });
  }

  ngOnInit(): void {}

  // Método para seleccionar una factura
  selectInvoice(invoice: any) {
    this.selectedInvoice = invoice;
  }

  // Método para manejar el evento de toggle del sidenav
  toggleSidenav() {
    console.log('Sidenav toggled');
  }
}
