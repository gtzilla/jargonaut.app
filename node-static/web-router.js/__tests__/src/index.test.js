'use strict';

import { jest, describe, expect, it } from '@jest/globals';
import { WebRouter } from '../../src/index.js';
// eslint-disable-next-line
import _ from 'underscore';

afterEach(() => {
  const router = new WebRouter();
  router.off();
  WebRouter.reset();
});
beforeAll(() => {
  WebRouter.autoListen = false;
  delete window.location;
  window.location = {
    reload: jest.fn()
  };
});

describe('WebRouter Basic', () => {
  it('Can be imported', () => {
    expect(WebRouter).toBeTruthy();
    expect(WebRouter).toBeDefined();
  });
  it('Public API Methods', () => {
    const router = new WebRouter('/', null);
    expect(_.isFunction(router.on)).toBeTruthy();
    expect(_.isFunction(router.off)).toBeTruthy();
    expect(_.isFunction(router.updatePageLinks)).toBeTruthy();
    expect(_.isFunction(router.listen)).toBeTruthy();
    expect(_.isFunction(router.resolve)).toBeTruthy();
    expect(_.isFunction(router.navigate)).toBeTruthy();
    expect(_.isFunction(router.notFound)).toBeTruthy();
    expect(router.all).toBeDefined();
    expect(_.isFunction(WebRouter.addPageLinkSelectors)).toBeTruthy();
    expect(_.isFunction(WebRouter.reset)).toBeTruthy();
    expect(WebRouter.routes).toBeDefined();
    expect(WebRouter.lastResolved).toBeDefined();
  });
  it('can chain notFound, on and resolve', () => {
    const router = new WebRouter();
    expect.assertions(1);
    router.notFound(() => {
      expect(false).toBeTruthy();
    }).on('/f001', () => {
      expect(true).toBeTruthy();
    }).on('/f002').resolve('/f001');
  });
  it('can handle not found with handler', () => {
    expect.assertions(1);
    const router = new WebRouter();
    expect.assertions(1);
    router.notFound(() => {
      expect(true).toBeTruthy();
    });
    router.on('/f001', () => {
      expect(true).toBeTruthy();
    }).on('/not-found').resolve('/f001');
  });
});

describe('WebRouter `.on()`', () => {
  it('assigns routes', () => {
    const router = new WebRouter();
    router.on('/', () => { return true; }, {});
    router.on('/not-true', () => { return false; }, {});
    const _routes = WebRouter.routes;
    const found = _routes['/'];
    const foundNotTrue = _routes['/not-true'];
    expect(router.all).toEqual(_routes);
    expect(router.all['/']).toEqual(found);
    expect(found).toBeTruthy();
    expect(foundNotTrue).toBeTruthy();
    expect(_.isFunction(found.method)).toBeTruthy();
    expect(found.method()).toBeTruthy();
    expect(foundNotTrue.method()).toBeFalsy();
  });
});

describe('WebRouter multi resolved', () => {
  it('can be resolved more than once', () => {
    expect.assertions(4);
    const router = new WebRouter();
    router.on('/abc123', () => {
      expect(true).toBeTruthy();
    }).on('/abc/123/:xyz', ({ xyz }) => {
      expect(true).toBeTruthy();
      expect(xyz).toEqual('happy');
    }).resolve('/abc123');
    router.resolve('/abc/123/happy');
    router.resolve('/abc123');
  });
});

describe('WebRouter `.off()`', () => {
  it('Clears all routes when no args', () => {
    const router = new WebRouter();
    router.on('/', () => {});
    router.on('/something', () => {});
    const _routes = WebRouter.routes;
    const found = _routes['/'];
    expect(found).toBeTruthy();
    router.off();
    expect(WebRouter.routes).toBeTruthy();
    expect(WebRouter.routes['/']).toBeFalsy();
  });
});

