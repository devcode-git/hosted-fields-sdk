declare module "hosted-fields-sdk" {
  export interface HostedFieldsConfig {
    [key: string]: any;
  }

  export interface ClickToPayPayload {
    [key: string]: any;
  }

  export interface ClickToPayTransactionAmount {
    /**
     * The transaction amount as a string.(e.g., "10")
     */
    amount: string;
    /**
     * The currency code in ISO 4217 format. (e.g., "USD")
     */
    currencyCode: string; 
  }

  export interface HostedFields {
    /**
     * Initializes hosted fields with the provided configuration.
     */
    setup(config: HostedFieldsConfig): void;

    /**
     * If you want to get the encrypted values from the fields you can call this method.
     * This will trigger the supplied callback-function registered in HostedFields.setup() to be called with the values for each field.
     */
    get(): void;

    /**
     * If you wish to reset the currently rendered iframes (fields) you can call HostedFields.reset() before running a new setup().
     * This can be required if your page that contains the fields gets re-rendered. In that case you will have registered duplicates of the fields. 
     * So it's a good idea to call HostedFields.reset() on a beforeDestroy-hook if you are using Vue or React.
     */
    reset(): void;

    /**
     * Updates the Click to Pay transaction amount.
     */
    setClickToPayTransactionAmount(transactionAmount: any): void;

    /**
     * Initiates a Click to Pay checkout flow.
     */
    clickToPayCheckout(payload: ClickToPayPayload): void;
  }

  /**
   * Main HostedFields singleton/object exposed by the SDK.
   */
  export const HostedFields: HostedFields;

  /**
   * The supported field types.
   */
  export const FieldTypes: {
    readonly TEXT: "TEXT";
    readonly NUMBER: "NUMBER";
    readonly CVV: "CVV";
    readonly CREDITCARD_NUMBER: "CREDITCARD_NUMBER";
    readonly EXPIRY_MM_YYYY: "EXPIRY_MM_YYYY";
  };

  /**
   * Represents a single hosted field configuration.
   */
  export class Field {
    /**
     * The type of the field (e.g., TEXT, NUMBER, etc.).
     */
    type: keyof typeof FieldTypes;

    /**
     * The HTML id of the field.
     */
    id: string;

    /**
     * The name of the field (used as a key when retrieving hosted field data).
     */
    name: string;

    /**
     * The label text of the field.
     */
    label: string;

    /**
     * Placeholder text to display inside the field.
     */
    helpKey: string;

    /**
     * Error message to display if the field has validation issues.
     */
    error: string;

    /**
     * Whether the field should be visible (default: true).
     */
    visible: boolean;

    /**
     * Whether the field is required (default: true).
     */
    required: boolean;

    /**
     * For backward compatibility: set to true to enable autofill (disables value formatting).
     */
    noAttributeValueFormatting: boolean;

    /**
     * What autofill value the field should use (e.g., "cc-number", "cc-csc", "cc-exp").
     */
    autocomplete: string;

    constructor(
      type: keyof typeof FieldTypes,
      id: string,
      name: string,
      label: string,
      helpKey?: string,
      errorKey?: string,
      visible?: boolean,
      required?: boolean,
      noAttributeValueFormatting?: boolean,
      autocomplete?: string
    );
  }
}