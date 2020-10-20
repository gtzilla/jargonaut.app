'use strict';

import { ThinStorage } from './thin-storage.js';
import { StructureComponent } from './structure-component.js';
import { UserPreferencesComponent } from './user-preferences-component.js';
import { ExportJargonComponent } from './export-jargon-component.js';
import {
  getShuffledCollection
} from '../web-lib/game-play-component.js';

const el = React.createElement.bind(React);
const thinStore = new ThinStorage();

export function ExportLibraryDisplayComponent (props) {
  const _phraseCollection = getShuffledCollection();
  const [phrases] = React.useState(_phraseCollection);
  return (
    el(React.Fragment, {},
      el(UserPreferencesComponent, {
        onChange: () => {},
        onLibraryAdded: () => {
          thinStore.del('nextUp_v1');
          thinStore.del('skipped_v1');
        }
      }),
      el(StructureComponent, { router: props.router },
        el(ExportJargonComponent, {
          itemsLength: phrases.length,
          exportData: phrases
        })))
  );
}
