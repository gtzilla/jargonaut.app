'use strict';

import { deriveAcronymFromPhrase } from './hintable-input-component.js';

const el = React.createElement.bind(React);

export function phraseSort (item1, item2) {
  if (item1.phrase > item2.phrase) return 1;
  if (item1.phrase < item2.phrase) return -1;
  if (item1.phrase === item2.phrase) return 0;
}

export function JargonAndArconymComponent (props) {
  const items = Array.from(props.solved).sort(phraseSort).map((item, idx) => {
    const acronym = item.alt ? item.alt : deriveAcronymFromPhrase(item.phrase);
    let phraseOrSpoilerBlock = item.phrase;
    if (props.noSpoilers) {
      const found = props.unsolved.find(obj => item.phrase === obj.phrase);
      if (found) {
        phraseOrSpoilerBlock = _.range(0, item.phrase.length).map(idx => '*').join('');
      }
    }
    const closeButton = el('li', {
      'data-index': idx,
      title: 'Remove Jargon',
      onClick: props.handleClickRemove.bind(this),
      className: 'success-list-single-item-removed-btn'
    }, 'X');
    return el('div', {
      className: 'success-list-single-item'
    },
    el('ul', {
      className: 'success-list-subview-flexlist'
    },
    props.allowRemoval && props.side !== 'left' ? closeButton : null,
    el('li', {}, phraseOrSpoilerBlock),
    el('li', {
    }, el('a', { href: '/acronym/' + acronym }, acronym)),

    props.allowRemoval && props.side === 'right' ? closeButton : null));
  });
  return (
    el(React.Fragment, {},
      ...items));
}
