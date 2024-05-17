import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface User
{
  name: string;
  bio: string;
  location: string;
  twitter_username: string;
  avatar_url: string;
  username: string;
}

interface Repository
{
  name: string;
  description: string;
  language: string;
}

@Component({
  selector: 'app-getuser',
  templateUrl: './getuser.component.html',
  styleUrls: ['./getuser.component.scss'],
  host: { ngSkipHydration: 'true' },
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
  private cache: { [key: string]: any } = {};
  perPageOptions: number[] = [10, 20, 50, 100];
  isLoading: boolean = false;
  isReposLoading: boolean = false;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  searchUser()
  {
    if (this.username.trim() === '')
    {
      const config = new MatSnackBarConfig();
      config.duration = 3000;
      config.verticalPosition = 'top';
      config.panelClass = ['indigo-pink'];
      this.snackBar.open('Please enter a username', 'Close', config);
      return;
    }

    if (this.cache[this.username])
    {
      this.userData = this.cache[this.username].userData;
      this.userAvatarUrl = this.cache[this.username].userAvatarUrl;
      this.repositories = this.cache[this.username].repositories;
      this.currentPage = 1;
      this.calculateTotalPages();
      return;
    }

    this.isLoading = true;
    const apiUrl = `https://api.github.com/users/${this.username}`;
    const headers = new HttpHeaders().set('Authorization', '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');

    this.http.get<User>(apiUrl, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching user data:', error);
        const config = new MatSnackBarConfig();
        config.duration = 3000;
        config.verticalPosition = 'top';
        config.panelClass = ['indigo-pink'];
        this.snackBar.open('Username not found', 'Close', config);
        this.isLoading = false;
        return of(null);
      })
    ).subscribe((response) => {
      this.isLoading = false;
      if (response) {
        this.userData = response;
        this.userAvatarUrl = response.avatar_url;
        this.getUserRepositories();
        this.currentPage = 1;
        this.cache[this.username] = {
          userData: this.userData,
          userAvatarUrl: this.userAvatarUrl,
          repositories: this.repositories
        };
      }
    });
  }

  getUserRepositories()
  {
    this.isReposLoading = true;
    const apiUrl = `https://api.github.com/users/${this.username}/repos`;
    const headers = new HttpHeaders().set('Authorization', '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');

    let allRepositories: Repository[] = [];
    let page = 1;

    const fetchRepositories = () => {
      const pageUrl = `${apiUrl}?page=${page}`;
      this.http.get<Repository[]>(pageUrl, { headers }).pipe(
        catchError((error) => {
          console.error('Error fetching user repositories:', error);
          return of([]);
        })
      ).subscribe((response) => {
        if (response.length === 0)
        {
          this.repositories = allRepositories;
          this.calculateTotalPages();
          this.isReposLoading = false;
          this.cache[this.username].repositories = this.repositories;
        }
        else
        {
          allRepositories = allRepositories.concat(response);
          page++;
          fetchRepositories();
        }
      });
    };

    fetchRepositories();
  }

  updateRepositoriesPerPage()
  {
    this.repositoriesPerPage = Math.min(Math.max(this.repositoriesPerPage, 10), 100);
    this.calculateTotalPages();
    this.currentPage = 1;
  }

  calculateTotalPages()
  {
    this.totalPages = Math.ceil(this.repositories.length / this.repositoriesPerPage);
    this.totalPageArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  prevPage()
  {
    if (this.currentPage > 1)
    {
      this.currentPage--;
    }
  }

  nextPage()
  {
    if (this.currentPage < this.totalPages)
    {
      this.currentPage++;
    }
  }

  getCurrentPageRepositories(): Repository[]
  {
    const startIndex = (this.currentPage - 1) * this.repositoriesPerPage;
    const endIndex = startIndex + this.repositoriesPerPage;
    return this.repositories.slice(startIndex, endIndex);
  }

}
