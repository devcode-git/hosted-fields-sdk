import $ from 'jquery'
import { actions } from '../actions'

class HostedFieldSdk {
    constructor () {
        this.window = document.parentWindow || document.defaultView;
        this.targets = []
        this.responses = []
    }

    setup (config) {
        this.merchantId = config.merchantId
        this.hostedfieldsurl = config.hostedfieldsurl
        this.fields = config.fields
        this.service = config.service
        this.styles = config.styles
        this.callback = config.callback
        this.el = config.el
        
        this.initIframes()
    }
    
    get () {
        this.targets.forEach((target) => {
            target.target.postMessage({action: actions.get, merchantId: this.merchantId, id: target.id}, '*')
        })
    }
    
    initIframes () {
        this.targets = this.targets.concat(this.fields.map((field) => {
            return this.initIframe(field)
        }))
    }
    
    eventHandler ($event) {
        const { data } = $event
        const { action, id, formData } = data
        switch (action) {
            case actions.formData:
                this.responses.push({ id: id, data: formData })
                this.sendCallback()
                break
            case actions.formSubmit:
                this.pay()
                break
        }
    }
    
    sendCallback () {
        const responseIds = this.responses.map((response) => response.id)
        const targetIds = this.targets.map((target) => target.id)
        if (responseIds.length !== targetIds.length) return
        let includesAllIds = true
        targetIds.forEach((targetId) => {
            includesAllIds = responseIds.includes(targetId)
        })
        
        // Check that we have gotten responses from all hosted fields.
        // Before sending the callback.
        if (includesAllIds) {
            const data = this.responses.reduce((formData, response) => { 
              formData = { ...formData, ...response.data } 
              return formData 
            }, {})
            // Reset the responses.
            responses = []
            this.callback()(data)
        }
    }
    
    initIframe (field) {
        const iframe = document.createElement('iframe')
        iframe.id = 'iframe-hosted-field-' + field.id
        iframe.name = 'iframe-hosted-field-' + field.id
    
        // This is hostedfieldsurl
        iframe.src = hostedfieldsurl + '?mid=' + merchantId
        const container = document.querySelector(el)
    
        const iframeContainerEl = document.createElement('div')
        iframeContainerEl.id = 'hosted-field-' + field.id
        iframeContainerEl.className = 'hosted-field'
        iframeContainerEl.appendChild(iframe)
    
        container.appendChild(iframeContainerEl)
    
        // Get the target window...
        const target = document.querySelector('#'+iframe.id).contentWindow
        // Attach onload event listener to iframe so we can send the 
        // setupContent event when iframe is fully loaded.
        iframe.onload = this.createIframeProxy.bind(this, field, target)
        return {
            id: iframe.id, target
        }
    }
    
    createIframeProxy (field, target) {
        const fields = {}
        fields[field.name] = field
        this.window.addEventListener("message", eventHandler, false)
        target.postMessage({
            action: actions.setupContent,
            styles: styles,
            fields: fields,
            service: this.service
        }, '*') 
    }
}

export const hostedFieldSdk = new HostedFieldSdk()
