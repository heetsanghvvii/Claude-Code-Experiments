/* Editable rule list for the Jain screening aid. Screening aid only, not a certification.
 * Edit terms freely. Matching is on whole words, case-insensitive; a trailing "s"/"es" is tolerated.
 * The longest matching phrase wins ("soy lecithin" beats "lecithin"). Within equal evidence the most
 * restrictive class wins (not_jain > unknown > ok).
 *
 * cls: "not_jain" | "unknown" | "ok" | "honey" (resolved by config.honey)
 */
(function (root) {
  "use strict";
  var RULES = {
    version: "0.1",
    // honey: "not_jain" (treat bee products as not Jain) or "unknown" (practices differ, cannot decide)
    config: { honey: "not_jain" },

    groups: [
      { id: "meat_fish_egg", cls: "not_jain", label: "Meat, fish, egg and animal derivatives", terms: [
        "meat", "beef", "pork", "chicken", "mutton", "lamb", "turkey", "bacon", "ham", "sausage", "salami", "pepperoni",
        "fish", "fish sauce", "fish oil", "cod liver oil", "anchovy", "anchovies", "tuna", "salmon", "sardine", "shrimp", "prawn", "crab", "lobster",
        "squid", "oyster", "oyster sauce", "clam", "mussel", "caviar", "roe", "krill",
        "egg", "egg white", "egg yolk", "egg powder", "albumen", "lysozyme", "ovalbumin",
        "gelatin", "gelatine", "collagen", "bone", "bone phosphate", "bone char", "bone meal", "isinglass",
        "lard", "tallow", "suet", "animal fat", "animal oil", "chicken fat", "beef fat", "pork fat", "shortening of animal origin",
        "animal rennet", "pepsin", "bone broth", "meat extract", "chicken extract", "beef extract",
        "cochineal", "carmine", "carminic acid", "natural red 4", "shellac", "lac resin", "confectioner's glaze", "lanolin"
      ] },
      { id: "root_vegetables", cls: "not_jain", label: "Root vegetables, bulbs and allium", terms: [
        "onion", "garlic", "potato", "carrot", "radish", "beetroot", "beet", "turnip", "sweet potato", "yam", "leek", "shallot",
        "spring onion", "scallion", "chive", "parsnip", "celeriac", "colocasia", "arbi", "suran", "elephant foot yam",
        "potato starch", "potato flour", "dehydrated potato", "dehydrated onion", "onion powder", "garlic powder", "garlic paste", "ginger garlic paste",
        "beetroot extract", "beet sugar"
      ] },
      { id: "alcohol", cls: "not_jain", label: "Alcohol", terms: [
        "alcohol", "ethanol", "wine", "beer", "rum", "whisky", "whiskey", "brandy", "vodka", "gin", "liquor", "liqueur", "sake", "mirin", "cider", "spirit", "red wine", "white wine", "rum flavour"
      ] },
      { id: "bee_products", cls: "honey", label: "Honey and bee products (practices differ; see config.honey)", terms: [
        "honey", "beeswax", "royal jelly", "propolis", "bee pollen"
      ] },
      { id: "practices_differ", cls: "unknown", reason: "practices differ between Jain traditions", label: "Items where practices differ", terms: [
        "ginger", "turmeric", "mushroom", "tapioca", "cassava", "arrowroot", "yeast", "yeast extract", "vinegar", "malt vinegar", "vanilla extract", "baker's yeast"
      ] },
      { id: "unstated_origin", cls: "unknown", reason: "origin unstated", label: "Additives, enzymes, emulsifiers and flavours of unstated origin", terms: [
        "lecithin", "emulsifier", "stabiliser", "stabilizer", "enzyme", "enzymes", "rennet", "microbial rennet", "cheese", "whey", "whey powder", "whey protein",
        "flavour", "flavouring", "flavor", "flavoring", "natural flavour", "natural flavouring", "natural flavor", "nature identical flavouring", "nature identical flavouring substances",
        "artificial flavour", "artificial flavouring", "added flavour", "added flavor", "natural and artificial flavour",
        "mono and diglycerides", "mono- and diglycerides", "monoglycerides", "diglycerides", "glycerol", "glycerin", "glycerine",
        "stearic acid", "magnesium stearate", "calcium stearate", "vitamin d3", "vitamin d", "vitamin a", "omega 3", "omega-3",
        "starch", "modified starch", "spice extract", "seasoning", "stock", "broth", "bouillon", "gravy", "marshmallow", "mayonnaise",
        "worcestershire sauce", "l-cysteine", "cysteine", "glucosamine", "lipase", "protease", "trypsin", "lactase",
        "colour", "color", "permitted natural colour", "permitted synthetic food colour", "permitted colour", "preservative", "antioxidant", "humectant",
        "raising agent", "acidity regulator", "thickener", "anticaking agent", "flavour enhancer", "glazing agent", "bulking agent", "sweetener", "firming agent"
      ] },
      { id: "plant_synthetic", cls: "ok", label: "Clearly plant, dairy, mineral or synthetic", terms: [
        "soy lecithin", "soya lecithin", "soybean lecithin", "sunflower lecithin", "water", "salt", "iodised salt", "iodized salt", "edible common salt", "common salt", "rock salt", "sea salt", "potassium iodate", "sugar", "cane sugar", "invert sugar", "invert sugar syrup", "glucose", "glucose syrup", "liquid glucose",
        "fructose", "dextrose", "maltodextrin", "jaggery", "corn syrup", "high fructose corn syrup", "maltose", "molasses",
        "wheat", "wheat flour", "refined wheat flour", "maida", "atta", "whole wheat flour", "wheat gluten", "gluten", "semolina", "rava", "suji", "flour",
        "rice", "rice flour", "rice meal", "rice bran", "poha", "corn", "corn flour", "corn meal", "maize", "edible maize starch", "maize starch", "corn starch", "cornflour",
        "oats", "barley", "millet", "ragi", "jowar", "bajra", "quinoa", "malt extract", "barley malt extract",
        "chickpea flour", "gram flour", "besan", "moong dal", "dal", "lentil", "pulses", "peas", "chickpea", "soya", "soy", "soybean", "soya flour", "soy protein", "soy sauce", "tofu",
        "palm oil", "palmolein", "palm olein", "refined palm oil", "palm kernel oil", "sunflower oil", "groundnut oil", "peanut oil", "mustard oil", "rice bran oil", "soybean oil", "coconut oil", "sesame oil", "cottonseed oil",
        "vegetable oil", "edible vegetable oil", "refined vegetable oil", "vegetable fat", "edible vegetable fat", "hydrogenated vegetable fat", "cocoa butter", "shea butter",
        "cocoa", "cocoa solids", "cocoa powder", "cocoa mass", "chocolate", "milk chocolate", "dark chocolate",
        "milk", "milk solids", "milk powder", "skimmed milk powder", "skim milk powder", "whole milk powder", "condensed milk", "cream", "butter", "ghee", "curd", "yogurt", "yoghurt", "paneer", "buttermilk", "milk fat", "casein", "lactose",
        "spices", "spices and condiments", "condiments", "cumin", "chilli", "chili", "red chilli", "chilli powder", "black pepper", "pepper", "coriander", "cardamom", "clove", "cloves", "cinnamon", "asafoetida", "hing", "fenugreek", "mustard", "mustard seeds", "nutmeg", "fennel", "bay leaf", "curry leaf", "dried mango powder", "amchur", "tamarind", "cumin seeds", "carom", "ajwain",
        "tomato", "tomato paste", "tomato powder", "spinach", "capsicum", "cabbage", "cauliflower", "peas", "beans", "coriander leaves", "mint", "lemon", "lime", "orange", "apple", "mango", "pineapple", "banana", "grape", "fruit", "fruits", "vegetables", "fruit juice", "fruit pulp", "mango pulp", "juice concentrate",
        "cashew", "cashew nut", "almond", "peanut", "groundnut", "hazelnut", "walnut", "pistachio", "coconut", "desiccated coconut", "coconut milk", "sesame", "sesame seeds", "raisin", "raisins", "dates", "nuts", "seeds", "sunflower seeds", "flax seeds",
        "citric acid", "ascorbic acid", "vitamin c", "malic acid", "tartaric acid", "baking soda", "sodium bicarbonate", "baking powder", "ammonium bicarbonate", "calcium carbonate", "sodium carbonate", "potassium carbonate", "sodium chloride", "potassium chloride",
        "tea", "coffee", "instant coffee", "chicory", "carbon dioxide", "carbonated water", "calcium chloride", "magnesium chloride", "iron", "zinc", "niacin", "folic acid", "thiamine", "riboflavin"
      ] }
    ],

    // Phrases such as "Emulsifier (E471)". When a functional class has bracketed children, the children
    // are classified instead; with no children the bare class word is "unknown" (unstated origin).
    functionalClasses: ["emulsifier", "emulsifiers", "stabiliser", "stabilisers", "stabilizer", "stabilizers", "raising agent", "raising agents",
      "acidity regulator", "acidity regulators", "thickener", "thickeners", "humectant", "humectants", "antioxidant", "antioxidants",
      "preservative", "preservatives", "colour", "colours", "color", "colors", "permitted natural colour", "permitted natural colours", "permitted synthetic food colour", "permitted synthetic food colours",
      "permitted colour", "permitted colours", "added flavour", "added flavours", "flavour", "flavours", "flavouring", "flavourings", "flavour enhancer", "flavour enhancers",
      "anticaking agent", "anticaking agents", "anti-caking agent", "glazing agent", "bulking agent", "sweetener", "sweeteners", "firming agent", "gelling agent", "emulsifying salts", "improver", "improvers",
      "nature identical flavouring substances", "natural flavouring substances", "spices", "spices and condiments", "condiments", "edible vegetable oil", "vegetable oil", "vegetable fat", "minerals", "vitamins", "mineral", "vitamin"],

    // E/INS numbers (base number + optional letter, subtype such as (ii) ignored).
    // Any code NOT listed here is "unknown: additive of unstated origin".
    codes: {
      not_jain: {
        "120": "cochineal / carmine (insect)", "441": "gelatine (animal)", "542": "edible bone phosphate (animal)",
        "901": "beeswax (bee product)", "904": "shellac (insect secretion)", "913": "lanolin (sheep wool)",
        "1105": "lysozyme (egg)", "162": "beetroot red (root vegetable)"
      },
      ok: {
        "102": "tartrazine (synthetic)", "110": "sunset yellow FCF (synthetic)", "122": "carmoisine (synthetic)", "124": "ponceau 4R (synthetic)",
        "129": "allura red (synthetic)", "133": "brilliant blue (synthetic)", "143": "fast green (synthetic)", "150a": "caramel (plant sugars)", "150b": "caramel", "150c": "caramel", "150d": "caramel",
        "160c": "paprika extract (plant)", "160d": "lycopene (tomato)", "160b": "annatto (plant)", "170": "calcium carbonate (mineral)",
        "200": "sorbic acid (synthetic)", "202": "potassium sorbate (synthetic)", "211": "sodium benzoate (synthetic)", "212": "potassium benzoate (synthetic)",
        "220": "sulphur dioxide (synthetic)", "223": "sodium metabisulphite (synthetic)", "260": "acetic acid", "261": "potassium acetate", "262": "sodium acetates", "263": "calcium acetate",
        "296": "malic acid", "297": "fumaric acid", "300": "ascorbic acid", "301": "sodium ascorbate", "330": "citric acid", "331": "sodium citrates", "332": "potassium citrates", "333": "calcium citrates",
        "334": "tartaric acid", "336": "potassium tartrates", "339": "sodium phosphates", "340": "potassium phosphates", "341": "calcium phosphates (mineral)",
        "350": "sodium malates", "400": "alginic acid (seaweed)", "401": "sodium alginate (seaweed)", "402": "potassium alginate (seaweed)", "404": "calcium alginate (seaweed)",
        "406": "agar (seaweed)", "407": "carrageenan (seaweed)", "410": "locust bean gum (plant)", "412": "guar gum (plant)", "413": "tragacanth (plant)", "414": "gum arabic (plant)", "415": "xanthan gum (fermentation)",
        "440": "pectin (plant)", "450": "diphosphates (mineral)", "451": "triphosphates (mineral)", "452": "polyphosphates (mineral)", "460": "cellulose (plant)", "461": "methyl cellulose (plant)", "466": "carboxymethyl cellulose (plant)",
        "500": "sodium carbonates (mineral)", "501": "potassium carbonates (mineral)", "503": "ammonium carbonates (mineral)", "504": "magnesium carbonates (mineral)", "508": "potassium chloride (mineral)", "509": "calcium chloride (mineral)",
        "551": "silicon dioxide (mineral)", "552": "calcium silicate (mineral)", "553": "talc / magnesium silicates (mineral)", "554": "sodium aluminium silicate (mineral)",
        "621": "monosodium glutamate (fermentation)", "954": "saccharin (synthetic)", "950": "acesulfame K (synthetic)", "951": "aspartame (synthetic)", "955": "sucralose (synthetic)", "956": "alitame",
        "1200": "polydextrose (synthetic)", "1400": "dextrin (starch, source unstated)"
      }
    }
  };
  // 1400 is generic dextrin and its starch source is unstated, so keep it out of the "ok" list.
  delete RULES.codes.ok["1400"];

  if (typeof module !== "undefined" && module.exports) module.exports = RULES;
  else { root.FS = root.FS || {}; root.FS.jainRules = RULES; }
})(typeof window !== "undefined" ? window : globalThis);
