import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getAuth, signOut } from "firebase/auth";
import { firebaseApp } from '../../../main';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [ 
        RouterLink,
        CommonModule,
        FormsModule
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    @Output() public sideNavToggle = new EventEmitter();
    isLoggedIn: boolean = false;
    username: string = "";

    constructor(private router: Router) {} 

    ngOnInit(): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            // Check if session is expired
            const loginTimeStr: string | null = localStorage.getItem("loginTime");
            const userInfo: string | null = localStorage.getItem("userInfo");
            if(loginTimeStr != null && userInfo != null) {
                const loginTime = parseInt(loginTimeStr, 10);
                const expTime = 60 * 60 * 1000; // 60 minutes in milliseconds
                if (Date.now() - loginTime > expTime) {
                    console.log("Session expired, logging out...");
                    this.logout();
                  }
                  else {
                      this.isLoggedIn = true;
                      const info: string[] =  userInfo.split("|");
                      this.username = `Hi! ${info[0]}`;
                  }
            }
            else {
                console.log("2. User is logged out");
                this.logout();
            }
        }
    }

    onToggleSidenav() {
        this.sideNavToggle.emit();
    }

    async logout() {
        try {
            if(this.isLoggedIn) {
                const auth = getAuth(firebaseApp);
                await signOut(auth);
                localStorage.clear();; // Clear all login information
                this.isLoggedIn = false;
                console.log("User logged out");
            }
            this.router.navigate(['/login']);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }
}