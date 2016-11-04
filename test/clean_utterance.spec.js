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
const clean_utterance = require('../prepare/clean_utterance');

describe('clean utterance', function() {

  it('removes whitespace chars', function(done) {
    var text = '   this \n is	\t	some        \n\r     \r text';

    clean_utterance(text, {}, function(err, clean_text, ctx) {
      assert(ctx);
      assert.strictEqual(clean_text, 'this is some text');
      done();
    });
  });

  it('removes "funny" chars', function(done) {
    var text = 'this]> { ^is }some~   text   ';

    clean_utterance(text, {}, function(err, clean_text) {
      assert.strictEqual(clean_text, 'this is some text');
      done();
    });
  });

  it('removes html', function(done) {
    var text = 'this <div class="w3-code notranslate">is some<div> text';

    clean_utterance(text, {}, function(err, clean_text) {
      assert.strictEqual(clean_text, 'this is some text');
      done();
    });
  });
});