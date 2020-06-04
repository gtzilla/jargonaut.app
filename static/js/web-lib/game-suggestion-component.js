'use strict';

import { deriveAcronymFromPhrase } from './game-letters-component.js';
import { SuccessListComponent } from './success-list-component.js';
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
export class GameSuggestionComponent extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      count: 0,
      letters: [],
      suggestedPhrase: props.suggestedPhrase || null,
      alt: null,
      type: 'pure',
      removedPositions: [],
      phrases: thinStore.get('custom_dict_v1') || []
    };
  }

  static get propTypes () {
    return {
      actionText: () => {},
      onKeyUp: () => {},
      inputPlaceholder: () => {},
      suggestedPhrase: () => {},
      onSuggestAndEmail: () => {},
      onSubmit: () => {}
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
    // You can also log the error to an error reporting service
    console.error('error', error, errorInfo);
  }

  handleChange (e) {
    this.setState({
      suggestedPhrase: this.input.value
    });
  }

  onSubmitWrapper (e) {
    console.log('onSubmitWrapper', e);
    e.preventDefault();
    if (this.props.onSubmit && _.isFunction(this.props.onSubmit)) {
      this.props.onSubmit(e, this.input.value, this.dynamicAcronym);
    }
    return this.handleSubmit(e, this.input.value, this.dynamicAcronym);
  }

  componentDidMount () {
    this.input.focus();
  }

  handleClick (e) {
    e.preventDefault();
    if (!e.target) return;
    console.log('e.target.nodeName', e.target.nodeName);
    if (e.target.nodeName.toLowerCase() !== 'a') return;
    const uls = e.currentTarget.parentNode.querySelectorAll('ul');
    if (!uls) {
      return;
    }
    const letterId = e.target.getAttribute('data-id');
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

  /**
    Generic use case
  */
  async handleSubmit (e, phrase = null, acronym = null) {
    console.log('handleSubmit', e);
    e.preventDefault();
    const suggestedPhrase = this.input.value || null;

    this.setState({
      suggestedPhrase
    }, () => {
      const alt = acronym || null;
      const phrase = new PhraseModel(suggestedPhrase, alt);
      const found = this.state.phrases.find(item => {
        return item.phrase === suggestedPhrase && suggestedPhrase.length;
      });
      if (!found) {
        this.state.phrases.push(phrase);
        console.log('original', phrase);

        this.setState({
          count: this.state.count + 1
        }, () => {
          thinStore.set('custom_dict_v1', this.state.phrases);
          this.resetState();
        });
        // such an add spot for this.
        thinStore.del('won_v1');
      }
    });
  }

  handleKeyUp (e) {
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
      this.props.onKeyUp(e, this.input.value);
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
      el(StructureComponent, {},
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
          ' Decode Jargon by adding to the glossary')),
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
        el(SuccessListComponent, {

          solved: new Set(this.state.phrases || []),
          onReset: () => {
            console.log('Reseting user custom dictionary', this.state.phrases);
            thinStore.del('custom_dict_v1');
            this.setState({
              phrases: [],
              counter: 0
            }, () => {

            });
            document.location.reload();
          }
        })
      )
    );
  }
}
