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
    username: string = "";

    constructor(private router: Router) {} 

    ngOnInit(): void {
        const auth = getAuth(firebaseApp);

        onAuthStateChanged(auth, async (user) => {
            if (user) {
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
        });
    }

    onToggleSidenav() {
        this.sideNavToggle.emit();
    }

    async logout() {
        try {
            const auth = getAuth(firebaseApp);
            await signOut(auth);
            this.username = "";
            this.router.navigate(['/login']);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }
}