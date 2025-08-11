
export const actions = {
    // Event is emitted when input is done.
    get: 'get',
    // Event is emitted when the iframe is created and the content will be rendered.
    setupContent: 'setupContent',
    // Event is emitted when the iframe is created and the content will be rendered.
    setupSingleIframeContent: 'setupSingleIframeContent',
    // Received when with the hosted field data.
    formData: 'formData',
    // Received when enter was pressed in the hosted fields to submit the form.
    formSubmit: 'formSubmit',
    // Received when the hosted fields credit card number changed and returs the detected card brand.
    cardBrandChange: 'cardBrandChange',
}
Object.freeze(actions)
