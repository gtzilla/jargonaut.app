'use strict';

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
    } catch (e) {}
    return null;
  }

  del (key) {
    try {
      return this.db.removeItem(key);
    } catch (e) {}
    return null;
  }
}

export { ThinStorage };
