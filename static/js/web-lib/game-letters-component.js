'use strict';

/**
  Manage the events and UI for typing letters.

    1. checks keyboard, focus and submit events
    for new letters.
    2. determines correctness of typed user entry.
*/
import {
  HintableInputComponent,
  deriveAcronymFromPhrase
} from './hintable-input-component.js';

const el = React.createElement.bind(React);

class GameLettersComponent extends React.Component {
  constructor (props) {
    super(props);
    if (!props.allPhrases) {
      throw new Error('allPhrases property must be array');
    }
    if (!props.phrase) {
      throw new Error('activePhrase property must be object');
    }
    const activePhrase = this.props.phrase;
    const pos = _.findIndex(this.props.allPhrases, item => {
      return item.phrase === activePhrase.phrase;
    });
    if (pos > -1) {
      this.props.allPhrases.splice(pos, 1);
    }

    this.state = {
      shakebox: false,
      userTyped: '',
      submitTint: -1,
      isNSFW: props.isNSFW,
      spaces: 0,
      scrollLeft: 0
    };
  }

  static get propTypes () {
    return {
      phrase: () => {},
      allPhrases: () => {},
      existingSkipped: () => {},
      existingCorrect: () => {},
      onMounted: () => {},
      onUpdated: () => {},
      handleReset: () => {},
      onAnswerCorrect: () => {},
      onSkipped: () => {},
      isNSFW: () => {},
      onAnswerWrong: () => {}
    };
  }

  componentDidMount () {
    this.hintableInputInstance.focus();
    if (this.props.onMounted) {
      this.props.onMounted(this.props.phrase, this.dynamicAcronym);
    }
  }

  validateTypedPhraseCorrect (phrase) {
    /**
      in iOS, unless changed. Single straight quotes
      are curly quotes, which causes exact string match
      to fail.

      this is broken again on ios when deplyed via github
      6/7/2020
    */
    const correctPhrase = this.props.phrase.phrase.replace(/’/g, '\'').toLowerCase();
    if (phrase.toLowerCase() === correctPhrase) {
      return true;
    }
  }

  get dynamicAcronym () {
    return this.props.phrase.alt ? this.props.phrase.alt : deriveAcronymFromPhrase(this.props.phrase.phrase);
  }

  componentDidUpdate () {
    if (this.props.onUpdated) {
      this.props.onUpdated(this.props.phrase, this.dynamicAcronym);
    }
  }

  handleSubmit (e) {
    e.preventDefault();
    const currentlyActive = this.props.phrase;
    const testedPhrase = this.hintableInputInstance.value.trim();
    const isValid = this.validateTypedPhraseCorrect(testedPhrase);
    if (isValid) {
      this.props.onAnswerCorrect(currentlyActive);
      this.setState({
        submitTint: -1,
        shakebox: false,
        userTyped: '',
        spaces: 0
      });
      this.hintableInputInstance.focus();
      this.hintableInputInstance.reset();
    } else {
      let useTint = this.state.submitTint;
      useTint += 30;
      this.setState({
        submitTint: useTint,
        shakebox: true
      }, () => {
        // inelegant
        setTimeout(() => {
          this.setState({
            shakebox: false
          });
        }, 1500);
      });
      if (this.props.onAnswerWrong) {
        this.props.onAnswerWrong(currentlyActive);
      }
    }
  }

  handleReset (e) {
    this.props.handleReset(e);
    document.location.reload();
  }

  handleSkipClicked (e) {
    e.preventDefault();
    if (!this.props.allPhrases.length) {
      this.hintableInputInstance.focus();
      return;
    }
    this.setState({
      userTyped: '',
      spaces: 0,
      submitTint: -1
    }, () => {
      this.props.onSkipped(this.props.phrase);
      this.hintableInputInstance.reset();
      this.hintableInputInstance.focus();
    });
  }

  render () {
    return el('div', {
      className: 'game-letters-component-box'
    },
    el('ul', {
      className: 'game-letters-component-list'
    },
    el('li', {
      className: 'stackedView'
    },
    el('form', {
      onSubmit: this.handleSubmit.bind(this)
    },
    el(HintableInputComponent, {
      userTyped: this.state.userTyped,
      acronym: this.dynamicAcronym,
      phrase: this.props.phrase,
      submitTint: this.state.submitTint,
      shakebox: this.state.shakebox,
      ref: el => { this.hintableInputInstance = el; }
    }),
    el('button', {
      className: 'game-letters-component-button',
      type: 'submit'
    }, 'Solve'),
    el('a', {
      className: 'game-letters-skip-button',
      onClick: this.handleSkipClicked.bind(this),
      href: '#'
    }, 'skip'))))
    );
  }
}

export {
  GameLettersComponent,
  deriveAcronymFromPhrase
};
