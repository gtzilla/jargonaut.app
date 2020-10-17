'use strict';

const el = React.createElement.bind(React);

export function TextCopyBoxComponent (props) {
  let inputRef;
  const shareJsonUrl = new URL('/edit-jargon', document.location.origin);
  shareJsonUrl.search = new URLSearchParams({
    json: window.btoa(JSON.stringify(props.exportData))
  });
  const handleUrlCopySubmit = evt => {
    evt.preventDefault();
    navigator.clipboard.writeText(inputRef.value || '');
  };
  return (
    el(React.Fragment, {},
      el('h2', {}, 'Share via URL'),
      el('p', {}, '',
        'The library will be appended upon visiting this URL'),
      el('form', {
        onSubmit: handleUrlCopySubmit
      },
      el('input', {
        className: 'share-via-json-url-input',
        type: 'text',
        ref: el => { inputRef = el; },
        readOnly: true,
        value: shareJsonUrl.toString(),
        placeholder: 'export url here'
      }),
      el('button', {
        className: 'button-submit-copy-url-base64-json',
        type: 'submit'
      }, 'Copy'))
    ));
}

export class ExportJargonComponent extends React.PureComponent {
  handleSubmit (evt) {
    evt.preventDefault();
    navigator.clipboard.writeText(this.textarea.value || '');
  }

  static get propTypes () {
    return {
      exportData: () => {}
    };
  }

  handleUrlCopySubmit (evt) {
    evt.preventDefault();
    navigator.clipboard.writeText(this.textarea.value || '');
  }

  render () {
    return (
      el('div', {
        className: 'export-jaron-container'
      },
      el(TextCopyBoxComponent, {
        exportData: this.props.exportData
      }),
      el('h2', {}, 'Share via Github Gist'),
      el('p', {}, ''),
      el('ol', {},
        el('li', {}, 'Create a ', el('a', {
          href: 'https://gist.github.com',
          target: 'new'
        }, 'Gist')),
        el('li', {}, 'Copy+Paste below string into Gist'),
        el('li', {}, 'Share the Gist URL with your team'),
        el('li', {}, 'To import ',
          el('a', {
            href: document.location.pathname + '?preferences=1'
          }, 'Open'), ' the blue cog'),
        el('li', {}, ' Add Custom Library from Gist')),
      el('form', {
        onSubmit: this.handleUrlCopySubmit.bind(this)
      },
      el('textarea', {
        cols: 80,
        rows: 10,
        ref: el => { this.textarea = el; },
        readOnly: true,
        value: window.btoa(JSON.stringify(this.props.exportData))
      }),
      el('div', {
        className: 'button-submit-copy-exported-json'
      },
      el('button', { type: 'submit' }, 'Copy'))))
    );
  }
}
