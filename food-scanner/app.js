(function () {
  "use strict";
  var FS = window.FS, $ = function (id) { return document.getElementById(id); };

  // Built-in examples: real barcodes found via the Open Food Facts India search / known global product.
  var EXAMPLES = [
    ["3017620422003", "Nutella (global)"],
    ["8901719134845", "Parle-G"],
    ["8906010500764", "Balaji Chataka Pataka"],
    ["8901058000290", "Maggi noodles"],
    ["8901063139329", "Britannia Bourbon"],
    ["8904043901015", "Tata Salt"],
    ["8900000000000", "Not-found example"]
  ];
  var SAMPLES = {
    gelatin: "Ingredients: Sugar, Glucose Syrup, Gelatin, Acidity Regulator (330), Permitted Natural Colour (120), Flavour.",
    ambiguous: "Ingredients: Refined Wheat Flour (Maida) 62%, Sugar, Refined Palm Oil, Emulsifier (E471), Natural Flavouring, Iodised Salt."
  };
  var OCR_LOW_CONF = 75;       // mean OCR confidence (0-100) below this is treated as low
  var OCR_LOW_WORD = 60;       // a word below this counts as low-confidence
  var OCR_LOW_SHARE = 0.25;    // more than this share of low-confidence words => low

  var ocr = { confidence: null, lowShare: null, edited: false, original: "", fromOcr: false };
  var lastProduct = null;

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") el.className = attrs[k]; else if (k === "text") el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]);
    });
    (function add(list) {
      for (var i = 0; i < list.length; i++) { var c = list[i]; if (c == null) continue; if (Array.isArray(c)) add(c); else el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }
    })(Array.prototype.slice.call(arguments, 2));
    return el;
  }
  function src(text) { return h("span", { class: "src", text: text }); }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
  function fmt(v, unit) { return v == null ? null : (Math.round(v * 100) / 100) + (unit ? " " + unit : ""); }

  // ---- tabs
  function selectTab(which) {
    ["barcode", "label"].forEach(function (t) {
      $("tab-" + t).setAttribute("aria-selected", String(t === which)); $("panel-" + t).hidden = t !== which;
    });
  }
  $("tab-barcode").onclick = function () { selectTab("barcode"); };
  $("tab-label").onclick = function () { selectTab("label"); };

  // ---- examples
  EXAMPLES.forEach(function (e) {
    var b = h("button", { type: "button", text: e[1], title: e[0] });
    b.onclick = function () { $("barcode").value = e[0]; lookup(e[0]); };
    $("examples").appendChild(b);
  });

  // ---- barcode lookup
  $("barcode-form").onsubmit = function (ev) { ev.preventDefault(); lookup($("barcode").value.trim()); };
  $("honey-flag").onchange = function () {
    if (lastProduct) renderJainForProduct(lastProduct.p, lastProduct.slot);
    if ($("label-result").firstChild) analyseLabel();
  };

  function lookup(code) {
    var out = clear($("barcode-result"));
    if (!/^\d{8,14}$/.test(code)) { out.appendChild(h("div", { class: "error", text: "Enter 8 to 14 digits (EAN-8, UPC-A, EAN-13 or GTIN-14)." })); return; }
    out.appendChild(h("p", { class: "muted", text: "Looking up " + code + " in Open Food Facts..." }));
    var ctl = new AbortController(), timer = setTimeout(function () { ctl.abort(); }, 20000);
    FS.off.fetchProduct(code, ctl.signal).then(function (r) {
      clearTimeout(timer); clear(out);
      if (!r.found) { out.appendChild(h("div", { class: "card" }, h("h2", { text: "Product not found in Open Food Facts" }), h("p", { class: "muted", text: "Barcode " + code + " has no entry. Open Food Facts coverage for Indian products is partial. No data was invented." }))); return; }
      renderProduct(r.product, out);
    }, function (e) {
      clearTimeout(timer); clear(out);
      out.appendChild(h("div", { class: "error", text: "Could not reach Open Food Facts (" + (e.name === "AbortError" ? "timed out" : e.message) + "). Check your connection or try again. This is not the same as 'product not found'." }));
    });
  }

  function renderProduct(p, out) {
    var name = p.product_name, brand = p.brands;
    var head = h("div", { class: "card" },
      h("div", { class: "product" },
        p.image_front_small_url ? (function () { var i = h("img", { src: p.image_front_small_url, alt: "Front of pack", loading: "lazy" }); i.onerror = function () { i.remove(); }; return i; })() : null,
        h("div", null,
          h("h2", null, name ? name : h("span", { class: "missing", text: "Product name: this field is missing" })),
          h("div", null, h("span", { class: "muted", text: "Brand: " }), brand ? brand : h("span", { class: "missing", text: "this field is missing" })),
          p.quantity ? h("div", { class: "muted", text: "Quantity: " + p.quantity }) : null,
          h("div", { class: "muted", text: "Barcode " + p.code }, src("Open Food Facts")))));
    out.appendChild(head);

    // Open Food Facts Nutri-Score: its own box, never blended with the local score.
    var g = p.nutriscore_grade, has = /^[a-e]$/.test(g || "");
    var offBox = h("div", { class: "card sep" }, h("h2", null, "Nutri-Score grade from Open Food Facts", src("Open Food Facts")));
    if (has) offBox.appendChild(h("div", { class: "gradeline" }, h("span", { class: "grade " + g, text: g.toUpperCase() }), h("span", { class: "muted", text: "Supplied by Open Food Facts. We did not calculate it." })));
    else offBox.appendChild(h("p", { class: "missing", text: g === "not-applicable" ? "Open Food Facts marks Nutri-Score as not applicable for this product." : "Open Food Facts has no Nutri-Score grade for this product." }));
    out.appendChild(offBox);

    // nutrition table
    var ex = FS.off.extractInputs(p.nutriments), x = ex.inputs;
    var rows = [["Energy", x.energyKj != null ? fmt(x.energyKj, "kJ") + (ex.kcal != null ? " / " + fmt(ex.kcal, "kcal") : "") : null],
      ["Fat", fmt(x.fat, "g")], ["Saturated fat", fmt(x.satFat, "g")], ["Carbohydrates", fmt(x.carbs, "g")], ["Sugars", fmt(x.sugars, "g")],
      ["Protein", fmt(x.protein, "g")], ["Salt", fmt(x.salt, "g")], ["Fibre", fmt(x.fibre, "g")]];
    var tbl = h("table", null, h("tbody", null, rows.map(function (r) {
      return h("tr", null, h("th", { text: r[0] }), h("td", { class: "num" }, r[1] != null ? r[1] : h("span", { class: "missing", text: "this field is missing" })));
    })));
    var nut = h("div", { class: "card" }, h("h2", null, "Nutrition per 100g", src("Open Food Facts")), tbl);
    if (ex.notes.length) nut.appendChild(h("p", { class: "muted", text: "Notes: " + ex.notes.join("; ") + "." }));
    if (ex.onlyPrepared) nut.appendChild(h("div", { class: "notice", text: "Only 'as prepared' values exist for this product. They are not used here and no per-100g 'as sold' values were substituted." }));
    out.appendChild(nut);

    // ingredients + allergens
    var ingText = p.ingredients_text_en || p.ingredients_text || "";
    var al = FS.off.pretty(p.allergens_tags), tr = FS.off.pretty(p.traces_tags);
    out.appendChild(h("div", { class: "card" }, h("h2", null, "Ingredients", src("Open Food Facts")),
      ingText ? h("p", { text: ingText }) : h("p", { class: "missing", text: "Ingredient list: this field is missing" }),
      h("h3", { text: "Allergens" }),
      al.length ? h("p", { text: al.join(", ") }) : h("p", { class: "missing", text: "No allergens listed in Open Food Facts for this product (this does not mean none are present)." }),
      tr.length ? h("p", { class: "muted", text: "Traces: " + tr.join(", ") }) : null));

    // local score (separate)
    out.appendChild(renderLocalScore(p, ex));

    // Jain (separate)
    var slot = h("div"); out.appendChild(slot);
    lastProduct = { p: p, slot: slot };
    renderJainForProduct(p, slot);
  }

  function renderLocalScore(p, ex) {
    var box = h("div", { class: "card sep" }, h("h2", null, "Locally calculated score", src("calculated here from Open Food Facts per-100g data")));
    box.appendChild(h("p", { class: "muted", text: "Prototype calculation of the official Nutri-Score algorithm (2023 version). Not an official label, not medical advice." }));
    var excl = FS.off.excludedCategory(p.categories_tags);
    if (excl) { box.appendChild(h("p", { class: "missing", text: "Not calculated: this product appears to be in the category '" + excl + "', which has separate Nutri-Score rules not implemented in this prototype." })); return box; }
    var r = FS.nutriscore.compute(ex.inputs);
    if (r.status === "insufficient") {
      box.appendChild(h("div", { class: "notice" }, h("strong", { text: "Insufficient data: no score calculated." }), h("div", { text: "Missing inputs:" }), h("ul", null, r.missing.map(function (m) { return h("li", { text: m }); }))));
      return box;
    }
    if (r.status === "inconsistent") {
      box.appendChild(h("div", { class: "notice" }, h("strong", { text: "Data looks inconsistent: no score calculated." }), h("ul", null, r.issues.map(function (m) { return h("li", { text: m }); }))));
      return box;
    }
    box.appendChild(h("div", { class: "gradeline" }, h("span", { class: "grade " + r.grade.toLowerCase(), text: r.grade }), h("div", null, h("strong", { text: "Score " + r.score }), h("div", { class: "muted", text: r.formula }))));
    var tb = h("tbody");
    ["negative", "positive"].forEach(function (side) {
      tb.appendChild(h("tr", null, h("th", { colspan: "3", text: side === "negative" ? "Negative components (N = " + r.negative + ")" : "Positive components (P = " + r.positive + ")" })));
      r.rows.filter(function (x) { return x.side === side; }).forEach(function (x) {
        tb.appendChild(h("tr", null, h("td", null, x.rule, h("div", { class: "muted", text: x.rule_text })), h("td", { text: x.value }),
          h("td", { class: "num", text: (x.counted ? x.points : "0 (" + x.points + " not counted)") + " / " + x.max })));
      });
    });
    box.appendChild(h("details", { open: "" }, h("summary", { text: "Why this score" }), h("table", null, tb), h("p", { class: "muted", text: "Grade bands: " + r.bands + "." })));
    if (ex.notes.length) box.appendChild(h("p", { class: "muted", text: "Input notes: " + ex.notes.join("; ") + "." }));
    box.appendChild(h("p", { class: "disclaimer", text: "General-foods rules only. Category is taken from Open Food Facts tags; products in beverage, cheese, fat/oil, water, salt or red meat categories are not scored." }));
    return box;
  }

  // ---- Jain rendering
  function honeyOpt() { return $("honey-flag").checked ? "not_jain" : "unknown"; }
  function renderJain(result, sourceLabel) {
    var box = h("div", { class: "card sep" }, h("h2", null, "Jain suitability check", src(sourceLabel)));
    box.appendChild(h("p", { class: "muted", text: "Screening aid only, not a certification - verify with your own dietary authority." }));
    box.appendChild(h("div", { class: "badge " + result.level, text: result.verdict }));
    result.reasons.forEach(function (r) { box.appendChild(h("p", { class: "muted", text: r })); });
    if (result.traceNote) box.appendChild(h("div", { class: "notice", text: result.traceNote }));
    if (result.rows.length) {
      var labels = { ok: "plant/dairy/mineral/synthetic", not_jain: "not Jain", unknown: "unknown" };
      box.appendChild(h("details", null, h("summary", { text: "Per-ingredient classification (" + result.rows.length + ")" }),
        h("table", null, h("tbody", null, result.rows.map(function (r) {
          return h("tr", null, h("td", null, r.text, h("div", { class: "muted", text: r.why })), h("td", null, h("span", { class: "pill " + r.cls, text: labels[r.cls] })));
        })))));
    }
    return box;
  }
  function renderJainForProduct(p, slot) {
    clear(slot);
    var text = p.ingredients_text_en || p.ingredients_text || "";
    var n = FS.ingredients.parse(text).items.length, hasAllergens = (p.allergens_tags || []).length > 0;
    var short = text && n <= 2 && hasAllergens;
    var res = FS.jain.analyse({ text: text, confidence: short ? "low" : "ok", confidenceNote: "The Open Food Facts ingredient list has only " + n + " item(s) but lists allergens, so it looks incomplete. Compare with the pack.", source: "Open Food Facts" }, { honey: honeyOpt() });
    res.reasons.push("Ingredient text comes from a crowd-sourced database and can be incomplete or outdated. Compare with the pack.");
    slot.appendChild(renderJain(res, "ingredients from Open Food Facts"));
  }

  // ---- label photo + OCR
  var photoUrl = null;
  $("photo").onchange = function () {
    var f = this.files && this.files[0], img = $("photo-preview"), err = $("photo-error");
    img.hidden = true; err.hidden = true; img.removeAttribute("src"); $("ocr-run").disabled = true;
    if (photoUrl) { URL.revokeObjectURL(photoUrl); photoUrl = null; }
    if (!f) return;
    img.onload = function () { img.hidden = false; $("ocr-run").disabled = false; };
    img.onerror = function () {
      img.hidden = true; $("ocr-run").disabled = true;
      err.textContent = "Could not read this file as an image. Choose a JPG, PNG or similar photo.";
      err.hidden = false;
    };
    try { photoUrl = URL.createObjectURL(f); img.src = photoUrl; }
    catch (e) { img.onerror(); }
  };
  function loadTesseract() {
    if (window.Tesseract) return Promise.resolve();
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
      s.onload = res; s.onerror = function () { rej(new Error("Could not load Tesseract.js from the CDN (offline?)")); };
      document.head.appendChild(s);
    });
  }
  $("ocr-run").onclick = function () {
    var f = $("photo").files[0]; if (!f) return;
    var btn = this, st = $("ocr-status"), pr = $("ocr-progress");
    btn.disabled = true; pr.hidden = false; pr.value = 0; st.textContent = "Loading OCR engine...";
    loadTesseract().then(function () {
      return Tesseract.createWorker("eng", 1, {
        langPath: "https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int",
        logger: function (m) { if (m.status === "recognizing text") { pr.value = Math.round(m.progress * 100); st.textContent = "Reading text... " + pr.value + "%"; } else st.textContent = m.status; }
      });
    }).then(function (worker) {
      return worker.recognize(f).then(function (r) { return worker.terminate().then(function () { return r; }); });
    }).then(function (r) {
      var words = (r.data.words || []), low = words.filter(function (w) { return w.confidence < OCR_LOW_WORD; }).length;
      ocr = { confidence: r.data.confidence, lowShare: words.length ? low / words.length : 1, edited: false, original: r.data.text.trim(), fromOcr: true, words: words.length, lowWords: low };
      $("label-text").value = ocr.original; $("confirm-text").checked = false;
      $("text-source").textContent = "your photo, read by Tesseract.js OCR (not yet checked)";
      st.textContent = "Done. Check the text below against the label."; pr.hidden = true; renderOcrMeta();
    }).catch(function (e) { st.textContent = "OCR failed: " + e.message; pr.hidden = true; }).then(function () { btn.disabled = false; });
  };
  function ocrIsLow() {
    if (!ocr.fromOcr) return false;
    return ocr.confidence < OCR_LOW_CONF || ocr.lowShare > OCR_LOW_SHARE;
  }
  function renderOcrMeta() {
    var m = clear($("ocr-meta"));
    if (!ocr.fromOcr) return;
    var low = ocrIsLow();
    m.appendChild(h("div", { class: "notice" },
      "OCR confidence: " + Math.round(ocr.confidence) + "% (" + ocr.lowWords + " of " + ocr.words + " words below " + OCR_LOW_WORD + "%). ",
      low ? "This is low. Treat the text as unreliable until you have corrected it." : "OCR can still misread letters. Check it yourself."));
  }
  $("label-text").oninput = function () {
    if (ocr.fromOcr && this.value !== ocr.original) { ocr.edited = true; $("text-source").textContent = "your photo (OCR), edited by you"; }
    if (!ocr.fromOcr) $("text-source").textContent = "text entered by you";
  };
  $("sample-gelatin").onclick = function () { setSample(SAMPLES.gelatin); };
  $("sample-ambiguous").onclick = function () { setSample(SAMPLES.ambiguous); };
  function setSample(t) { ocr = { fromOcr: false }; clear($("ocr-meta")); $("label-text").value = t; $("text-source").textContent = "built-in sample text (not from a real label)"; $("confirm-text").checked = true; analyseLabel(); }

  function analyseLabel() {
    var text = $("label-text").value, out = clear($("label-result"));
    var conf = "ok", note = null, confirmed = $("confirm-text").checked;
    if (ocr.fromOcr && ocrIsLow() && !confirmed) { conf = "low"; note = "OCR confidence is low (" + Math.round(ocr.confidence) + "%). Edit the text to match the label and tick the confirmation box."; }
    else if (!confirmed) { conf = "unverified"; note = "Tick the confirmation box once the text matches the label and is complete."; }
    var label = ocr.fromOcr ? (ocr.edited ? "your photo via OCR, edited by you" : "your photo via OCR") : "text entered by you";
    var res = FS.jain.analyse({ text: text, confidence: conf, confidenceNote: note, source: label }, { honey: honeyOpt() });
    out.appendChild(renderJain(res, label));
    if (ocr.fromOcr) out.appendChild(h("p", { class: "muted", text: "OCR confidence " + Math.round(ocr.confidence) + "%. " + (ocr.edited ? "Text was edited after OCR." : "") }));
  }
  $("analyse").onclick = analyseLabel;
})();
