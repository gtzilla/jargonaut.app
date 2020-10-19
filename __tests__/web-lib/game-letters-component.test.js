'use strict';

import rtl from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';
import { GameLettersComponent } from '../../static/js/web-lib/game-letters-component.js';
import React from 'react';

const { render, screen } = rtl;
const el = React.createElement.bind(React);
const basicPhrase = { phrase: 'React Testing Library', rating: 'g', type: 'pure' };

/**

*/
describe('Exists and Can be rendered', () => {
  it('Has button with Text', async () => {
    render(el(GameLettersComponent, {
      acronym: 'rtl',
      phrase: basicPhrase
    }));
    const hints = await screen.findByRole('button');
    expect(hints).toBeTruthy();
    const button = await screen.findAllByText(/Solve/i);
    expect(button).toHaveLength(1);
  });
});

/**
  TODO:
  simulate being typed into
  see if the value is updating.
*/
