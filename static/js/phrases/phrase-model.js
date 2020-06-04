'use strict';

export function PhraseModel (phrase, alt = null, collection = 'general', rating = 'g') {
  const type = alt || 'pure';
  return {
    phrase,
    rating,
    alt,
    type,
    collection
  };
}
