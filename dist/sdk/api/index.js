'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HostedFields = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The payment iq mid
var merchantId;
// List of fields to host
var fields;
// Url to the hosted fields
var hostedfieldsurl;
// Service
var service;
// External styles for hosted fields.
var styles;
// The hosted fields.
var targets = [];
// Responses gotten from the hosted fields.
var responses = [];
// Element to render the hosted fields on.
var el;
// Method to call when all responses from hosted fields
// has been collected.
var callback;
// This window.
var window = document.parentWindow || document.defaultView;

function setup(config) {
    merchantId = config.merchantId;
    hostedfieldsurl = config.hostedfieldsurl;
    fields = config.fields;
    service = config.service;
    styles = config.styles;
    callback = config.callback;
    el = config.el;

    initIframes();
}

function get() {
    targets.forEach(function (target) {
        target.target.postMessage({ action: _actions.actions.get, merchantId: merchantId, id: target.id }, '*');
    });
}

function reset() {
    targets = [];
}

function destroyContent() {
    merchantId = null;
    fields = null;
    hostedfieldsurl = null;
    service = null;
    styles = null;
    targets = [];
    responses = [];
    el = null;
    callback = null;
}

function initIframes() {
    targets = targets.concat(fields.map(function (field) {
        return initIframe(field);
    }));
}

function eventHandler($event) {

    switch ($event.data.action) {
        case _actions.actions.formData:
            responses.push({ id: $event.data.id, data: $event.data.formData });
            sendCallback();
            break;
        case _actions.actions.formSubmit:
            get();
            break;
    }
}

function sendCallback() {
    var responseIds = responses.map(function (response) {
        return response.id;
    });
    var targetIds = targets.map(function (target) {
        return target.id;
    });
    if (responseIds.length !== targetIds.length) return;
    var includesAllIds = true;
    targetIds.forEach(function (targetId) {
        includesAllIds = responseIds.includes(targetId);
    });

    // Check that we have gotten responses from all hosted fields.
    // Before sending the callback.
    if (includesAllIds) {
        var data = responses.reduce(function (formData, response) {
            formData = (0, _extends3.default)({}, formData, response.data);
            return formData;
        }, {});
        // Reset the responses.
        responses = [];
        callback()(data);
    }
}

function initIframe(field) {
    var iframe = document.createElement('iframe');
    iframe.id = 'hosted-field-' + field.id;
    iframe.name = 'hosted-field-' + field.id;
    iframe.tabIndex = '-1';

    // This is hostedfieldsurl
    iframe.src = hostedfieldsurl + '?mid=' + merchantId;
    var container = document.querySelector(el);

    var iframeContainerEl = document.createElement('div');
    iframeContainerEl.id = 'hosted-field-container-' + field.id;
    iframeContainerEl.className = 'hosted-field-container';
    iframeContainerEl.appendChild(iframe);

    container.appendChild(iframeContainerEl);

    // Get the target window...
    var target = document.querySelector('#' + iframe.id).contentWindow;
    // Attach onload event listener to iframe so we can send the
    // setupContent event when iframe is fully loaded.
    iframe.onload = createIframeProxy.bind(this, field, target);
    return {
        id: iframe.id, target: target
    };
}

function createIframeProxy(field, target) {
    var fields = {};
    fields[field.name] = field;
    window.addEventListener("message", eventHandler, false);
    target.postMessage({
        action: _actions.actions.setupContent,
        styles: styles,
        fields: fields,
        service: service
    }, '*');
}

var HostedFields = exports.HostedFields = {
    // Setup hosted fields
    setup: setup,
    // Get the data from the hosted fields.
    get: get,
    // reset the current targets
    reset: reset
};