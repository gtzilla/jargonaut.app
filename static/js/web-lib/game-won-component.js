'use strict';

import { StructureComponent } from './structure-component.js';
import { SuccessListComponent } from './success-list-component.js';
const el = React.createElement.bind(React);
class GameWonComponent extends React.Component {
  static get propTypes () {
    return {
      solved: () => {},
      handleReset: () => {},
      isNSFW: () => {}
    };
  }

  setNSFW (isNSFW) {
    this.setState({
      isNSFW
    });
  }

  nsfwChecker (item) {
    if (!this.props.isNSFW && item.rating !== 'g') return false;
    return true;
  }

  render () {
    const winTerms = ['Champion', 'You won', 'Winner'];
    const pos = _.random(0, winTerms.length - 1);
    const href = '/suggest';

    return (
      el(StructureComponent, {},
        el('div', {
          className: 'you-won-header'
        },
        el('h2', {}, winTerms[pos] + '!')),
        el('div', {
          className: 'all-phrases-solved-box'
        },
        el('p', {}, 'You\'ve already solved the-acronym-game. Add to the dictionary.'),
        el('a', { href }, 'Add more Jargon'),
        ' or ',
        el('a', {
          onClick: (e) => {
            this.props.handleReset(e);
            document.location.assign('/');
          },
          href: '#'
        }, 'Reset')),
        el(SuccessListComponent, {
          solved: this.props.solved,
          onAcronymClick: () => {
            console.log('An acronym in the success list was clicked');
          },
          onReset: (e) => {
            this.props.handleReset(e);
            document.location.assign('/');
          },
          side: 'left'
        })));
  }
}

export { GameWonComponent };
