import { Component, computed, effect, inject, resource, signal } from '@angular/core';
import { NzStepComponent, NzStepsComponent } from 'ng-zorro-antd/steps';
import { NzInputDirective, NzInputWrapperComponent } from 'ng-zorro-antd/input';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { debounce, form, FormField, schema } from '@angular/forms/signals';
import { TmdbService } from '../services/tmdb.service';
import { MovieCard } from '../components/movie-card';
import { MovieResultItem } from '@lorenzopant/tmdb';

@Component({
  selector: 'movies-page',
  imports: [
    NzStepsComponent,
    NzStepComponent,
    NzInputDirective,
    NzInputWrapperComponent,
    NzDividerComponent,
    FormField,
    MovieCard,
  ],
  host: { class: 'page' },
  template: `
    <nz-steps
      nzDirection="vertical"
      [nzCurrent]="index()"
      (nzIndexChange)="index.set($event)"
      nzSize="small"
    >
      <nz-step nzTitle="Get your unordered top 100" [nzDisabled]="index() < 1"></nz-step>
      <nz-step nzTitle="Ranking" [nzDisabled]="index() < 2"></nz-step>
      <nz-step nzTitle="Get your ordered top 100" [nzDisabled]="index() < 3"></nz-step>
      <nz-step
        nzTitle="Get tailored recommendations from your friends"
        [nzDisabled]="index() < 4"
      ></nz-step>
    </nz-steps>
    <nz-divider />
    @if (index() === 0) {
      <div id="search-container">
        <nz-input-search>
          <input nz-input placeholder="Search for a movie" [formField]="form.query" />
        </nz-input-search>
        @if (selectedMovies().length > 2) {
          You're over but that's ok
        }
        <span>{{ selectedMovies().length }} / 100</span>
      </div>
      @if (form.query().value()) {
        <section class="results">
          @for (movie of results(); track movie.id) {
            <movie-card [movie]="movie" (movieClicked)="addMovie(movie)"></movie-card>
          }
        </section>
      } @else {
        <section class="results">
          @for (movie of selectedMovies(); track movie.id) {
            <movie-card
              [movie]="movie"
              (movieClicked)="removeMovie(movie)"
              [danger]="true"
            ></movie-card>
          }
        </section>
      }
    }
  `,
  styles: `
    #search-container {
      display: flex;
      gap: 24px;
      justify-content: space-between;
      align-items: center;
    }

    .results {
      padding: 24px 0;
      box-sizing: border-box;
      display: flex;
      gap: 12px;
      overflow-x: auto;
    }

    nz-divider {
      margin: 0 0 12px 0;
    }
  `,
})
export class MoviesPage {
  tmdb = inject(TmdbService).tmdb;
  index = signal<number>(0);
  model = signal({
    query: '',
  });
  #rules = schema<{ query: string }>((f) => {
    debounce(f.query, 500);
  });
  form = form(this.model, this.#rules);
  resultsResource = resource({
    params: () => ({ query: this.form.query().value() }),
    loader: ({ params }) => this.tmdb.search.movies({ query: params.query }),
  });
  results = computed(() => this.resultsResource.value()?.results ?? []);
  selectedMovies = signal<MovieResultItem[]>([]);

  constructor() {
    effect(() => {
      if (this.selectedMovies().length >= 1) {
        this.index.set(1);
      }
    });
  }

  addMovie(movie: MovieResultItem) {
    this.selectedMovies.update((v) => [...new Set([...v, movie])]);
    this.form.query().reset('');
  }

  removeMovie(movie: MovieResultItem) {
    this.selectedMovies.update((v) => v.filter((m) => m.id !== movie.id));
  }
}
