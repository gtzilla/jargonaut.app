'use strict';

import { ThinStorage } from './thin-storage.js';
import { PhraseModel } from '../phrases/phrase-model.js';
import { ComprehensivePhraseCollection } from '../phrases/phrases-list.js';
import { AddedStatsComponent } from './added-stats-component.js';

const el = React.createElement.bind(React);
const thinStore = new ThinStorage();

/**
  Allows user to toggle NSFW filtering.
  Allows user to add external gist of jargon library
  Parses base64 URL query parameter JSON into custom library
  Built-in animations.
  show a stats panel when adding new items

  states:
    closed
    open
    opened, closings

*/
function discoverGistId (url) {
  return url.split('/').pop();
}

function onlyValidModels (item) {
  return PhraseModel.validate(item);
}

function gistParseContentFromApiResponse (data) {
  const mapped = [];
  for (const k in data.files) {
    let content = null;
    try {
      content = JSON.parse(window.atob(data.files[k].content));
    } catch (err) {
      console.error('ERROR', err);
    }
    if (content) { mapped.push(...content); }
  }
  return mapped;
}

export class UserPreferencesComponent extends React.Component {
  constructor (props) {
    super(props);
    const params = new URLSearchParams(document.location.search);
    const openOnLoad = (params.get('preferences') === 'true' || params.get('preferences') === '1') || false;
    const rawUrl = params.get('url');
    const rawJson = params.get('json');
    this.state = {
      aggregate: null,
      stats: {},
      libraryUrls: props.existingLibraries || thinStore.get('custom_dict_urls_v1') || [],
      insertPanel: openOnLoad,
      nsfw: props.isNSFW || thinStore.get('nsfw_v1') || false,
      closeOpenedPanel: false,
      fetchedFailed: false
    };
    if (rawUrl) {
      this.fetchGistData(rawUrl)
        .then(this.processAndUpdate(rawUrl));
    }
    if (rawJson) {
      let mappedJson = null;
      try {
        mappedJson = JSON.parse(window.atob(rawJson));
      } catch (e) {}
      const { stats, aggregate } = this.importLibraryJson(mappedJson);
      this.state.aggregate = aggregate;
      this.state.stats = stats;
      thinStore.set('custom_dict_v1', aggregate);
      this.props.onLibraryAdded(null);
    }
  }

  static get propTypes () {
    return {
      appendToStarter: () => {},
      isNSFW: () => {},
      onAppendToggleChange: () => {},
      onLibraryAdded: () => {},
      existingLibraries: () => {},
      onChange: () => {},
      onStartClose: () => {},
      onEndClose: () => {}
    };
  }

  importLibraryJson (mappedJson) {
    const existing = thinStore.get('custom_dict_v1') || [];
    const dedupedCustom = this.dedupeLibraryForImport(existing, mappedJson);
    const deduped = this.dedupeLibraryForImport(ComprehensivePhraseCollection, dedupedCustom);
    const aggregate = existing.concat(deduped);
    const stats = {
      existing: existing.length,
      deduped: deduped.length,
      newAttempted: mappedJson.length,
      total: aggregate.length
    };
    return { aggregate, stats };
  }

  handleClick (e) {
    e.preventDefault();
    this.setState({
      closeOpenedPanel: this.state.insertPanel,
      insertPanel: !this.state.insertPanel
    });
    if (this.state.insertPanel && this.props.onStartClose) {
      this.props.onStartClose();
    }
  }

  handleChange (e) {
    this.setState({
      nsfw: !this.state.nsfw
    }, () => {
      thinStore.set('nsfw_v1', this.state.nsfw);
    });
    this.props.onChange(e, !this.state.nsfw);
  }

