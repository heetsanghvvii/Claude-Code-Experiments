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
    if (which !== "barcode") stopScan();
    ["barcode", "compare", "label"].forEach(function (t) {
      $("tab-" + t).setAttribute("aria-selected", String(t === which)); $("panel-" + t).hidden = t !== which;
    });
    if (which === "compare") initCompare();
  }
  $("tab-barcode").onclick = function () { selectTab("barcode"); };
  $("tab-compare").onclick = function () { selectTab("compare"); };
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
    if (lastProduct && lastProduct.slot) renderJainForProduct(lastProduct.p, lastProduct.slot);
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
    stopScan();
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

    var ex = FS.off.extractInputs(p.nutriments), x = ex.inputs;
    var ingText = p.ingredients_text_en || p.ingredients_text || "";

    // 1. Your targets, 2. Protein value (both separate from every score)
    var tSlot = h("div"); out.appendChild(tSlot);
    var vSlot = h("div"); out.appendChild(vSlot);
    lastProduct = { p: p, ex: ex, ingText: ingText, tSlot: tSlot, vSlot: vSlot };
    renderTargetsBox();
    vSlot.appendChild(renderValue(p, ex));

    // 3. nutrition table
    var rows = [["Energy", x.energyKj != null ? fmt(x.energyKj, "kJ") + (ex.kcal != null ? " / " + fmt(ex.kcal, "kcal") : "") : (ex.kcal != null ? fmt(ex.kcal, "kcal") : null)],
      ["Fat", fmt(x.fat, "g")], ["Saturated fat", fmt(x.satFat, "g")], ["Carbohydrates", fmt(x.carbs, "g")], ["Sugars", fmt(x.sugars, "g")],
      ["Protein", fmt(x.protein, "g")], ["Salt", fmt(x.salt, "g")], ["Fibre", fmt(x.fibre, "g")]];
    var B = FS.bands, chips = {
      "Fat": B.lmh("fat", x.fat), "Saturated fat": B.lmh("satFat", x.satFat), "Sugars": B.lmh("sugars", x.sugars), "Salt": B.lmh("salt", x.salt),
      "Protein": B.protein(x.protein, ex.kcal), "Fibre": B.fibre(x.fibre)
    };
    var tbl = h("table", null, h("tbody", null, rows.map(function (r) {
      var c = chips[r[0]], isLmh = ["Fat", "Saturated fat", "Sugars", "Salt"].indexOf(r[0]) !== -1;
      return h("tr", null, h("th", { text: r[0] }), h("td", { class: "num" }, r[1] != null ? r[1] : h("span", { class: "missing", text: "this field is missing" })),
        h("td", null, c ? h("span", { class: "chip " + c.level, text: isLmh ? c.word : c.word }) : null));
    })));
    var nut = h("div", { class: "card" }, h("h2", null, "Nutrition per 100g", src("Open Food Facts")), tbl);
    nut.appendChild(h("p", { class: "muted", text: "Colour chips: " + B.NOTES.uk + " " + B.NOTES.eu + " Protein share of energy is protein g x 4 / kcal and needs kcal. The words, not only the colours, carry the meaning. These are published thresholds, not a health verdict by this app." }));
    if (ex.notes.length) nut.appendChild(h("p", { class: "muted", text: "Notes: " + ex.notes.join("; ") + "." }));
    if (ex.onlyPrepared) nut.appendChild(h("div", { class: "notice", text: "Only 'as prepared' values exist for this product. They are not used here and no per-100g 'as sold' values were substituted." }));
    out.appendChild(nut);

    // 4. ingredients + allergens
    var al = FS.off.pretty(p.allergens_tags), tr = FS.off.pretty(p.traces_tags);
    out.appendChild(h("div", { class: "card" }, h("h2", null, "Ingredients", src("Open Food Facts")),
      ingText ? h("p", { text: ingText }) : h("p", { class: "missing", text: "Ingredient list: this field is missing" }),
      h("h3", { text: "Allergens" }),
      al.length ? h("p", { text: al.join(", ") }) : h("p", { class: "missing", text: "No allergens listed in Open Food Facts for this product (this does not mean none are present)." }),
      tr.length ? h("p", { class: "muted", text: "Traces: " + tr.join(", ") }) : null));

    // 5. the three separate score boxes (never blended)
    var g = p.nutriscore_grade, has = /^[a-e]$/.test(g || "");
    var offBox = h("div", { class: "card sep" }, h("h2", null, "Nutri-Score grade from Open Food Facts", src("Open Food Facts")));
    if (has) offBox.appendChild(h("div", { class: "gradeline" }, h("span", { class: "grade " + g, text: g.toUpperCase() }), h("span", { class: "muted", text: "Supplied by Open Food Facts. We did not calculate it." })));
    else offBox.appendChild(h("p", { class: "missing", text: g === "not-applicable" ? "Open Food Facts marks Nutri-Score as not applicable for this product." : "Open Food Facts has no Nutri-Score grade for this product." }));
    out.appendChild(offBox);
    out.appendChild(renderLocalScore(p, ex));
    out.appendChild(renderCustomScore(p, ex));

    // 6. Jain (separate, last)
    var slot = h("div"); out.appendChild(slot);
    lastProduct.slot = slot;
    renderJainForProduct(p, slot);
  }

  // ---- your targets (stored in this browser only)
  var TKEYS = ["protein", "sugars", "satFat", "salt", "fibre", "kcal", "exclude"];
  var T_STORE = "fs.targets.v1";
  var targets = {};
  function storeGet() { try { var v = localStorage.getItem(T_STORE); return v ? JSON.parse(v) : {}; } catch (e) { return {}; } }
  function storeSet(o) { try { localStorage.setItem(T_STORE, JSON.stringify(o)); } catch (e) { /* storage unavailable: targets last for this visit only */ } }
  function countTargets() { return FS.targets.evaluate(targets, {}, "").length; }
  function updateTargetsSummary() { var n = countTargets(); $("targets-summary").textContent = "Your targets (" + (n ? n + " set" : "optional") + ")"; }
  (function initTargets() {
    var saved = storeGet();
    TKEYS.forEach(function (k) {
      var v = saved && typeof saved[k] === "string" ? saved[k] : "";
      targets[k] = v; $("t-" + k).value = v;
      $("t-" + k).oninput = function () { targets[k] = this.value; storeSet(targets); updateTargetsSummary(); renderTargetsBox(); };
    });
    $("targets-clear").onclick = function () { TKEYS.forEach(function (k) { targets[k] = ""; $("t-" + k).value = ""; }); storeSet(targets); updateTargetsSummary(); renderTargetsBox(); };
    updateTargetsSummary();
    if (countTargets()) $("targets-box").open = true;
  })();

  function renderTargetsBox() {
    if (!lastProduct) return;
    var slot = clear(lastProduct.tSlot), ex = lastProduct.ex, x = ex.inputs;
    var nutrition = { protein: x.protein, sugars: x.sugars, satFat: x.satFat, salt: x.salt, fibre: x.fibre, kcal: ex.kcal };
    var res = FS.targets.evaluate(targets, nutrition, lastProduct.ingText);
    var box = h("div", { class: "card sep" }, h("h2", null, "Your targets", src("your targets vs Open Food Facts data")));
    box.appendChild(h("p", { class: "muted", text: "These targets are your own. The app makes no health statement about them or about this product." }));
    if (!res.length) box.appendChild(h("p", { class: "missing", text: "No targets set. Open \"Your targets\" above the results and type your own numbers." }));
    else {
      var cls = { "met": "met", "not met": "notmet" };
      box.appendChild(h("table", null, h("tbody", null, res.map(function (r) {
        var val;
        if (r.key.indexOf("exclude:") === 0) val = r.found === null ? h("span", { class: "missing", text: "ingredient list is missing" }) : (r.found ? "found in ingredients" : "not found in ingredients");
        else val = r.value != null ? "label: " + fmt(r.value, r.unit) : h("span", { class: "missing", text: "this field is missing" });
        return h("tr", null, h("td", null, r.rule), h("td", null, val), h("td", null, h("span", { class: "pill " + (cls[r.outcome] || "cannot"), text: r.outcome })));
      }))));
    }
    slot.appendChild(box);
  }

  // ---- protein value (formula inputs always shown; nothing guessed)
  function renderValue(p, ex) {
    var box = h("div", { class: "card sep" }, h("h2", null, "Protein value", src("calculated here from Open Food Facts data")));
    var protein = ex.inputs.protein, kcal = ex.kcal;
    var a = FS.value.proteinPer100kcal(protein, kcal);
    box.appendChild(h("h3", { text: "Protein per 100 kcal" }));
    if (a.status === "ok") box.appendChild(h("div", null, h("span", { class: "big", text: a.value + " g" }), h("div", { class: "muted", text: "Formula: " + a.formula + " = " + a.value + " g per 100 kcal" })));
    else box.appendChild(h("p", { class: "missing", text: a.reason + "." }));

    box.appendChild(h("h3", null, "Protein per Rs 100", src("price entered by you")));
    var pk = FS.value.packGrams(p.product_quantity, p.product_quantity_unit, p.quantity);
    var grams = pk.grams, wInput = null;
    if (grams !== null) box.appendChild(h("div", { class: "muted", text: "Pack weight: " + grams + " g (from Open Food Facts product quantity)" }));
    else {
      var why = pk.reason === "ml" ? "This is a millilitre product, so per-rupee protein by weight is not calculated for it. " : (pk.reason === "unit unknown" ? "Open Food Facts gives a pack size without a gram unit. " : "Open Food Facts has no pack weight for this product. ");
      box.appendChild(h("p", { class: pk.reason === "ml" ? "notice" : "muted", text: why + (pk.reason === "ml" ? "" : "Type the weight from the pack.") }));
      if (pk.reason !== "ml") { wInput = h("input", { id: "pack-g", inputmode: "decimal", placeholder: "grams" }); box.appendChild(h("div", { class: "kv" }, h("label", { for: "pack-g", text: "Pack weight (g)" }), wInput)); }
    }
    var result = h("div", { "aria-live": "polite" });
    if (pk.reason !== "ml") {
      var mInput = h("input", { id: "mrp", inputmode: "decimal", placeholder: "from the pack" });
      box.appendChild(h("div", { class: "kv" }, h("label", { for: "mrp", text: "Price (MRP, Rs)" }), mInput));
      box.appendChild(h("p", { class: "muted", text: "Open Food Facts has no prices. Type the MRP printed on the pack." }));
      box.appendChild(result);
      var upd = function () {
        clear(result);
        var w = grams !== null ? grams : (wInput ? FS.targets.parseTarget(wInput.value) : null);
        var m = FS.targets.parseTarget(mInput.value);
        if (m === 0) m = null;
        if (m === null && mInput.value.trim() === "" && (wInput === null || wInput.value.trim() === "")) { result.appendChild(h("p", { class: "missing", text: "Enter the price to see protein per Rs 100." })); return; }
        var r = FS.value.proteinPerRs100(protein, w, m);
        if (r.status === "ok") result.appendChild(h("div", null, h("span", { class: "big", text: r.value + " g per Rs 100" }),
          h("div", { class: "muted", text: "Formula: " + r.formula + " = " + r.value + " g. Protein in the pack: " + (Math.round(r.packProtein * 10) / 10) + " g. Price entered by you." })));
        else result.appendChild(h("p", { class: "missing", text: r.reason + "." }));
      };
      mInput.oninput = upd; if (wInput) wInput.oninput = upd; upd();
    }

    // category position (needs data/protein-india.json)
    var pos = h("div", { class: "rank" });
    box.appendChild(h("h3", null, "Position in category", src("Open Food Facts contributors, ODbL")));
    box.appendChild(pos);
    pos.appendChild(h("p", { class: "muted", text: "Loading category data..." }));
    loadCategoryData().then(function (d) {
      clear(pos);
      var keys = FS.value.matchCategories(p.categories_tags, d.categories);
      // One category only: the one whose snapshot lists this barcode, else the first tag match.
      var home = Object.keys(d.categories || {}).filter(function (k) {
        return ((d.categories[k] && d.categories[k].products) || []).some(function (x) { return x && String(x.code) === String(p.code); });
      });
      if (home.length) keys = [home[0]]; else if (keys.length > 1) keys = [keys[0]];
      if (!keys.length) { pos.appendChild(h("p", { class: "muted", text: "This product's Open Food Facts categories do not match any category in the comparison data." })); return; }
      var myRatio = FS.value.ratio({ proteins_100g: protein, energy_kcal_100g: kcal });
      keys.forEach(function (k) {
        var c = d.categories[k];
        if (myRatio === null) { pos.appendChild(h("p", { class: "missing", text: "Position in " + c.label + " not shown: " + a.reason + "." })); return; }
        var ps = FS.value.position(c.products, myRatio, p.code);
        var txt = (ps.tiedWith ? "Joint " : "") + FS.value.ordinal(ps.rank) + (ps.tiedWith ? " (tied with " + ps.tiedWith + " other" + (ps.tiedWith > 1 ? "s" : "") + ")" : "") + " of " + ps.of + " by protein per 100 kcal in " + c.label + " (products with data)";
        pos.appendChild(h("p", { text: txt }));
      });
      pos.appendChild(h("p", { class: "muted", text: "This orders one number. It is not a judgement of quality. Data snapshot generated " + (d.generated || "date not stated") + "." }));
    }, function () { clear(pos); pos.appendChild(h("p", { class: "missing", text: "Category data not available" })); });
    return box;
  }

  // ---- category data (loaded on demand, optional)
  var catPromise = null, mrpPromise = null;
  function loadCategoryData() {
    if (!catPromise) catPromise = fetch("data/protein-india.json").then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (d) {
      if (!d || typeof d.categories !== "object" || d.categories === null) throw new Error("bad format");
      return d;
    });
    catPromise.catch(function () { catPromise = null; });
    return catPromise;
  }
  function loadMrpData() {
    if (!mrpPromise) mrpPromise = fetch("data/seed-mrp.json").then(function (r) { if (!r.ok) throw new Error("none"); return r.json(); })
      .then(function (d) { if (!Array.isArray(d)) throw new Error("bad"); return d; });
    mrpPromise.catch(function () { mrpPromise = null; });
    return mrpPromise;
  }

  // ---- compare a category
  var compareReady = false;
  function initCompare() {
    if (compareReady) return;
    var out = clear($("compare-result")), sel = $("cat-select");
    out.appendChild(h("p", { class: "muted", text: "Loading category data..." }));
    loadCategoryData().then(function (d) {
      compareReady = true; clear(out);
      Object.keys(d.categories).forEach(function (k) { var o = h("option", { value: k, text: d.categories[k].label || k }); sel.appendChild(o); });
      sel.onchange = function () { renderCompare(d, sel.value); };
      out.appendChild(h("p", { class: "muted", text: "Choose a category above." }));
    }, function () {
      clear(out); sel.disabled = true;
      out.appendChild(h("div", { class: "card" }, h("p", { class: "missing", text: "Category data not available" }), h("p", { class: "muted", text: "The rest of the app still works." })));
    });
  }
  function safeLink(url, text) { return /^https:\/\//.test(url || "") ? h("a", { href: url, target: "_blank", rel: "noopener noreferrer", text: text }) : h("span", { text: text }); }
  function renderCompare(d, key) {
    var out = clear($("compare-result"));
    if (!key || !d.categories[key]) return;
    var c = d.categories[key], rk = FS.value.rankCategory(c.products), CAP = 200;
    var card = h("div", { class: "card" }, h("h2", null, c.label || key, src("Open Food Facts")));
    card.appendChild(h("p", { class: "muted", text: rk.rows.length + " products have both protein and energy and are ordered by protein per 100 kcal, highest first. " + rk.leftOut + " of " + rk.total + " products were left out because protein or energy is missing. This orders one number, it is not a judgement of any product." }));
    if (!rk.rows.length) card.appendChild(h("p", { class: "missing", text: "insufficient data: no products with both fields." }));
    else {
      var shown = rk.rows.slice(0, CAP);
      card.appendChild(h("div", { class: "scroll-x" }, h("table", { class: "cmp" },
        h("thead", null, h("tr", null, h("th", { text: "Product" }), h("th", { class: "num", text: "Protein g/100g" }), h("th", { class: "num", text: "kcal /100g" }), h("th", { class: "num", text: "Sugars g/100g" }), h("th", { class: "num", text: "Protein per 100 kcal" }))),
        h("tbody", null, shown.map(function (r) {
          var p = r.product, name = p.name || "name missing";
          var tr = h("tr", null,
            h("td", null, p.code ? h("button", { type: "button", class: "rowbtn", text: name }) : h("span", { text: name }), h("small", { text: (p.brand || "brand missing") + (p.quantity ? ", " + p.quantity : "") })),
            h("td", { class: "num", text: fmt(p.proteins_100g) }), h("td", { class: "num", text: fmt(p.energy_kcal_100g) }),
            p.sugars_100g != null ? h("td", { class: "num", text: fmt(p.sugars_100g) }) : h("td", { class: "num" }, h("span", { class: "missing", text: "missing" })),
            h("td", { class: "num" }, h("strong", { text: r.value.toFixed(1) })));
          if (p.code) tr.onclick = function () { selectTab("barcode"); $("barcode").value = p.code; lookup(String(p.code)); window.scrollTo(0, 0); };
          return tr;
        })))));
      if (rk.rows.length > CAP) card.appendChild(h("p", { class: "muted", text: "Showing the first " + CAP + " of " + rk.rows.length + "." }));
      card.appendChild(h("p", { class: "muted", text: "Tap a row to look up that barcode." }));
    }
    card.appendChild(h("p", { class: "disclaimer" }, "Source: " + (d.source || "Open Food Facts contributors") + ". Data generated " + (d.generated || "date not stated") + ". ", d.source_url ? safeLink(d.source_url, "Open Food Facts") : null));
    out.appendChild(card);

    loadMrpData().then(function (all) {
      var recs = all.filter(function (r) { return r && typeof r.category === "string" && (r.category === key || r.category.toLowerCase() === String(c.label || "").toLowerCase()); });
      if (!recs.length) return;
      var m = FS.value.rankMrp(recs);
      if (!m.rows.length) return;
      var box = h("div", { class: "card" }, h("h2", null, "Protein per Rs 100 (MRP from brand sites)", src("prices from brand sites, checked on the dates shown")));
      box.appendChild(h("p", { class: "muted", text: "Prices change and may differ by shop. Protein per Rs 100 = (protein per 100 g x pack grams / 100) / MRP x 100." }));
      box.appendChild(h("div", { class: "scroll-x" }, h("table", { class: "cmp" },
        h("thead", null, h("tr", null, h("th", { text: "Product" }), h("th", { class: "num", text: "Pack g" }), h("th", { class: "num", text: "MRP Rs" }), h("th", { class: "num", text: "Protein per Rs 100" }), h("th", { text: "Source" }))),
        h("tbody", null, m.rows.map(function (r) {
          var x = r.rec;
          return h("tr", null, h("td", null, x.name || "name missing", h("small", { text: x.brand || "brand missing" })), h("td", { class: "num", text: fmt(x.pack_g) }), h("td", { class: "num", text: fmt(x.mrp_inr) }),
            h("td", { class: "num" }, h("strong", { text: r.value.toFixed(1) })), h("td", null, safeLink(x.source_url, "brand site"), h("small", { text: "checked " + (x.checked || "date missing") })));
        })))));
      if (m.skipped) box.appendChild(h("p", { class: "muted", text: m.skipped + " entries were left out because a number is missing." }));
      out.appendChild(box);
    }, function () { /* optional file absent: show nothing */ });
  }

  // ---- camera scanning
  function stopScan() { if (FS.scan) FS.scan.stop(); $("scan-box").hidden = true; }
  $("scan-btn").onclick = function () {
    var err = $("scan-error"); err.hidden = true;
    $("scan-box").hidden = false;
    var handle = FS.scan.start({
      video: $("scan-video"),
      onStatus: function (t) { $("scan-status").textContent = t; },
      onError: function (t) { $("scan-box").hidden = true; err.textContent = t; err.hidden = false; },
      onCode: function (code) {
        $("scan-box").hidden = true;
        $("barcode").value = code;
        lookup(String(code).trim());
      }
    });
    if (!handle) $("scan-box").hidden = true;
  };
  $("scan-cancel").onclick = stopScan;
  window.addEventListener("pagehide", stopScan);

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("sw.js").catch(function () { /* app works without it */ });
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

  function renderCustomScore(p, ex) {
    var box = h("div", { class: "card sep" }, h("h2", null, "Macro Score", src("calculated here from Open Food Facts per-100g data")));
    box.appendChild(h("p", { class: "muted", text: "Project formula for fitness-focused label reading. Not Nutri-Score, not an official rating, not medical advice. Separate from the other scores." }));
    var r = FS.customScore.compute(Object.assign({ kcal: ex.kcal }, ex.inputs), FS.nutriscore.plausibility);
    if (r.status === "insufficient") { box.appendChild(h("div", { class: "notice" }, h("strong", { text: "Insufficient data: no score calculated." }), h("div", { text: "Missing inputs:" }), h("ul", null, r.missing.map(function (m) { return h("li", { text: m }); })))); return box; }
    if (r.status === "inconsistent") { box.appendChild(h("div", { class: "notice" }, h("strong", { text: "Data looks inconsistent: no score calculated." }), h("ul", null, r.issues.map(function (m) { return h("li", { text: m }); })))); return box; }
    box.appendChild(h("div", { class: "gradeline" }, h("span", { class: "scorebig" }, h("strong", { class: "big", text: "Macro Score " + r.score + " / 100" }), h("span", { class: "chip " + r.level, text: r.band })), h("span", { class: "muted", text: r.formula })));
    box.appendChild(h("details", { open: "" }, h("summary", { text: "Why this score" }), h("table", null, h("tbody", null, r.rows.map(function (x) {
      return h("tr", null, h("td", null, x.rule, h("div", { class: "muted", text: x.rule_text })), h("td", { text: x.value }), h("td", { class: "num", text: x.points + " / " + x.max }));
    }))), h("p", { class: "muted", text: "Bands: 70 to 100 High (green), 40 to 69 Mid (amber), 0 to 39 Low (red). The words describe the score only. Weights and anchors are in custom-score.js." })));
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
