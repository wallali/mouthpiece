mouthpiece
==========
A conversation process flow for intelligent agents.

[![Build Status](https://travis-ci.org/wallali/mouthpiece.svg?branch=master)](https://travis-ci.org/wallali/mouthpiece)


Setup
-----
[![NPM](https://nodei.co/npm/mouthpiece.png)](https://npmjs.org/package/mouthpiece)

Install via npm:
```sh
npm install mouthpiece --save
```


Usage
-----
Import and initialize the conversation with a config:

```javascript
var config = {
  prepare: [doPrepare],
  converser: converser,
  actions: {
    anAction: anAction,
  }
};

var converse = require('mouthpiece/converse')(config);

converse('users utterance', context, function(err, result){
  if(err) {
    // handle it
  }
});
```

The config is used to setup the process flow as follows:

* `config.prepare` - An Array of operations to run before calling the converser, optional. 
* `config.converser` - The converser function that handles the agents dialog.
* `config.actions` - An action map used to carry out actions in the converser output, optional.

Prepare operation signature:

```javascript
function doPrepare(utterance, context, cb) {
  console.log('Carring out preparatory processing');
  process.nextTick(() =>
    cb(null, utterance, context); 
  );
}
```

Action operation signature:

```javascript
function anAction(verb, conversation_result, cb) {
  console.log('Carrying out action ' + verb);
  process.nextTick(() =>
    cb(null, conversation_result);
  );
}
```

Converser operation signature:

```javascript
function converser(utterance, context, cb){
  console.log('Carrying out conversation');
  var converser_result = { context: context };
  process.nextTick(() =>
    cb(null, converser_result);
  );
}
```

The converser on sucessful completion must return a result object with the `context` property set to the updated context.

```javascript
var converser_result = {
  context: {
    do: 'anAction, anotherAction',
    replay: false
  }
};
```

The returned context can have two special properties that direct what happens next:
* `do` - This can be array of strings or a comma separated string. Each string is a key into `config.actions`. Actions corresponding to each key are then executed in order with this conversation result passed in.
* `replay` - This is a boolean which, if set to `true`, will cause the conversation flow to be re-entered running it a second time in its entiriety, but with the new context taken from this conversation result. If `converse_result.input` is set it will be used as the utterance for the replay round, otherwise the last user utterance is used.


Running tests
-------------
### Step 1: Get the Code

```
git clone https://github.com/wallali/mouthpiece.git
```

### Step 2: Running Tests

```
npm test
```


Debugging
---------

`mouthpiece` uses the [debug module](https://github.com/visionmedia/debug) to output debug messages to the console. To output all debug messages, run your node app with the `DEBUG` environment variable:
```
DEBUG=mouthpiece:* node your-app.js
```
This will output debugging messages from `mouthpiece`.


License
-------

[Apache 2.0](https://github.com/wallali/mouthpiece/blob/master/LICENSE)
