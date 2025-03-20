import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrls: ['./side-nav.component.css'],
    standalone: true,
    imports: [MatListModule, MatIconModule, MatMenuModule, RouterLink]
})
export class SideNavListComponent implements OnInit {
    @Output() sidenavClose = new EventEmitter();
    constructor() {}
    ngOnInit() {}
    public onSidenavClose = () => {
        this.sidenavClose.emit();
    }
}