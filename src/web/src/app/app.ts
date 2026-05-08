import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzFlexDirective} from 'ng-zorro-antd/flex';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzButtonComponent, NzCardComponent, NzFlexDirective],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  protected readonly title = signal('what-we-like');
}
