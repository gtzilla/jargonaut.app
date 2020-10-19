'use strict';

import { UserPreferencesComponent } from './user-preferences-component.js';
import { GameLettersComponent, deriveAcronymFromPhrase } from './game-letters-component.js';
import { ComprehensivePhraseCollection } from '../phrases/phrases-list.js';
import { ThinStorage } from './thin-storage.js';
import { StructureComponent } from './structure-component.js';
import { GlossaryListComponent } from './glossary-list-component.js';

const thinStore = new ThinStorage();
const el = React.createElement.bind(React);

export function nsfwFilter (isNSFW, array) {
  return array.filter((item, idx, all) => {
    if (!isNSFW && item.rating !== 'g') return false;
    return true;
  });
}

export function pickCorrectAcronym (item) {
  return item && item.alt ? item.alt : deriveAcronymFromPhrase(item && item.phrase);
}

export function getShuffledCollection (appendToStarter = true) {
  return _.shuffle(getCollection(appendToStarter));
}
export function getCollection (appendToStarter) {
  const userPhrases = thinStore.get('custom_dict_v1') || [];
  if (!appendToStarter && userPhrases.length) {
    return userPhrases;
  }
  return ComprehensivePhraseCollection.concat(userPhrases);
}

export function prunePreviouslyCorrectFromPhrases (solved, fullAcronymPhrasesList) {
  const copyData = (fullAcronymPhrasesList || []).slice(0);
  solved.forEach(exist => {
    const idx = _.findIndex(copyData, (item) => {
      return item.phrase === exist.phrase;
    });
    if (idx > -1) {
      copyData.splice(idx, 1);
    }
  });
  const phrases = new Set(_.pluck(copyData, 'phrase'));
  return Array.from(phrases).map(phrase => {
    return _.find(copyData, item => {
      return item.phrase === phrase;
    });
  });
}

function pickUrlOrStorage (acronym, phrases) {
  if (acronym) {
    return _.find(phrases, item => {
      const _derived = deriveAcronymFromPhrase(item.phrase);
      if (item.alt && acronym.toUpperCase() === item.alt) {
        return true;
      }
      if (item.type === 'pure' && acronym.toUpperCase() === _derived) {
        return true;
      }
    });
  }
  return null;
}

export function resetStoredInfo () {
  window.localStorage.removeItem('append_to_starter_v1');
  window.localStorage.removeItem('correct_v1');
  window.localStorage.removeItem('won_v1');
  window.localStorage.removeItem('nextUp_v1');
  window.localStorage.removeItem('skipped_v1');
}

export class GamePlayComponent extends React.PureComponent {
  constructor (props) {
    super(props);
    let phrase;
    const unsolved = this.unsolved;
    const outcome = pickUrlOrStorage(props.acronym, unsolved);
    if (outcome) {
      phrase = outcome;
    }
    const nextUp = thinStore.get('nextUp_v1');
    if (!phrase) {
      this.props.onNavigate('/acronym/' + pickCorrectAcronym(nextUp || unsolved[0]));
    }
  }

  get phrase () {
    return pickUrlOrStorage(this.props.acronym, this.unsolved);
  }

  get phrases () {
    return nsfwFilter(this.nsfwFlag, this.unsolved);
  }

  get solved () {
    return thinStore.get('correct_v1') || [];
  }

  get phraseCatalog () {
    return getShuffledCollection(this.appendToSeed) || [];
  }

  get unsolved () {
    return prunePreviouslyCorrectFromPhrases(this.solved, this.phraseCatalog);
  }

  get nsfwFlag () {
    return thinStore.get('nsfw_v1') || false;
  }

  set appendToSeed (value) {
    return thinStore.set('append_to_starter_v1', !!value);
  }

  get appendToSeed () {
    return thinStore.get('append_to_starter_v1') || false;
  }

  static get propTypes () {
    return {
      acronym: () => {}
    };
  }

  static get defaultProps () {
    return {
      acronym: null
    };
  }

