'use strict';

const el = React.createElement.bind(React);

/**
  states:
    closed
    open
    opened, closings
*/
export class UserPreferencesComponent extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      insertPanel: false,
      nsfw: props.isNSFW,
      closeOpenedPanel: false
    };
  }

  static get propTypes () {
    return {
      isNSFW: () => {},
      onChange: () => {},
      onStartClose: () => {},
      onEndClose: () => {}
    };
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
    });
    this.props.onChange(e, !this.state.nsfw);
  }

  handleAnimateEnd (e) {
    if (this.state.closeOpenedPanel && this.props.onEndClose) {
      this.props.onEndClose();
    }
    this.setState({
      closeOpenedPanel: false
    });
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
    return (
      el(React.Fragment, {},
        el('span', spanParams,
          el('form', {},
            el('label', {},
              el('input', {
                ref: el => { this.checkbox = el; },
                type: 'checkbox',
                checked: this.state.nsfw,
                onChange: this.handleChange.bind(this)
              }),
              'NSFW'),
            el('button', { type: 'submit' }))),
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
