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
const context_reset = require('../actions/context_reset');

describe('context reset', function() {
  var actionReset = context_reset();
  var conversation_result = {};

  beforeEach(function() {
    conversation_result = {
      context: {
        intents: [],
        username: 'a name',
        last_sentiment: 'happy',
        do: 'checkWeather'
      }
    };

    actionReset = context_reset();
  });

  it('keeps nothing by default', function(done) {
    actionReset('', conversation_result, function(err, result) {
      assert(!err);
      assert(result.context);
      assert.deepStrictEqual(result.context, {});

      done();
    });
  });

  it('keeps specified items', function(done) {
    actionReset = context_reset(['username', 'last_sentiment']);
    actionReset('', conversation_result, function(err, result) {
      assert(!err);
      assert(result.context);
      assert.deepStrictEqual(result.context, {
        username: 'a name',
        last_sentiment: 'happy'
      });

      done();
    });
  });

  it('keeps specified items, string init', function(done) {
    actionReset = context_reset('username');
    actionReset('', conversation_result, function(err, result) {
      assert(!err);
      assert(result.context);
      assert.deepStrictEqual(result.context, {
        username: 'a name'
      });

      done();
    });
  });

  it('keeps specified items, csv init', function(done) {
    actionReset = context_reset('username, last_sentiment');
    actionReset('', conversation_result, function(err, result) {
      assert(!err);
      assert(result.context);
      assert.deepStrictEqual(result.context, {
        username: 'a name',
        last_sentiment: 'happy'
      });

      done();
    });
  });
});