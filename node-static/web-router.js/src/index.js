'use strict';

/**
  See README.md and __tests__/src/index.test.js
*/

import _ from 'underscore';

let _routes = {};
let DEBUG = false;
let autoListen = true;
let lastResolved = null;
const pageLinkDefaultNames = ['[data-navigo]', '[data-route]']
let pageLinkNames = pageLinkDefaultNames.slice(0);
let notFoundHandler = null;
/**
  @param {array} items - an array of functions to recursively call
  @param {object} params
  @param {function} callback

  helper method to handle an array of functions
*/
function recursionMethods(items, params=null, callback) {
  if(!items.length) { return callback(true); }
  const first = _.first(items);
  if(_.isFunction(first)) {
    first((allow=true)=>{
      if(!allow) { return callback(false); }
      recursionMethods(_.rest(items), params, callback);
    });
  }
}

/**
  @param {string} hookType - before, after or leave
  @param {RouteInfo} route object
  @param {object} params
  @param {function} callback

  Pass the callback through
*/
function callHook(hookType, info, params=null, callback=()=>{}) {
  if(_.isFunction(info.hooks[hookType])) {
    info.hooks[hookType]((allow=true)=>{
      if(allow) { callback(allow) }
    }, params);
  } else if(_.isArray(info.hooks[hookType])) {
    recursionMethods(info.hooks[hookType], params, (allow=true)=>{
      if(allow) { callback(allow); }
    });
  } else {
    callback();
  }
}
/**
  @param {RouteInfo} info - the value matched from _routes
  @param {object|array|null} - route matching
*/
function callBeforeAndMain(info, params=null) {
  return callHook('before', info, params, (allow)=>{
    if(_.isArray(params)) {
      info.method.apply({}, params);
    } else {
      info.method(params);
    }
  });
}
/**
  @param {RouteInfo} info - the value matched from _routes
  @param {object|array|null} - route matching
  @param {function} callback - method to call when completed. 
*/
function callAfter(info, params=null, callback=(allow)=>{}) {
  return callHook('after', info, params, callback);
}

/**
  @param {RouteInfo} info - the value matched from _routes
  @param {object|array|null} - route matching
  @param {function} callback - method to call when completed. 
*/
function callLeave(info, params=null, callback=(allow)=>{}) {
  return callHook('leave', info, params, callback);
}

/**
  @param {Event} evt - the window popstate event

  @return {WebRouter}
*/
function locationChange(evt) {
  if(lastResolved) {
    if(DEBUG) console.log("was a last resolve", lastResolved);
    callLeave(lastResolved, evt);
  }
  this.resolve();
  return this;
}

/**
  Formalize the route information
*/
function RouteInfo(props) {
  Object.assign(this, props);
  return this;
}