  fetchGistData (value) {
    const gistId = discoverGistId(value);
    const libraryUrl = new URL(`https://api.github.com/gists/${gistId}`);
    if (this.state.libraryUrls.includes(value)) {
      console.log('Known library. No update', this.state.libraryUrls);
      return Promise.resolve(null);
    }
    return window.fetch(libraryUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      mode: 'cors'
    })
      .then(data => data.json())
      .catch(err => {
        console.error('Gist Unreachable', err);
        this.setState({
          fetchedFailed: true
        });
        return null;
      });
  }

  processAndUpdate (rawUrl) {
    return data => {
      if (!data) return;
      this.state.libraryUrls.push(rawUrl);
      const mapped = gistParseContentFromApiResponse(data);
      const { stats, aggregate } = this.importLibraryJson(mapped);
      this.setState({
        stats,
        aggregate
      }, () => {
        thinStore.set('custom_dict_v1', aggregate);
        const libExists = thinStore.get('custom_dict_urls_v1') || [];
        libExists.push(rawUrl);
        thinStore.set('custom_dict_urls_v1', libExists);
        if (rawUrl) {
          this.props.onLibraryAdded(rawUrl);
          this.libraryUrlInput.value = '';
        }
      });
    };
  }

  // returns array, without duplicates
  dedupeLibraryForImport (existing, mapped) {
    return mapped
      .filter(onlyValidModels)
      .map(PhraseModel.restrictedProperties)
      .filter(item => {
        return !_.find(existing, exists => {
          return exists.phrase === item.phrase;
        });
      });
  }

  handleSubmit (e) {
    e.preventDefault();
    const rawUrl = this.libraryUrlInput.value;
    this.setState({
      fetchedFailed: false
    }, () => {
      this.fetchGistData(rawUrl)
        .then(this.processAndUpdate(rawUrl));
    });
  }

  handleAnimateEnd (e) {
    if (this.state.closeOpenedPanel && this.props.onEndClose) {
      this.props.onEndClose();
    }
    this.setState({
      closeOpenedPanel: false
    });
  }

  handleChangeAppendToStarter (e) {
    if (this.props.onAppendToggleChange) {
      this.props.onAppendToggleChange(e.target.checked);
    }
  }

  render () {
    let classModifier = '';
    if (this.state.insertPanel) {
      classModifier = 'opened';
    } else if (this.state.closeOpenedPanel) {
      classModifier = 'closed';
    }
    let cogModifier = 'closed';
    if (this.state.insertPanel) {
      cogModifier = 'opened';
    }
    const spanParams = {
      onAnimationEnd: this.handleAnimateEnd.bind(this),
      className: 'user-preference-open-panel ' + classModifier
    };
    const safariAnimateFunctionName = 'onWebkitAnimationEnd'.toLowerCase();
    if (_.has(window, safariAnimateFunctionName) && window[safariAnimateFunctionName]) {
      spanParams.onWebkitAnimationEnd = this.handleAnimateEnd.bind(this);
    }
    const libraryUrls = this.state.libraryUrls.map(item => {
      return (
        el('div', {}, item.toString())
      );
    });
    let newlyAddedLibraryStats = null;
    if (this.state.aggregate && this.state.aggregate.length) {
      newlyAddedLibraryStats = el(AddedStatsComponent, this.state.stats);
    }
    const cssInputBox = this.state.fetchedFailed ? 'fetching-failed' : '';
    const errorMsg = this.state.fetchedFailed ? (
      el('div', {
        className: 'failed-error-msg-preferences'
      },
      el('p', {}, 'Failed. Browser cannot reach github.com'))) : null;
    return (
      el(React.Fragment, {},
        el('span', spanParams,
          el('div', {
            className: 'user-preferences-flex-container'
          },
          el('form', {},
            el('div', {},
              el('label', {},
                el('input', {
                  ref: el => { this.checkbox = el; },
                  type: 'checkbox',
                  checked: this.state.nsfw,
                  onChange: this.handleChange.bind(this)
                }), 'NSFW')),
            el('div', {},
              el('label', {},
                el('input', {
                  type: 'checkbox',
                  checked: this.props.appendToStarter,
                  onChange: this.handleChangeAppendToStarter.bind(this)
                }), 'Append to starter Jargon'))),
          el('div', {
            className: 'custom-library-input-container'
          },
          el('h2', {}, 'Custom Library from Gist'),
          el('form', {
            type: 'submit',
            onSubmit: this.handleSubmit.bind(this)
          },
          el('label', {},
            el('input', {
              className: 'gist-id-url-input-box ' + cssInputBox,
              type: 'text',
              ref: el => { this.libraryUrlInput = el; },
              placeholder: 'Gist Id or URL'
            })), errorMsg)),
          el('div', {},
            el('h3', {}, 'Custom Library URL'),
            ...libraryUrls))),
        newlyAddedLibraryStats,
        el('div', {
          className: 'game-preferences-cog-wrapper ' + classModifier,
          onClick: this.handleClick.bind(this)
        },
        el('img', {
          src: '/static/svg/noun_cog_170060.svg',
          className: 'game-preferences-cog ' + cogModifier
        }))));
  }
}
