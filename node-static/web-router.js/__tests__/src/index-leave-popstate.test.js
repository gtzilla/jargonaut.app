'use strict';

import { describe, expect, it } from '@jest/globals';
import { WebRouter } from '../../src/index.js';
// eslint-disable-next-line
import _ from 'underscore';

/**
  This is a separate file
  due to event issues
  happening during initial development

  popstate was triggering the leave method 6 times each. Why
  appears to be related to the other `describe` blocks
*/

beforeAll(async () => {
  WebRouter.autoListen = true;
});

describe('WebRouter leave hook method', () => {
  let count = 0;
  let historyPopped = false;
  beforeAll(() => {
    window.onpopstate = function (evt) {
      historyPopped = true;
    };
  });
  afterEach(() => {
    const router = new WebRouter();
    router.off();
  });
  it('fires leave on popstate', () => {
    const router = new WebRouter();
    count += 1;
    expect.assertions(4);
    router.on('/foo2', () => {
      expect(true).toBeTruthy();
    }, {
      leave: [(done, params) => {
        count += 1;
        expect(true).toBeTruthy();
        done();
      }, (done, params) => {
        count += 1;
        expect(historyPopped).toBeTruthy();
        expect(count).toEqual(3);
        done();
      }]
    });
    router.resolve('/foo2');
    const event = document.createEvent('CustomEvent');
    event.state = null;
    event.initEvent('popstate', true, true);
    window.dispatchEvent(event);
  });
});
