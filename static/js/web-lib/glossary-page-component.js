'use strict';

/**
  When completed, show just a glossary view of
  all solved jargon acronyms
*/

import { StructureComponent } from './structure-component.js';
import { GlossaryListComponent, unsolvedPhrases } from './glossary-list-component.js';
import { UserPreferencesComponent } from './user-preferences-component.js';
import { ThinStorage } from './thin-storage.js';
import {
  getCollection,
  nsfwFilter
} from './game-play-component.js';

const el = React.createElement.bind(React);
const thinStore = new ThinStorage();
export class GlossaryPageComponent extends React.PureComponent {
  constructor (props) {
    super(props);
    const isNSFW = thinStore.get('nsfw_v1') || false;
    const allPhrases = nsfwFilter(isNSFW, getCollection());
    this.state = {
      allPhrases,
      unsolved: unsolvedPhrases(isNSFW)
    };
  }

  static get propTypes () {
    return {
      router: () => {},
      solved: () => {},
      handleReset: () => {}
    };
  }

  render () {
    const href = '/edit-jargon';
    return (
      el(React.Fragment, {},
        el(UserPreferencesComponent, {
          onChange: (evt, isNSFW) => {},
          onLibraryAdded: (rawLibraryUrl) => {}
        }),
        el(StructureComponent, { router: this.props.router },
          el('div', {
            className: 'glossary-page-header'
          },
          el('h2', {}, 'Jargon Glossary')),
          el('div', {
            className: 'all-phrases-solved-box'
          },
          el('p', {}, 'Jargon decoded.'),
          el('a', { href }, 'Add Jargon'),
          ', ',
          el('a', { href: '/share' }, 'Share'),
          ' or ',
          el('a', { href: '/' }, 'Solve')),
          el(GlossaryListComponent, {
            noSpoilers: true,
            solved: this.state.allPhrases,
            unsolved: this.state.unsolved,
            onAcronymClick: () => {
              console.log('An acronym in the success list was clicked');
            },
            onReset: (evt) => {
              this.props.handleReset(evt);
            },
            side: 'left'
          }))));
  }
}
