'use strict';

import rtl from '@testing-library/react';
import ruetl from '@testing-library/user-event';
import { describe, expect, it } from '@jest/globals';
import { HintableInputComponent } from '../../static/js/web-lib/hintable-input-component.js';
import React from 'react';

const userEvent = ruetl.default;
const { render, screen } = rtl;
const el = React.createElement.bind(React);
const basicPhrase = { phrase: 'React Testing Library', rating: 'g', type: 'pure' };

describe('Handles Events', () => {
  it('Keyboard', async () => {
    render(el(HintableInputComponent, {
      acronym: 'rtl',
      userTyped: '',
      phrase: basicPhrase
    }));
    const input = screen.getByRole('textbox', { name: 'jargon input' });
    userEvent.type(input, 'a');
    expect(input.value).toEqual('A');
    userEvent.type(input, 'b');
    expect(input.value).toEqual('Ab');
  });
});
