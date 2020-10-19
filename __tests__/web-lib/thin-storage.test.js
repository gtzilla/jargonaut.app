'use strict';

// import { render, fireEvent, screen } from rtl
import { describe, expect, it } from '@jest/globals';
import { ThinStorage } from '../../static/js/web-lib/thin-storage.js';

describe('Exists', () => {
  it('can be instatiated', () => {
    const thin = new ThinStorage();
    expect(thin).toBeTruthy();
  });
  it('has a Public API', () => {
    const thin = new ThinStorage();
    expect(_.isFunction(thin.set)).toBeTruthy();
    expect(_.isFunction(thin.get)).toBeTruthy();
    expect(_.isFunction(thin.del)).toBeTruthy();
  });
});
