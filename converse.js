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

var _ = require('lodash');
const async = require('async');
const events = require('events');
const debug = require('debug')('mouthpiece:converse');
const noop = function () {};

exports = module.exports = create;

//-

function skipAction(verb, conversation_result, cb) {
  debug('No action was mapped to ' + verb + ' in the config.');
  process.nextTick(function () {
    cb(null, conversation_result);
  });
}

/** 
 * Creates the conversation flow.
 * @param {Object} config Configuration for the flow.
 * @param {Array} [config.prior] Operations to run before calling the converser. 
 * @param {Function} config.converser The converser that handles the dialog.
 * @param {Object} [config.actions] The action map used to process the converser action output.
 * @return {Function}
 */
function create(config) {
  var prior = config.prepare || [];
  var converser = config.converser;
  var actions = config.actions || {};

  converse.events = new events.EventEmitter();

  return converse;

  //--

  function converse(utterance, context, cb) {
    if (typeof (context) === 'function') {
      cb = context;
      context = {};
    }

    if (!cb) cb = noop;

    context = context || {};

    prior.unshift(async.constant(utterance, context));

    async.waterfall(prior, function (err, utterance, context) {
      if (err) return cb(err);

      debug('Completed all prior operations. Starting converse...');
      startConverse(utterance, context);
    });

    //--

    function startConverse(utterance, context) {
      converser(utterance, context, function (err, converse_result) {
        if (err) {
          converse.events.emit('message', utterance, context);
          return cb(err);
        }

        if (converser.transformResult && typeof (converser.transformResult) === 'function') {
          converse_result = converser.transformResult(converse_result);
        }

        converse.events.emit('message', utterance, context, converse_result);

        if (!converse_result.context) {
          return cb(new Error('Converser must return an updated context back in the result.'));
        }

        converse_result.utterance = converse_result.utterance || utterance;

        postConverse(converse_result);
      });
    }

    function postConverse(converse_result) {
      let action_verbs = converse_result.context.do || [];
      let replay = converse_result.context.replay || false;
      let loop = converse_result.context.loop || false;

      converse_result.context.do = null;
      converse_result.context.replay = null;
      converse_result.context.loop = null;

      if (_.isString(action_verbs)) {
        action_verbs = _.split(action_verbs, /\s*,\s*/);
      }

      debug('Got post-converse actions', action_verbs);

      var prev_verb_result = converse_result;

      async.eachSeries(action_verbs, doVerb, function (err) {
        if (err) return cb(err);

        debug('Done post-converse.');

        if (replay) {
          debug('Replaying...');
          return converse(prev_verb_result.utterance, prev_verb_result.context, cb);
        }

        if (loop) {
          debug('Looping...');
          return startConverse(prev_verb_result.utterance, prev_verb_result.context);
        }

        converse.events.emit('response', prev_verb_result);
        cb(null, prev_verb_result);
      });

      //--

      function doVerb(verb, verb_cb) {
        let op = actions[verb] || skipAction;
        op(verb, prev_verb_result, function (op_err, op_result) {
          if (op_err) return verb_cb(op_err);

          prev_verb_result = op_result;

          verb_cb(null);
        });
      }
    }
  }
}
