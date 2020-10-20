'use strict';


// 
import { describe, expect, it } from '@jest/globals';
import { ComprehensivePhraseCollection, Ratings } from '../../static/js/phrases/phrases-list.js';


describe('phrases-list.js', ()=>{
  it('ComprehensivePhraseCollection  Exists', ()=>{
    expect(ComprehensivePhraseCollection).toBeDefined();
    expect(_.isArray(ComprehensivePhraseCollection)).toBeTruthy();
    expect(ComprehensivePhraseCollection.length).toBeTruthy();
  });
  it('Ratings Exists', ()=>{
    expect(Ratings).toBeDefined();
    expect(_.isArray(Ratings)).toBeTruthy();
    expect(Ratings.length).toBeTruthy();
  });
});
