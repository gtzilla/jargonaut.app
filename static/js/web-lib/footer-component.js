'use strict';

export function FooterComponent (props) {
  const el = React.createElement.bind(React);
  return (
    el('div', {
      className: 'footer'
    },
    el('ul', {},
      el('li', {},
        el('a', { href: '/suggest' }, 'Add Jargon')),
      el('li', {},
        el('a', { href: '/solved' }, 'Solved')),
      el('li', {},
        el('a', { href: 'https://github.com/gtzilla/jargonaut.app' }, 'Github'))))
  );
}
