'use strict';

import Navigo from '../../../node-static/navigo/lib/navigo.es.js';
import { AddJargonComponent } from '../web-lib/add-jargon-component.js';
import { GlossaryPageComponent } from '../web-lib/glossary-page-component.js';
import { ThinStorage } from '../web-lib/thin-storage.js';
import { PrivacyPolicyComponent } from '../web-lib/privacy-policy-component.js';
import { UserPreferencesComponent } from '../web-lib/user-preferences-component.js';
import { StructureComponent } from '../web-lib/structure-component.js';
import { ExportJargonComponent } from '../web-lib/export-jargon-component.js';
// import { UnknownJargonComponent } from '../web-lib/unknown-jargon-component.js';
import {
  GamePlayComponent,
  getShuffledCollection,
  resetStoredInfo
} from '../web-lib/game-play-component.js';

const thinStore = new ThinStorage();
const el = React.createElement.bind(React);
const router = new Navigo(document.location.origin);

function userReset (e) {
  e.preventDefault();
  resetStoredInfo();
}

async function loadPhraseOrNavigateToWon (done, params) {
  if (thinStore.get('won_v1')) {
    document.location.assign('/edit-jargon');
    done(false);
  }
  done(true);
}

function addMoreJargonView () {
  const existing = thinStore.get('custom_dict_v1') || [];
  ReactDOM.render(
    el(AddJargonComponent, {
      actionText: 'Add',
      onLibraryAdded: (gistLibraryUrl) => {
        if (!gistLibraryUrl) {
          // came via URL, not gist
          /**
            First time user
            1. Take directly to the game or leave on add-jargon?

            If user had existing dictionary, before add,
            leave on page
          */
          const routeTo = existing.length ? document.location.pathname : '/';
          router.navigate(routeTo);
        }
      },
      inputPlaceholder: 'Jargon phrase',
      onSubmit: () => {},
      onSuggestAndEmail: () => {
        document.location.assign('/');
      }
    }),
    document.getElementById('container-v2')
  );
}

function glossaryListPage () {
  ReactDOM.render(
    el(GlossaryPageComponent, {
      handleReset: (e) => {
        userReset(e);
        document.location.reload();
      }

    }),
    document.getElementById('container-v2')
  );
}

function privacyPolicyDisplayPage () {
  ReactDOM.render(
    el(React.Fragment, {},
      el(StructureComponent, {},
        el(PrivacyPolicyComponent, {}))),
    document.getElementById('container-v2')
  );
}

function jargonautDisplayPage (params) {
  const { acronym, jargonType } = params;
  ReactDOM.render(
    el(GamePlayComponent, {
      onAcronymClick: () => {
        console.log('an acronym in the success list was clicked');
      },
      jargonType,
      acronym,
      onNavigate: router.navigate.bind(router)
    }),
    document.getElementById('container-v2'));
}

export function ExportLibraryDisplayComponent (props) {
  const isAppendToStarter = thinStore.get('append_to_starter_v1') || false;
  const _phraseCollection = getShuffledCollection(isAppendToStarter);
  const [phrases, setPhrases] = React.useState(_phraseCollection);
  const [appendToStarter, setAppendToStarter] = React.useState(isAppendToStarter);
  return (
    el(React.Fragment, {},
      el(UserPreferencesComponent, {
        appendToStarter,
        onChange: () => {},
        onLibraryAdded: () => {
          thinStore.del('nextUp_v1');
          thinStore.del('skipped_v1');
        },
        onAppendToggleChange: (isAppendToStarter) => {
          const phraseCollection = getShuffledCollection(isAppendToStarter);
          setAppendToStarter(isAppendToStarter);
          setPhrases(phraseCollection);
          thinStore.del('nextUp_v1');
          thinStore.set('append_to_starter_v1', isAppendToStarter);
        }
      }),
      el(StructureComponent, {},
        el(ExportJargonComponent, {
          itemsLength: phrases.length,
          appendToStarter,
          exportData: phrases
        })))
  );
}

function exportJargonDisplayPage () {
  ReactDOM.render(
    el(ExportLibraryDisplayComponent, {}),
    document.getElementById('container-v2')
  );
}

/**
  Client Routing
*/
router
  .notFound(addMoreJargonView)
  .on('/privacy-policy', privacyPolicyDisplayPage, {})
  .on('/export-jargon', exportJargonDisplayPage, {})
  .on('/glossary', glossaryListPage, {})
  .on('/acronym/:acronym', jargonautDisplayPage, {
    before: loadPhraseOrNavigateToWon
  })
  .on('/', jargonautDisplayPage, {
    before: loadPhraseOrNavigateToWon
  }).resolve(document.location.pathname);
