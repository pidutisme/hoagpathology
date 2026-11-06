/* =========================================================
   NOTIFICATION MODULE
   Independent workspace. Critical-value catalogue is loaded as reference data.
   Existing notification transaction data is intentionally NOT loaded.
   ========================================================= */
(function (window, document) {
  'use strict';

  var records = [];
  var pageSize = 20;
  var currentPage = 1;
  var editingId = null;

  /* Critical-value reference catalogue. Transaction records remain empty. */
  var testCatalogue = {
  "BIOCHEMISTRY": [
    {
      "name": "Sodium",
      "rule": "<125 mmol/L / >155 mmol/L",
      "low": 125.0,
      "high": 155.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Potassium",
      "rule": "<2.8 mmol/L / >6.0 mmol/L",
      "low": 2.8,
      "high": 6.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Glucose",
      "rule": "<2.8 mmol/L / >20.0 mmol/L",
      "low": 2.8,
      "high": 20.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Calcium",
      "rule": "<1.5 mmol/L / >3.0 mmol/L",
      "low": 1.5,
      "high": 3.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Magnesium",
      "rule": "<0.41 mmol/L / >2.0 mmol/L",
      "low": 0.41,
      "high": 2.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Phosphate",
      "rule": "<0.32 mmol/L / >2.87 mmol/L",
      "low": 0.32,
      "high": 2.87,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Lactate",
      "rule": ">5.0 mmol/L",
      "low": null,
      "high": 5.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "pH",
      "rule": "<7.2 / >7.55",
      "low": 7.2,
      "high": 7.55,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "pO2",
      "rule": "<7.8 kPa",
      "low": 7.8,
      "high": null,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "pCO2",
      "rule": ">9.3 kPa",
      "low": null,
      "high": 9.3,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Serum Osmolality",
      "rule": "<250 mmol/kg / >350 mmol/kg",
      "low": 250.0,
      "high": 350.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Creatine Kinase",
      "rule": ">5000 U/L",
      "low": null,
      "high": 5000.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Lithium",
      "rule": ">1.5 mmol/L",
      "low": null,
      "high": 1.5,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "CSF-Glucose",
      "rule": "<1.6 mmol/L",
      "low": 1.6,
      "high": null,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Calcium Paeds",
      "rule": "<1.7 mmol/L / >3.1 mmol/L",
      "low": 1.7,
      "high": 3.1,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Magnesium Paeds",
      "rule": "<0.5 mmol/L / >1.8 mmol/L",
      "low": 0.5,
      "high": 1.8,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Phosphate Paeds",
      "rule": "<0.4 mmol/L / >2.8 mmol/L",
      "low": 0.4,
      "high": 2.8,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Lactate Paeds",
      "rule": ">3.0 mmol/L",
      "low": null,
      "high": 3.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "pH Paeds",
      "rule": ">7.60",
      "low": null,
      "high": 7.6,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "pO2 Paeds",
      "rule": "<2.85 kPa / >16.0 kPa",
      "low": 2.85,
      "high": 16.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "pCO2 Paeds",
      "rule": "<2.6 kPa / >9.1 kPa",
      "low": 2.6,
      "high": 9.1,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Serum Osmolality Paeds",
      "rule": "<250 mmol/kg / >310 mmol/kg",
      "low": 250.0,
      "high": 310.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Creatinine Paeds",
      "rule": ">330 µmol/L",
      "low": null,
      "high": 330.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Ammonia Paeds",
      "rule": ">100 µmol/L",
      "low": null,
      "high": 100.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Bilirubin Paeds",
      "rule": "Neonate >513 μmol/L / Children >428 μmol/L",
      "low": null,
      "high": null,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "CSF-Protein Paeds",
      "rule": ">1.87 g/L",
      "low": null,
      "high": 1.87,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Urea Paeds",
      "rule": ">19.0 mmol/L",
      "low": null,
      "high": 19.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Uric Acid Paeds",
      "rule": ">500 μmol/L",
      "low": null,
      "high": 500.0,
      "alerts": [],
      "type": "numeric"
    }
  ],
  "HAEMATOLOGY": [
    {
      "name": "Haemoglobin",
      "rule": "<6.0 g/dL / >19.0 g/dL",
      "low": 6.0,
      "high": 19.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Haematocrit",
      "rule": "<0.20 / 20% / >0.40 / 60%",
      "low": 0.2,
      "high": 0.4,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Platelet",
      "rule": "<20 X 10^3 /μL / >1000 X 10^3 /μL",
      "low": 20.0,
      "high": 1000.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Fibrinogen",
      "rule": "<100 mg/dL",
      "low": 100.0,
      "high": null,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "INR (Ratio)",
      "rule": ">5",
      "low": null,
      "high": 5.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "PT",
      "rule": ">2.5 Upper Limit",
      "low": null,
      "high": 2.5,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "APTT",
      "rule": "80 sec or >2X Upper Reference range",
      "low": null,
      "high": null,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Haemoglobin Paeds",
      "rule": "<7.0 g/dL / >20.0 g/dL",
      "low": 7.0,
      "high": 20.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Haemoglobin Neonate",
      "rule": "<8.0 g/dL / >22.0 g/dL",
      "low": 8.0,
      "high": 22.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Haematocrit Paeds",
      "rule": "<0.20 / 20% / >0.40 / 40%",
      "low": 0.2,
      "high": 0.4,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Haematocrit Neonate",
      "rule": "<0.25 / 25% / >0.70 / 75%",
      "low": 0.25,
      "high": 0.7,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Platelet Paeds",
      "rule": "<50 X 10^3 /μL / >1000 X 10^3 /μL",
      "low": 50.0,
      "high": 1000.0,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "Fibrinogen Paeds",
      "rule": "<70 mg/dL",
      "low": 70.0,
      "high": null,
      "alerts": [],
      "type": "numeric"
    },
    {
      "name": "WBC Paeds",
      "rule": "<2.0 X 10^3 /μL / >50 X 10^3 /μL",
      "low": 2.0,
      "high": 50.0,
      "alerts": [],
      "type": "numeric"
    }
  ],
  "MICROBIOLOGY": [
      {
          "name": "Cerebrospinal Fluid Culture and Sensitivity",
          "rule": "Alert / critical result: Abnormal",
          "low": null,
          "high": null,
          "alerts": [
              "Abnormal"
          ],
          "type": "qualitative",
          "options": [
              "Abnormal",
              "No Growth"
          ]
      },
      {
          "name": "Cerebrospinal Fluid Antigen Detection",
          "rule": "Alert / critical result: Positive",
          "low": null,
          "high": null,
          "alerts": [
              "Positive"
          ],
          "type": "qualitative",
          "options": [
              "Positive",
              "Negative"
          ]
      },
      {
          "name": "Sterile Body Fluids",
          "rule": "Alert / critical result: Positive",
          "low": null,
          "high": null,
          "alerts": [
              "Positive"
          ],
          "type": "qualitative",
          "options": [
              "Positive",
              "No Growth"
          ]
      },
      {
          "name": "Sputum AFB",
          "rule": "Alert / critical result: AFB Seen",
          "low": null,
          "high": null,
          "alerts": [
              "AFB Seen"
          ],
          "type": "qualitative",
          "options": [
              "AFB Seen",
              "No AFB Seen"
          ]
      },
      {
          "name": "BFMP",
          "rule": "Alert / critical result: Malaria Parasite Seen",
          "low": null,
          "high": null,
          "alerts": [
              "Malaria Parasite Seen"
          ],
          "type": "qualitative",
          "options": [
              "Malaria Parasite Seen",
              "No Malaria Parasite Seen"
          ]
      },
      {
          "name": "Any Culture & Sensitivity",
          "rule": "Alert / critical result: Listeria / Bacillus / Clostridium / Streptococcus viridans / Streptococcus pneumoniae / Streptococcus agalactiae / Streptococcus pyogenes / Streptococcus bovis / Enterococcus faecalis / Enterococcus faecium / Staphylococcus aureus / Staphylococcus epidermidis / Staphylococcus saprophyticus / Citrobacter koseri / Citrobacter freundii / Klebsiella aerogenes / Enterobacter cloacae / Enterobacter amnigenus / Enterobacter intermedius / Pectobacterium carotovorum / Dickeya dadantii / Escherichia coli / Klebsiella oxytoca / Klebsiella pneumoniae / Serratia fonticola / Serratia rubidaea / Edwardsiella tarda / Erwinia cacticida / Morganella morganii / Proteus mirabilis / Proteus vulgaris / Proteus penneri / Providencia stuartii / Salmonella bongori / Salmonella enterica / Serratia marcescens / Serratia liquefaciens / Shigella spp. / Yersinia enterocolitica / Yersinia pestis / Yersinia pseudotuberculosis / Salmonella typhi / Vibrio cholerae / Bordetella pertusis / Corynebacterium diptheria / Candida albican / Pseudomonas aeruginosa",
          "low": null,
          "high": null,
          "alerts": [
              "Listeria",
              "Bacillus",
              "Clostridium",
              "Streptococcus viridans",
              "Streptococcus pneumoniae",
              "Streptococcus agalactiae",
              "Streptococcus pyogenes",
              "Streptococcus bovis",
              "Enterococcus faecalis",
              "Enterococcus faecium",
              "Staphylococcus aureus",
              "Staphylococcus epidermidis",
              "Staphylococcus saprophyticus",
              "Citrobacter koseri",
              "Citrobacter freundii",
              "Klebsiella aerogenes",
              "Enterobacter cloacae",
              "Enterobacter amnigenus",
              "Enterobacter intermedius",
              "Pectobacterium carotovorum",
              "Dickeya dadantii",
              "Escherichia coli",
              "Klebsiella oxytoca",
              "Klebsiella pneumoniae",
              "Serratia fonticola",
              "Serratia rubidaea",
              "Edwardsiella tarda",
              "Erwinia cacticida",
              "Morganella morganii",
              "Proteus mirabilis",
              "Proteus vulgaris",
              "Proteus penneri",
              "Providencia stuartii",
              "Salmonella bongori",
              "Salmonella enterica",
              "Serratia marcescens",
              "Serratia liquefaciens",
              "Shigella spp.",
              "Yersinia enterocolitica",
              "Yersinia pestis",
              "Yersinia pseudotuberculosis",
              "Salmonella typhi",
              "Vibrio cholerae",
              "Bordetella pertusis",
              "Corynebacterium diptheria",
              "Candida albican",
              "Pseudomonas aeruginosa"
          ],
          "type": "qualitative",
          "options": [
              "Listeria",
              "Bacillus",
              "Clostridium",
              "Streptococcus viridans",
              "Streptococcus pneumoniae",
              "Streptococcus agalactiae",
              "Streptococcus pyogenes",
              "Streptococcus bovis",
              "Enterococcus faecalis",
              "Enterococcus faecium",
              "Staphylococcus aureus",
              "Staphylococcus epidermidis",
              "Staphylococcus saprophyticus",
              "Citrobacter koseri",
              "Citrobacter freundii",
              "Klebsiella aerogenes",
              "Enterobacter cloacae",
              "Enterobacter amnigenus",
              "Enterobacter intermedius",
              "Pectobacterium carotovorum",
              "Dickeya dadantii",
              "Escherichia coli",
              "Klebsiella oxytoca",
              "Klebsiella pneumoniae",
              "Serratia fonticola",
              "Serratia rubidaea",
              "Edwardsiella tarda",
              "Erwinia cacticida",
              "Morganella morganii",
              "Proteus mirabilis",
              "Proteus vulgaris",
              "Proteus penneri",
              "Providencia stuartii",
              "Salmonella bongori",
              "Salmonella enterica",
              "Serratia marcescens",
              "Serratia liquefaciens",
              "Shigella spp.",
              "Yersinia enterocolitica",
              "Yersinia pestis",
              "Yersinia pseudotuberculosis",
              "Salmonella typhi",
              "Vibrio cholerae",
              "Bordetella pertusis",
              "Corynebacterium diptheria",
              "Candida albican",
              "Pseudomonas aeruginosa",
              "No Significant Growth"
          ]
      },
      {
          "name": "Antigen Detection",
          "rule": "Alert / critical result: Legionella spp",
          "low": null,
          "high": null,
          "alerts": [
              "Legionella spp"
          ],
          "type": "qualitative",
          "options": [
              "Legionella spp",
              "Negative"
          ]
      },
      {
          "name": "VDRL",
          "rule": "Alert / critical result: Reactive",
          "low": null,
          "high": null,
          "alerts": [
              "Reactive"
          ],
          "type": "qualitative",
          "options": [
              "Reactive",
              "Non-reactive"
          ]
      },
      {
          "name": "Hepatitis A",
          "rule": "Alert / critical result: Reactive",
          "low": null,
          "high": null,
          "alerts": [
              "Reactive"
          ],
          "type": "qualitative",
          "options": [
              "Reactive",
              "Non-reactive"
          ]
      },
      {
          "name": "Hepatitis B",
          "rule": "Alert / critical result: Reactive",
          "low": null,
          "high": null,
          "alerts": [
              "Reactive"
          ],
          "type": "qualitative",
          "options": [
              "Reactive",
              "Non-reactive"
          ]
      },
      {
          "name": "Hepatitis C",
          "rule": "Alert / critical result: Reactive",
          "low": null,
          "high": null,
          "alerts": [
              "Reactive"
          ],
          "type": "qualitative",
          "options": [
              "Reactive",
              "Non-reactive"
          ]
      },
      {
          "name": "Syphilis - RPR/TPPA",
          "rule": "Alert / critical result: Reactive",
          "low": null,
          "high": null,
          "alerts": [
              "Reactive"
          ],
          "type": "qualitative",
          "options": [
              "Reactive",
              "Non-reactive"
          ]
      },
      {
          "name": "MTB C&S",
          "rule": "Alert / critical result: Culture Growth",
          "low": null,
          "high": null,
          "alerts": [
              "Culture Growth"
          ],
          "type": "qualitative",
          "options": [
              "Culture Growth",
              "No Culture Growth"
          ]
      },
      {
          "name": "Slit Skin Smear",
          "rule": "Alert / critical result: Positive",
          "low": null,
          "high": null,
          "alerts": [
              "Positive"
          ],
          "type": "qualitative",
          "options": [
              "Positive",
              "Negative"
          ]
      },
      {
          "name": "MTB Gene Xpert",
          "rule": "Alert / critical result: MTB Detected",
          "low": null,
          "high": null,
          "alerts": [
              "MTB Detected"
          ],
          "type": "qualitative",
          "options": [
              "MTB Detected",
              "MTB Not Detected"
          ]
      },
      {
          "name": "Leptospirosis",
          "rule": "Alert / critical result: IgG Detected / IgM Detected / LeptoMAT Inconclusive / LeptoMAT Positive",
          "low": null,
          "high": null,
          "alerts": [
              "IgG Detected",
              "IgM Detected",
              "LeptoMAT Inconclusive",
              "LeptoMAT Positive"
          ],
          "type": "qualitative",
          "options": [
              "IgG Detected",
              "IgM Detected",
              "LeptoMAT Inconclusive",
              "LeptoMAT Positive",
              "IgG Not Detected",
              "IgM Not Detected",
              "LeptoMAT Negative"
          ]
      },
      {
          "name": "Dengue Combo",
          "rule": "Alert / critical result: NS1 Detected / IgM Positive / IgG Positive",
          "low": null,
          "high": null,
          "alerts": [
              "NS1 Detected",
              "IgM Positive",
              "IgG Positive"
          ],
          "type": "qualitative",
          "options": [
              "NS1 Detected",
              "IgM Positive",
              "IgG Positive",
              "NS1 Not Detected",
              "IgM Negative",
              "IgG Negative"
          ]
      },
      {
          "name": "Influenza Test",
          "rule": "Alert / critical result: Influenza A Detected / Influenza B Detected",
          "low": null,
          "high": null,
          "alerts": [
              "Influenza A Detected",
              "Influenza B Detected"
          ],
          "type": "qualitative",
          "options": [
              "Influenza A Detected",
              "Influenza B Detected",
              "Influenza A Not Detected",
              "Influenza B Not Detected"
          ]
      }
  ]
};
  function $(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function nowLocalInput() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function timeNow() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; return pad(h) + ':' + pad(m) + ' ' + ap;
  }
  function format12Hour(h, m, ap) { return pad(Number(h)) + ':' + pad(Number(m)) + ' ' + ap; }
  function parseTime12(value) {
    var m = String(value || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    var h = Number(m[1]), min = Number(m[2]), ap = m[3].toUpperCase();
    if (h < 1 || h > 12 || min < 0 || min > 59) return null;
    return { hour: h, minute: min, ampm: ap };
  }
  function fmtDate(value) {
    if (!value) return '—';
    var d = new Date(value);
    if (isNaN(d.getTime())) return esc(value);
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + '<br><small>' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + '</small>';
  }
  var STORAGE_KEY = 'hoagpathology.notification.records.v2';
  var LEGACY_STORAGE_KEY = 'hoagpathology.notification.records.v1';
  var DB_NAME = 'hoagpathology-notification';
  var DB_STORE = 'records';
  var recordsHydrated = false;

  function localRead() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }
  function localWrite() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); return true; } catch (e) { return false; }
  }
  function openRecordsDB() {
    return new Promise(function(resolve, reject) {
      if (!window.indexedDB) return reject(new Error('IndexedDB unavailable'));
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function() {
        var db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: 'id' });
      };
      req.onsuccess = function() { resolve(req.result); };
      req.onerror = function() { reject(req.error || new Error('IndexedDB open failed')); };
    });
  }
  function idbReadAll() {
    return openRecordsDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readonly'), store = tx.objectStore(DB_STORE), req = store.getAll();
        req.onsuccess = function() { resolve(Array.isArray(req.result) ? req.result : []); };
        req.onerror = function() { reject(req.error || new Error('IndexedDB read failed')); };
        tx.oncomplete = function() { try { db.close(); } catch (e) {} };
      });
    });
  }
  function idbWriteAll(list) {
    return openRecordsDB().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readwrite'), store = tx.objectStore(DB_STORE);
        store.clear();
        list.forEach(function(item) { store.put(item); });
        tx.oncomplete = function() { try { db.close(); } catch (e) {} resolve(true); };
        tx.onerror = function() { try { db.close(); } catch (e) {} reject(tx.error || new Error('IndexedDB write failed')); };
      });
    });
  }
  function loadRecords() {
    records = localRead();
    recordsHydrated = false;
    idbReadAll().then(function(saved) {
      if (saved.length) records = saved;
      else if (records.length) idbWriteAll(records).catch(function(){});
      recordsHydrated = true;
      render();
    }).catch(function() { recordsHydrated = true; render(); });
  }
  function persistRecords() {
    localWrite();
    idbWriteAll(records).catch(function(){});
  }

  function setDefaultForm() {
    var dt = $('notificationDateTime'); if (dt) dt.value = nowLocalInput();
    var ti = $('notificationInformedTime'); if (ti) ti.value = timeNow();
    var status = $('notificationStatus'); if (status) status.value = 'PENDING';
    editingId = null;
    var mode = $('notificationFormMode'); if (mode) mode.textContent = 'NEW RECORD';
  }
  function clearForm() {
    var form = $('notificationForm'); if (form) form.reset();
    var sex = $('notificationSex'); if (sex) sex.value = '';
    var age = $('notificationAge'); if (age) age.value = '';
    var test = $('notificationTest'); if (test) { test.innerHTML = '<option value="">Select discipline first</option>'; test.dispatchEvent(new Event('change',{bubbles:true})); }
    var rule = $('notificationCriticalLimit'); if (rule) { rule.className = 'notification-critical-box is-empty'; rule.innerHTML = '<strong>Reference</strong><span>Select a test to load the critical value rule.</span>'; }
    syncResultControl(null, '');
    setFlag('Awaiting result', '');
    setDefaultForm();
  }
  function setFlag(text, tone) {
    var el = $('notificationFlag'); if (!el) return;
    el.textContent = text || 'Awaiting result';
    el.className = 'notification-flag' + (tone ? ' ' + tone : '');
  }
  function parseIc(value) {
    var s = String(value || '').replace(/[^0-9]/g, '');
    if (s.length < 6) return;
    var yy = Number(s.slice(0,2)), mm = Number(s.slice(2,4)), dd = Number(s.slice(4,6));
    var now = new Date(), currentYY = now.getFullYear() % 100;
    var year = yy <= currentYY ? 2000 + yy : 1900 + yy;
    var dob = new Date(year, mm - 1, dd);
    if (dob.getFullYear() !== year || dob.getMonth() !== mm - 1 || dob.getDate() !== dd) return;
    var age = now.getFullYear() - year;
    if (now.getMonth() < mm - 1 || (now.getMonth() === mm - 1 && now.getDate() < dd)) age--;
    var sex = '';
    if (s.length >= 12) sex = Number(s.slice(-1)) % 2 ? 'M' : 'F';
    if ($('notificationAge')) $('notificationAge').value = Math.max(0, age);
    if ($('notificationSex')) $('notificationSex').value = sex;
  }
  var qualitativeResultOptions = {
    'Cerebrospinal Fluid Culture and Sensitivity': ['No Growth'],
    'Cerebrospinal Fluid Antigen Detection': ['Negative'],
    'Sterile Body Fluids': ['No Growth'],
    'Sputum AFB': ['No AFB Seen'],
    'BFMP': ['No Malaria Parasite Seen'],
    'Any Culture & Sensitivity': ['No Significant Growth'],
    'Antigen Detection': ['Negative'],
    'VDRL': ['Non-reactive'],
    'Hepatitis A': ['Non-reactive'],
    'Hepatitis B': ['Non-reactive'],
    'Hepatitis C': ['Non-reactive'],
    'Syphilis - RPR/TPPA': ['Non-reactive'],
    'MTB C&S': ['No Culture Growth'],
    'Slit Skin Smear': ['Negative'],
    'MTB Gene Xpert': ['MTB Not Detected'],
    'Leptospirosis': ['IgG Not Detected', 'IgM Not Detected', 'LeptoMAT Negative'],
    'Dengue Combo': ['NS1 Not Detected', 'IgM Negative', 'IgG Negative'],
    'Influenza Test': ['Influenza A Not Detected', 'Influenza B Not Detected']
  };

  function findTestItem() {
    var discipline = $('notificationDiscipline'), test = $('notificationTest');
    if (!discipline || !test) return null;
    var list = testCatalogue[discipline.value] || [];
    return list.find(function (x) { return String(x.name) === String(test.value); }) || null;
  }

  function syncResultControl(item, selectedValue) {
    var wrap = $('notificationResultSelectWrap');
    var input = $('notificationResult');
    var select = $('notificationResultSelect');
    var hint = $('notificationResultHint');
    if (!wrap || !input || !select) return;
    var qualitative = !!(item && item.type === 'qualitative');
    wrap.classList.toggle('is-qualitative', qualitative);
    wrap.classList.toggle('is-quantitative', !qualitative);
    select.required = qualitative;
    input.required = !qualitative;
    if (qualitative) {
      var options = [];
      (item.options || item.alerts || []).forEach(function (x) { if (options.indexOf(x) < 0) options.push(x); });
      (qualitativeResultOptions[item.name] || []).forEach(function (x) { if (options.indexOf(x) < 0) options.push(x); });
      select.innerHTML = '<option value="">Select result</option>' + options.map(function (x) { return '<option value="' + esc(x) + '">' + esc(x) + '</option>'; }).join('');
      select.value = selectedValue || '';
      input.value = '';
      if (hint) hint.textContent = 'Select the reported qualitative result from the catalogue.';
    } else {
      select.innerHTML = '<option value="">Select result</option>';
      select.value = '';
      input.value = selectedValue || '';
      if (hint) hint.textContent = item ? 'Enter the quantitative result; the flag will be calculated automatically.' : 'Select a test first.';
    }
    var trigger = select.parentElement && select.parentElement.querySelector('.notification-select-trigger [data-notification-select-label]');
    if (trigger) { var opt = select.options[select.selectedIndex]; trigger.textContent = opt ? opt.textContent : 'Select result'; }
  }

  function getResultValue() {
    var item = findTestItem();
    return item && item.type === 'qualitative' ? String(($('notificationResultSelect') || {}).value || '') : String(($('notificationResult') || {}).value || '').trim();
  }

  function populateTests() {
    var discipline = $('notificationDiscipline');
    var test = $('notificationTest');
    if (!discipline || !test) return;
    var list = testCatalogue[discipline.value] || [];
    if (!list.length) {
      test.innerHTML = '<option value="">Test catalogue not loaded yet</option>';
      test.disabled = true;
      test.dispatchEvent(new Event('change',{bubbles:true}));
      return;
    }
    test.disabled = false;
    test.innerHTML = '<option value="">Select test</option>' + list.map(function (x) { return '<option value="' + esc(x.name) + '">' + esc(x.name) + '</option>'; }).join('');
    test.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function updateRuleAndFlag() {
    var discipline = $('notificationDiscipline');
    var test = $('notificationTest');
    var resultValue = getResultValue();
    var box = $('notificationCriticalLimit');
    if (!discipline || !test || !box) return;
    var list = testCatalogue[discipline.value] || [];
    var item = list.find(function (x) { return String(x.name) === String(test.value); });
    if (!item) {
      box.className = 'notification-critical-box is-empty';
      box.innerHTML = '<strong>Reference</strong><span>Critical-value catalogue will be connected in the next step.</span>';
      setFlag(resultValue ? 'REVIEW' : 'Awaiting result', resultValue ? 'critical' : '');
      return;
    }
    box.className = 'notification-critical-box';
    box.innerHTML = '<strong>Critical Limit (' + esc(item.name) + ')</strong><span>' + esc(item.rule || 'See reference catalogue') + '</span>';
    syncResultControl(item, resultValue);
    evaluateResult(item, resultValue);
  }
  function evaluateResult(item, value) {
    var raw = String(value || '').trim();
    var n = Number(raw.replace(/,/g, '').match(/-?[0-9]+(?:\.[0-9]+)?/)?.[0] || '');
    if (!raw) { setFlag('Awaiting result', ''); return; }
    if (item && item.type === 'qualitative') {
      var hit = (item.alerts || []).some(function (x) { return String(x).toLowerCase() === raw.toLowerCase(); });
      if (hit) {
        var up = raw.toUpperCase();
        var tone = /DETECTED|POSITIVE|REACTIVE|ABNORMAL|SEEN|GROWTH|MALARIA/.test(up) ? 'critical' : 'normal';
        setFlag(up, tone);
      } else setFlag('REVIEW', 'normal');
      return;
    }
    if (item && item.low != null && !isNaN(n) && n < Number(item.low)) { setFlag('LOW CRITICAL', 'critical'); return; }
    if (item && item.high != null && !isNaN(n) && n > Number(item.high)) { setFlag('HIGH CRITICAL', 'critical'); return; }
    setFlag('REVIEW', 'normal');
  }

  function initNotificationTimePicker() {
    var picker = $('notificationTimePicker'), input = $('notificationInformedTime'), trigger = $('notificationTimeTrigger'), menu = $('notificationTimeMenu');
    if (!picker || !input || !trigger || !menu || picker.dataset.ready === '1') return;
    picker.dataset.ready = '1';
    menu.hidden = true;
    input.setAttribute('aria-expanded','false');
    trigger.classList.remove('is-open');

    // Match the other Notification dropdowns: the menu lives above the page layer,
    // stays attached to the trigger while scrolling, and closes only on outside click.
    document.body.appendChild(menu);

    var hours = Array.from({length:12}, function(_,i){ return i+1; });
    var minutes = Array.from({length:60}, function(_,i){ return i; });
    var ampm = ['AM','PM'];
    var renderCol = function(part, values) {
      var col = menu.querySelector('[data-time-part="'+part+'"]');
      if (!col) return;
      col.innerHTML = values.map(function(v){
        var text = part === 'minute' ? pad(v) : String(v);
        return '<button type="button" data-time-value="'+esc(String(v))+'">'+esc(text)+'</button>';
      }).join('');
    };
    renderCol('hour',hours); renderCol('minute',minutes); renderCol('ampm',ampm);

    function current(){ return parseTime12(input.value) || parseTime12(timeNow()); }
    function syncSelected(){
      var t=current();
      menu.querySelectorAll('[data-time-part]').forEach(function(col){
        var part=col.dataset.timePart, val=part==='hour'?String(t.hour):part==='minute'?String(t.minute):t.ampm;
        var selected=null;
        col.querySelectorAll('button').forEach(function(b){
          var on=b.dataset.timeValue===val;
          b.classList.toggle('is-selected', on);
          if(on) selected=b;
        });
        if(selected && part!=='ampm') {
          try { selected.scrollIntoView({block:'center', inline:'nearest'}); } catch(_) {}
        }
      });
    }
    function position(){
      if (menu.hidden) return;
      var r=trigger.getBoundingClientRect(), w=menu.offsetWidth || 356, h=menu.offsetHeight || 220;
      var left=Math.min(Math.max(8,r.left),Math.max(8,window.innerWidth-w-8));
      var top=r.bottom+6;
      if(top+h>window.innerHeight-8) top=Math.max(8,r.top-h-6);
      menu.style.width=w+'px';
      menu.style.left=left+'px';
      menu.style.top=top+'px';
    }
    function open(){
      menu.hidden=false;
      input.setAttribute('aria-expanded','true');
      trigger.classList.add('is-open');
      syncSelected();
      position();
    }
    function close(){
      menu.hidden=true;
      input.setAttribute('aria-expanded','false');
      trigger.classList.remove('is-open');
    }
    function choose(part,value){
      var t=current();
      if(part==='hour') t.hour=Number(value); else if(part==='minute') t.minute=Number(value); else t.ampm=value;
      input.value=format12Hour(t.hour,t.minute,t.ampm);
      syncSelected();
      position();
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }
    trigger.addEventListener('click',function(e){e.preventDefault();e.stopPropagation(); menu.hidden ? open() : close();});
    input.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open();});
    menu.addEventListener('click',function(e){
      var b=e.target.closest('button[data-time-value]');
      if(!b) return;
      e.preventDefault(); e.stopPropagation();
      choose(b.parentElement.dataset.timePart,b.dataset.timeValue);
    });
    document.addEventListener('click',function(e){
      if(!picker.contains(e.target) && !menu.contains(e.target)) close();
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape') close();});
    window.addEventListener('resize',position);
    window.addEventListener('scroll',position,true);
    input.value=timeNow();
  }

  function initNotificationNeumorphicSelects() {
    var page = $('notification');
    if (!page) return;
    var openMenu = null, openTrigger = null, openSelect = null;
    function close() {
      if (openMenu) openMenu.remove();
      if (openTrigger) { openTrigger.classList.remove('is-open'); openTrigger.setAttribute('aria-expanded','false'); }
      openMenu = openTrigger = openSelect = null;
    }
    function position() {
      if (!openMenu || !openTrigger) return;
      var r=openTrigger.getBoundingClientRect(), w=Math.max(r.width,180), h=openMenu.offsetHeight;
      var left=Math.min(Math.max(8,r.left),Math.max(8,window.innerWidth-w-8)), top=r.bottom+6;
      if(top+h>window.innerHeight-8) top=Math.max(8,r.top-h-6);
      openMenu.style.width=w+'px'; openMenu.style.left=left+'px'; openMenu.style.top=top+'px';
    }
    function sync(select) {
      var wrap=select.parentElement, trigger=wrap && wrap.querySelector('.notification-select-trigger');
      if(!trigger) return;
      var label=trigger.querySelector('[data-notification-select-label]'), opt=select.options[select.selectedIndex];
      if(label) label.textContent=opt?opt.textContent:'Select...';
      trigger.classList.toggle('is-disabled',!!select.disabled);
      if(openMenu) openMenu.querySelectorAll('button').forEach(function(b){b.classList.toggle('is-selected',b.dataset.value===select.value);});
    }
    function setup(select) {
      if(!select || select.dataset.notificationCustom==='1') { if(select) sync(select); return; }
      select.dataset.notificationCustom='1';
      var wrap=document.createElement('div'); wrap.className='notification-custom-select-wrap';
      select.parentNode.insertBefore(wrap,select); wrap.appendChild(select); select.classList.add('notification-native-select');
      var trigger=document.createElement('button'); trigger.type='button'; trigger.className='notification-select-trigger'; trigger.setAttribute('aria-haspopup','listbox'); trigger.setAttribute('aria-expanded','false');
      trigger.innerHTML='<span data-notification-select-label></span><span class="notification-select-chevron">⌄</span>';
      wrap.insertBefore(trigger,select); sync(select);
      trigger.addEventListener('click',function(e){e.preventDefault();e.stopPropagation(); if(select.disabled)return; if(openTrigger===trigger)close(); else {
        close(); openTrigger=trigger; openSelect=select; openMenu=document.createElement('div'); openMenu.className='notification-select-menu'; openMenu.setAttribute('role','listbox');
        Array.prototype.forEach.call(select.options,function(opt){ var b=document.createElement('button'); b.type='button'; b.textContent=opt.textContent; b.dataset.value=opt.value; b.setAttribute('role','option'); if(opt.value===select.value)b.classList.add('is-selected'); b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();select.value=opt.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync(select);close();}); openMenu.appendChild(b); });
        document.body.appendChild(openMenu); trigger.classList.add('is-open'); trigger.setAttribute('aria-expanded','true'); position();
      }});
      select.addEventListener('change',function(){sync(select);});
    }
    page.querySelectorAll('select').forEach(setup);
    document.addEventListener('click',function(e){if(openMenu && !e.target.closest('.notification-select-menu') && !e.target.closest('.notification-select-trigger')) close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
    window.addEventListener('resize',position); window.addEventListener('scroll',position,true);
  }
  function collectForm() {
    return {
      id: editingId || ('N' + Date.now()),
      notification_datetime: $('notificationDateTime').value,
      barcode: $('notificationBarcode').value.trim(),
      patient_name: $('notificationPatientName').value.trim(),
      patient_id: $('notificationIdIc').value.trim(),
      sex: $('notificationSex').value.trim(),
      age: $('notificationAge').value.trim(),
      unit: $('notificationUnit').value,
      discipline: $('notificationDiscipline').value,
      test_name: $('notificationTest').value,
      critical_limit: $('notificationCriticalLimit').innerText.replace(/^Reference\s*/i, '').trim(),
      result: getResultValue(),
      flag: $('notificationFlag').textContent.trim(),
      staff: $('notificationStaff').value.trim(),
      inform_to: $('notificationInformTo').value.trim(),
      informed_time: $('notificationInformedTime').value,
      status: $('notificationStatus').value,
      notes: $('notificationNotes').value.trim()
    };
  }
  function render() {
    var search = String(($('notificationSearch') || {}).value || '').trim().toLowerCase();
    var year = String(($('notificationYearFilter') || {}).value || 'ALL');
    var month = String(($('notificationMonthFilter') || {}).value || 'ALL');
    var discipline = String(($('notificationDisciplineFilter') || {}).value || 'ALL');
    var flag = String(($('notificationFlagFilter') || {}).value || 'ALL');
    var status = String(($('notificationStatusFilter') || {}).value || 'ALL');
    var filtered = records.filter(function (r) {
      var hay = [r.patient_name, r.patient_id, r.barcode, r.test_name, r.unit, r.staff].join(' ').toLowerCase();
      if (search && hay.indexOf(search) < 0) return false;
      if (year !== 'ALL' && String(r.notification_datetime || '').slice(0,4) !== year) return false;
      if (month !== 'ALL' && String(r.notification_datetime || '').slice(5,7) !== month) return false;
      if (discipline !== 'ALL' && r.discipline !== discipline) return false;
      if (flag !== 'ALL' && r.flag !== flag) return false;
      if (status !== 'ALL' && r.status !== status) return false;
      return true;
    });
    var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * pageSize;
    var rows = filtered.slice(start, start + pageSize);
    var body = $('notificationTableBody'), empty = $('notificationEmpty');
    if (body) body.innerHTML = rows.map(function (r) {
      var cls = r.discipline === 'BIOCHEMISTRY' ? 'bio' : r.discipline === 'HAEMATOLOGY' ? 'hema' : 'micro';
      var statusCls = String(r.status).toLowerCase();
      return '<tr><td>' + fmtDate(r.notification_datetime) + '</td>' +
        '<td class="patient">' + esc(r.patient_name) + '</td>' +
        '<td>' + esc(r.patient_id) + '</td>' +
        '<td>' + esc(r.unit) + '</td>' +
        '<td><span class="notification-pill ' + cls + '">' + esc(r.discipline) + '</span></td>' +
        '<td>' + esc(r.test_name || '—') + '</td>' +
        '<td class="result">' + esc(r.result) + '</td>' +
        '<td><span class="notification-pill flag">' + esc(r.flag) + '</span></td>' +
        '<td><span class="notification-pill status ' + statusCls + '">' + esc(r.status) + '</span></td>' +
        '<td><div class="notification-actions"><button class="notification-action" type="button" data-notification-view="' + esc(r.id) + '" title="View">◉</button><button class="notification-action" type="button" data-notification-edit="' + esc(r.id) + '" title="Edit">✎</button></div></td></tr>';
    }).join('');
    if (empty) empty.hidden = rows.length > 0;
    var shownStart = filtered.length ? start + 1 : 0;
    var shownEnd = Math.min(start + pageSize, filtered.length);
    var pager = $('notificationPager'); if (pager) pager.textContent = 'Showing ' + shownStart + '–' + shownEnd + ' of ' + filtered.length;
    updateStats();
  }
  function updateStats() {
    var total = records.length;
    var set = function (id, val) { var el = $(id); if (el) el.textContent = String(val); };
    set('notificationStatTotal', total); set('notificationTotal', total + ' TOTAL');
    set('notificationStatBio', records.filter(function (r) { return r.discipline === 'BIOCHEMISTRY'; }).length);
    set('notificationStatHema', records.filter(function (r) { return r.discipline === 'HAEMATOLOGY'; }).length);
    set('notificationStatMicro', records.filter(function (r) { return r.discipline === 'MICROBIOLOGY'; }).length);
  }
  function showDetail(record) {
    var modal = $('notificationDetailModal');
    if (!modal) {
      modal = document.createElement('div'); modal.id = 'notificationDetailModal'; modal.className = 'notification-modal'; modal.hidden = true;
      modal.innerHTML = '<div class="notification-modal-dialog"><div class="notification-modal-head"><h3>CRITICAL VALUE RECORD</h3><button class="notification-modal-close" type="button" data-notification-close>×</button></div><div class="notification-modal-body"><div class="notification-detail-grid" id="notificationDetailGrid"></div></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-notification-close]')) modal.hidden = true; });
    }
    var grid = $('notificationDetailGrid');
    var fields = [['Date / Time', fmtDate(record.notification_datetime)],['Barcode',esc(record.barcode)],['Patient',esc(record.patient_name)],['ID / IC',esc(record.patient_id)],['Sex',esc(record.sex)],['Age',esc(record.age)],['Unit',esc(record.unit)],['Discipline',esc(record.discipline)],['Test',esc(record.test_name)],['Critical Limit',esc(record.critical_limit)],['Result',esc(record.result)],['Flag',esc(record.flag)],['Staff',esc(record.staff)],['Inform To',esc(record.inform_to)],['Time Informed',esc(record.informed_time)],['Status',esc(record.status)],['Notes',esc(record.notes || '—')]];
    if (grid) grid.innerHTML = fields.map(function (f) { return '<div class="notification-detail"><small>' + f[0] + '</small><strong>' + f[1] + '</strong></div>'; }).join('');
    modal.hidden = false;
  }
  function editRecord(id) {
    var r = records.find(function (x) { return String(x.id) === String(id); }); if (!r) return;
    editingId = r.id;
    $('notificationDateTime').value = r.notification_datetime || '';
    $('notificationBarcode').value = r.barcode || '';
    $('notificationPatientName').value = r.patient_name || '';
    $('notificationIdIc').value = r.patient_id || '';
    $('notificationSex').value = r.sex || '';
    $('notificationAge').value = r.age || '';
    $('notificationUnit').value = r.unit || '';
    $('notificationDiscipline').value = r.discipline || '';
    populateTests();
    $('notificationTest').disabled = false;
    $('notificationTest').innerHTML = '<option value="' + esc(r.test_name || '') + '">' + esc(r.test_name || 'Current test') + '</option>';
    var editItem = findTestItem();
    syncResultControl(editItem, r.result || '');
    $('notificationStaff').value = r.staff || '';
    $('notificationInformTo').value = r.inform_to || '';
    $('notificationInformedTime').value = r.informed_time || '';
    $('notificationStatus').value = r.status || 'PENDING';
    $('notificationNotes').value = r.notes || '';
    var box = $('notificationCriticalLimit'); box.className = 'notification-critical-box'; box.innerHTML = '<strong>Critical Limit / Alert</strong><span>' + esc(r.critical_limit || 'Reference catalogue not loaded') + '</span>';
    setFlag(r.flag || 'REVIEW', r.flag && r.flag !== 'REVIEW' ? 'critical' : 'normal');
    $('notificationFormMode').textContent = 'EDIT RECORD';
    var page = $('notification'); if (page) page.querySelector('.notification-form-card').scrollIntoView({behavior:'smooth', block:'start'});
  }
  function open() {
    var page = $('notification');
    if (!page) return;
    document.querySelectorAll('.page.active').forEach(function (p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav-btn.active').forEach(function (b) { b.classList.remove('active'); });
    var nav = document.querySelector('.nav-btn[data-page="notification"]'); if (nav) nav.classList.add('active');
    page.classList.add('active');
    clearForm();
    render();
  }
  function bind() {
    var back = $('notificationBackBtn'); if (back) back.addEventListener('click', function () { var b = document.querySelector('.nav-btn[data-page="dashboard"]'); if (b) b.click(); });
    var form = $('notificationForm'); if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var item = collectForm();
      var idx = records.findIndex(function (r) { return String(r.id) === String(item.id); });
      if (idx >= 0) records[idx] = item; else { item.id = item.id || ('notif-' + Date.now() + '-' + Math.random().toString(36).slice(2,8)); records.unshift(item); }
      persistRecords();
      clearForm(); render();
    });
    var clear = $('notificationClearBtn'); if (clear) clear.addEventListener('click', clearForm);
    var ic = $('notificationIdIc'); if (ic) ic.addEventListener('input', function () { parseIc(this.value); });
    var discipline = $('notificationDiscipline'); if (discipline) discipline.addEventListener('change', function () { populateTests(); updateRuleAndFlag(); });
    var test = $('notificationTest'); if (test) test.addEventListener('change', updateRuleAndFlag);
    var result = $('notificationResult'); if (result) result.addEventListener('input', updateRuleAndFlag);
    var resultSelect = $('notificationResultSelect'); if (resultSelect) resultSelect.addEventListener('change', updateRuleAndFlag);
    ['notificationSearch','notificationYearFilter','notificationMonthFilter','notificationDisciplineFilter','notificationFlagFilter','notificationStatusFilter'].forEach(function (id) { var el = $(id); if (el) { ['input','change'].forEach(function (evt) { el.addEventListener(evt, function () { currentPage = 1; render(); }); }); } });
    var body = $('notificationTableBody'); if (body) body.addEventListener('click', function (e) {
      var view = e.target.closest('[data-notification-view]'); if (view) { var r = records.find(function (x) { return String(x.id) === String(view.dataset.notificationView); }); if (r) showDetail(r); return; }
      var edit = e.target.closest('[data-notification-edit]'); if (edit) editRecord(edit.dataset.notificationEdit);
    });
  }

  window.LabNotification = { open: open, render: render, getRecords: function () { return records.slice(); } };
  loadRecords();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ bind(); initNotificationNeumorphicSelects(); initNotificationTimePicker(); }); else { bind(); initNotificationNeumorphicSelects(); initNotificationTimePicker(); }
})(window, document);
