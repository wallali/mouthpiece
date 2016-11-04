/**
 * Copyright (c) 2016 Ali Lokhandwala <ali@huestones.co.uk>. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const assert = require('assert');
const sinon = require('sinon');
const conversation_builder = require('../converse');

describe('converse', function() {

  var initial_context = {};
  var utterance = '';

  var prior1 = sinon.stub();
  var prior2 = sinon.stub();

  var converse_result = {
    context: {}
  };

  var converser = sinon.stub();
  var action1 = sinon.stub();
  var action2 = sinon.stub();

  var config = {
    prepare: [],
    converser: converser,
    actions: {}
  };

  var converse;

  beforeEach(function() {
    initial_context = {};
    utterance = 'user says';
    converse_result = {
      context: {
        do: ['act1', 'act2'],
        replay: false
      }
    };

    prior1.callsArgWith(2, null, utterance, initial_context);
    prior2.callsArgWith(2, null, utterance, initial_context);

    action1.callsArgWith(2, null, converse_result);
    action2.callsArgWith(2, null, converse_result);

    converser.callsArgWith(2, null, converse_result);

    config = {
      prepare: [prior1, prior2],
      converser: converser,
      actions: {
        act1: action1,
        act2: action2
      }
    };

    converse = conversation_builder(config);
  });

  afterEach(function() {
    converser.reset();
    action1.reset();
    action2.reset();
    prior1.reset();
    prior2.reset();
  });

  it('defines event emitter', function() {
    assert(converse.events);
  });

  it('Completes flow with calls in correct order', function(done) {
    converse = conversation_builder(config);
    converse('say something', {}, function(err, result) {
      assert(prior1.calledOnce);
      assert(prior2.calledOnce);
      assert(converser.calledOnce);
      assert(action1.calledOnce);
      assert(action2.calledOnce);

      assert(!err);
      assert(result);

      assert(prior2.calledAfter(prior1));
      assert(converser.calledAfter(prior2));
      assert(action1.calledAfter(converser));

      assert(prior1.alwaysCalledWith('say something', {}));
      assert(prior2.alwaysCalledWith('user says', {}));

      assert(converser.alwaysCalledWith('user says'));

      assert(action1.alwaysCalledWith('act1', converse_result));
      assert(action2.alwaysCalledWith('act2', converse_result));

      assert(!converse_result.context.do);
      assert(!converse_result.context.replay);

      done();

    });
  });

  it('Completes replay flow with calls in correct order', function(done) {
    converse = conversation_builder(config);
    converse_result.context.replay = true;
    converse('say something', {}, function(err, result) {
      assert(prior1.calledTwice);
      assert(prior2.calledTwice);
      assert(converser.calledTwice);
      assert(action1.calledOnce);
      assert(action2.calledOnce);

      assert(!err);
      assert(result);

      assert(prior2.calledAfter(prior1));
      assert(converser.calledAfter(prior2));

      assert(prior1.alwaysCalledWith('say something', {}));
      assert(prior2.alwaysCalledWith('user says', {}));

      assert(converser.alwaysCalledWith('user says', {}));

      assert(action1.alwaysCalledWith('act1', converse_result));
      assert(action2.alwaysCalledWith('act2', converse_result));

      assert(!converse_result.context.do);
      assert(!converse_result.context.replay);

      done();

    });
  });

  it('Completes flow without priors', function(done) {
    config.prepare = null;
    converse = conversation_builder(config);

    converse('say something', function(err, result) {
      assert(!prior1.called);
      assert(!prior2.called);
      assert(converser.calledOnce);
      assert(action1.calledOnce);
      assert(action2.calledOnce);

      assert(!err);
      assert(result);

      done();
    });
  });

  it('Completes flow without actions', function(done) {
    converse_result.context.do = null;
    converse = conversation_builder(config);

    converse('say something', function(err, result) {
      assert(prior1.called);
      assert(prior2.called);
      assert(converser.calledOnce);

      assert(!err);
      assert(result);

      done();
    });
  });

  it('Passes context from prior 1 to prior 2 and so on', function(done) {

    prior1.callsArgWith(2, null, utterance, {
      prior1: true
    });
    prior2.callsArgWith(2, null, utterance, {
      prior2: true
    });

    converse_result.context.do = null;
    converse = conversation_builder(config);

    converse('say something', function(err, result) {
      assert(prior1.called);
      assert(prior2.called);
      assert(converser.calledOnce);
      assert(!action1.calledOnce);
      assert(!action2.calledOnce);

      assert(!err);
      assert(result);

      assert(prior1.alwaysCalledWith('say something', {}));
      assert(prior2.alwaysCalledWith('user says', {
        prior1: true
      }));
      assert(converser.alwaysCalledWith('user says', {
        prior2: true
      }));

      done();
    });
  });

  it('Passes result from action 1 to action 2 and so on', function(done) {
    config.prepare = null;
    converse = conversation_builder(config);

    action1.callsArgWith(2, null, {
      action1: true
    });
    action2.callsArgWith(2, null, {
      action2: true
    });

    converse('say something', function(err, result) {
      assert(converser.calledOnce);
      assert(action1.calledOnce);
      assert(action2.calledOnce);

      assert(!err);
      assert(result);

      assert(action1.alwaysCalledWith('act1', converse_result));
      assert(action2.alwaysCalledWith('act2', {
        action1: true
      }));

      assert.deepStrictEqual(result, {
        action2: true
      });

      done();
    });
  });

  it('Ignores unknown actions', function(done) {
    converse_result.context.do = ['act1', 'someact', '', 'act2'];
    converse = conversation_builder(config);

    converse('say something', function(err, result) {
      assert(prior1.called);
      assert(prior2.called);
      assert(converser.calledOnce);
      assert(action1.calledOnce);
      assert(action2.calledOnce);

      assert(!err);
      assert(result);

      done();
    });
  });

  it('Respects prior order', function(done) {
    config.actions = null;
    config.prepare = [prior2, prior1];
    converse = conversation_builder(config);

    converse('say something', function(err, result) {
      assert(prior1.called);
      assert(prior2.called);
      assert(converser.calledOnce);
      assert(!action1.calledOnce);
      assert(!action2.calledOnce);

      assert(prior1.calledAfter(prior2));
      assert(!err);
      assert(result);

      done();
    });
  });

  it('Respects action order', function(done) {
    config.prepare = null;
    converse_result.context.do = ['act2', 'act1'];

    converse = conversation_builder(config);

    converse('say something', function(err, result) {
      assert(!prior1.called);
      assert(!prior2.called);
      assert(converser.calledOnce);
      assert(action1.calledOnce);
      assert(action2.calledOnce);

      assert(!err);
      assert(result);

      assert(action1.calledAfter(action2));

      done();
    });
  });

  it('Allows action as comma seperated string', function(done) {
    config.prepare = null;
    converse_result.context.do = 'act2 ,  act1';

    converse = conversation_builder(config);

    converse('say something', function(err, result) {
      assert(converser.calledOnce);
      assert(action1.calledOnce);
      assert(action2.calledOnce);

      assert(!err);
      assert(result);

      assert(action1.calledAfter(action2));

      assert(!converse_result.context.do);

      done();
    });
  });

  it('Error in prior stops flow', function(done) {

    prior1.callsArgWith(2, 'error');
    converse = conversation_builder(config);

    converse('say something', function(err, result) {
      assert(prior1.calledOnce);
      assert(!prior2.called);
      assert(!converser.called);
      assert(!action1.called);
      assert(!action2.called);

      assert(err);
      assert(!result);

      assert.strictEqual(err, 'error');

      done();
    });
  });

  it('Error in action stops flow', function(done) {

    action1.callsArgWith(2, 'error');
    converse = conversation_builder(config);

    converse('say something', function(err, result) {
      assert(prior1.calledOnce);
      assert(prior2.calledOnce);
      assert(converser.calledOnce);
      assert(action1.calledOnce);
      assert(!action2.called);

      assert(err);
      assert(!result);

      assert.strictEqual(err, 'error');

      assert(!converse_result.context.do);
      assert(!converse_result.context.replay);

      done();
    });
  });

  it('Error in converser stops flow', function(done) {

    converser.callsArgWith(2, 'error');
    converse = conversation_builder(config);

    converse('say something', function(err, result) {
      assert(prior1.calledOnce);
      assert(prior2.calledOnce);
      assert(converser.calledOnce);
      assert(!action1.called);
      assert(!action2.called);

      assert(err);
      assert(!result);

      assert.strictEqual(err, 'error');

      done();
    });
  });

  it('Missing context in converser result stops flow', function(done) {

    converser.callsArgWith(2, null, {});
    converse = conversation_builder(config);

    converse('say something', function(err, result) {
      assert(prior1.calledOnce);
      assert(prior2.calledOnce);
      assert(converser.calledOnce);
      assert(!action1.called);
      assert(!action2.called);

      assert(err);
      assert(!result);

      assert.strictEqual(err.message, 'Converser must return an updated context back in the result.');

      done();
    });
  });

});