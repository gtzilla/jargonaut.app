'use strict';

import { deriveAcronymFromPhrase } from './hintable-input-component.js';
import { GlossaryListComponent, unsolvedPhrases } from './glossary-list-component.js';
import { UserPreferencesComponent } from './user-preferences-component.js';
import { StructureComponent } from './structure-component.js';
import { ThinStorage } from './thin-storage.js';
import { PhraseModel } from '../phrases/phrase-model.js';

const el = React.createElement.bind(React);
let counter = 0;
const thinStore = new ThinStorage();
function Letter (char, displayed = true) {
  counter += 1;
  return {
    letter: char,
    letterId: char + counter,
    displayed
  };
}
export class AddJargonComponent extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      count: 0,
      letters: [],
      appendToStarter: thinStore.get('append_to_starter_v1') || false,
      suggestedPhrase: props.suggestedPhrase || null,
      alt: null,
      type: 'pure',
      removedPositions: [],
      phrases: props.phrases || thinStore.get('custom_dict_v1') || []
    };
  }

  static get propTypes () {
    return {
      router: () => {},
      solved: () => {},
      phrases: () => {},
      actionText: () => {},
      onKeyUp: () => {},
      inputPlaceholder: () => {},
      suggestedPhrase: () => {},
      onSuggestAndEmail: () => {},
      onSubmit: () => {},
      onLibraryAdded: () => {}
    };
  }

  get dynamicAcronym () {
    const mapped = this.state.letters.filter(item => item.displayed).map(item => {
      return item.letter;
    });
    return mapped.join('');
  }

  resetState () {
    this.setState({
      removedPositions: [],
      showThanks: false,
      suggestedPhrase: null,
      alt: null,
      type: 'pure',
      phrases: thinStore.get('custom_dict_v1') || []
    });
  }

  componentDidCatch (error, errorInfo) {
    console.error('error', error, errorInfo);
  }

  handleChange (evt) {
    this.setState({
      suggestedPhrase: this.input.value
    });
  }

  onSubmitWrapper (evt) {
    console.log('onSubmitWrapper', evt);
    evt.preventDefault();
    if (this.props.onSubmit && _.isFunction(this.props.onSubmit)) {
      this.props.onSubmit(evt, this.input.value, this.dynamicAcronym);
    }
    return this.handleSubmit(evt, this.input.value, this.dynamicAcronym);
  }

  componentDidMount () {
    this.input.focus();
  }

  handleClick (evt) {
    evt.preventDefault();
    if (!evt.target) return;
    console.log('evt.target.nodeName', evt.target.nodeName);
    if (evt.target.nodeName.toLowerCase() !== 'a') return;
    const uls = evt.currentTarget.parentNode.querySelectorAll('ul');
    if (!uls) {
      return;
    }
    const letterId = evt.target.getAttribute('data-id');
    const found = this.state.letters.findIndex(item => {
      if (item.letterId === letterId) return true;
    });

    if (found > -1) {
      const exists = this.state.letters.slice(0);
      exists[found].displayed = false;
      this.setState({
        letters: exists,
        suggestedPhrase: this.input.value,
        type: 'alt'
      }, () => {
        console.log('alt', this.state.suggestedPhrase, this.state.letters, this.state.acronym);
      });
    }
  }

  async handleSubmit (evt, phrase = null, acronym = null) {
    evt.preventDefault();
    const suggestedPhrase = this.input.value || null;

    this.setState({
      suggestedPhrase
    }, () => {
      const phrase = new PhraseModel(suggestedPhrase, acronym);
      const found = this.state.phrases.find(item => {
        return item.phrase === suggestedPhrase && suggestedPhrase.length;
      });
      if (!found) {
        this.state.phrases.push(phrase);
        this.setState({
          count: this.state.count + 1
        }, () => {
          thinStore.set('custom_dict_v1', this.state.phrases);
          thinStore.del('nextUp_v1');
          this.resetState();
        });
        thinStore.del('won_v1');
      }
    });
  }

  handleKeyUp (evt) {
    if (!this.input.value.length) {
      this.setState({
        alt: null,
        removedPositions: [],
        type: 'pure'
      });
    }
    const derived = deriveAcronymFromPhrase(this.input.value);
    const letters = derived.split('').map(letter => new Letter(letter));
    if (derived !== this.dynamicAcronym) {
      const exists = this.state.letters || [];
      letters.slice(0, this.state.letters.length).forEach((item, idx) => {
        item.displayed = exists[idx].displayed;
      });
    }
    this.setState({
      letters,
      suggestedPhrase: this.input.value

    });
    if (this.props.onKeyUp) {
      this.props.onKeyUp(evt, this.input.value);
    }
  }

  render () {
    let letterEls = [];
    if (this.state.letters.length) {
      letterEls = this.state.letters.filter(item => item.displayed).map(item => {
        return (
          el('ul', {
            onClick: this.handleClick.bind(this),
            className: 'game-editable-acronym-single-letter-list'
          },
          el('li', {
            className: 'game-editable-acronym-letter-remove-control-box'
          },
          el('a', {
            'data-id': item.letterId,
            href: '#letter-' + item.letter
          }, 'X')),
          el('li', {
            className: 'game-editable-acronym-single-letter'
          }, item.letter))
        );
      });
    }

    return (
      el(React.Fragment, {},
        el(UserPreferencesComponent, {
          appendToStarter: this.state.appendToStarter,
          onChange: (evt, isNSFW) => {
            const unsolved = unsolvedPhrases(isNSFW);
            this.setState({
              unsolved
            });
          },
          onAppendToggleChange: (isAppendToStarter) => {
            this.setState({
              appendToStarter: isAppendToStarter
            });
            // warn: hardcoded nsfw flag here.
            const unsolved = unsolvedPhrases(false);
            this.setState({
              unsolved
            });

            thinStore.del('nextUp_v1');
            thinStore.set('append_to_starter_v1', isAppendToStarter);
          },
          onLibraryAdded: (rawLibraryUrl) => {
            thinStore.del('nextUp_v1');
            thinStore.del('skipped_v1');
            this.resetState();
            this.props.onLibraryAdded(rawLibraryUrl);
          }
        }),
        el(StructureComponent, { router: this.props.router },
          el('div', {
            className: 'game-letters-suggestion-box'
          },
          el('div', {
            className: 'acronym-defintion-header-box'
          },
          el('div', {
            className: 'game-editable-acronym-box'
          }, ...letterEls),
          el('h2', {}, 'ac\u00B7ro\u00B7nym'),
          el('h3', {}, '/\u02C8akr\u0259\u02CCnim/'),
          el('h4', {}, 'noun'),
          el('p', {}, 'an ',
            el('span', {
              className: 'game-suggestion-abbreviation-teaser'
            }, 'abbreviation'),
            ' formed from the initial letters of other words and pronounced as a word (e.g. ASCII, NASA ).',
            ' Build your own Jargon by typing below.')),
          el('form', {
            onSubmit: this.onSubmitWrapper.bind(this),
            method: 'GET',
            action: '#'
          },
          el('input', {
            onKeyUp: this.handleKeyUp.bind(this),
            ref: el => { this.input = el; },
            value: this.state.suggestedPhrase || '',
            type: 'text',
            name: 'suggest',
            onChange: this.handleChange.bind(this),
            placeholder: this.props.inputPlaceholder
          }),
          el('button', { type: 'submit' }, this.props.actionText))),
          el(GlossaryListComponent, {
            solved: new Set(this.state.phrases || []),
            unsolved: unsolvedPhrases(false),
            noSpoilers: true,
            onRemoveClick: (evt, data) => {
              console.log('got data into add jargon.js', data);
              const exists = thinStore.get('custom_dict_v1') || [];
              const found = exists.findIndex(item => {
                return item.phrase === data.phrase;
              });
              if (found > -1) {
                exists.splice(found, 1);
                this.setState({
                  phrases: exists
                }, () => {
                  thinStore.set('custom_dict_v1', exists);
                });
              }
            },
            onReset: () => {
              console.log('Reseting user custom dictionary', this.state.phrases);
              thinStore.del('custom_dict_v1');
              thinStore.del('custom_dict_urls_v1');
              this.setState({
                phrases: [],
                counter: 0
              }, () => {

              });
              document.location.reload();
            }
          }))
      )
    );
  }
}
