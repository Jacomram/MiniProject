import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, doc } from "firebase/firestore";
import { firebaseApp } from '../../../main';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      this.router.navigate(['/home']);
    }
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  isPasswordMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  // Register
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

      // save login status
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", this.email);
      localStorage.setItem("userName", this.name);

      alert("Registration successful!");

      await this.login();

      this.router.navigate(['/home']);
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Registration failed. Please try again");
    }
  }

  async login() {
    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
      console.log("User logged in:", userCredential.user);

      // Saving login log with Firebase
      await this.loginLog(userCredential.user.uid, this.email);

      // Login successful, navigate to home page
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error("Login failed:", error.message);

      // Handle specific Firebase Authentication error codes
      switch (error.code) {
        case "auth/user-not-found":
          alert("No user found with this email. Please sign up.");
          break;
        case "auth/wrong-password":
          alert("Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          alert("Invalid email format.");
          break;
        case "auth/user-disabled":
          alert("This account has been disabled.");
          break;
        case "auth/invalid-credential":
          alert("Incorrect email or password. Please try again.");
          break;
        case "auth/missing-password":
          alert("Please enter the password.");
          break;
        default:
          alert("Login failed: " + error.message);
      }
    }
  }

  // Login Log function
  async loginLog(uid: string, email: string): Promise<void> {
    const db = getFirestore(firebaseApp);
    try {
      const curentTime: string = Date.now().toString();
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollection);
      
      let username = "";
      querySnapshot.forEach((doc) => {
          if(doc.data()["email"].toLocaleLowerCase() == email?.toLocaleLowerCase()) {
              username = doc.data()["name"];
          }
      });

      if(username == "")
          username = email?.split('@')[0]; 

      // Add data to Firestore's login_log collection 
      await addDoc(collection(db, 'login_log'), {
        uid: uid,
        email: email,
        loginTime: curentTime,
        createdAt: new Date()
      });

      //keep login information
      localStorage.setItem("loginTime", curentTime);
      localStorage.setItem("uid", uid);
      localStorage.setItem("userInfo", username + "|" + email);

      console.log("login log saved successfully!", localStorage);
    } catch (error) {
      console.error("Error saving login log:", error);
      throw error;
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