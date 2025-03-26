import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseApp } from '../../../main';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {
  taskTitle: string = '';
  taskDescription: string = '';

  async addTask() {
    try {
      const db = getFirestore(firebaseApp);
      const tasksCollection = collection(db, 'tasks');
      
      const taskData = {
        title: this.taskTitle,
        description: this.taskDescription,
        createdAt: new Date(),
        completed: false
      };

      await addDoc(tasksCollection, taskData);
      
      // Clear fields after adding the task
      this.taskTitle = '';
      this.taskDescription = '';
      
      console.log('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }
}