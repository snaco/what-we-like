import { Component, computed, inject, input, output } from '@angular/core';
import { TmdbService } from '../services/tmdb.service';
import { MovieResultItem } from '@lorenzopant/tmdb';
import { NzButtonComponent } from 'ng-zorro-antd/button';

@Component({
  selector: 'movie-card',
  imports: [NzButtonComponent],
  template: `
    <ng-template #cover>
      <img [src]="poster()" alt="poster" />
    </ng-template>
    <button nz-button (click)="movieClicked.emit()" [nzDanger]="danger()">
      <img [src]="poster()" alt="poster" />
      <div>{{ releaseDate() }}</div>
    </button>
  `,
  styles: `
    img {
      max-height: 30vh;
      aspect-ratio: 2/3;
    }
    .title {
      text-wrap: wrap;
      max-width: 100px;
    }
    button {
      height: 25vh + 12px;
    }
  `,
})
export class MovieCard {
  tmdb = inject(TmdbService).tmdb;
  movie = input.required<MovieResultItem>();
  releaseDate = computed(() => this.movie().release_date);
  posterPath = computed(() => this.movie().poster_path);
  poster = computed(() => (this.posterPath() ? this.tmdb.images.poster(this.posterPath()!) : null));
  movieClicked = output<void>();
  danger = input<boolean>(false);
}
