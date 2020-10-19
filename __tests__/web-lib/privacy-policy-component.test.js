'use strict';

import '@testing-library/jest-dom';
import rtl from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';

import { PrivacyPolicyComponent } from '../../static/js/web-lib/privacy-policy-component.js';
import React from 'react';

const { render, screen } = rtl;
const el = React.createElement.bind(React);

describe('Privacy Policy', () => {
  it('Has aria roles and labels', async () => {
    render(el(PrivacyPolicyComponent, {}));
    const h1 = await screen.getByRole('heading', { name: 'Privacy Information' });
    expect(h1).toBeInTheDocument();

    const doc = await screen.getByRole('document', { name: /privacy policy/i });
    expect(doc).toBeInTheDocument();
  });

  it('has multiple headers', async () => {
    render(el(PrivacyPolicyComponent, {}));
    const elems = await screen.getAllByRole('heading');
    expect(elems).toHaveLength(4);
  });
});
