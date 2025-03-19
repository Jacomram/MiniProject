import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    @Output() public sideNavToggle = new EventEmitter();
    
    constructor() {}
    ngOnInit(): void {}
    onToggleSidenav() {
        // Open and close side nav bar
        this.sideNavToggle.emit();
    }
}