import { Directive } from '@angular/core';

@Directive({ selector: '[fade-in]', host: { class: 'fade-in' } })
export class FadeInDirective {}
