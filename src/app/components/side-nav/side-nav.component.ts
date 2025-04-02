import { Component, EventEmitter, Output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
    selector: 'app-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrls: ['./side-nav.component.css'],
    standalone: true,
    imports: [
        MatListModule, 
        MatIconModule, 
        MatMenuModule, 
        CommonModule, 
        FormsModule,
        RouterLink
    ]
})
export class SideNavListComponent {
    @Output() sidenavClose = new EventEmitter();
    isLoggedIn: boolean = false;

    constructor(private router: Router) {} 

    public onSidenavClose = () => {
        this.sidenavClose.emit();
    }
}