'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FieldTypes = exports.Field = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Class that describes the field
 */
var Field =
/**
 * @argument type The type of field. ex: TEXT, NUMBER (@see FieldTypes)
 * @argument id The html id of the field.
 * @argument name The name of the id and the name of the returned property when retriving the hosted field data.
 * @argument label The text label of the field
 * @argument helpKey Text to be displayed as placeholder of field
 * @argument errorKey Message to show if field has errors
 * @argument visible If the field should be visible (default true)
 * @argument required If the field is required or not (default true)
 */
exports.Field = function Field(type, id, name, label) {
  var helpKey = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
  var errorKey = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';
  var visible = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;
  var required = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : true;
  (0, _classCallCheck3.default)(this, Field);

  this.type = type;
  this.id = id;
  this.name = name;
  this.label = label;
  this.helpKey = helpKey;
  this.error = errorKey;
  this.visible = visible;
  this.required = required;
};

/**
 * The different field types..
 */


var FieldTypes = exports.FieldTypes = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  CVV: 'CVV',
  CREDITCARD_NUMBER: 'CREDITCARD_NUMBER',
  EXPIRY_MM_YYYY: 'EXPIRY_MM_YYYY'
};