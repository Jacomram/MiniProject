import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink],
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