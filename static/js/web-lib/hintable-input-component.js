'use strict';

const el = React.createElement.bind(React);

function hasModifier (e) {
  return e.metaKey || e.altKey || e.shiftKey || e.ctrlKey;
}

function capitalizer (typed) {
  return typed
    .replace(/^([a-z])$/, (matches, m1) => {
      return m1.toUpperCase();
    })
    .replace(/\s([a-z])$/, (matches, m1, m2) => {
      return ' ' + m1.toUpperCase();
    });
}
export function deriveAcronymFromPhrase (item) {
  return item && item.split(' ').map(word => {
    return word.substring(0, 1).toUpperCase();
  }).join('');
}

export function testPhraseAcronymMatchForHintPreview (acronym, typed, spaces) {
  if (!acronym) return '';
  const pos = spaces;
  let hintToUser = acronym.substring(pos);
  const userEnteredAcronym = deriveAcronymFromPhrase(typed);
  const officialLastLetter = acronym.substring(pos - 1, pos);
  const userLastAcronymLetter = userEnteredAcronym.substring(pos - 1, pos);
  if (userLastAcronymLetter !== officialLastLetter) {
    hintToUser = acronym.substring(pos - 1);
  }
  return hintToUser;
}

export class HintableInputComponent extends React.PureComponent {
  static get propTypes () {
    return {
      shakebox: () => {},
      phrase: () => {},
      submitTint: () => {},
      userTyped: () => {},
      acronym: () => {}
    };
  }

  constructor (props) {
    super(props);
    this.state = {
      scrollLeft: 0,
      spaces: 0,
      submitTint: props.submitTint,
      userTyped: props.userTyped,
      shakebox: props.shakebox
    };
  }

  focus () {
    this.activeElement.focus();
  }

  reset () {
    this.setState({
      submitTint: -1,
      shakebox: false,
      userTyped: '',
      spaces: 0
    });
  }

  get value () {
    return this.activeElement.value;
  }

  componentDidUpdate () {
    this.disabledElement.scrollLeft = this.state.scrollLeft;
    this.setState({
      shakebox: this.props.shakebox
    });
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

  handleFocus (e) {
    const el = e.currentTarget;
    if (!this.props.phrase) return;
    el.selectionStart = el.selectionEnd = el.value.length;
  }

  handleBlur (e) {
    this.disabledElement.scrollLeft = 0;
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
      const acronym = this.props.acronym;
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

  render () {
    const styleParams = {};
    if (this.props.submitTint > -1) {
      styleParams.color = `rgb(${this.state.submitTint}, 0, 0)`;
    }
    const cssNames = this.state.shakebox ? 'shakeit-short' : '';
    const hinted = testPhraseAcronymMatchForHintPreview(this.props.acronym, this.state.userTyped, this.state.spaces);
    return (
      el(React.Fragment, {},
        el('div', {
          className: 'game-letters-component-input-box ' + cssNames
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
          // Hinted, unsolved, letters in acronym, appended to user input value
          value: this.state.userTyped + hinted,
          className: 'game-letters-component-input-disabled'
        }))));
  }
}
