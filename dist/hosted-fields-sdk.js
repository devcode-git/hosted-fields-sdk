const n = {
  // Event is emitted when input is done.
  get: "get",
  // Event is emitted when the iframe is created and the content will be rendered.
  setupContent: "setupContent",
  // Event is emitted when the iframe is created and the content will be rendered.
  setupSingleIframeContent: "setupSingleIframeContent",
  // Received when with the hosted field data.
  formData: "formData",
  // Received when enter was pressed in the hosted fields to submit the form.
  formSubmit: "formSubmit"
};
Object.freeze(n);
var u, E, f, d, b, y, s = [], m = [], I, S, o, R, C = 0, D = document.parentWindow || document.defaultView;
function q(e) {
  u = e.merchantId, E = e.renderMode, d = e.hostedfieldsurl, f = e.fields, b = e.service, y = e.styles, S = e.callback, o = e.onLoadCallback, R = e.autoFocusNext || !1, I = e.el, E && E === "single" ? T() : O();
}
function w(e) {
  return [
    e,
    "https://test-hostedpages.paymentiq.io",
    "https://hostedpages.paymentiq.io",
    "https://card-fields.paymentiq.io"
  ].indexOf(e) > -1;
}
function Y() {
  s.forEach((e) => {
    e.target.postMessage({ action: n.get, merchantId: u, id: e.id }, d);
  });
}
function N() {
  s = [];
}
function O() {
  s = s.concat(f.map((e) => F(e)));
}
function T() {
  s = _();
}
function k(e) {
  if (w(e.origin))
    switch (e.data.action) {
      case n.formData:
        m.push({ id: e.data.id, data: e.data.formData }), x();
        break;
      case n.formSubmit:
        Y();
        break;
    }
  else
    console.error("Received message from invalid origin", e.origin);
}
function x() {
  var e = m.map((t) => t.id), a = s.map((t) => t.id);
  if (e.length === a.length) {
    var r = !0;
    if (a.forEach((t) => {
      r = e.includes(t);
    }), r) {
      const t = m.reduce((i, l) => {
        const { errors: h, ...p } = i, { errors: v, ...g } = l.data, c = { ...p, ...g }, M = { ...h, ...v };
        return Object.keys(M).length > 0 && (c.errors = M), c;
      }, {});
      m = [], S()(t);
    }
  }
}
function F(e) {
  var a = document.createElement("iframe");
  a.id = "hosted-field-" + e.id, a.name = "hosted-field-" + e.id, a.src = d + "?mid=" + u;
  var r = document.querySelector(I), t = document.createElement("div");
  t.id = "hosted-field-container-" + e.id, t.className = "hosted-field-container";
  try {
    t.appendChild(a), r.appendChild(t);
    var i = document.querySelector("#" + a.id).contentWindow;
    return a.onload = V.bind(this, e, i), {
      id: a.id,
      target: i
    };
  } catch (l) {
    console.log(l), o()();
  }
}
function V(e, a) {
  var r = {};
  r[e.name] = e, D.addEventListener("message", k, !1), a.postMessage({
    action: n.setupContent,
    styles: y,
    fields: r,
    service: b
  }, d), C++, C === f.length && o && (o()(), C = 0);
}
function _() {
  var e = document.createElement("iframe");
  e.id = "hosted-field-single-iframe", e.name = "hosted-field-single-iframe", e.src = d + "?mid=" + u;
  var a = document.querySelector(I), r = document.createElement("div");
  r.id = "hosted-field-container-single-iframe", r.className = "hosted-field-container";
  try {
    r.appendChild(e), a.appendChild(r);
    var t = document.querySelector("#hosted-field-single-iframe").contentWindow;
    return e.onload = L.bind(this, f, t), [{
      id: e.id,
      target: t
    }];
  } catch (i) {
    console.log(i), o()();
  }
}
function L(e, a) {
  var r = {};
  e.forEach(function(t) {
    r[t.name] = t;
  }), D.addEventListener("message", k, !1), a.postMessage({
    action: n.setupSingleIframeContent,
    styles: y,
    fields: r,
    service: b,
    settings: {
      autoFocusNext: R
    }
  }, d), o()();
}
const j = {
  // Setup hosted fields
  setup: q,
  // Get the data from the hosted fields.
  get: Y,
  // reset the current targets
  reset: N
};
class A {
  /**
   * @argument type The type of field. ex: TEXT, NUMBER (@see FieldTypes)
   * @argument id The html id of the field.
   * @argument name The name of the id and the name of the returned property when retriving the hosted field data.
   * @argument label The text label of the field
   * @argument helpKey Text to be displayed as placeholder of field
   * @argument errorKey Message to show if field has errors
   * @argument visible If the field should be visible (default true)
   * @argument required If the field is required or not (default true)
   * @argument noAttributeValueFormatting Due to backwards compability, the flag noAttributeValueFormatting needs to be set to true to make autofill work
   * @argument autocomplete What should the field use as autofill value (cc-number, cc-csc, cc-exp)
   */
  constructor(a, r, t, i, l = "", h = "", p = !0, v = !0, g = !1, c = "") {
    this.type = a, this.id = r, this.name = t, this.label = i, this.helpKey = l, this.error = h, this.visible = p, this.required = v, this.noAttributeValueFormatting = g, this.autocomplete = c;
  }
}
const B = {
  TEXT: "TEXT",
  NUMBER: "NUMBER",
  CVV: "CVV",
  CREDITCARD_NUMBER: "CREDITCARD_NUMBER",
  EXPIRY_MM_YYYY: "EXPIRY_MM_YYYY"
};
export {
  A as Field,
  B as FieldTypes,
  j as HostedFields
};
