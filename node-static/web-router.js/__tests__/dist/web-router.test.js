'use strict';

import { jest, describe, expect, it } from '@jest/globals';
import { WebRouter } from '../../dist/web-router.js';
import _ from 'underscore'

describe('Validty of build', ()=>{
  it('Exists and Has Methods', ()=>{
    const router = new WebRouter;
    expect(router).toBeTruthy();
    expect(_.isFunction(router.navigate)).toBeTruthy();
    expect(_.isFunction(router.off)).toBeTruthy();
    expect(_.isFunction(router.updatePageLinks)).toBeTruthy();
    expect(_.isFunction(router.resolve)).toBeTruthy();
    expect(_.isFunction(router.navigate)).toBeTruthy();  
  });
});