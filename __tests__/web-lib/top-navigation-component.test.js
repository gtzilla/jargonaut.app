'use strict';

import '@testing-library/jest-dom';
import rtl from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';
import { TopNavigationComponent } from '../../static/js/web-lib/top-navigation-component.js';
import React from 'react';

const { render, screen } = rtl;
const el = React.createElement.bind(React);

describe('Top Navigation', () => {
  it('', async () => {
    render(el(TopNavigationComponent, {}));
    const elem = await screen.getByRole('navigation', { name: /App Navigation/i });
    expect(elem).toBeInTheDocument();
  });
});
