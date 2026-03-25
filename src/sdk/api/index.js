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
// The ClickToPay target iframe
var clickToPayIframe 
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
// Method to call when card brand(e.g. visa, mastercard, etc.) has changed 
// based on the credit card nunmber that was entered.
var onCardBrandChangeCallback;
// Method to call when iframe requests to expand (used for ClickToPay when 3DS window is shown)
var onRequestIframeExpandCallback;
// Method to call when iframe requests to cancel expand
var onCancelIframeExpandCallback;
// Method to call when receive a successful ClickToPay checkout response
var onClickToPayCheckoutSuccessCallback;
// Method to call when receive an error on the ClickToPay checkout
var onClickToPayCheckoutErrorCallback;
// Boolean - should the next field be focused when a valid value has been set
var autoFocusNext;
// Keep track of number of loaded fields
var onLoadCounter = 0;
// Allowed postMessage origins
var allowedOrigins = [];
// This window.
var window = document.parentWindow || document.defaultView;
/**
 * ClickToPay attributes for the ClickToPay instance
 * @param locale default: "en_US"
 * @param sandbox default: "true" (set it to "false" in production)
 */ 
var clickToPayAttributes;
// ClickToPay config according to: https://srci-docs.prod.srci.cloud.netcetera.com/sdk-config-guide
var clickToPayConfig;

 
const recommendedExpandedHeight = 850; // in px
const iframeAllowPermissions = 'payment';

function extractOrigin (url) {
    try {
        var anchor = document.createElement('a')
        anchor.href = url
        return anchor.protocol + '//' + anchor.host
    } catch (error) {
        return null
    }
}

function setup (config) {
    merchantId = config.merchantId;
    renderMode = config.renderMode;
    hostedfieldsurl = config.hostedfieldsurl;
    fields = config.fields;
    service = config.service;
    styles = config.styles;
    callback = config.callback;
    onLoadCallback = config.onLoadCallback;
    onCardBrandChangeCallback = config.onCardBrandChangeCallback;
    onRequestIframeExpandCallback = config.onRequestIframeExpandCallback;
    onCancelIframeExpandCallback = config.onCancelIframeExpandCallback;
    onClickToPayCheckoutSuccessCallback = config.onClickToPayCheckoutSuccessCallback;
    onClickToPayCheckoutErrorCallback = config.onClickToPayCheckoutErrorCallback;
    autoFocusNext = config.autoFocusNext || false
    el = config.el;
    clickToPayConfig = config.clickToPayConfig;
    clickToPayAttributes = config.clickToPayAttributes;
    allowedOrigins = [];

    var hostedFieldsOrigin = extractOrigin(hostedfieldsurl)
    if (hostedFieldsOrigin) {
        allowedOrigins.push(hostedFieldsOrigin)
    }

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
    const fallbackOrigins = [
        'https://test-hostedpages.paymentiq.io',
        'https://card-fields.paymentiq.io'
    ]
    const validOrigins = [...allowedOrigins, ...fallbackOrigins]
    return validOrigins.indexOf(origin) > -1
}

function get () {
    targets.forEach((target) => {
        target.target.postMessage({action: actions.get, merchantId: merchantId, id: target.id}, hostedfieldsurl);
    })
}

function reset () {
  targets = []
  clickToPayIframe = undefined
}

function assertClickToPayIsSet () {
    if(!clickToPayConfig) {
        console.error('ClickToPay config not set')
        return false
    }
    
    if(!clickToPayIframe) {
        console.error('ClickToPay target not set internally')
        return false
    } 

    return true
}

function setClickToPayTransactionAmount (transactionAmount) {
    if(!assertClickToPayIsSet()) return;
    
    clickToPayIframe.contentWindow.postMessage({
        action: actions.setClickToPayTransactionAmount,
        transactionAmount
    }, hostedfieldsurl)
}