/**
  if parameterized URL patterns are
    /:pattern/:date
    /:pattern

  And route is
  /66,55,55,55,55/2020-10-20

  Should not be matching /pattern
*/
describe('parameterized URL', () => {
  it('is not greedy', () => {
    const router = new WebRouter();
    expect.assertions(2);
    router.on('/:pattern', ({ pattern }) => {
      expect(true).toBeTruthy();
    }).on('/:pattern/:date', ({ pattern, date }) => {
      expect(pattern).toEqual('66,55,55,55,55');
      expect(date).toEqual('2020-10-17');
    }).resolve('/66,55,55,55,55/2020-10-17');
  });

  it('is not greedy, reverse declaration', () => {
    const router = new WebRouter();
    expect.assertions(2);
    router.on('/:pattern/:date', ({ pattern, date }) => {
      expect(pattern).toEqual('66,55,55,55,55');
      expect(date).toEqual('2020-10-17');
    }).on('/:pattern', ({ pattern }) => {
      expect(true).toBeTruthy();
    }).resolve('/66,55,55,55,55/2020-10-17');
  });
});

describe('WebRouter .navigate() adds to history length', () => {
  /**
    This tests relies on there only
    being 1 `it` and is brittle
  */
  let startLength;
  let historyPopped = false;
  beforeAll(() => {
    WebRouter.autoListen = true;
    startLength = window.history.length;
    window.onpopstate = function (evt) {
      historyPopped = true;
    };
  });
  it('Added to history', () => {
    const router = new WebRouter();
    expect(window.history.length).toEqual(1);
    router.navigate('/foo1');
    const event = document.createEvent('CustomEvent');
    event.state = null;
    event.initEvent('popstate', true, true);
    window.dispatchEvent(event);
    expect(window.history.length).toEqual(2);
    expect(window.history.length).toEqual(startLength + 1);
    expect(historyPopped).toBeTruthy();
  });
  afterAll(() => {
    startLength = 0;
  });
});

describe('WebRouter .resolve() routes', () => {
  beforeAll(() => {
    delete window.location.pathname;
    window.location.pathname = '/foo1';
  });
  it('resolves to path', () => {
    let count = 0;
    const router = new WebRouter();
    router.on('/foo1', () => {
      count = 1;
      expect(count).toEqual(1);
    });
    router.resolve();
  });
});

describe('leave hook', () => {
  /**
    https://stackoverflow.com/questions/57614973/testing-popstate-event-with-jest
    works ok, could be better
  */
  const mockAddEventListener = jest.fn();
  const orig = window.addEventListener;
  beforeAll(() => {
    window.addEventListener = mockAddEventListener;
  });
  afterAll(() => {
    window.addEventListener = orig;
  });
  it('can trigger leave', testDone => {
    expect.assertions(5);
    const router = new WebRouter();
    router.on('/foo321', () => {
      expect(true).toBeTruthy();
    }, {
      leave: (done, evt) => {
        expect(evt).toBeDefined();
        expect(evt.state).toBeDefined();
        expect(evt.state.foo).toBeTruthy();
        testDone();
      }
    }).resolve('/foo321');
    expect(mockAddEventListener.mock.calls[0][0]).toBe('popstate');
    const state = { foo: true };
    mockAddEventListener.mock.calls[0][1]({ state });
    router.navigate('/bar321', state);
    delete window.addEventListener;
  });
});

describe('WebRouter after hook', () => {
  beforeAll(() => {
    delete window.location.pathname;
    window.location.pathname = '/foo1';
  });
  it('can accept array', () => {
    expect.assertions(5);
    let count = 0;
    const router = new WebRouter();
    expect(window.location.pathname).toEqual('/foo1');
    router.on('/foo1', () => {
      expect(true).toBeTruthy();
      count += 1;
      expect(count).toEqual(1);
    }, {
      after: [(done, params) => {
        expect(true).toBeTruthy();
        done();
      }, (done, params) => {
        expect(true).toBeTruthy();
        done();
      }]
    });
    router.resolve();
  });
  it('can terminate call chain when array', () => {
    expect.assertions(2);
    const router = new WebRouter();
    router.on('/foo1', () => {
      expect(true).toBeTruthy();
    }, {
      after: [(done, params) => {
        expect(true).toBeTruthy();
        done(false);
      }, (done, params) => {
        // should never fire
        expect(true).toBeTruthy();
        expect(false).toBeTruthy();
        done(true);
      }]
    });
    router.resolve();
  });
  it('can accept single function', () => {
    expect.assertions(4);
    let count = 0;
    const router = new WebRouter();
    expect(window.location.pathname).toEqual('/foo1');
    router.on('/foo1', () => {
      expect(true).toBeTruthy();
      count += 1;
      expect(count).toEqual(1);
    }, {
      after: (done, params) => {
        expect(true).toBeTruthy();
        done();
      }
    });
    router.resolve();
  });
});

