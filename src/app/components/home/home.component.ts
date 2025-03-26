import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SideNavListComponent } from '../side-nav/side-nav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TasksComponent } from "../tasks/tasks.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, SideNavListComponent, MatSidenavModule, TasksComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  sidenavOpened = false;

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }
}
