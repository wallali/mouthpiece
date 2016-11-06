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
* `config.converser` - The main converser function that handles the agents dialog.
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

Converser result
----------------

The converser on sucessful completion must return a result object with the `context` property set to the updated context. 

This is the format of the result expected by the onward flow:

```javascript
var converser_result = {
  context: {
    do: 'anAction, anotherAction',
    replay: false,
    loop: false
  }
};
```

The returned context can also have two special properties that direct what happens next:
* `do` - This can be array of strings or a comma separated string. Each string is a key into `config.actions`. Actions corresponding to each key are then executed in order with this conversation result passed in.
* `loop` - This boolean if set to `true` will cause the converser service to be called again running the flow a second time but with the new context taken from this conversation result. 
* `replay` - This boolean if set to `true` will cause the conversation flow to be re-entered running it a second time in its entiriety including any prepare operations, but with the new context taken from this conversation result. 

If `converser_result.utterance` is set it will be used as the utterance during loop and replay, otherwise the last user utterance is used. If `converser_result.utterance` is not set, it is set to the last user utterance before calling any actions.


### Dealing with different converser result formats

If the converser service you are using does not return a result in the expected format described above, the onward flow will break and cause errors. There are two ways to address this.

#### Use a wrapper function
You can wrap the non-conforming converser in a function that will take the immediate output of the converser and transform it to the form described above:

```javascript
function converser_wrapper(utterance, context, cb){
  console.log('Carrying out conversation');
  converser(utterance, context, function(err, result){
    if(err) return cb(err);
    
    // If result is not in the expected format this is your opportunity to correct it.
    var formatted_result = result; 
    
    cb(null, formatted_result);
  });
}

config.converser = converser_wrapper;
```
This approach is suitable when the format of the result is very different from the expected one and/or an asynchronous operation is needed to transform the result into the expected format.

#### Provide `converser.transformResult()`
You can provide a `transformResult()` operation on your converser, which will be called before passing its result onward into the flow. Your `transformResult()` will have the opportunity to transform the result into the format expected by the onward flow.

```javascript
converser.transformResult = function(result){
  // If result is not in the expected format this is your opportunity to correct it.
  var formatted_result = result; 
  return formatted_result;
}

config.converser = converser;
```
This approach is light-weight and works well when the result only needs minor tweaks to transform to the expected format and this can be done synchronously.


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
