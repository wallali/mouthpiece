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

const striptags = require('striptags');

module.exports = clean;

//--

function clean(utterance, context, cb) {
  utterance = utterance.replace(/[\n\r\t]/g, ' ');
  utterance = striptags(utterance).substring(0, 255);
  utterance = utterance.replace(/[{}<>~\[\]\^]/g, ' ');

  let clean_text = utterance;
  do {
    utterance = clean_text;
    clean_text = utterance.replace(/ {2}/g, ' ');
  } while (clean_text != utterance);

  clean_text = clean_text.trim();
  
  process.nextTick(() =>
    cb(null, clean_text, context));
}