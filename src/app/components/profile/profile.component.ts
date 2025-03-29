import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component'; 
import { SideNavListComponent } from '../side-nav/side-nav.component'; 
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, Router } from '@angular/router';
import { getAuth, onAuthStateChanged, signOut, updatePassword, updateProfile, User } from "firebase/auth";
import { firebaseApp } from '../../../main';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, HeaderComponent, SideNavListComponent, MatSidenavModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent {
  user: User | null = null;
  username: string = '';
  showPasswordForm: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';
  editingUsername: boolean = false;
  newUsername: string = '';
  sidenavOpened: boolean = false;
  isLoggedIn: boolean = false;

  // Flag for showing/hiding password
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private ngZone: NgZone, private router: Router) { 
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, async (currentUser) => { 
      this.ngZone.run(async () => { 
        if (currentUser) {
          this.user = currentUser;
          
          const db = getFirestore(firebaseApp);
          const usersCollection = collection(db, 'users');
          const querySnapshot = await getDocs(usersCollection); 
          
          let username = "";
          querySnapshot.forEach((doc) => {
            if (doc.data()["email"].toLowerCase() === currentUser.email?.toLowerCase()) {
              username = doc.data()["name"];
            }
          });
          
          // If a username is obtained, use it. If not, use the default value
          this.username = username || currentUser.displayName || currentUser.email?.split('@')[0] || 'Not set';
          this.newUsername = this.username;
          this.isLoggedIn = true;
        } else {
          this.user = null;
          this.username = 'Not set';
          this.isLoggedIn = false;
        }
      });
    });
  }

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  passwordFormValid(): boolean {
    return this.newPassword.length >= 6 && this.newPassword === this.confirmPassword;
  }

  async handlePasswordUpdate(): Promise<void> {
    if (!this.user) {
      alert("User is not logged in.");
      return;
    }

    if (!this.passwordFormValid()) {
      alert("Passwords do not match or are too short.");
      return;
    }

    try {
      // Check that user is not null and then call updatePassword
      if (this.user) {
        await updatePassword(this.user, this.newPassword);
        alert("Password updated successfully!");
        this.showPasswordForm = false;
        this.newPassword = '';
        this.confirmPassword = '';
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please try again.");
    }
  }

  cancelPasswordChange(): void {
    this.showPasswordForm = false;
    this.newPassword = '';
    this.confirmPassword = '';
  }

  async toggleUsernameEdit(): Promise<void> {
    if (this.editingUsername && this.user && this.newUsername !== this.username) {
      try {
        // 1. Update Auth display name
        await updateProfile(this.user, { displayName: this.newUsername });
        
        // 2. Update the relevant Firestore user document (added parts)
        const db = getFirestore(firebaseApp);
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);
        
        querySnapshot.forEach(async (doc) => {
          if (doc.data()["email"]?.toLowerCase() === this.user?.email?.toLowerCase()) {
            await updateDoc(doc.ref, { name: this.newUsername });
          }
        });
        
        this.username = this.newUsername;
        alert("Username updated successfully!");
      } catch (error) {
        console.error("Error updating username:", error);
        alert("Failed to update username. Please try again.");
      }
    }
    this.editingUsername = !this.editingUsername;
  }
  

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}