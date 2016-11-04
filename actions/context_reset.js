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

const _ = require('lodash');
const debug = require('debug')('mouthpiece:actions:context_reset');

module.exports = create;

//--

function create(keep) {

  var keepers = keep || [];

  if (_.isString(keepers)) {
    keepers = _.split(keep, /\s*,\s*/);
  }

  return actionReset;

  //--

  function actionReset(verb, conversation_result, cb) {
    conversation_result.context = _.pick(conversation_result.context, keepers);
    debug('Context reset');
    process.nextTick(() =>
      cb(null, conversation_result)
    );
  }
}