import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
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
export class SideNavListComponent implements OnInit {
    @Output() sidenavClose = new EventEmitter();
    isLoggedIn: boolean = false;

    constructor(private router: Router) {} 

    ngOnInit(): void {
        const auth = getAuth();
        const expTime = 30 * 60 * 1000; // 30 minutes in milliseconds
        onAuthStateChanged(auth, (user) => {
            console.log(this.isLoggedIn);
            if (user) {
              // Check if session is expired
              let loginTimeStr: string | null = localStorage.getItem("loginTime");
              if(loginTimeStr != null) {
                const loginTime = parseInt(loginTimeStr, 10);
                if (Date.now() - loginTime > expTime) {
                  console.log("Session expired, logging out...");
                  this.logout();
                }
                else
                    this.isLoggedIn = true;
              }
              else {
                console.log("1. User is logged out");
                this.logout();
              }
            } else {
                console.log("2. User is logged out");
                this.logout();
            }
          });
    }

    public onSidenavClose = () => {
        this.sidenavClose.emit();
    }

    async logout() {
        try {
            if(this.isLoggedIn) {
                const auth = getAuth();
                await signOut(auth);
                localStorage.removeItem("loginTime"); // Clear login time
                this.isLoggedIn = false;
                console.log("User logged out");
            }
            this.router.navigate(['/login']);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }
}