import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface User {
  name: string;
  bio: string;
  location: string;
  twitter_username: string;
  avatar_url: string;
  username: string;
}

interface Repository {
  name: string;
  description: string;
  language: string;
}

@Component({
  selector: 'app-getuser',
  templateUrl: './getuser.component.html',
  styleUrls: ['./getuser.component.scss']
})

export class GetuserComponent
{
  username: string = '';
  userData: User | undefined;
  error: string | undefined;
  userAvatarUrl: string | undefined;
  repositories: Repository[] = [];
  currentPage: number = 1;
  repositoriesPerPage: number = 10;
  totalPages: number = 0;
  totalPageArray: number[] = [];

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  searchUser() {
    if (this.username.trim() === '') {
      const config = new MatSnackBarConfig();
      config.duration = 3000;
      config.verticalPosition = 'top';
      config.panelClass = ['indigo-pink'];
      this.snackBar.open('Please enter a username', 'Close', config);
      return;
    }

    const apiUrl = `https://api.github.com/users/${this.username}`;
    const headers = new HttpHeaders().set('Authorization','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');

    this.http.get<User>(apiUrl, {headers}).pipe(
      catchError((error) => {
        console.error('Error fetching user data:', error);
        const config = new MatSnackBarConfig();
        config.duration = 3000;
        config.verticalPosition = 'top';
        config.panelClass = ['indigo-pink'];
        this.snackBar.open('Username not found', 'Close', config);
        return of(null);
      })
    ).subscribe((response) => {
      if (response) {
        this.userData = response;
        this.userAvatarUrl = response.avatar_url;
        this.getUserRepositories();
        this.currentPage = 1;
        console.log('Name:', this.userData.name);
        console.log('Bio:', this.userData.bio);
        console.log('Location:', this.userData.location);
        console.log('Twitter Account:', this.userData.twitter_username);
      }
    });
  }

  getUserRepositories() {
    const apiUrl = `https://api.github.com/users/${this.username}/repos`;
    const headers = new HttpHeaders().set('Authorization','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');

    // Variables to store all repositories
    let allRepositories: Repository[] = [];
    let page = 1;

    // Define a function to fetch repositories recursively until no more pages are available
    const fetchRepositories = () => {
      const pageUrl = `${apiUrl}?page=${page}`;
      this.http.get<Repository[]>(pageUrl, { headers }).pipe(
        catchError((error) => {
          console.error('Error fetching user repositories:', error);
          return of([]);
        })
      ).subscribe((response) => {
        // If response is empty, stop fetching
        if (response.length === 0) {
          // Assign all repositories fetched to the class property
          this.repositories = allRepositories;
          this.calculateTotalPages(); // Calculate total pages
          console.log('User Repositories:', this.repositories);
        } else {
          // If response is not empty, append to the allRepositories array and increment page number
          allRepositories = allRepositories.concat(response);
          page++;
          // Fetch next page
          fetchRepositories();
        }
      });
    };

    // Start fetching repositories
    fetchRepositories();
  }


  calculateTotalPages() {
    this.totalPages = Math.ceil(this.repositories.length / this.repositoriesPerPage);
    console.log('Total Pages:', this.totalPages);
    this.totalPageArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      console.log('Current Page:', this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      console.log('Current Page:', this.currentPage);
    }
  }

  getCurrentPageRepositories(): Repository[] {
    const startIndex = (this.currentPage - 1) * this.repositoriesPerPage;
    const endIndex = startIndex + this.repositoriesPerPage;
    return this.repositories.slice(startIndex, endIndex);
  }
}

