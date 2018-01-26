'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hostedFieldSdk = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _actions = require('../actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HostedFieldSdk = function () {
    function HostedFieldSdk() {
        (0, _classCallCheck3.default)(this, HostedFieldSdk);

        this.window = document.parentWindow || document.defaultView;
        this.targets = [];
        this.responses = [];
    }

    (0, _createClass3.default)(HostedFieldSdk, [{
        key: 'setup',
        value: function setup(config) {
            this.merchantId = config.merchantId;
            this.hostedfieldsurl = config.hostedfieldsurl;
            this.fields = config.fields;
            this.service = config.service;
            this.styles = config.styles;
            this.callback = config.callback;
            this.el = config.el;

            this.initIframes();
        }
    }, {
        key: 'get',
        value: function get() {
            var _this = this;

            this.targets.forEach(function (target) {
                target.target.postMessage({ action: _actions.actions.get, merchantId: _this.merchantId, id: target.id }, '*');
            });
        }
    }, {
        key: 'initIframes',
        value: function initIframes() {
            var _this2 = this;

            this.targets = this.targets.concat(this.fields.map(function (field) {
                return _this2.initIframe(field);
            }));
        }
    }, {
        key: 'eventHandler',
        value: function eventHandler($event) {
            var data = $event.data;
            var action = data.action,
                id = data.id,
                formData = data.formData;

            switch (action) {
                case _actions.actions.formData:
                    this.responses.push({ id: id, data: formData });
                    this.sendCallback();
                    break;
                case _actions.actions.formSubmit:
                    this.pay();
                    break;
            }
        }
    }, {
        key: 'sendCallback',
        value: function sendCallback() {
            var responseIds = this.responses.map(function (response) {
                return response.id;
            });
            var targetIds = this.targets.map(function (target) {
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
                var data = this.responses.reduce(function (formData, response) {
                    formData = (0, _extends3.default)({}, formData, response.data);
                    return formData;
                }, {});
                // Reset the responses.
                responses = [];
                this.callback()(data);
            }
        }
    }, {
        key: 'initIframe',
        value: function initIframe(field) {
            var iframe = document.createElement('iframe');
            iframe.id = 'iframe-hosted-field-' + field.id;
            iframe.name = 'iframe-hosted-field-' + field.id;

            // This is hostedfieldsurl
            iframe.src = hostedfieldsurl + '?mid=' + merchantId;
            var container = document.querySelector(el);

            var iframeContainerEl = document.createElement('div');
            iframeContainerEl.id = 'hosted-field-' + field.id;
            iframeContainerEl.className = 'hosted-field';
            iframeContainerEl.appendChild(iframe);

            container.appendChild(iframeContainerEl);

            // Get the target window...
            var target = document.querySelector('#' + iframe.id).contentWindow;
            // Attach onload event listener to iframe so we can send the 
            // setupContent event when iframe is fully loaded.
            iframe.onload = this.createIframeProxy.bind(this, field, target);
            return {
                id: iframe.id, target: target
            };
        }
    }, {
        key: 'createIframeProxy',
        value: function createIframeProxy(field, target) {
            var fields = {};
            fields[field.name] = field;
            this.window.addEventListener("message", eventHandler, false);
            target.postMessage({
                action: _actions.actions.setupContent,
                styles: styles,
                fields: fields,
                service: this.service
            }, '*');
        }
    }]);
    return HostedFieldSdk;
}();

var hostedFieldSdk = exports.hostedFieldSdk = new HostedFieldSdk();