describe('WebRouter before hook method', () => {
  beforeAll(() => {
    delete window.location.pathname;
    window.location.pathname = '/foo1';
  });

  it('can accept array', () => {
    let count = 0;
    expect.assertions(2);
    const router = new WebRouter();
    router.on('/foo1', () => {
      expect(count).toEqual(2);
      expect(true).toEqual(true);
    }, {
      before: [(done, params) => {
        count += 1;
        done();
      }, (done, params) => {
        count += 1;
        done();
      }]
    });
    router.resolve();
  });
  it('can accept a single function', () => {
    const router = new WebRouter();
    router.on('/foo1', () => {}, {
      before: (done, params) => {
        done();
      }
    });
  });
  it('Uses RegExp and can accept a single function', () => {
    let count = false;
    expect.assertions(2);
    const router = new WebRouter();
    router.on(/^\/foo([1-9]{1})/, () => {
      expect(count).toEqual(true);
    }, {
      before: (done, params) => {
        count = true;
        done();
      }
    });
    router.resolve();
    expect(count).toEqual(true);
  });

  it('can reject from before with false argument to done', () => {
    expect.assertions(2);
    const router = new WebRouter();
    expect(window.location.pathname).toEqual('/foo1');
    router.on('/foo1', () => {
      // shouldn't be fired
      expect(false).toEqual(true);
      expect(true).toBeTruthy();
      expect(true).toBeTruthy();
    }, {
      before: (done, params) => {
        expect(true).toBeTruthy();
        done(false);
      }
    });
    router.resolve();
  });
  it('works with after hook', () => {
    expect.assertions(4);
    const router = new WebRouter();
    router.on('/foo1', () => {
      expect(true).toBeTruthy();
    }, {
      before: (done, params) => {
        expect(true).toBeTruthy();
        expect([]).toBeTruthy();
        done();
      },
      after: (done, params) => {
        expect(true).toBeTruthy();
        done();
      }
    });
    router.resolve();
  });
  it('can cancel call chain and route', () => {
    const router = new WebRouter();
    expect.assertions(2);
    router.on('/f001', () => {
      expect(false).toBeTruthy();
    }, {
      before: [(done, params) => {
        expect(true).toBeTruthy();
        done();
      }, (done, params) => {
        expect(true).toBeTruthy();
        done(false);
      }, (done, params) => {
        expect(false).toBeTruthy();
        done(false);
      }]
    });
    router.resolve('/f001');
  });
});

describe('RegExp Route Matching', () => {
  beforeAll(() => {
    delete window.location.pathname;
    window.location.pathname = '/foo/america/plain';
  });
  it('matches basic regexp', () => {
    const router = new WebRouter();
    expect.assertions(2);
    router.on(/^\/(foo)\/([a-z]{1,})\/plain$/, (arg1, arg2) => {
      expect(arg1).toEqual('foo');
      expect(arg2).toEqual('america');
    });
    router.resolve();
  });

  it('can match multiple regexp groups', () => {
    const router = new WebRouter();
    expect.assertions(4);
    router.on(/\/foo\/(bar|car)\/(bat)\/([^/]{1,})/, (arg1, arg2, arg3) => {
      expect(true).toBeTruthy();
      expect(arg1).toEqual('bar');
      expect(arg2).toEqual('bat');
      expect(arg3).toEqual('1234456678-123456');
    });
    router.resolve('/foo/bar/bat/1234456678-123456');
  });

  it("isn't greedy", () => {
    expect.assertions(2);
    const router = new WebRouter();
    router.on(/\/foo\/(bar|car)\/(bat)\/([^/]{1,})$/, (arg1, arg2) => {
      expect(arg1).toEqual('bar');
      expect(arg2).toEqual('bat');
    });
    router.on(/^\/foo\/(bar|car)\/(bat)\/([^/]{1,})\/plain$/, (arg1, arg2, arg3) => {
      expect(true).toBeTruthy();
      expect(arg1).toEqual('bar');
      expect(arg2).toEqual('bat');
      expect(arg3).toEqual('1234456678-123456');
    });
    router.resolve('/foo/bar/bat/1234456678-123456');
  });

  it('matches regexp, variants', () => {
    const router = new WebRouter();
    expect.assertions(2);
    router.on(/\/(cat)\/normal\/([a-z]{1})\/normal\/plain/, (arg1, arg2) => {
      expect(arg1).toEqual('bat');
      expect(arg2).toEqual('c');
    });
    router.on(/^\/(bar|bat)\/normal\/([a-z]{1})\/normal\/plain$/, (arg1, arg2) => {
      expect(arg1).toEqual('bat');
      expect(arg2).toEqual('c');
    });
    router.resolve('/bat/normal/c/normal/plain');
  });
});

