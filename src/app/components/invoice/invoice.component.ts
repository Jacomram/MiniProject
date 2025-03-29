import { Component } from '@angular/core';
import { from, Observable } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header.component'; // Asegúrate de que la ruta sea correcta
import { SideNavListComponent } from '../side-nav/side-nav.component';
import { firebaseApp } from '../../../main';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
  invoices$: Observable<any[]>; // Observable para las facturas desde Firebase
  selectedInvoice: any; // Factura seleccionada para mostrar detalles

  constructor() {
    this.invoices$ = from(this.queryData()) as Observable<any[]>; 
  }

  async queryData() {
    // Cargar las facturas desde Firebase
    const db = getFirestore(firebaseApp);
    const usersCollection = collection(db, 'products');
    const querySnapshot = await getDocs(usersCollection);   
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Método para seleccionar una factura
  selectInvoice(invoice: any) {
    this.selectedInvoice = invoice;
  }

  // Método para manejar el evento de toggle del sidenav
  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }
}
