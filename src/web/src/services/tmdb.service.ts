import { Injectable } from '@angular/core';
import { TMDB } from '@lorenzopant/tmdb';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  tmdb = new TMDB(
    'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkOTExYzk1ZTIwMjIyOGU4ZjY3OTA3NWNjMTQ2YWE5YSIsIm5iZiI6MTc3ODMwODc5My44OTQsInN1YiI6IjY5ZmVkNmI5NzZlOGYxYmRkODIyMTU5YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.eKdQelulFl5peA0m6iodkgL6hbPRcqJX2SxYrat1Xl4',
  );
}