describe('WebRouter transforms /foo/:someValue/:anotherValue', () => {
  beforeAll(() => {
    delete window.location.pathname;
    window.location.pathname = '/foo/america/purple';
  });
  it('transforms two :arg into RegExp', () => {
    expect.assertions(5);
    const router = new WebRouter();
    expect(window.location.pathname).toEqual('/foo/america/purple');
    router.on('/foo/:someValue/:anotherValue', ({ someValue, anotherValue }) => {
      expect(someValue).toBeTruthy();
      expect(someValue).toEqual('america');
      expect(anotherValue).toBeTruthy();
      expect(anotherValue).toEqual('purple');
    });
    router.resolve();
  });
});

describe('Example code, README, declaration', () => {
  beforeAll(() => {
    delete window.location.pathname;
    window.location.pathname = '/some/url';
  });
  it('can be simply declared with routes', () => {
    expect.assertions(1);
    new WebRouter({
      '/some/url': () => {
        expect(true).toBeTruthy();
      }
    }).resolve();
  });

  it('resolves correctly .off() single route disable', () => {
    const paramValue = 'working';
    const route = new WebRouter();
    expect.assertions(1);
    route.on('/somepage/:myParam', ({ myParam }) => {
      // ... rendering
      expect(myParam).toEqual(paramValue);
    }).on('/anotherpage/:myParam', ({ myParam }) => {
      expect(myParam).toEqual(paramValue);
    });
    // disable that route
    route.off('/somepage/:myParam');
    route.resolve(`/anotherpage/${paramValue}`);
  });

  it('resolves .on() handler regexp', () => {
    expect.assertions(7);
    const route1Arg1 = 'bar';
    const route1Arg2 = 'abcDEFABCXYZ0123456789';
    const route2Arg1 = 'a9s058cjdjsjc94ns53512ncx3-shx8wncie.0djdmn,kjdjd';
    const urlUserName = 'WebRouter';
    const urlFailedUserName = 'failed';
    const router = new WebRouter();
    router.on(/myapp\/(bar|car)\/([A-Za-z0-9]{10,})/, (arg1, arg2) => {
      expect(arg1).toEqual(route1Arg1);
      expect(arg2).toEqual(route1Arg2);
    });
    router.on(/myapp\/search\/([^/]{1,})/, (searchPhrase) => {
      // Render app
      expect(searchPhrase).toEqual(route2Arg1);
    }, {
      before: (done, params) => {
        // must call done. pass `false` to terminate
        expect(_.isFunction(done)).toBeTruthy();
        done();
      }
    });
    router.on('/profile/:userName', ({ userName }) => {
      // only called when URL is /profile/WebRouter
      // based on before
      expect(userName).toEqual(urlUserName);
    }, {
      before: (done, { userName }) => {
        if (userName === 'WebRouter') {
          expect(userName).toEqual(urlUserName);
          done();
        } else {
          expect(userName).toEqual(urlFailedUserName);
          done(false);
        }
      }
    });
    router.resolve(`/myapp/${route1Arg1}/${route1Arg2}`);
    router.resolve(`/myapp/search/${route2Arg1}`);
    router.resolve(`/profile/${urlUserName}`);
    router.resolve(`/profile/${urlFailedUserName}`);
  });
});

