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
    required: required
}
````

The type-property can be one of the following:
````
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  CVV: 'CVV',
  CREDITCARD_NUMBER: 'CREDITCARD_NUMBER',
  EXPIRY_MM_YYYY: 'EXPIRY_MM_YYYY'
````


#### HostedFields
HostedFields in turn will expose two functions
* setup
* get

Setup is the first function you will call. It takes a config-object as its only parameter:

````
{
    merchantId: 123456789,
    hostedfieldsurl: http://urlToHostedFields.com,
    fields: my_fields, //fields you've generated using the Field-constructor
    service: 'your_service',
    styles: 'any custom styles you wish to include',
    callback: someFunction,
    el = A domElement to render the hosted fields in
}
````

Setup will first set the base values. After that it will loop through the fields you've passed in and create an iframe for each one.

````
//Each iframe will get an id 'hosted-field-' + the id of the field
iframe.id = 'hosted-field-' + field.id;

//hostedfieldsurl passed in config to setup
iframe.src = hostedfieldsurl + '?mid=' + merchantId;

//domEl the iframe should be appended to, also from config
var container = document.querySelector(el);
````
Lastly eventListener are registered to the iframe so that it picks up postMessage events.

#### Styling
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
       required: true
   },
   {
       type: FieldTypes.TEXT,
       id: 'lastname',
       name: 'lastname',
       label: 'Last name',
       error: 'Last name is not invalid',
       helpKey: 'Last name',
       visible: true,
       required: true
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
      conf.required
  )
})
````

**Call the setup function**
````
HostedFields.setup({
  merchantId: 123456789,
  hostedfieldsurl: "https://urlToHostedFields.com",
  fields: fields,
  service: 'some service',
  styles: '* .hosted-input-container .input-container input { color: green; }',
  callback: formCallbackHandler,
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

const fetchFormData = () => {
	HostedFields.get() //will trigger formCallbackHandler
}
````

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
      required: true
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
  },
  {
	  type: FieldTypes.CVV,
      id: 'cvv',
      name: 'cvv',
      label: 'CVV',
      error: 'CVV not valid',
      helpKey: 'CVV',
      visible: true,
      required: true
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
      conf.required
    )
})

// And finally the setup

HostedFields.setup({
  merchantId: 123456789,
  hostedfieldsurl: "https://urlToHostedFields.com",
  fields: fields,
  service: 'some service',
  styles: '.hosted-input-container .input-container input { color: red; }',
  callback: formCallbackHandler,
  el: '#hosted-fields-wrapper'
})

// When you want to fetch the form information:
HostedFields.get()

Returns an object of key-values for your fields.
Fields that are to be encrypted (Card number + CVV) will return the encrypted value.
If any errors are detected, an error message will be returned as the value of that field, prefixed with ERROR

````
