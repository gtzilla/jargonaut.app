'use strict';

/**
  List of all solved

  Shown in several different views
  as a sub-component. Fleibel for right or left.
*/
import { JargonAndArconymComponent, phraseSort } from './jargon-and-arconym-component.js';
import { ThinStorage } from './thin-storage.js';
import {
  getShuffledCollection,
  nsfwFilter
} from './game-play-component.js';

const el = React.createElement.bind(React);
const thinStore = new ThinStorage();

export function unsolvedPhrases (isNSFW) {
  const solved = thinStore.get('correct_v1') || [];
  const appendToStarter = thinStore.get('append_to_starter_v1') || false;
  const allPhrases = nsfwFilter(isNSFW, getShuffledCollection(appendToStarter));
  const unsolved = allPhrases.filter(item => {
    return !solved.find(obj => {
      return obj.phrase === item.phrase;
    });
  });
  return unsolved;
}

export class GlossaryListComponent extends React.Component {
  static get propTypes () {
    return {
      onRemoveClick: () => {},
      onAcronymClick: () => {},
      buttonText: () => {},
      side: () => {},
      onReset: () => {},
      solved: () => {},
      noSpoilers: () => {},
      unsolved: () => {}
    };
  }

  handleClick (e) {
    if (this.props.onAcronymClick) {
      this.props.onAcronymClick(e);
    }
  }

  get solved () {
    return Array.from(this.props.solved).sort(phraseSort) || [];
  }

  handleClickRemove (e) {
    e.preventDefault();
    const idx = e.currentTarget.getAttribute('data-index');
    const targetSolved = this.solved[idx];
    if (_.isFunction(this.props.onRemoveClick)) {
      this.props.onRemoveClick(e, targetSolved);
    }
  }

  render () {
    const buttonText = this.props.buttonText || 'Reset';
    const style = {};
    if (this.props.side) {
      style.float = this.props.side;
    }
    const _resetButton = this.solved.length ? el('div', {
      className: 'success-list-reset-button-box',
      onClick: this.props.onReset
    }, el('a', {}, buttonText)) : null;
    return (
      el(React.Fragment, {},
        el('div', {
          style,
          className: 'success-list-component-box side_' + this.props.side || 'right'
        },
        el(JargonAndArconymComponent, {
          noSpoilers: this.props.noSpoilers,
          unsolved: this.props.unsolved,
          solved: this.solved,
          side: this.props.side,
          allowRemoval: !!this.props.onRemoveClick,
          handleClickRemove: this.handleClickRemove.bind(this)
        }),
        _resetButton)));
  }
}
