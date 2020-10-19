'use strict';

import { ThinStorage } from '../web-lib/thin-storage.js';
import { StructureComponent } from '../web-lib/structure-component.js';
import { UserPreferencesComponent } from '../web-lib/user-preferences-component.js';
import { ExportJargonComponent } from '../web-lib/export-jargon-component.js';
import {
  getShuffledCollection
} from '../web-lib/game-play-component.js';

const el = React.createElement.bind(React);
const thinStore = new ThinStorage();

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
