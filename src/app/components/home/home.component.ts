import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SideNavListComponent } from '../side-nav/side-nav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TasksComponent } from "../tasks/tasks.component";
import { TaskService, Task } from '../../services/task.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent, 
    SideNavListComponent, 
    MatSidenavModule, 
    TasksComponent,
    DragDropModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  sidenavOpened = false;

  constructor(public taskService: TaskService) {}

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  async deleteTask(task: Task) {
    if (task.id) {
      try {
        await this.taskService.deleteTask(task.id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  }

  async onDrop(event: CdkDragDrop<Task[], Task[], Task>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Update task status in Firebase
      const task = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromContainerId(event.container.id);
      if (task.id && newStatus) {
        await this.taskService.updateTaskStatus(task.id, newStatus);
      }
    }
  }

  private getStatusFromContainerId(containerId: string): 'backlog' | 'in-progress' | 'done' | null {
    switch (containerId) {
      case 'backlog':
        return 'backlog';
      case 'in-progress':
        return 'in-progress';
      case 'done':
        return 'done';
      default:
        return null;
    }
  }
}
