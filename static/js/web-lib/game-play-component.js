'use strict';

import { UserPreferencesComponent } from './user-preferences-component.js';
import { GameLettersComponent, deriveAcronymFromPhrase, nsfwFilter } from './game-letters-component.js';
import { ThinStorage } from './thin-storage.js';
import { StructureComponent } from '../web-lib/structure-component.js';
import { SuccessListComponent } from '../web-lib/success-list-component.js';

const thinStore = new ThinStorage();
const el = React.createElement.bind(React);

export function pickCorrectAcronym (item) {
  return item.alt ? item.alt : deriveAcronymFromPhrase(item.phrase);
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
  window.localStorage.removeItem('correct_v1');
  window.localStorage.removeItem('won_v1');
  window.localStorage.removeItem('nextUp_v1');
  window.localStorage.removeItem('skipped_v1');
}

export function GamePlayComponent (props) {
  let phrase = props.phrase || thinStore.get('nextUp_v1') || props.unsolved[0];
  const outcome = pickUrlOrStorage(props.args, props.unsolved);
  if (outcome) {
    phrase = outcome;
  }
  const isNSFW = thinStore.get('nsfw_v1');
  const _raw = thinStore.get('skipped_v1') || [];
  const [skipped] = React.useState(_raw);
  const [phrases, setPhrases] = React.useState(nsfwFilter(isNSFW, props.unsolved));
  const [activePhrase, setActivePhrase] = React.useState(phrase);
  const [correct, setCorrect] = React.useState(props.solved);
  const [acronym, setAcronym] = React.useState(pickCorrectAcronym(phrase));
  const [nsfwFlag, setNSFWFlag] = React.useState(isNSFW);

  return (
    el(React.Fragment, {},
      el(UserPreferencesComponent, {
        onChange: (e, isNSFW) => {
          setNSFWFlag(isNSFW);
          thinStore.set('nsfw_v1', isNSFW);
          setPhrases(nsfwFilter(isNSFW, props.unsolved));
        },
        isNSFW: nsfwFlag
      }),
      el(StructureComponent, {
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
          // ensure it's saved
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
          // setPhrases(phrases);
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
      el(SuccessListComponent, {
        onAcronymClick: props.onAcronymClick,
        // items: new Set(correct),
        solved: new Set(correct),
        onReset: () => {
          resetStoredInfo();
          document.location.reload();
        }
      }),
      el('div', { id: 'create-acronym-dictionary-box' }))
    ));
}
