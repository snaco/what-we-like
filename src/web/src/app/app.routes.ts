import { Routes } from '@angular/router';
import { MoviesPage } from '../pages/movies';
import { TvPage } from '../pages/tv';
import { BooksPage } from '../pages/books';

export const routes: Routes = [
  {
    path: 'movies',
    component: MoviesPage,
  },
  {
    path: '',
    redirectTo: 'movies',
    pathMatch: 'full',
  },
  {
    path: 'tv',
    component: TvPage,
  },
  {
    path: 'books',
    component: BooksPage,
  },
];
