'use strict';

const el = React.createElement.bind(React);
function capitalizer (typed) {
  return typed
    .replace(/^([a-z])$/, (matches, m1) => {
      return m1.toUpperCase();
    })
    .replace(/\s([a-z])$/, (matches, m1, m2) => {
      return ' ' + m1.toUpperCase();
    });
}

function hasModifier (e) {
  return e.metaKey || e.altKey || e.shiftKey || e.ctrlKey;
}

function deriveAcronymFromPhrase (item) {
  return item && item.split(' ').map(word => {
    return word.substring(0, 1).toUpperCase();
  }).join('');
}

function nsfwFilter (isNSFW, array) {
  // always start from props.Allphrases
  return array.filter((item, idx, all) => {
    if (!isNSFW && item.rating !== 'g') return false;
    return true;
  });
}

class GameLettersComponent extends React.Component {
  constructor (props) {
    super(props);
    if (!props.allPhrases) {
      throw new Error('allPhrases property must be array');
    }
    if (!props.phrase) {
      throw new Error('activePhrase property must be object');
    }
    // remainingCountElement
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
    this.activeElement.focus();
    if (this.props.onMounted) {
      this.props.onMounted(this.props.phrase, this.dynamicAcronym);
    }
  }

  validateTypedPhraseCorrect (phrase) {
    /**
      in iOS, unless changed. Single straight quotes
      are curly quotes, which causes exact string match
      to fail.
    */
    const correctPhrase = this.props.phrase.phrase.replace(/’/g, '\'').toLowerCase();
    if (phrase.toLowerCase() === correctPhrase) {
      return true;
    }
  }

  matchScrollPosition () {
    if (this.activeElement) { this.disabledElement.scrollLeft = this.activeElement.scrollLeft; }
  }

  handleChange (e) {
    let typed = e.currentTarget.value;
    typed = typed.replace(/\s{2,}/g, ' ');
    const splitted = typed.trim().split(' ');
    typed = capitalizer(typed);
    this.setState({
      spaces: splitted.length,
      scrollLeft: e.currentTarget.scrollLeft
    });
    if (typed.length === 0) {
      this.setState({
        userTyped: typed,
        spaces: 0
      });
      e.currentTarget.blur();
      e.currentTarget.focus();
    } else {
      this.setState({
        userTyped: typed
      });
    }
    this.disabledElement.scrollLeft = e.currentTarget.scrollLeft;
  }

  setNSFW (isNSFW) {
    this.setState({
      isNSFW
    });
  }

  handleKeyUp (e) {
    this.matchScrollPosition();
  }

  handleKeyPress (e) {
    setTimeout(() => {
      this.matchScrollPosition();
    }, 5);
  }

  handleKeyDown (e) {
    if (e.keyCode === 9) {
      e.preventDefault();
    }
    if (!hasModifier(e) && (e.keyCode === 39 || e.keyCode === 9)) {
      const acronym = this.dynamicAcronym;
      let typed = e.currentTarget.value;
      const splitted = typed.trim().split(' ');
      let spaces = splitted.length;
      if (!typed) {
        typed = acronym.substring(splitted.length - 1, splitted.length);
      } else {
        if (!typed.endsWith(' ')) {
          typed += ' ';
        }
        typed += acronym.substring(splitted.length, splitted.length + 1);
        spaces += 1;
      }
      this.setState({
        userTyped: typed,
        shakebox: false,
        spaces
      });
      this.matchScrollPosition();
    }
  }

  handleBlur (e) {
    this.disabledElement.scrollLeft = 0;
  }

  handleFocus (e) {
    const el = e.currentTarget;
    if (!this.props.phrase) return;
    el.selectionStart = el.selectionEnd = el.value.length;
  }

  get dynamicAcronym () {
    return this.props.phrase.alt ? this.props.phrase.alt : deriveAcronymFromPhrase(this.props.phrase.phrase);
  }

  componentDidUpdate () {
    this.disabledElement.scrollLeft = this.state.scrollLeft;
    if (this.props.onUpdated) {
      this.props.onUpdated(this.props.phrase, this.dynamicAcronym);
    }
  }

  handleSubmit (e) {
    e.preventDefault();
    const currentlyActive = this.props.phrase;
    const testedPhrase = this.activeElement.value.trim();
    const isValid = this.validateTypedPhraseCorrect(testedPhrase);
    if (isValid) {
      this.props.onAnswerCorrect(currentlyActive);
      this.setState({
        submitTint: -1,
        shakebox: false,
        userTyped: '',
        spaces: 0
      });
      this.activeElement.focus();
    } else {
      let useTint = this.state.submitTint;
      useTint += 30;
      this.setState({
        submitTint: useTint,
        shakebox: true
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
      this.activeElement.focus();
      return;
    }
    this.setState({
      userTyped: '',
      spaces: 0,
      submitTint: -1
    }, () => {
      this.props.onSkipped(this.props.phrase);
      this.activeElement.focus();
    });
  }

  handleUserChallenge (e) {
    e.preventDefault();
    const userTyped = this.activeElement.value;
    if (userTyped && userTyped.length) {
      this.setState({
        spaces: 0,
        userTyped: ''
      });
    }
    this.activeElement.focus();
  }

  testPhraseAcronymMatchForHintPreview (acronym, typed) {
    if (!acronym) return '';
    const pos = this.state.spaces;
    let hintToUser = acronym.substring(pos);
    const userEnteredAcronym = deriveAcronymFromPhrase(typed);
    const officialLastLetter = acronym.substring(pos - 1, pos);
    const userLastAcronymLetter = userEnteredAcronym.substring(pos - 1, pos);
    if (userLastAcronymLetter !== officialLastLetter) {
      hintToUser = acronym.substring(pos - 1);
    }
    return hintToUser;
  }

  render () {
    const acronym = this.dynamicAcronym;
    const styleParams = {};
    if (this.state.submitTint > -1) {
      styleParams.color = `rgb(${this.state.submitTint}, 0, 0)`;
    }
    let disabledInputText = acronym;
    const hinted = this.testPhraseAcronymMatchForHintPreview(acronym, this.state.userTyped);
    disabledInputText = this.state.userTyped + hinted;
    const cssNames = this.state.shakebox ? 'shakeit-short' : '';
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
    el('div', {
      className: 'game-letters-component-input-box ' + cssNames,
      ref: el => { this.box = el; }
    },
    el('input', {
      type: 'text',
      style: styleParams,
      ref: el => { this.activeElement = el; },
      autoComplete: 'off',
      value: this.state.userTyped,
      onKeyUp: this.handleKeyUp.bind(this),
      onKeyDown: this.handleKeyDown.bind(this),
      onKeyPress: this.handleKeyPress.bind(this),
      onChange: this.handleChange.bind(this),
      onFocus: this.handleFocus.bind(this),
      onBlur: this.handleBlur.bind(this),
      className: 'game-letters-component-input'
    }),
    el('input', {
      disabled: true,
      type: 'text',
      scrollleft: '100px',
      ref: el => { this.disabledElement = el; },
      value: disabledInputText,
      className: 'game-letters-component-input-disabled'
    })),
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
  nsfwFilter,
  deriveAcronymFromPhrase
};
