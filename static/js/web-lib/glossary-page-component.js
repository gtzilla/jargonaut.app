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
    const appendToStarter = thinStore.get('append_to_starter_v1') || false;
    const allPhrases = nsfwFilter(isNSFW, getCollection(appendToStarter));
    this.state = {
      allPhrases,
      unsolved: unsolvedPhrases(isNSFW),
      appendToStarter: thinStore.get('append_to_starter_v1') || false
    };
  }

  static get propTypes () {
    return {
      solved: () => {},
      handleReset: () => {}
    };
  }

  render () {
    const href = '/edit-jargon';
    return (
      el(React.Fragment, {},
        el(UserPreferencesComponent, {
          appendToStarter: this.state.appendToStarter,
          onChange: (e, isNSFW) => {},
          onAppendToggleChange: (isAppendToStarter) => {
            this.setState({
              appendToStarter: isAppendToStarter
            });
            const solved = thinStore.get('correct_v1') || [];
            this.setState({
              solved
            });
            thinStore.del('nextUp_v1');
            thinStore.set('append_to_starter_v1', isAppendToStarter);
          },
          onLibraryAdded: (rawLibraryUrl) => {
          }
        }),
        el(StructureComponent, {},
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
          el('a', { href: '/export' }, 'Export'),
          ' or ',
          el('a', { href: '/' }, 'Solve')),
          el(GlossaryListComponent, {
            noSpoilers: true,
            // poorly named. solved is more like all
            solved: this.state.allPhrases,
            unsolved: this.state.unsolved,
            onAcronymClick: () => {
              console.log('An acronym in the success list was clicked');
            },
            onReset: (e) => {
              this.props.handleReset(e);
              document.location.assign('/');
            },
            side: 'left'
          }))));
  }
}