/**
  A WebRouter that works with `popstate`
  @class 
*/
export class WebRouter {
  constructor(routes={}) {
    lastResolved = null;
    for(const key in routes) {
      const value = routes[key];
      this.on(key, value);
    }    
    if(autoListen) {
      this.listen();
      this.updatePageLinks();
    }
  }
  /**
    @param {string|RegExp} routeName
    @param {function} method
    @param {object} hooks of format {before, after, leave}

    @return {WebRouter}
  */
  on(routeName='/', method, hooks={}) {
    if(DEBUG) console.log(".on(", routeName, method, hooks, ")");
    let name = routeName;
    let isRegExp = false;
    const keys = [];
    if(_.isRegExp(routeName)) {
      isRegExp = true;
      name = routeName.toString();
    } else {
      // handle parameterized URL string
      const remapped = name.split('/').map(item=>{
        if(item.startsWith(":")) {
          isRegExp = true;
          keys.push(item.slice(1));
          return '([^/]{1,})';
        }
        return item;
      });
      routeName = new RegExp('^' + remapped.join('/') + '$');
    }
    _routes[name] = new RouteInfo({
      name,
      regExp:isRegExp ? routeName : null,
      regExpKeys:keys,
      method,
      hooks
    });
    return this;   
  } 
  /**
    @return {WebRouter}
  */
  off(...args) {
    if(DEBUG) { console.log(".off(", args, ")"); }
    if(args.length === 0) {
      WebRouter.reset();
      window.removeEventListener('popstate', locationChange.bind(this), false);
      delete window.hasListenerAttached;
    } else {
      const [routeName] = args;
      delete _routes[routeName];  
    }
    return this;
  }
  /**
    @return {WebRouter}
  */  
  listen() {
    if(!window.hasListenerAttached) {
      if(DEBUG) console.log("listen() Attaching to window")
      window.addEventListener('popstate', locationChange.bind(this), false);
      window.hasListenerAttached = true;      
    }
    return this;
  }
  /**
    @param {function} callback (optional) used mostly for testing

    @return {WebRouter}
  */
  updatePageLinks(callback=null) {
    if(DEBUG) console.log('updatePageLinks', pageLinkNames);
    pageLinkNames.forEach(name=>{
      const links = document.querySelectorAll(name);
      _.each(links, el=>{
        if(!el.hasListenerAttached) {
          el.addEventListener('click', (evt)=>{
            if(DEBUG) { 
              console.log("CLICKED. Now navigate", evt); 
            }
            if((evt.ctrlKey || evt.metaKey) && evt.target.tagName.toLowerCase() === 'a') { 
              return false; 
            }
            evt.preventDefault();
            const href = evt.target.getAttribute('href');
            if(!callback) {
              this.navigate(href);
            } else {
              callback.call(this, href);  
            }
          }, false);
        }
        el.hasListenerAttached = true;
      });
    });
    return this;
  }
  /**
    @param {string} path - the path to navigate
    @param {object} data - an object to set for `state`

    @return {WebRouter}
  */
  navigate(path, data=null) {
    window.history.pushState(data, null, path);
    this.resolve();
    return this;
  }
  /**
    @return {WebRouter}
  */
  notFound(handler) {
    if(_.isFunction(handler)) {
      notFoundHandler = handler;  
    }
    return this;
  }
  /**
    @param {string} current (optional) - default is current window.location.pathname. 

    @return {WebRouter}
  */
  resolve(current=window.location.pathname) {
    if(DEBUG) console.log('Resolve', current);
    let wasMatched = false;
    for(const key in _routes) {
      const value = _routes[key];
      if(!value.regExp) {
        if(key === current) {
          wasMatched = true;
          lastResolved = value;
          callBeforeAndMain(value, {});
          callAfter(value, null);
        }
      } else if(value.regExp) {
        const matched = current.match(value.regExp) || [];
        const keyMatches = matched.slice(1, value.regExpKeys.length+1);
        const raw = {};
        if(matched && matched.length) {
          keyMatches.forEach((item, idx)=>{
            const key = value.regExpKeys[idx];
            raw[key] = item;
          });
          const params = value.regExpKeys.length ? raw : matched.slice(1);
          wasMatched = true;
          lastResolved = value;
          callBeforeAndMain(value, params);
          callAfter(value, params);
        }
      }
    }
    if(!wasMatched) {
      lastResolved = null;
      if(notFoundHandler) {
        if(DEBUG) console.log("notFound");
        notFoundHandler.call(this);
      }
    } else if(DEBUG) {
      console.log('Route Matched', lastResolved);
    }
    return this;
  }
  /**
    @return {object}
  */
  get all() {
    return _routes;
  }

  static set autoListen(value) {
    return autoListen = !!(value);
  }
  /**
    @return {object}
  */  
  static get routes() {
    return _routes;
  }
  /**
    @return {string}
  */
  static get lastResolved() {
    return lastResolved;
  }
  static reset() {
    _routes = {}
    autoListen = true;
    lastResolved = null;
    notFoundHandler = null;
    pageLinkNames = pageLinkDefaultNames.slice(0);
  } 
  static set debug(value) {
    DEBUG = !!(value);
  }
  /**
    @param {array} items - additional selectors to use when calling `.updatePageLinks()`
  */
  static addPageLinkSelectors(items=[]) {
    pageLinkNames.push(...items);
    pageLinkNames = _.unique(pageLinkNames)
  }
}
