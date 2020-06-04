'use strict';

// foorly named. this is now top nav.
export function TopNavigationComponent (props) {
  const el = React.createElement.bind(React);
  return (
    el('div', {
      className: 'top-navigation-navigation'
    },
    el('ul', {},

      el('li', {},
        el('a', { href: '/glossary' }, 'Glossary')),
      el('li', {},
        el('a', { href: '/' }, 'Solve')),
      el('li', {},
        el('a', { href: '/edit-jargon' }, 'Edit')),
      el('li', {},
        el('a', { href: '/export-jargon' }, 'Export')),
      el('li', {},
        el('a', { href: '/privacy-policy' }, 'Privacy')),
      el('li', {},
        el('a', {
          target: 'new',
          href: 'https://github.com/gtzilla/jargonaut.app'
        }, 'Code'))))
  );
}
