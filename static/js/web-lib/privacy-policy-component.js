'use strict';

const el = React.createElement.bind(React);

export class PrivacyPolicyComponent extends React.PureComponent {
  render () {
    return (
      el('div', {
        className: 'privacy-policy-container',
        role: 'document',
        'aria-label': 'privacy policy'
      },
      el('h1', {
        'aria-label': 'Privacy Information'
      }, 'Privacy'),
      el('h3', {}, 'Warranty and Support'),
      el('p', {},
        'There is no warranty. Support for general bugs is best communicated',
        ' via Github Issues. A link to the source code is available.',
        ' Enterprise specific features can be purchased. Please contact ',
        el('a', { href: 'mailto:email.developnyc@gmail.com' }, 'email.developnyc@gmail.com')),
      el('h3', {}, 'Source Code'),
      el('p', {},
        'This app is free to be used by anyone.',
        ' The source code is not open source. Enterprises must license ',
        ' this project if hosted outside ', el('a', { href: 'https://jargonaut.app' }, 'Jargonaut.app.'),
        ' Any external use of this code, or its parts, is strictly prohibited, without express written consent. ',
        ' The source code link above is available for review.'),
      el('h3', {}, 'Telemetry'),
      el('p', {},
        'Jargonaut.app keeps your enterprise jargon private.',
        ' Jargonaut.app does not collect Telemetry, nor is it able to collect Telemetry.',
        ' This project, Jargonaut.app, does not collect any serverside Telemetry',
        ' Jargonaut.app is hosted using Github and is a JavaScript Single Page Application (SPA)',
        ' Jargonaut.app does not make use of any third party tracking software. ',
        ' All dictionaries (glossaries) are stored locally, in the browser.',
        ' The source code is available for review.'
      ),
      el('p', {},
        'Jargonaut.app is safe to run in sensitive and corporate environments. ',
        ' Jargonaut.app does not leak employee or private information. ',
        ' One downside to collecting no Telemetry, means it\'s impossible to',
        ' know what features users want, need, and are using. That is a solvable problem.',
        ' Please report any opportunities to improve Jargonaut.app. ',
        ' Report issues ',
        el('a', {
          target: 'new',
          href: 'https://github.com/gtzilla/jargonaut.app/issues'
        }, 'here'),
        ', which will open Github.'))
    );
  }
}
