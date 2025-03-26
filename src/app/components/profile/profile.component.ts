import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component'; 
import { SideNavListComponent } from '../side-nav/side-nav.component'; 
import { RouterModule } from '@angular/router';
import { getAuth, onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider, User } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from '../../../main';

interface ProfileUser extends User {
  displayName: string;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, HeaderComponent, SideNavListComponent, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent {
  user: User | null = null;
  username: string = '';
  showPasswordForm: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';

  isSideNavOpen: boolean = false; //Variable to control sidebar open and close

  constructor(private ngZone: NgZone) { 
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, async (currentUser) => {
      this.ngZone.run(() => { 
        if (currentUser) {
          this.user = currentUser;
          this.username = currentUser.displayName || currentUser.email?.split('@')[0] || 'Not set';
        } else {
          this.user = null;
          this.username = 'Not set';
        }
      });
    });
  }

  toggleSideNav() {
    this.isSideNavOpen = !this.isSideNavOpen; // Function to change open and close sidebar
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
      await updatePassword(this.user, this.newPassword);
      alert("Password updated successfully!");
      this.showPasswordForm = false;
      this.newPassword = '';
      this.confirmPassword = '';
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
}