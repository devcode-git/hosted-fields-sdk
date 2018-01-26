'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.actions = undefined;

var _freeze = require('babel-runtime/core-js/object/freeze');

var _freeze2 = _interopRequireDefault(_freeze);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var actions = exports.actions = {
    // Event is emitted when input is done.
    get: 'get',
    // Event is emitted when the iframe is created and the content will be rendered.
    setupContent: 'setupContent',
    // Received when with the hosted field data.
    formData: 'formData',
    // Recvied when enter was pressed in the hosted fields to submit the form.
    formSubmit: 'formSubmit'
};
(0, _freeze2.default)(actions);