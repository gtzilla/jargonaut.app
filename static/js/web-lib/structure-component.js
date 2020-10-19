'use strict';

/**
  Header + Footer UI Wrap

  Allows page contents as props.children
*/
import { TopNavigationComponent } from './top-navigation-component.js';
const el = React.createElement.bind(React);

export class StructureComponent extends React.PureComponent {
// export function StructureComponent (props) {
  static get propTypes () {
    return {
      router: () => {},
      remaining: () => {},
      children: () => {},
      acronym: () => {}
    };
  }

  static get defaultProps () {
    return {
      acronym: '',
      router: null
    };
  }

  render () {
    return (
      el(React.Fragment, {},
        el('div', {
          className: 'container'
        },
        el(TopNavigationComponent, {
          router: this.props.router,
          host: '/'
        }),
        el('h1', {},
          el('a', {
            title: 'Jargonaut',
            href: '/'
          }, 'Jargonaut'),
          el('span', {
            className: 'header-tiny-tag-teaser'
          }, this.props.acronym),
          el('span', {
            className: 'header-remaining-count-tag-teaser'
          }, this.props.remaining)),
        el('p', {}, 'Enterprise vernacular training game and glossary'),
        this.props.children)));
  }
}
