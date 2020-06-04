'use strict';

import Navigo from '../../../node-static/navigo/lib/navigo.es.js';
import { GameSuggestionComponent } from '../web-lib/game-suggestion-component.js';
import { ComprehensivePhraseCollection } from '../phrases/phrases-list.js';
import { GameWonComponent } from '../web-lib/game-won-component.js';
import { ThinStorage } from '../web-lib/thin-storage.js';
import { TitleAnimatorPreloaderHOCComponent } from '../web-lib/title-animator-preloader-hoc-component.js';

import {
  GamePlayComponent,
  resetStoredInfo,
  pickCorrectAcronym
} from '../web-lib/game-play-component.js';
const thinStore = new ThinStorage();
const COLLECTION = (function () {
  const userPhrases = thinStore.get('custom_dict_v1') || [];
  return _.shuffle(ComprehensivePhraseCollection.concat(userPhrases));
})();
const el = React.createElement.bind(React);
const router = new Navigo(document.location.origin);

function userReset (e) {
  e.preventDefault();
  resetStoredInfo();
}

function prunePreviouslyCorrectFromPhrases (solved, fullAcronymPhrasesList) {
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

async function loadPhraseOrNavigateToWon (done, params) {
  if (thinStore.get('won_v1')) {
    document.location.assign('/add-jargon');
    done(false);
  }
  done(true);
}

function addMoreJargonView () {
  ReactDOM.render(
    el(GameSuggestionComponent, {
      actionText: 'Add',
      inputPlaceholder: 'Jargon phrase',
      onSubmit: () => {},
      onSuggestAndEmail: () => {
        document.location.assign('/');
      }
    }),
    document.getElementById('container-v2')
  );
}

function allSolvedView () {
  // meh, cheesy
  const solved = thinStore.get('correct_v1') || [];
  ReactDOM.render(

    el(GameWonComponent, {
      handleReset: (e) => {
        userReset(e);
        document.location.reload();
      },
      solved
    }),
    document.getElementById('container-v2')
  );
}

function jargonautDisplayPage (jargonType = null, acronym = null) {
  const phraseCollection = COLLECTION;
  // that's kinda weird
  let phrase;
  if (acronym) {
    phrase = phraseCollection.find(item => {
      if (pickCorrectAcronym(item) === acronym) {
        return true;
      }
    });
  }
  const solved = thinStore.get('correct_v1') || [];
  solved.sort();
  const unsolved = prunePreviouslyCorrectFromPhrases(solved, phraseCollection);
  ReactDOM.render(
    el(TitleAnimatorPreloaderHOCComponent, {},
      el(GamePlayComponent, {
        onAcronymClick: () => {
          console.log('an acronym in the success list was clicked');
        },
        jargonType,
        phrase,
        solved: thinStore.get('correct_v1') || [],
        unsolved,
        onNavigate: router.navigate.bind(router)
      })),
    document.getElementById('container-v2'));
}

/**
  Client Routing
*/
router
  .notFound(addMoreJargonView)
  .on('/solved', allSolvedView, {
    before: (done, params) => {
      console.log('Previously solved.');
      done();
    }
  })
  .on('/acronym/:acronym', jargonautDisplayPage, {
    before: loadPhraseOrNavigateToWon
  })
  .on('/', jargonautDisplayPage, {
    before: loadPhraseOrNavigateToWon
  }).resolve(document.location.pathname);
