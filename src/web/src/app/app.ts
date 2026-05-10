import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzSegmentedComponent } from 'ng-zorro-antd/segmented';
import { NzAffixComponent } from 'ng-zorro-antd/affix';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzCardComponent, NzSegmentedComponent, NzAffixComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <nz-card id="app-content">
      <nz-affix nzTarget="#app-content" nzOffsetTop="24">
        <nz-segmented
          id="page-selector"
          [nzOptions]="views()"
          (nzValueChange)="goToPage($event)"
        ></nz-segmented>
      </nz-affix>
      <router-outlet></router-outlet>
    </nz-card>
  `,
  styles: `
    @import '../styles';
    app-root {
      display: flex;
      height: 100%;
      width: 100%;
      padding: 5%;
      justify-content: center;
    }

    #app-content {
      width: 100%;
      height: 100%;
    }

    #page-selector {
      width: 100%;
      margin-bottom: 24px;
      background-color: @card-background;
    }

    .ant-segmented-item {
      width: 33.33%;
    }
  `,
})
export class App {
  views = signal(['Movies', 'TV', 'Books']);

  router = inject(Router);

  goToPage(page: string | number) {
    this.router.navigate([(page as string).toLowerCase()]);
  }
}
