
export const actions = {
    // Event is emitted when input is done.
    get: 'get',
    // Event is emitted when the iframe is created and the content will be rendered.
    setupContent: 'setupContent',
    // Event is emitted when the iframe is created and the content will be rendered.
    setupSingleIframeContent: 'setupSingleIframeContent',
    // Setup Click To Pay.
    setupClickToPay: 'setupClickToPay',
    // Received when with the hosted field data.
    formData: 'formData',
    // Received when enter was pressed in the hosted fields to submit the form.
    formSubmit: 'formSubmit',
    // Received when the hosted fields credit card number changed and returs the detected card brand.
    cardBrandChange: 'cardBrandChange',
    // Set click to pay transaction amount acordin to: https://srci-docs.prod.srci.cloud.netcetera.com/sdk-config-guide
    setClickToPayTransactionAmount: 'setClickToPayTransactionAmount',
    // ClickToPay checkout: https://srci-docs.prod.srci.cloud.netcetera.com/sdk-checkout-api
    clickToPayCheckout: 'clickToPayCheckout',
    // ClickToPay checkout success response
    clickToPayCheckoutSuccess: 'clickToPayCheckoutSuccess',
    // ClickToPay checkout error response
    clickToPayCheckoutError: 'clickToPayCheckoutError',
    // Request iframe to expand
    requestIframeExpand: 'requestIframeExpand',
    // Cancel iframe expand
    cancelIframeExpand: 'cancelIframeExpand',
}
Object.freeze(actions)
