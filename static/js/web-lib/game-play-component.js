'use strict';

import { UserPreferencesComponent } from './user-preferences-component.js';
import { GameLettersComponent, deriveAcronymFromPhrase } from './game-letters-component.js';
import { ComprehensivePhraseCollection } from '../phrases/phrases-list.js';
import { ThinStorage } from './thin-storage.js';
import { StructureComponent } from '../web-lib/structure-component.js';
import { GlossaryListComponent } from '../web-lib/glossary-list-component.js';

const thinStore = new ThinStorage();
const el = React.createElement.bind(React);

export function nsfwFilter (isNSFW, array) {
  return array.filter((item, idx, all) => {
    if (!isNSFW && item.rating !== 'g') return false;
    return true;
  });
}

export function pickCorrectAcronym (item) {
  return item.alt ? item.alt : deriveAcronymFromPhrase(item.phrase);
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

function pickUrlOrStorage (args, phrases) {
  if (args && args.acronym) {
    return _.find(phrases, item => {
      const _derived = deriveAcronymFromPhrase(item.phrase);
      if (item.alt && args.acronym.toUpperCase() === item.alt) {
        return true;
      }
      if (item.type === 'pure' && args.acronym.toUpperCase() === _derived) {
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

export function GamePlayComponent (props) {
  let phrase;
  const isNSFW = thinStore.get('nsfw_v1') || false;
  const _appendToStarter = thinStore.get('append_to_starter_v1') || false;
  const _raw = thinStore.get('skipped_v1') || [];
  const solved = thinStore.get('correct_v1') || [];
  const nextUp = thinStore.get('nextUp_v1');
  const phraseCollection = getShuffledCollection(_appendToStarter);
  solved.sort();
  const unsolved = prunePreviouslyCorrectFromPhrases(solved, phraseCollection);
  const outcome = pickUrlOrStorage(props.args, unsolved);
  if (outcome) {
    phrase = outcome;
  }
  if (props.acronym) {
    phrase = phraseCollection.find(item => {
      if (pickCorrectAcronym(item) === props.acronym) {
        return true;
      }
    });
  }

  phrase = phrase || nextUp || unsolved[0];
  const [skipped] = React.useState(_raw);
  const [appendToStarter, setAppendToStarter] = React.useState(_appendToStarter);
  const [phrases, setPhrases] = React.useState(nsfwFilter(isNSFW, unsolved));
  const [activePhrase, setActivePhrase] = React.useState(phrase);
  const [correct, setCorrect] = React.useState(solved);
  const [acronym, setAcronym] = React.useState(pickCorrectAcronym(phrase));
  const [nsfwFlag, setNSFWFlag] = React.useState(isNSFW);

  return (
    el(React.Fragment, {},
      el(UserPreferencesComponent, {
        appendToStarter: _appendToStarter,
        onAppendToggleChange: (isAppendToStarter) => {
          setAppendToStarter(isAppendToStarter);
          const phraseCollection = getShuffledCollection(isAppendToStarter);
          const unsolved = prunePreviouslyCorrectFromPhrases(solved, phraseCollection);
          setPhrases(nsfwFilter(isNSFW, unsolved));
          thinStore.del('nextUp_v1');
          thinStore.set('append_to_starter_v1', isAppendToStarter);
        },
        onChange: (e, isNSFW) => {
          setPhrases(nsfwFilter(isNSFW, unsolved));
          setNSFWFlag(isNSFW);
        },
        onLibraryAdded: (rawLibraryUrl) => {
          const phraseCollection = getShuffledCollection(appendToStarter);
          const unsolved = prunePreviouslyCorrectFromPhrases(solved, phraseCollection);
          setPhrases(nsfwFilter(isNSFW, unsolved));
          thinStore.del('nextUp_v1');
          thinStore.del('skipped_v1');
          console.log('onLibraryAdded');
        }
      }),
      el(StructureComponent, {
        router: props.router,
        remaining: phrases.length,
        acronym: acronym
      },
      el('div', { id: 'phrase-remaining-counter' }),
      el(GameLettersComponent, {
        existingSkipped: skipped,
        allPhrases: phrases,
        phrase: activePhrase,
        isNSFW: nsfwFlag,
        side: 'right',
        onAnswerWrong: (phrase) => {},
        onAnswerCorrect: (current) => {
          let allCorrects = thinStore.get('correct_v1') || [];
          if (!allCorrects.length) {
            allCorrects = [];
          }
          allCorrects.push(current);
          thinStore.set('correct_v1', Array.from(new Set(allCorrects)));
          setCorrect(allCorrects);
          const next = phrases.shift();
          if (!next) {
            thinStore.set('won_v1', true);
            thinStore.del('nextUp_v1');
            props.onNavigate('/solved');
            return;
          }
          setActivePhrase(next);
          setPhrases(nsfwFilter(isNSFW, phrases));
          setAcronym(pickCorrectAcronym(next));
          thinStore.set('nextUp_v1', next);
          return next;
        },
        onMounted: (activePhrase, acronym) => {
          thinStore.set('nextUp_v1', activePhrase);
        },
        onUpdated: (activePhrase, acronym) => {
          props.onNavigate('/acronym/' + acronym);
          thinStore.set('nextUp_v1', activePhrase);
        },
        onSkipped: (phrase) => {
          const next = phrases.shift();
          skipped.push(phrase);
          phrases.push(phrase);
          setAcronym(pickCorrectAcronym(next));
          setActivePhrase(next);
          thinStore.set('skipped_v1', skipped);
          if (next) {
            thinStore.set('nextUp_v1', next);
          } else {
            thinStore.del('nextUp_v1');
          }
        }
      }),
      el('div', { id: 'modal' }),
      el(GlossaryListComponent, {
        onAcronymClick: props.onAcronymClick,
        solved: new Set(correct),
        onReset: () => {
          resetStoredInfo();
          document.location.reload();
        }
      }),
      el('div', { id: 'create-acronym-dictionary-box' }))
    ));
}
