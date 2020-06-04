'use strict';

const el = React.createElement.bind(React);
class SuccessListComponent extends React.Component {
  deriveAcronymFromPhrase (item) {
    const phrase = item;
    const splitted = (phrase || '').split(' ');
    return splitted.map(word => {
      return word.substring(0, 1).toUpperCase();
    }).join('');
  }

  static get propTypes () {
    return {
      onAcronymClick: () => {},
      buttonText: () => {},
      side: () => {},
      onReset: () => {},
      solved: () => {}
    };
  }

  handleClick (e) {
    if (this.props.onAcronymClick) {
      this.props.onAcronymClick(e);
    }
  }

  render () {
    const buttonText = this.props.buttonText || 'Reset';
    const items = Array.from(this.props.solved).sort((a, b) => {
      if (a.phrase > b.phrase) return 1;
      if (a.phrase < b.phrase) return -1;
      if (a.phrase === b.phrase) return 0;
    }).map(item => {
      const acronym = item.alt ? item.alt : this.deriveAcronymFromPhrase(item.phrase);
      return el('div', {},
        el('ul', {
          className: 'success-list-subview-flexlist'
        },
        el('li', {}, item.phrase),
        el('li', {
        }, el('a', { href: '/acronym/' + acronym }, acronym))));
    });

    const style = {};
    if (this.props.side) {
      style.float = this.props.side;
    }
    const _resetButton = items.length ? el('div', {
      className: 'success-list-reset-button-box',
      onClick: this.props.onReset
    }, el('a', {}, buttonText)) : null;
    return (
      el(React.Fragment, {},
        el('div', {
          style,
          className: 'success-list-component-box side_' + this.props.side || 'right'
        }, ...items, _resetButton)));
  }
}

export { SuccessListComponent };
