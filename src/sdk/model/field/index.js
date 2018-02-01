/**
 * Class that describes the field
 */
export class Field {
  /**
   * @argument type The type of field. ex: TEXT, NUMBER (@see FieldTypeS)
   * @argument id The html id of the field.
   * @argument name The name of the id and the name of the returned property when retriving the hosted field data.
   * @argument label The text label of the field
   * @argument helpKey Text to be displayed as placeholder of field
   * @argument errorKey Message to show if field has errors
   * @argument visible If the field should be visible (default true)
   * @argument required If the field is required or not (default true)
   */
  constructor (type, id, name, label, helpKey = '', errorKey = '', visible = true, required = true) {
    this.type = type
    this.id = id
    this.name = name
    this.label = label
    this.helpKey = helpKey
    this.error = errorKey
    this.visible = visible
    this.required = required
  }
}

/**
 * The different field types..
 */
export const FieldTypes = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  CVV: 'CVV',
  CREDITCARD_NUMBER: 'CREDITCARD_NUMBER',
  EXPIRY_MM_YYYY: 'EXPIRY_MM_YYYY'
}