  // componentDidMount () {
  //   if (this.props.acronym) {
  //     console.log('props.acronym', this.props.acronym);
  //     const phrase = this.phraseCatalog.find(item => {
  //       if (pickCorrectAcronym(item) === this.props.acronym) {
  //         return true;
  //       }
  //     });
  //   }
  // }

  componentDidUpdate () {
    const phrase = pickUrlOrStorage(this.props.acronym, this.unsolved);
    const nextUp = thinStore.get('nextUp_v1');
    if (!phrase) {
      this.props.onNavigate('/acronym/' + pickCorrectAcronym(nextUp || this.unsolved[0]));
    }
  }

  render () {
    // if(!this.state.phrase) return el('div', {}, 'No Phrase');
    return (
      el(React.Fragment, {},
        el(UserPreferencesComponent, {
          appendToStarter: this.appendToSeed,
          onAppendToggleChange: (isAppendToStarter) => {
            this.appendToSeed = isAppendToStarter;
            thinStore.del('nextUp_v1');
            thinStore.set('append_to_starter_v1', isAppendToStarter);
          },
          onChange: (evt, isNSFW) => {
            thinStore.set('nsfw_v1', isNSFW);
            // this is probably useful to force a re-render
            // but is otherwise broken
            this.setState({
              nsfwFlag: isNSFW
            });
          },
          onLibraryAdded: (rawLibraryUrl) => {
            thinStore.del('nextUp_v1');
            thinStore.del('skipped_v1');
            console.log('onLibraryAdded');
          }
        }),
        el(StructureComponent, {
          router: this.props.router,
          remaining: this.phrases.length,
          acronym: this.props.acronym
        },
        el('div', { id: 'phrase-remaining-counter' }),
        this.phrase ? el(GameLettersComponent, {
          existingSkipped: thinStore.get('skipped_v1') || [],
          allPhrases: this.phrases,
          phrase: this.phrase,
          acronym: this.props.acronym,
          isNSFW: this.nsfwFlag,
          side: 'right',
          onAnswerWrong: (phrase) => {},
          onAnswerCorrect: (current) => {
            let allCorrects = thinStore.get('correct_v1') || [];
            if (!allCorrects.length) {
              allCorrects = [];
            }
            allCorrects.push(current);
            thinStore.set('correct_v1', Array.from(new Set(allCorrects)));
            // setCorrect(allCorrects);
            const next = this.phrases.shift();
            if (!next) {
              thinStore.set('won_v1', true);
              thinStore.del('nextUp_v1');
              this.props.onNavigate('/solved');
              return;
            }
            // probably only useful to
            // force a re-render.
            // maybe use shouldUpdate?
            this.setState({
              phrase: next
            });
            this.props.onNavigate('/acronym/' + pickCorrectAcronym(next));
            thinStore.set('nextUp_v1', next);
            return next;
          },
          onMounted: (activePhrase, acronym) => {
            thinStore.set('nextUp_v1', activePhrase);
          },
          onUpdated: (activePhrase, acronym) => {
            this.props.onNavigate('/acronym/' + acronym);
            thinStore.set('nextUp_v1', activePhrase);
          },
          onSkipped: (phrase) => {
            const next = this.phrases.shift();
            const skipped = thinStore.get('skipped_v1') || [];
            skipped.push(phrase);
            thinStore.set('skipped_v1', skipped);
            if (next) {
              thinStore.set('nextUp_v1', next);
            } else {
              thinStore.del('nextUp_v1');
            }
            this.props.onNavigate('/acronym/' + pickCorrectAcronym(next));
          }
        }) : null,
        el('div', { id: 'modal' }),
        el(GlossaryListComponent, {
          onAcronymClick: this.props.onAcronymClick,
          solved: new Set(this.solved),
          onReset: () => {
            resetStoredInfo();
            document.location.reload();
          }
        }),
        el('div', { id: 'create-acronym-dictionary-box' }))
      ));
  }
}
