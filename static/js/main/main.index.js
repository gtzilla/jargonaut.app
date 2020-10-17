'use strict';

import { WebRouter } from '../../../node-static/web-router.js/dist/web-router.js?r=1';
// import { WebRouter } from '../../../node-static/web-router.js/src/index.js';
import { AddJargonComponent } from '../web-lib/add-jargon-component.js';
import { GlossaryPageComponent } from '../web-lib/glossary-page-component.js';
import { ThinStorage } from '../web-lib/thin-storage.js';
import { PrivacyPolicyComponent } from '../web-lib/privacy-policy-component.js';
import { UserPreferencesComponent } from '../web-lib/user-preferences-component.js';
import { StructureComponent } from '../web-lib/structure-component.js';
import { ExportJargonComponent } from '../web-lib/export-jargon-component.js';
import { unsolvedPhrases } from '../web-lib/glossary-list-component.js';
import {
  getCollection,
  nsfwFilter,
  GamePlayComponent,
  getShuffledCollection,
  resetStoredInfo
} from '../web-lib/game-play-component.js';

const thinStore = new ThinStorage();
const el = React.createElement.bind(React);
const router = new WebRouter();

function userReset (evt) {
  evt.preventDefault();
  resetStoredInfo();
}

async function loadPhraseOrNavigateToWon (done, params) {
  const isNSFW = thinStore.get('nsfw_v1') || false;
  const appendToStarter = thinStore.get('append_to_starter_v1') || false;
  const allPhrases = nsfwFilter(isNSFW, getCollection(appendToStarter));
  const unsolved = unsolvedPhrases(allPhrases);
  if (!unsolved.length) {
    router.navigate('/edit-jargon');
    done(false);
  }
  done(true);
}

function addMoreJargonView () {
  const existing = thinStore.get('custom_dict_v1') || [];
  ReactDOM.render(
    el(AddJargonComponent, {
      actionText: 'Add',
      router,
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
      router,
      handleReset: (evt) => {
        userReset(evt);
        document.location.reload();
      }

    }),
    document.getElementById('container-v2')
  );
}

function privacyPolicyDisplayPage () {
  ReactDOM.render(
    el(React.Fragment, {},
      el(StructureComponent, {
        router
      },
      el(PrivacyPolicyComponent, {}))),
    document.getElementById('container-v2')
  );
}

function jargonautDisplayPage (params) {
  const { acronym, jargonType } = params;
  // console.log("jargonautDisplayPage()", acronym)
  ReactDOM.render(
    el(GamePlayComponent, {
      router,
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
      el(StructureComponent, { router: props.router },
        el(ExportJargonComponent, {
          itemsLength: phrases.length,
          appendToStarter,
          exportData: phrases
        })))
  );
}

function exportJargonDisplayPage () {
  ReactDOM.render(
    el(ExportLibraryDisplayComponent, {
      router
    }),
    document.getElementById('container-v2')
  );
}

/**
  Client Routing
*/
router
  .notFound(addMoreJargonView)
  .on('/privacy-policy', privacyPolicyDisplayPage, {})
  .on('/share', exportJargonDisplayPage, {})
  .on('/glossary', glossaryListPage, {})
  .on('/acronym/:acronym', jargonautDisplayPage, {
    before: loadPhraseOrNavigateToWon
  })
  .on('/', jargonautDisplayPage, {
    before: loadPhraseOrNavigateToWon
  }).resolve(document.location.pathname);