function clickToPayCheckout (payload) {
    if(!assertClickToPayIsSet()) return;

    clickToPayIframe.contentWindow.postMessage({
        action: actions.clickToPayCheckout,
        payload
    }, hostedfieldsurl)
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
            case actions.cardBrandChange:
                onCardBrandChangeCallback?.({cardBrand: $event.data.cardBrand })
                break;
            case actions.requestIframeExpand:
                onRequestIframeExpandCallback?.(recommendedExpandedHeight)
                clickToPayIframe.classList.add('expanded')
                break;
            case actions.clickToPayCheckoutSuccess:
                onClickToPayCheckoutSuccessCallback?.($event.data.response)
                break;
            case actions.clickToPayCheckoutError:
                onClickToPayCheckoutErrorCallback?.($event.data.error)
                break;
            case actions.cancelIframeExpand:
                onCancelIframeExpandCallback?.()
                clickToPayIframe.classList.remove('expanded')
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

function handleOnLoad(iframe) {
    onLoadCallback?.()();

    if (!iframe) return;
    clickToPayIframe = iframe;

    if (clickToPayConfig) {
        clickToPayIframe.contentWindow.postMessage({
            action: actions.setupClickToPay,
            attributes: clickToPayAttributes,
            config: clickToPayConfig
        }, hostedfieldsurl);
    }
}


// Sets up a single iframe for each field
function initIframe (field) {
    var iframe = document.createElement('iframe');
    iframe.id = 'hosted-field-' + field.id;
    iframe.name = 'hosted-field-' + field.id;
    iframe.allow = iframeAllowPermissions;
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
      var targetIframe = document.querySelector('#'+iframe.id);
      // Attach onload event listener to iframe so we can send the
      // setupContent event when iframe is fully loaded.
      iframe.onload = createIframeProxy.bind(this, field, targetIframe)
      return {
          id: iframe.id, 
          target: targetIframe.contentWindow
      }
    } catch (err) {
      console.log(err)
      handleOnLoad(null)
    }
}

function createIframeProxy (field, iframe) {
    var fieldsObj = {};
    fieldsObj[field.name] = field;
    window.addEventListener("message", eventHandler, false)
    iframe.contentWindow.postMessage({
        action: actions.setupContent,
        styles: styles,
        fields: fieldsObj,
        service: service,
    }, hostedfieldsurl);

    onLoadCounter++
    if (onLoadCounter === fields.length && onLoadCallback) {
        handleOnLoad(iframe)
        onLoadCounter = 0
    }
}

// Sets up a single iframe for each field
function initSingleIframe () {
    var iframe = document.createElement('iframe');
    iframe.id = 'hosted-field-single-iframe';
    iframe.name = 'hosted-field-single-iframe';
    // iframe.tabIndex = '-1'; // This disabled the possibility to set focus on the frame and any of its contents.
    iframe.allow = iframeAllowPermissions;

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
      var targetIframe = document.querySelector('#hosted-field-single-iframe');
      // Attach onload event listener to iframe so we can send the
      // setupContent event when iframe is fully loaded.
      iframe.onload = createSingleIframeProxy.bind(this, fields, targetIframe)
      return [{
          id: iframe.id, 
          target: targetIframe.contentWindow
      }]

    } catch (err) {
      console.log(err)
      handleOnLoad(null)
    }
}

function createSingleIframeProxy (fields, iframe) {
    var fieldsObj = {};
    fields.forEach(function (field) {
        fieldsObj[field.name] = field;
    })

    window.addEventListener("message", eventHandler, false)
    iframe.contentWindow.postMessage({
        action: actions.setupSingleIframeContent,
        styles: styles,
        fields: fieldsObj,
        service: service,
        settings: {
            autoFocusNext
        }
    }, hostedfieldsurl);
    
    handleOnLoad(iframe)
}

export const HostedFields = {
    // Setup hosted fields
    setup,
    // Get the data from the hosted fields.
    get,
    // reset the current targets
    reset,
    // Set Click To Pay transaction amount according to: https://srci-docs.prod.srci.cloud.netcetera.com/sdk-config-guide
    setClickToPayTransactionAmount,
    // Perform ClickToPay checkout according to: https://srci-docs.prod.srci.cloud.netcetera.com/sdk-checkout-api
    clickToPayCheckout,
};
