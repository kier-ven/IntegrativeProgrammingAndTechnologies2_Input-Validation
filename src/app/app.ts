import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import {CommonModule} from '@angular/common';

interface usersModel {
  username: string;
  email: string;
  password: string;
}

type ActivityType = 'login' | 'register' | 'update' | 'alert';

interface ActivityItem {
  at: Date;
  type: ActivityType;
  title: string;
  detail: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, NgIf, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {

  protected readonly title = signal('login');

  isLogin: boolean = true;
  isAuthenticated: boolean = false;
  loggedInRole: 'student' | 'instructor' | '' = '';
  loggedInUser: usersModel | null = null;

  loginSubmitted: boolean = false;
  registerSubmitted: boolean = false;

  email: string = '';
  password: string = '';
  usernameReg: string = '';

  regEmail: string = '';
  regPassword: string = '';
  role: string = 'student';

  message: string = '';

  students: any[] = [];
  instructors: any[] = [];
  newuserList: usersModel[]=[];
  hasValidated: boolean = false;

  activeNav: 'overview' | 'users' | 'settings' = 'overview';
  activity: ActivityItem[] = [];

  switchForm(){
    this.isLogin = !this.isLogin;
    this.message = '';
    this.loginSubmitted = false;
    this.registerSubmitted = false;
  }

  private isEmailFormatValid(value: string): boolean {
    const v = (value ?? '').trim();
    if (!v) return false;
    // simple, practical email check for UI validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  private isPasswordLengthValid(value: string): boolean {
    const len = (value ?? '').length;
    return len >= 5 && len <= 8;
  }

  get loginEmailError(): string {
    if (!this.loginSubmitted) return '';
    if (!this.email?.trim()) return 'Email is required.';
    if (!this.isEmailFormatValid(this.email)) return 'Please enter a valid email.';
    return '';
  }

  get loginPasswordError(): string {
    if (!this.loginSubmitted) return '';
    if (!this.password) return 'Password is required.';
    if (!this.isPasswordLengthValid(this.password)) return 'Password must be 5–8 characters.';
    return '';
  }

  get registerEmailError(): string {
    if (!this.registerSubmitted) return '';
    if (!this.regEmail?.trim()) return 'Email is required.';
    if (!this.isEmailFormatValid(this.regEmail)) return 'Please enter a valid email.';
    return '';
  }

  get registerUsernameError(): string {
    if (!this.registerSubmitted) return '';
    if (!this.usernameReg?.trim()) return 'Username is required.';
    return '';
  }

  get registerPasswordError(): string {
    if (!this.registerSubmitted) return '';
    if (!this.regPassword) return 'Password is required.';
    if (!this.isPasswordLengthValid(this.regPassword)) return 'Password must be 5–8 characters.';
    return '';
  }

  private pushActivity(type: ActivityType, title: string, detail: string) {
    this.activity.unshift({ at: new Date(), type, title, detail });
    this.activity = this.activity.slice(0, 8);
  }

  formatTime(d: Date) {
    try {
      return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(d);
    } catch {
      return d.toLocaleTimeString();
    }
  }

  logout(){
    if (this.loggedInUser) {
      this.pushActivity('update', 'Logged out', `${this.loggedInUser.email}`);
    }
    this.isAuthenticated = false;
    this.loggedInRole = '';
    this.loggedInUser = null;
    this.email = '';
    this.password = '';
    this.message = '';
    this.isLogin = true;
    this.activeNav = 'overview';
  }

  register(){
    this.registerSubmitted = true;
    this.message = '';

    if (this.registerEmailError || this.registerUsernameError || this.registerPasswordError || !this.role) {
      this.message = "Please fix the highlighted errors.";
      return;
    }
    this.hasValidated = true;

    const newUser: usersModel = {
      username: this.usernameReg,
      email: this.regEmail,
      password: this.regPassword,
    };

    if (this.role === 'student') {
      this.students.push(newUser);
    } else if (this.role === 'instructor') {
      this.instructors.push(newUser);
    }

    this.loadTableValues();
    this.message = "Registration successful";
    this.pushActivity('register', 'New registration', `${newUser.username} • ${newUser.email} • ${this.role}`);

    // clear registration fields after successful registration
    this.regEmail = '';
    this.usernameReg = '';
    this.regPassword = '';
    this.role = 'student';
    this.registerSubmitted = false;
  }

  Validate(){
    this.loginSubmitted = true;
    this.message = '';

    if (this.loginEmailError || this.loginPasswordError) {
      this.message = "Please fix the highlighted errors.";
      return;
    }

    const student = this.students.find(
      u => u.email === this.email && u.password === this.password
    );
    const instructor = this.instructors.find(
      u => u.email === this.email && u.password === this.password
    );
    if(student){
      this.message = "Logged in as Student";
      this.isAuthenticated = true;
      this.loggedInRole = 'student';
      this.loggedInUser = student;
      this.pushActivity('login', 'Signed in', `${student.email} • student`);
    }
    else if(instructor){
      this.message = "Logged in as Instructor";
      this.isAuthenticated = true;
      this.loggedInRole = 'instructor';
      this.loggedInUser = instructor;
      this.pushActivity('login', 'Signed in', `${instructor.email} • instructor`);
    }
    else{
      this.message = "Invalid credentials";
      this.isAuthenticated = false;
      this.loggedInRole = '';
      this.loggedInUser = null;
      this.pushActivity('alert', 'Failed login attempt', `${this.email || '(no email)'}`);
    }
  }
  loadTableValues(){
    const newUser: usersModel = {
      username: this.usernameReg,
      email: this.regEmail,
      password: this.regPassword,
    }
    this.newuserList.push(newUser);
  }
}