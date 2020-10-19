'use strict';

import { deriveAcronymFromPhrase } from './hintable-input-component.js';
export function PhraseModel (phrase, acronym, rating = 'g') {
  const derived = deriveAcronymFromPhrase(phrase);
  let type = 'pure';
  let alt = null;
  if (acronym && derived.toLowerCase() !== acronym.toLowerCase()) {
    type = 'alt';
    alt = acronym;
  }
  return {
    phrase,
    rating,
    alt,
    type
  };
}

PhraseModel.validate = (obj) => {
  const model = new PhraseModel(obj.phrase, obj.alt);
  return (
    model.phrase === obj.phrase &&
    model.alt === obj.alt &&
    model.type === obj.type);
};

// assumes already validated.
PhraseModel.restrictedProperties = obj => {
  return new PhraseModel(obj.phrase, obj.alt, obj.rating);
};
