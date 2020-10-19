'use strict';

// foorly named. this is now top nav.
const el = React.createElement.bind(React);
export class TopNavigationComponent extends React.PureComponent {
  static get propTypes () {
    return {
      router: () => {}
    };
  }

  static get defaultProps () {
    return {
      router: null
    };
  }

  componentDidMount () {
    if (this.props.router) {
      // gross
      this.props.router.updatePageLinks();
    }
  }

  render () {
    return (
      el('div', {
        className: 'top-navigation-navigation'
      },
      el('ul', {
        role: 'navigation',
        'aria-label': 'App Navigation'
      },
      el('li', {},
        el('a', {
          'data-navigo': true,
          href: '/glossary'
        }, 'Glossary')),
      el('li', {},
        el('a', {
          'data-navigo': true,
          href: '/'
        }, 'Solve')),
      el('li', {},
        el('a', {
          'data-navigo': true,
          href: '/edit-jargon'
        }, 'Edit')),
      el('li', {},
        el('a', {
          'data-navigo': true,
          href: '/share'
        }, 'Share')),
      el('li', {},
        el('a', {
          'data-navigo': true,
          href: '/privacy-policy'
        }, 'Privacy')),
      el('li', {},
        el('a', {
          target: 'new',
          href: 'https://github.com/gtzilla/jargonaut.app'
        }, 'Code'))))
    );
  }
}
