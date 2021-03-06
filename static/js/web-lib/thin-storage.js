'use strict';

/**
  Wraps localStorage.

  Potentially replaced with indexDB in
  future revisions.
*/
class ThinStorage {
  constructor (props) {
    this.db = window.localStorage;
  }

  set (key, any) {
    this.db.setItem(key, JSON.stringify(any));
  }

  get (key) {
    try {
      return JSON.parse(this.db.getItem(key));
    } catch (err) {}
    return null;
  }

  del (key) {
    try {
      return this.db.removeItem(key);
    } catch (err) {}
    return null;
  }
}

export { ThinStorage };
