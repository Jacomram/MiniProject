import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../../../main';
import { get } from 'http';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {
addTask() {
  // Add a task to the database
  const db = getFirestore(firebaseApp);
  const tasksCollection = collection(db, 'tasks');

}
}