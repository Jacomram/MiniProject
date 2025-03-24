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

  constructor(private router: Router) {} 

  async register() {
    const auth = getAuth(firebaseApp);
    try {
      // User registration with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
      console.log("User registered:", userCredential.user);

      // Saving user information with Firebase
      await this.saveUserProfile(userCredential.user.uid, this.name, this.email);

      alert("Registration successful!");

      // Registration successful, navigate to home page
      this.router.navigate(['/home']);
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Registration failed. Please try again");
    }
  }

  // Save user profile in Firestore
  async saveUserProfile(uid: string, name: string, email: string): Promise<void> {
    const db = getFirestore(firebaseApp);
    try {
      // Add data to Firestore's users collection 
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