describe('Example code, Readme, chaining', () => {
  it('can be chained', testDone => {
    expect.assertions(4);
    const urlFragment = 'anything_is_here';
    const router = new WebRouter();
    expect(router).toBeDefined();
    router.on(/^\/foo1\/([^/]{1,})$/, (arg1) => {
      // Do main rendering...
      expect(arg1).toEqual(urlFragment);
      testDone();
    }, {
      before: [(done, params) => {
        // ...
        expect(true).toBeTruthy();
        done();
      }, (done, params) => {
        // ...
        expect(true).toBeTruthy();
        done();
      }]
    }).on('/foo2', () => {
      // Do main rendering...
      expect(true).toBeTruthy();
    }, {
      after: [(done, params) => {
        // not called
        expect(true).toBeTruthy();
        done();
      }, (done, params) => {
        // not called
        expect(true).toBeTruthy();
        done();
      }]
    }).resolve('/foo1/' + urlFragment);
  });
});

describe('WebRouter transforms colon prefix into RegExp', () => {
  beforeAll(() => {
    delete window.location.pathname;
    window.location.pathname = '/foo/america/purple/plain';
  });
  it('transforms two :arg into RegExp', () => {
    expect.assertions(5);
    const router = new WebRouter();
    expect(window.location.pathname).toEqual('/foo/america/purple/plain');
    router.on('/foo/:someValue/:anotherValue/plain', ({ someValue, anotherValue }) => {
      expect(someValue).toBeTruthy();
      expect(someValue).toEqual('america');
      expect(anotherValue).toBeTruthy();
      expect(anotherValue).toEqual('purple');
    });
    router.resolve();
  });

  it('Treats argument passed to resolve like window.location.pathname', () => {
    const router = new WebRouter();
    expect.assertions(3);
    router.on('/:argumentOne/:argumentTwo/:argumentThree/plain', ({ argumentOne, argumentTwo, argumentThree }) => {
      expect(argumentOne).toEqual('one');
      expect(argumentTwo).toEqual('two');
      expect(argumentThree).toEqual('three');
    });
    router.resolve('/one/two/three/plain');
  });
});

describe('WebRouter transforms /foo/:someValue ', () => {
  beforeAll(() => {
    delete window.location.pathname;
    window.location.pathname = '/foo/america';
  });
  it('transforms one :arg into RegExp', (...args) => {
    expect.assertions(4);
    const router = new WebRouter();
    expect(args).toBeTruthy();
    expect(window.location.pathname).toEqual('/foo/america');
    router.on('/foo/:someValue', ({ someValue }) => {
      expect(someValue).toBeTruthy();
      expect(someValue).toEqual('america');
    });
    router.resolve();
  });
});

describe('Routes in Constructor', () => {
  it('Can accept a collection of routes', () => {
    expect.assertions(1);
    const router = new WebRouter({
      '/foo1': () => {
        expect(true).toBeTruthy();
      },
      '/foo2': () => {
        expect(true).toBeTruthy();
      }
    });
    router.resolve('/foo1');
  });
});

describe('Bad inputs', () => {
  it('bad constructors', () => {
    expect.assertions(2);
    const router = new WebRouter(() => {
      return null;
    });
    expect(router).toBeDefined();
    expect(_.isObject(router.all)).toBeTruthy();
    router.resolve();
  });

  it('handles bad .on()', () => {
    const router = new WebRouter();
    try {
      router.on();
    } catch (err) {
      expect(false).toBeTruthy();
    }
  });
});

describe('WebRouter updatePageLinks', () => {
  beforeAll(() => {
    WebRouter.autoListen = false;
    // WebRouter.debug = true;
  });
  it('can bind to DOM', () => {
    const el = document.createElement('a');
    el.setAttribute('href', '/foo123');
    el.setAttribute('data-navigo', 'true');
    document.body.appendChild(el);
    expect.assertions(2);
    const router = new WebRouter();
    router.on('/foo12', () => {
      expect(true).toBeTruthy();
      router.updatePageLinks(() => {
        expect(true).toBeTruthy();
      });
      const event = document.createEvent('CustomEvent');
      event.initEvent('click', true, true);
      const el = document.querySelector('a');
      el.dispatchEvent(event);
    });
    router.resolve('/foo12');
  });
});
