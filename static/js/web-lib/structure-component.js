'use strict';

import { FooterComponent } from './footer-component.js';
const el = React.createElement.bind(React);
export function StructureComponent (props) {
  const href = '/';

  return (
    el(React.Fragment, {},
      el('div', {
        className: 'container'
      },
      el('h1', {},
        el('a', {
          title: 'Jargonaut',
          href: '/'
        }, 'Jargonaut'),
        el('span', {
          className: 'header-tiny-tag-teaser'
        }, props.acronym),
        el('span', {
          className: 'header-remaining-count-tag-teaser'
        }, props.remaining)),
      el('p', {}, 'Enterprise vernacular training game and glossary'),
      props.children),
      el(FooterComponent, { host: href })));
}
