import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../../../main';
import { exit } from 'process';

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

    constructor() {}
    ngOnInit(): void {
        const auth = getAuth(firebaseApp);

        // Check if a user is logged in
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const db = getFirestore(firebaseApp);
                const usersCollection = collection(db, 'users');  // Reference to 'users' collection
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
        // Open and close side nav bar
        this.sideNavToggle.emit();
    }
}