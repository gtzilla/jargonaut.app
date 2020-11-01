

# WebRouter.js

A modern vanilla JavaScript web router, inspired by Navigo API. Testing with Jest & JSDOM and bundled with microbundle.

Some of the improvements from the inspirational project: `before`, `after` and `leave` hook accept either a function or an array of functions. Previous methods can cancel the call chain for later methods see [hooks](#hooks) section for details.

Additionally, improved `RegExp` matching, direct access to all routes, statically via `WebRouter.routes`, modern JavaScript codebase without the need for Babel and more.

Does not support hash routing. Consider [Navigo](https://github.com/krasimir/navigo) if you need to support old browsers.


# Usage


## `.on()` Route Handlers

This method be called multiple times, see chaining section below. It accepts a route name, parameterized URL string or `RegExp` to match against. The second argument is the main render method and an optional third argument of `hooks`. See the [hooks](#hooks) section for more information

```javascript
const router = new WebRouter();
router.on('/somepage/:myParam', ({myParam})=>{
  console.log('Page loaded', myParam);
}).resolve();

```

### `.on()` RegExp Handlers or Parameterized URL Strings

```javascript
const router = new WebRouter();
router.on(/myapp\/(bar|car)\/([A-Za-z0-9]{10,})/, (arg1, arg2)=>{
  console.log('Page loaded', arg1, arg2);
})
router.on(/myapp\/search\/([^/]{1,})/, (searchPhrase)=>{
  // Render app
}, {
  before:(done, params)=>{
    // must call done. pass `false` to terminate
    done();
  }
});
router.on('/profile/:userName', ({userName})=>{
  // only called when URL is /profile/WebRouter
  // based on before
}, {
  before:(done, {userName})=>{
    if(userName === 'WebRouter') {
      done();
    } else {
      done(false);
    }
    
  }
});
router.resolve();

```

#### Accessing GET Parameters

Can be done easily with `window.location.search`, it is advisable to use the `const params = new URLSearchParams(window.location.search)` and `params.get('getParamName')`

## `.off()` Route Handlers

Omitting all arguments will delete all routes from the router. To remove individual routes, pass in the matching path that was passed as the first argument to `.on()`

```javascript
const route = new WebRouter();
route.on('/somepage/:myParam', ()=>{
  // ... rendering
});
// disable that route
route.off('/somepage/:myParam');
```

## `.navigate( url, [data] )` Method

You can initiate a navigation from JavaScript by using the `router.navigate` method. The `navigate` method can accept an optional second parameter, which will be passed to `pushState` and available via `event.state`. 

## `.resolve( path )` Method

`WebRouter` isn't started until `router.resolve()` is called. As a default argument, when no arguments are passed, `.resolve` uses `window.location.pathname`. However, you can manually intercede by passing the URL of the route you would prefer to resolve.

## `.updatePageLinks()` Method

Identical to navigo, `WebRouter` supports integration with existing links using the `router.updatePageLinks()` method call. Add the attribute `data-navigo` or `data-route` to enable a link integration with the `WebRouter`. `WebRouter` will use the `href` attribute and call `navigate` on the users behalf when they click the link.

```html
<!DOCTYPE html>
<html>
<head>
  <title></title>
</head>
<body>
  <div>
    <a href="/some/url" data-route>Regular Link</a>
  </div>
</body>
</html>
```

```javascript
new WebRouter({
'/some/url':()=>{ /* ... */ } 
}).resolve();
```

## `WebRouter.reset()` Method

Similar to passing no arguments to an instance `.off()` method, calling `WebRouter.reset()` will reset the application and all stored routes.

### Hooks

Hooks allow access to routes `before`, `after` and when the user navigates away via `leave`. They can accept a single function, as declared below or an array of functions

With hooks, passing an explicit `false` or falsy value as the first argument will terminate the call chain. Like `before`, the `after` and `leave` hooks receive `done` callback. Additionally, passing an explicit `false` to the `after` and `leave` hooks will cause the hooks to terminate, but have no effect on the primary route method.

```javascript
route.on('/', ()=>{}, {
  before:(done, params)=>{
    // before anything, call done();
  },
  after:(done, params)=>{
    // immediately after render
  },
  leave:(done, params)=>{
    // on user navigate away
  }
});

```

#### Hooks, array of functions

```javascript
route.on('/', ()=>{}, {
  before:[(done, params)=>{
    // allow
    done();
  }, (done, params)=>{
    // can reject
    done(false)
  }],
  after:[(done, params)=>{
    done(false);
  }, (done, params)=>{
    // terminated by done(false) in first method
    done();
  }],
  leave:[(done, params)=>{
    // can terminate chain by done(false) 
    done();
  }]
});
```

Hooks can be used together or as needed. For instance, if you wanted to call 5 methods before a route is invoked, but do not need to use `after` or leave, that's possible. For instanc presume we want to see if a user has a token, get the credentials is a user has said token that's simple

```javascript
router.on('/user', ()=>{
  const div = document.createElement('div')
  div.innerText = localStorage.getItem('user')
  document.body.appendChild(div);
}, {
  before:[(done, params)=>{
    const token = localStorage.getItem('token');
    if(!token) done(false);
    done();
  }, (done, params)=>{
    /**
      Assumes API response is
      {user:'your name'}
    */
    fetch('/v3/user')
      .then(data=>data.json())
      .then(data=>{
        localStorage.setItem('user', user.name);
        done();
      }).catch(err=>{
        done(false);
      })
  }];
})
```

##### Hook Detail: `after` called unless route changes

Please note, while this will not apply to most users, it's worth nothing that the `after` hooks will be called for a route unless the route explicitly changes even if you cancel in the `before` method.


### Chaining .on(), .on() and .resolve()

`WebRouter` supports call chaining for easier declarative routes

```javascript
const router = new WebRouter();
router.on(/^\/foo1\/([^/]{1,})$/, (arg1)=>{
  // Do main rendering...
}, {
  before:[(done,params)=>{
    // ...
    done();
  },(done, params)=>{
    // ...
    done();
  }]
}).on('/foo2', ()=>{
  // Do main rendering...
}, {
  after:[(done,params)=>{
    // ...
    done();
  },(done, params)=>{
    // ...
    done();
  }]
}).resolve();
```


### Convenience, Simple Declarations

If you don't need any `RegExp` support in your route or hooks, you can use the first argument of the `WebRouter` constructor to declare routes.

```javascript
const router = new WebRouter({
  '/foo1':()=>{
    /* ... */
  },
  '/foo2/field2':()=>{
    /* ... */
  }
});
```



##### Developing for WebRouter Project

Configuration For Testing: It is advised to use at least node version 14.5.0

```
nvm install 14.5.0
```

