import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { NzStepComponent, NzStepsComponent } from 'ng-zorro-antd/steps';
import { NzInputDirective, NzInputWrapperComponent } from 'ng-zorro-antd/input';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import {
  NzListComponent,
  NzListItemComponent,
  NzListItemMetaComponent,
  NzListItemMetaTitleComponent,
} from 'ng-zorro-antd/list';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { debounce, form, FormField, schema } from '@angular/forms/signals';
import { TmdbService } from '../services/tmdb.service';
import { MovieCard } from '../components/movie-card';
import { MovieResultItem } from '@lorenzopant/tmdb';

interface SortState {
  segments: MovieResultItem[][];
  leftIdx: number;
  rightIdx: number;
  currentMerged: MovieResultItem[];
}

export const MIN_MOVIES = 2;

@Component({
  selector: 'movies-page',
  imports: [
    NzStepsComponent,
    NzStepComponent,
    NzInputDirective,
    NzInputWrapperComponent,
    NzDividerComponent,
    NzButtonComponent,
    NzListComponent,
    NzListItemComponent,
    NzListItemMetaComponent,
    NzListItemMetaTitleComponent,
    FormField,
    MovieCard,
    CdkDropList,
    CdkDrag,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page' },
  template: `
    <nz-steps
      nzDirection="vertical"
      [nzCurrent]="index()"
      (nzIndexChange)="index.set($event)"
      nzSize="small"
    >
      <nz-step [nzTitle]="step1Label()"></nz-step>
      <nz-step nzTitle="Rank your movies by comparison"></nz-step>
      <nz-step nzTitle="Review and Finalize"></nz-step>
      <nz-step nzTitle="..."></nz-step>
    </nz-steps>
    <nz-divider />
    @if (index() === 0) {
      <div id="search-container">
        <nz-input-search>
          <input nz-input placeholder="Search for a movie" [formField]="form.query" />
        </nz-input-search>
        @if (selectedMovies().length > 3) {
          You're over but that's ok! Add more movies if you want.
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
    @if (index() === 1) {
      @if (currentPair(); as pair) {
        <section class="comparison" aria-labelledby="comparison-prompt">
          <p id="comparison-prompt" class="comparison-prompt">Which do you prefer?</p>
          <div class="comparison-pair" role="group" aria-label="Choose between two movies">
            <movie-card [movie]="pair[0]" (movieClicked)="choose(true)"></movie-card>
            <movie-card [movie]="pair[1]" (movieClicked)="choose(false)"></movie-card>
          </div>
        </section>
      }
    }
    @if (index() === 2) {
      <section class="ranking-section">
        <nz-list
          cdkDropList
          [cdkDropListData]="sortedSelections()"
          (cdkDropListDropped)="drop($event)"
          aria-label="Your ranked movie list"
        >
          @for (movie of sortedSelections(); track movie.id; let i = $index) {
            <nz-list-item cdkDrag>
              <nz-list-item-meta>
                <nz-list-item-meta-title>
                  <span class="rank-num">{{ i + 1 }}.</span>
                  {{ movie.title }}
                  <span class="movie-year">{{ movie.release_date.slice(0, 4) }}</span>
                </nz-list-item-meta-title>
              </nz-list-item-meta>
            </nz-list-item>
          }
        </nz-list>
        <button
          id="accept-ranking"
          nz-button
          nzType="primary"
          nzSize="large"
          (click)="acceptRanking()"
        >
          Accept ranking
        </button>
      </section>
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

    .comparison {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 24px 0;
    }

    .comparison-prompt {
      font-size: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    .comparison-pair {
      display: flex;
      gap: 24px;
      justify-content: center;
    }

    .ranking-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .drag-handle {
      cursor: grab;
      font-size: 1.25rem;
      color: #bbb;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .rank-num {
      font-variant-numeric: tabular-nums;
      color: #888;
      margin-right: 6px;
    }

    .movie-year {
      color: #888;
      font-size: 0.875rem;
      margin-left: 6px;
    }

    .cdk-drag-preview {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: #fff;
      border-radius: 4px;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
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
  sortState = signal<SortState | null>(null);
  sortedSelections = signal<MovieResultItem[]>([]);

  currentPair = computed((): [MovieResultItem, MovieResultItem] | null => {
    const state = this.sortState();
    if (!state || state.segments.length < 2) return null;
    return [state.segments[0][state.leftIdx], state.segments[1][state.rightIdx]];
  });

  step1Label = signal(`Enter at least ${MIN_MOVIES} movies`);

  constructor() {
    effect(() => {
      if (this.selectedMovies().length >= MIN_MOVIES) {
        this.step1Label.set(`Enter at least ${MIN_MOVIES} movies (or keep adding more)`);
      }
    });

    effect(() => {
      if (this.index() === 1 && this.sortState() === null) {
        const movies = this.selectedMovies();
        if (movies.length <= 1) {
          this.sortedSelections.set([...movies]);
          return;
        }
        this.sortState.set({
          segments: movies.map((m) => [m]),
          leftIdx: 0,
          rightIdx: 0,
          currentMerged: [],
        });
      }
    });
  }

  choose(pickedLeft: boolean) {
    let sorted: MovieResultItem[] | null = null;

    this.sortState.update((state) => {
      if (!state) return state;
      const [left, right, ...rest] = state.segments;
      let { leftIdx, rightIdx, currentMerged } = state;

      if (pickedLeft) {
        currentMerged = [...currentMerged, left[leftIdx++]];
      } else {
        currentMerged = [...currentMerged, right[rightIdx++]];
      }

      if (leftIdx >= left.length || rightIdx >= right.length) {
        const fullMerged =
          leftIdx >= left.length
            ? [...currentMerged, ...right.slice(rightIdx)]
            : [...currentMerged, ...left.slice(leftIdx)];
        const newSegments = [...rest, fullMerged];
        if (newSegments.length === 1) sorted = newSegments[0];
        return { segments: newSegments, leftIdx: 0, rightIdx: 0, currentMerged: [] };
      }

      return { segments: state.segments, leftIdx, rightIdx, currentMerged };
    });

    if (sorted) {
      this.sortedSelections.set(sorted);
      this.index.set(2);
    }
  }

  drop(event: CdkDragDrop<MovieResultItem[]>) {
    const list = [...this.sortedSelections()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.sortedSelections.set(list);
  }

  acceptRanking() {
    this.index.set(3);
  }

  addMovie(movie: MovieResultItem) {
    this.selectedMovies.update((v) => [...new Set([...v, movie])]);
    this.form.query().reset('');
  }

  removeMovie(movie: MovieResultItem) {
    this.selectedMovies.update((v) => v.filter((m) => m.id !== movie.id));
  }
}
