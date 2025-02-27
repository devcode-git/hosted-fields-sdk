import { actions } from './actions';

// The payment iq mid
var merchantId;
// Return each field as separate iframes or all fields in a single iframe
var renderMode;
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
// Method to call when all responses from hosted fields
// has been loaded
var onLoadCallback;
// Boolean - should the next field be focused when a valid value has been set
var autoFocusNext;
// Keep track of number of loaded fields
var onLoadCounter = 0;
// This window.
var window = document.parentWindow || document.defaultView;

function setup (config) {
    merchantId = config.merchantId;
    renderMode = config.renderMode;
    hostedfieldsurl = config.hostedfieldsurl;
    fields = config.fields;
    service = config.service;
    styles = config.styles;
    callback = config.callback;
    onLoadCallback = config.onLoadCallback;
    autoFocusNext = config.autoFocusNext || false
    el = config.el;

    // Create a single iframe for all the fields (single) or create an iframe per field (multiple)
    if (renderMode && renderMode === 'single') {
        // single
        registerSingleIframe()
    } else {
        // mulitple
        registerIframes();
    }
}

function validateOrigin (origin) {
    const validOrigins = [
        origin,
        'https://test-hostedpages.paymentiq.io',
        'https://hostedpages.paymentiq.io',
        'https://card-fields.paymentiq.io'
    ]
    return validOrigins.indexOf(origin) > -1
}

function get () {
    targets.forEach((target) => {
        target.target.postMessage({action: actions.get, merchantId: merchantId, id: target.id}, hostedfieldsurl);
    })
}

function reset () {
  targets = []
}

function destroyContent () {
  merchantId = null
  fields = null;
  hostedfieldsurl = null
  service = null
  styles = null
  targets = []
  responses = []
  el = null
  callback = null
  onLoadCallback = null
  onLoadCounter = 0
}

function registerIframes () {
    targets = targets.concat(fields.map((field) => {
        return initIframe(field)
    }))
}

function registerSingleIframe () {
    targets = initSingleIframe()
}

function eventHandler ($event) {
    if (validateOrigin($event.origin)) {
        switch ($event.data.action) {
            case actions.formData:
                responses.push({ id: $event.data.id, data: $event.data.formData })
                sendCallback()
                break;
            case actions.formSubmit:
                get()
                break;
        }
    } else {
        console.error('Received message from invalid origin', $event.origin)
    }
}

function sendCallback () {
    var responseIds = responses.map((response) => response.id);
    var targetIds = targets.map((target) => target.id);
    if (responseIds.length !== targetIds.length) return;
    var includesAllIds = true;
    targetIds.forEach((targetId) => {
        includesAllIds = responseIds.includes(targetId);
    });

    // Check that we have gotten responses from all hosted fields.
    // Before sending the callback.
    if (includesAllIds) {
        const data = responses.reduce((formData, response) => {
          const {errors, ...data} = formData;
          const {errors: fieldErrors, ...fieldData} = response.data;
          const newData = {...data, ...fieldData};
          const allErrors = {...errors, ...fieldErrors};
          if (Object.keys(allErrors).length > 0) {
            newData.errors = allErrors;
          }
          return newData;
        }, {});
        // Reset the responses.
        responses = []
        callback()(data);
    }
}

// Sets up a single iframe for each field
function initIframe (field) {
    var iframe = document.createElement('iframe');
    iframe.id = 'hosted-field-' + field.id;
    iframe.name = 'hosted-field-' + field.id;
    // iframe.tabIndex = '-1'; // This disabled the possibility to set focus on the frame and any of its contents.

    // This is hostedfieldsurl
    iframe.src = hostedfieldsurl + '?mid=' + merchantId;
    var container = document.querySelector(el);

    var iframeContainerEl = document.createElement('div');
    iframeContainerEl.id = 'hosted-field-container-' + field.id
    iframeContainerEl.className = 'hosted-field-container'
    try {
      iframeContainerEl.appendChild(iframe)

      container.appendChild(iframeContainerEl);

      // Get the target window...
      var target = document.querySelector('#'+iframe.id).contentWindow;
      // Attach onload event listener to iframe so we can send the
      // setupContent event when iframe is fully loaded.
      iframe.onload = createIframeProxy.bind(this, field, target)
      return {
          id: iframe.id, target
      }
    } catch (err) {
      console.log(err)
      onLoadCallback()()
    }
}

function createIframeProxy (field, target) {
    var fieldsObj = {};
    fieldsObj[field.name] = field;
    window.addEventListener("message", eventHandler, false)
    target.postMessage({
        action: actions.setupContent,
        styles: styles,
        fields: fieldsObj,
        service: service,
    }, hostedfieldsurl);

    onLoadCounter++
    if (onLoadCounter === fields.length && onLoadCallback) {
        onLoadCallback()()
        onLoadCounter = 0
    }
}

// Sets up a single iframe for each field
function initSingleIframe () {
    var iframe = document.createElement('iframe');
    iframe.id = 'hosted-field-single-iframe';
    iframe.name = 'hosted-field-single-iframe';
    // iframe.tabIndex = '-1'; // This disabled the possibility to set focus on the frame and any of its contents.

    // This is hostedfieldsurl
    iframe.src = hostedfieldsurl + '?mid=' + merchantId;
    var container = document.querySelector(el);

    var iframeContainerEl = document.createElement('div');
    iframeContainerEl.id = 'hosted-field-container-single-iframe'
    iframeContainerEl.className = 'hosted-field-container'
    try {
      iframeContainerEl.appendChild(iframe)

      container.appendChild(iframeContainerEl);

      // Get the target window...
      var target = document.querySelector('#hosted-field-single-iframe').contentWindow;
      // Attach onload event listener to iframe so we can send the
      // setupContent event when iframe is fully loaded.
      iframe.onload = createSingleIframeProxy.bind(this, fields, target)
      return [{
          id: iframe.id, target
      }]

    } catch (err) {
      console.log(err)
      onLoadCallback()()
    }
}

function createSingleIframeProxy (fields, target) {
    var fieldsObj = {};
    fields.forEach(function (field) {
        fieldsObj[field.name] = field;
    })

    window.addEventListener("message", eventHandler, false)
    target.postMessage({
        action: actions.setupSingleIframeContent,
        styles: styles,
        fields: fieldsObj,
        service: service,
        settings: {
            autoFocusNext
        }
    }, hostedfieldsurl);
    
    onLoadCallback()()
}

export const HostedFields = {
    // Setup hosted fields
    setup,
    // Get the data from the hosted fields.
    get,
    // reset the current targets
    reset
};
