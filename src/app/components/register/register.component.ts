import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseApp } from '../../../main';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  isPasswordMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  async register() {
    if (!this.isPasswordMatch()) {
      alert("Passwords do not match!");
      return;
    }

    const auth = getAuth(firebaseApp);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
      console.log("User registered:", userCredential.user);

      await this.saveUserProfile(userCredential.user.uid, this.name, this.email);
      alert("Registration successful!");
      this.router.navigate(['/home']);
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Registration failed. Please try again");
    }
  }

  async saveUserProfile(uid: string, name: string, email: string): Promise<void> {
    const db = getFirestore(firebaseApp);
    try {
      await addDoc(collection(db, 'users'), {
        uid: uid,
        name: name,
        email: email,
        createdAt: new Date()
      });
      console.log("User profile saved successfully!");
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  }
}