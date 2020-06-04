'use strict';

const el = React.createElement.bind(React);
export function AddedStatsComponent (props) {
  return (
    el(React.Fragment, {},
      el('div', {
        className: 'added-stats-component-box'
      },
      el('ul', {
        className: 'added-stats-component-list'
      },
      el('li', {}, 'Attempted: ', props.newAttempted),
      el('li', {}, 'existing: ', props.existing),
      el('li', {}, 'New added: ', props.deduped),
      el('li', {}, 'Total: ', props.total))))
  );
}
