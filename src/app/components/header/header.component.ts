import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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
        const auth = getAuth(firebaseApp);
        const expTime = 60 * 60 * 1000; // 60 minutes in milliseconds
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check if session is expired
              let loginTimeStr: string | null = localStorage.getItem("loginTime");
              if(loginTimeStr != null) {
                const loginTime = parseInt(loginTimeStr, 10);
                console.log(Date.now() - loginTime , expTime);
                if (Date.now() - loginTime > expTime) {
                  console.log("Session expired, logging out...");
                  this.logout();
                }
                else {
                    this.isLoggedIn = true;
                    const db = getFirestore(firebaseApp);
                    const usersCollection = collection(db, 'users');
                    const querySnapshot = await getDocs(usersCollection);
                    
                    querySnapshot.forEach((doc) => {
                        if(doc.data()["email"].toLocaleLowerCase() == user.email?.toLocaleLowerCase()) {
                            this.username = `Hi! ${doc.data()["name"]}`;
                        }
                    });
                    
                    if(this.username == "")
                        this.username = `Hi! ${user.email?.split('@')[0]}`; 
                }
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

    onToggleSidenav() {
        this.sideNavToggle.emit();
    }

    async logout() {
        try {
            if(this.isLoggedIn) {
                const auth = getAuth(firebaseApp);
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