import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Router } from '@angular/router';
import { getAuth } from 'firebase/auth';

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

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}

  async addTask() {
    if (!this.taskTitle.trim()) return;

    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        await this.router.navigate(['/login']);
        return;
      }

      await this.taskService.addTask({
        title: this.taskTitle,
        description: this.taskDescription,
        status: 'backlog',
        createdAt: new Date()
      });
      
      // Clear fields after adding the task
      this.taskTitle = '';
      this.taskDescription = '';
      
      console.log('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      if (error instanceof Error && error.message === 'No user is currently logged in') {
        await this.router.navigate(['/login']);
      }
    }
  }
}