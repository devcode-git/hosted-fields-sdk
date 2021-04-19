# Hosted fields sdk

Hosted fields SDK is a toolkit that allows you generate a form/set of fields. It is published as a node-module to the public [npm registry](https://www.npmjs.com/package/hosted-fields-sdk).


```
  npm i hosted-fields-sdk --save

  import { HostedFields, Field, FieldType } from 'hosted-fields-sdk'
```

The SDK will expose three functions

* HostedFields
* Field
* FieldTypes

#### Field & FieldTypes
You define what fields you wish to include in your form yourself. The SDK gives you a Field-constructor to help you with this. Simply pass in the following object to the Field-constructor and it will give you back a valid Field-item.

````
{
    id: id,
    name: name,
    type: type,
    label: label,
    error: errorKey,
    helpKey: helpKey,
    visible: visible,
    required: required,
    noAttributeValueFormatting: true, (not mandatory, defaults to false)
    autocomplete: autocomplete
}

````

#### noAttributeValueFormatting
In order to make input fields work with autofill for creditcard information, certain attributes are needed on the fields.
Due to backwards compability, the flag noAttributeValueFormatting needs to be set to true.

This will set the id and name attributes to the actual value you pass in for each field.
You can also set autocomplete to the desired value according to the autofill specs

https://developers.google.com/web/updates/2015/06/checkout-faster-with-autofill

Recommended values for autocomplete are:

Creditcard number: `cc-number`
CVC: `cc-csc`
Expiry: `cc-exp`

#### The type-property can be one of the following:
````
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  CVV: 'CVV',
  CREDITCARD_NUMBER: 'CREDITCARD_NUMBER',
  EXPIRY_MM_YYYY: 'EXPIRY_MM_YYYY'
````


#### HostedFields
HostedFields in turn will expose three functions
* setup
* get
* reset

**setup**

Setup is the first function you will call. It takes a config-object as its only parameter:

````
{
    merchantId: 123456789,
    hostedfieldsurl: 'https://hostedpages.paymentiq.io/1.0.29/index.html',
    fields: my_fields, //fields you've generated using the Field-constructor
    renderMode: 'single', // defaults to 'multiple', separate iframes per field
    service: 'payment_method_service', // service of the payment method. Not mandatory (AstropayCard requires this)
    styles: 'any custom styles you wish to include',
    callback: () => someFunction,
    autoFocusNext: true,
    onLoadCallback: () => someFunction
    el = A domElement to render the hosted fields in
}
````

#### renderMode

Choose if all fields should be returned in a single iframe (`single`) or separate iframes (`multiple`). Defaults to `multiple` for backwards compability.

#### autoFocusNext
From version `1.2.3` of the hosted-fields-sdk and Hosted-fields `1.0.31`, hosted-fields can be support to auto focus on the next field when a valid value has been entered. E.g when the user has entered their creditcard number, focus will automatically be put on expiry and then on to cvc.

Defaults to `false`.

**callback**
Pass in a function that you want to be called when the values from the fields are fetched.

**onLoadCallback**
Optionally, you can pass in a function that will be called when all the fields you have passed in have
loaded, allowing you to display some kind of loader until this callback has been triggered.

Possible values for hostedfieldsurl:

prod: 'https://hostedpages.paymentiq.io/1.0.29/index.html'

test: 'https://test-hostedpages.paymentiq.io/1.0.29/index.html'

NOTE:
Callback must be a function that returns a function.
This allows you to run for example your own validation on the values before you pass in your callback that will handle your formData.

Setup will first set the base values. After that it will loop through the fields you've passed in and create an iframe for each one.

**get**

If you want to get the encrypted values from the fields you can call
```
HostedFields.get()
```
This will trigger the supplied callback-function registered in HostedFields.setup() to be called with the values for each field.
Note that the callback function will also be called if the user presses enter in any of the fields.

```
{
   cardHolder: 'Admiral Ackbar',
   encCreditcardNumber: 'ENCRYPTED_STRING',
   encCvv: 'ENCRYPTED_STRING',
   expiryMonth: '05',
   expiryYear: '2025'
}
```

**reset**

If you wish to reset the currently rendered iframes (fields) you can call HostedFields.reset() before running a new setup().
This can be required if your page that contains the fields gets re-rendered. In that case you will have registered duplicates of the fields. So it's a good idea to call HostedFields.reset() on a beforeDestroy-hook if you are using Vue or React.

````
//Each iframe will get an id 'hosted-field-' + the id of the field
iframe.id = 'hosted-field-' + field.id;

//hostedfieldsurl passed in config to setup
iframe.src = hostedfieldsurl + '?mid=' + merchantId;

//domEl the iframe should be appended to, also from config
var container = document.querySelector(el);
````
Lastly eventListener are registered to the iframe so that it picks up postMessage events.

## Styling
Styling will mainly be handled buy the application using the hosted-fields. Each field will have some basic styling but the layout will have to be supplied.

Each field can have an appended string of css. This will be added to each field's iframe head as a style-tag.

## Basic Example
Two simple text fields for first & last name
````
import { FieldTypes } from 'hosted-fields-sdk'

let fieldConfig = [
   {
       type: FieldTypes.TEXT,
       id: 'first-name',
       name: 'first-name',
       label: 'First name',
       error: 'First name is not valid',
       helpKey: 'First name',
       visible: true,
       required: true,
       noAttributeValueFormatting: true,
       autocomplete: 'firstname'
   },
   {
       type: FieldTypes.TEXT,
       id: 'lastname',
       name: 'lastname',
       label: 'Last name',
       error: 'Last name is not invalid',
       helpKey: 'Last name',
       visible: true,
       required: true,
       noAttributeValueFormatting: true,
       autocomplete: 'lastname'
   }
]
````

**Generate Field-objects using the Field-constructor for each one**
````
import { Field } from 'hosted-fields-sdk'

let fields = fieldConfig.map(conf => {
  return new Field(
      conf.type,
      conf.id,
      conf.name,
      conf.label,
      conf.error,
      conf.helpKey,
      conf.visible,
      conf.required,
      conf.noAttributeValueFormatting,
      conf.autocomplete
  )
})
````

**Call the setup function**
````
HostedFields.setup({
  merchantId: 123456789,
  hostedfieldsurl: 'https://hostedpages.paymentiq.io/1.0.26/index.html',
  fields: fields,
  service: 'some service',
  styles: '* .hosted-input-container .input-container input { color: green; }',
  callback: () => formCallbackHandler,
  onLoadCallback: () => formHasLoadedCallbackHandler,
  el: '#hosted-fields-wrapper'
})
````

**Adding the callback handler and including the domElement stated as 'el'**
````
<!--index.html--->
<html>
    <head></head>
    <body onload=setupHostedFields()>
        <button onClick=fetchFormData()>Get form data</button>
	<div id="hosted-fields-wrapper"></div>
    </body>
</html>
````

````
// scripts.js
import { HostedFields, Field, FieldTypes } from 'hosted-fields-sdk'

const setupHostedFields = () => {
    HostedFields.setup(...the setup config)
}

const formCallbackHandler = (formData) => {
    // do stuff
}

const formHasLoadedCallbackHandler = () => {
    // all hosted fields has loaded
}

const fetchFormData = () => {
    HostedFields.get() //will trigger formCallbackHandler
}
````

**Styling rules**
You can set comments in your custom css style file to render the input in a certain way.

Available rules / comments: (Copy/paste the comment in it's exact form, one extra whitespace won't make it work.)
````
/* RenderAsFloatingLabel */
`````
The RenderAsFloatingLabel rule will render the input placeholder as a floating label instead of a fixed one.

**Basic styling**
Each field will get wrapped by a div with the class *.hosted-field-container* and an id suffixed with the stated id for that field.

By adding the following styles a basic layout will be created:
````
//style.css

#hosted-fields-wrapper {
   width: 600px;
}

#hosted-fields-wrapper .hosted-field-container {
   height: 65px;
}

#hosted-fields-wrapper .hosted-field-container iframe {
   width: 100%;
   border: 0px;
}
````

## Full checkout form
````
import { HostedFields, Field, FieldTypes } from 'hosted-fields-sdk'

// Configure your fields
let fieldConfig = [
  {
      type: FieldTypes.TEXT,
      id: 'cardholder-name',
      name: 'cardholder-name',
      label: 'Cardholder name',
      error: 'Cardholder not valid',
      helpKey: 'Cardholder name',
      visible: true,
      required: true
  },
  {
      type: FieldTypes.CREDITCARD_NUMBER,
      id: 'creditcard',
      name: 'creditcard',
      label: 'Credit card',
      error: 'Credit card number is invalid',
      helpKey: 'Credit card',
      visible: true,
      required: true,
      noAttributeValueFormatting: true,
      autocomplete: 'cc-number'
  },
  {
      type: FieldTypes.EXPIRY_MM_YYYY,
      id: 'date-expire',
      name: 'date-expire',
      label: 'Expiry date',
      error: 'Expire date not valid',
      helpKey: 'Expire date',
      visible: true,
      required: true
      noAttributeValueFormatting: true,
      autocomplete: 'cc-exp'
  },
  {
      type: FieldTypes.CVV,
      id: 'cvv',
      name: 'cvv',
      label: 'CVV',
      error: 'CVV not valid',
      helpKey: 'CVV',
      visible: true,
      required: true,
      noAttributeValueFormatting: true,
      autocomplete: 'cc-csc'
  }
]

// Construct your fields
let fields = fieldConfig.map(conf => {
  return new Field(
      conf.type,
      conf.id,
      conf.name,
      conf.label,
      conf.error,
      conf.helpKey,
      conf.visible,
      conf.required,
      conf.noAttributeValueFormatting,
      conf.autocomplete
    )
})

// And finally the setup

HostedFields.setup({
  merchantId: 123456789,
  hostedfieldsurl: 'https://hostedpages.paymentiq.io/1.0.26/index.html',
  fields: fields,
  service: 'some service',
  styles: '.hosted-input-container .input-container input { color: red; }',
  callback: () => formCallbackHandler,
  onLoadCallback: () => formHasLoadedCallbackhandler
  el: '#hosted-fields-wrapper'
})

// When you want to fetch the form information:
HostedFields.get()

Returns an object of key-values for your fields.
Fields that are to be encrypted (Card number + CVV) will return the encrypted value.
If any errors are detected, an error message will be returned as the value of that field, prefixed with ERROR

````
