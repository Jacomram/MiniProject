import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../../main';
import { BehaviorSubject } from 'rxjs';

export interface Task {
  id?: string;
  title: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'done';
  createdAt: Date;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private backlogTasks = new BehaviorSubject<Task[]>([]);
  private inProgressTasks = new BehaviorSubject<Task[]>([]);
  private doneTasks = new BehaviorSubject<Task[]>([]);
  private currentUserId: string | null = null;

  backlogTasks$ = this.backlogTasks.asObservable();
  inProgressTasks$ = this.inProgressTasks.asObservable();
  doneTasks$ = this.doneTasks.asObservable();

  private db = getFirestore(firebaseApp);
  private tasksCollection = collection(this.db, 'tasks');

  constructor() {
    // Listen for auth state changes
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, (user) => {
      this.currentUserId = user ? user.uid : null;
      if (this.currentUserId) {
        this.listenToTasks();
      } else {
        // Clear tasks when user logs out
        this.backlogTasks.next([]);
        this.inProgressTasks.next([]);
        this.doneTasks.next([]);
      }
    });
  }

  private listenToTasks() {
    if (!this.currentUserId) return;

    // Create a query to filter tasks by userId
    const userTasksQuery = query(this.tasksCollection, where('userId', '==', this.currentUserId));

    onSnapshot(userTasksQuery, (snapshot) => {
      const backlog: Task[] = [];
      const inProgress: Task[] = [];
      const done: Task[] = [];

      snapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() } as Task;
        switch (task.status) {
          case 'backlog':
            backlog.push(task);
            break;
          case 'in-progress':
            inProgress.push(task);
            break;
          case 'done':
            done.push(task);
            break;
        }
      });

      this.backlogTasks.next(backlog);
      this.inProgressTasks.next(inProgress);
      this.doneTasks.next(done);
    });
  }

  async addTask(task: Omit<Task, 'id' | 'userId'>) {
    if (!this.currentUserId) {
      throw new Error('No user is currently logged in');
    }

    try {
      await addDoc(this.tasksCollection, {
        ...task,
        userId: this.currentUserId
      });
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId: string, newStatus: Task['status']) {
    if (!this.currentUserId) {
      throw new Error('No user is currently logged in');
    }

    try {
      const taskRef = doc(this.db, 'tasks', taskId);
      await updateDoc(taskRef, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string) {
    if (!this.currentUserId) {
      throw new Error('No user is currently logged in');
    }

    try {
      const taskRef = doc(this.db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
} 