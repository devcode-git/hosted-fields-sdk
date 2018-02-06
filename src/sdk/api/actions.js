
export const actions = {
    // Event is emitted when input is done.
    get: 'get',
    // Event is emitted when the iframe is created and the content will be rendered.
    setupContent: 'setupContent',
    // Resets all base values and clears all fields
    destroyContent: 'destroyContent',
    // Received when with the hosted field data.
    formData: 'formData',
    // Recvied when enter was pressed in the hosted fields to submit the form.
    formSubmit: 'formSubmit'
}
Object.freeze(actions)
