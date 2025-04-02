import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SideNavListComponent } from '../side-nav/side-nav.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [HeaderComponent, SideNavListComponent, MatSidenavModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css'] 
})
export class AboutUsComponent {
    sidenavOpened = false;

    toggleSidenav() {
      this.sidenavOpened = !this.sidenavOpened;
    }
}
