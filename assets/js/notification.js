/* =========================================================
   NOTIFICATION MODULE
   Independent workspace. Critical-value catalogue is loaded as reference data.
   Existing notification transaction data is intentionally NOT loaded.
   ========================================================= */
(function (window, document) {
  'use strict';

  var records = [];
  var pageSize = 1000;
  var cacheKey = 'labAppNotificationV1';
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
      "rule": "<5.85 kPa / >16.2 kPa",
      "low": 5.85,
      "high": 16.2,
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
      "rule": "<0.20 (20%) / >0.60 (60%)",
      "low": 0.2,
      "high": 0.6,
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
      },
      {
          "name": "Herpes Simplex Virus (HSV 1/2 PCR)",
          "rule": "Alert / critical result: HSV-1 DNA Detected / HSV-2 DNA Detected",
          "low": null,
          "high": null,
          "alerts": [
              "HSV-1 DNA Detected",
              "HSV-2 DNA Detected"
          ],
          "type": "qualitative",
          "options": [
              "HSV-1 DNA Detected",
              "HSV-2 DNA Detected"
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
  function nowLocalInput() { return window.LabAppTime.localInputNow(); }
  function timeNow() { return window.LabAppTime.timeNow(); }

  function fmtDate(value) {
    if (!value) return '—';
    var p = window.LabAppTime.parts(value);
    if (!p) return esc(value);
    return window.LabAppTime.pad2(p.day) + '/' + window.LabAppTime.pad2(p.month) + '/' + p.year + '<br><small>' + window.LabAppTime.pad2(p.hour) + ':' + window.LabAppTime.pad2(p.minute) + '</small>';
  }
  var recordsHydrated = false;
  var notificationLoading = false;
  var notificationSaving = false;
  var notificationUserRole = '';
  var notificationIsAdmin = false;
  var notificationDateTimeState = '';

  function notificationApi(method, args) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 20000) : null;
    return fetch('/api/bridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store',
      signal: controller ? controller.signal : undefined,
      body: JSON.stringify({
        action: 'action',
        payload: { method: method, args: Array.isArray(args) ? args : [] }
      })
    }).then(function (response) {
      return response.text().then(function (text) {
        var data;
        try { data = JSON.parse(text); } catch (e) { throw new Error('API returned an invalid response.'); }
        if (!response.ok || (data && data.ok === false)) {
          throw new Error((data && data.error) || 'Notification API request failed.');
        }
        return data;
      });
    }).catch(function (error) {
      if (error && error.name === 'AbortError') throw new Error('Notification save timed out. Please check the server connection.');
      throw error;
    }).finally(function () { if (timer) clearTimeout(timer); });
  }

  function getCatalogueItemForRecord(r) {
    var discipline = String(r && r.discipline || '').trim().toUpperCase();
    var testName = String(r && r.test_name || '').trim().toLowerCase();
    var list = testCatalogue[discipline] || [];
    return list.find(function (x) {
      return String(x.name || '').trim().toLowerCase() === testName;
    }) || null;
  }

  function getResultUnit(r, item) {
    var rawResult = String(r && r.result || '').trim();
    if (!rawResult || !item || item.type === 'qualitative') return '';

    // Prefer an explicit unit on the catalogue item.
    if (item.unit) return String(item.unit).trim();

    // Prefer a unit already present in the stored result.
    var existing = rawResult.match(/(?:^|\s)(X\s*10\^?3\s*\/\s*µ?L|mmol\/L|mmol\/kg|µmol\/L|mol\/L|mg\/dL|g\/dL|g\/L|U\/L|kPa|sec|s|%|ratio)(?:\s|$)/i);
    if (existing) return existing[1].replace(/\s+/g, ' ').trim();

    // Derive the unit from the test itself for numeric tests whose critical
    // rule is expressed as a ratio, upper reference limit, or mixed notation.
    var testName = String(item.name || r.test_name || '').toLowerCase();
    var explicitByTest = {
      'ph': 'pH',
      'ph paeds': 'pH',
      'inr (ratio)': 'ratio',
      'pt': 'sec',
      'aptt': 'sec',
      'haemoglobin': 'g/dL',
      'haematocrit': '%',
      'haematocrit paeds': '%',
      'haematocrit neonate': '%',
      'platelet': 'X 10^3 /μL',
      'platelet paeds': 'X 10^3 /μL',
      'wbc': 'X 10^3 /μL',
      'wbc paeds': 'X 10^3 /μL'
    };
    if (explicitByTest[testName]) return explicitByTest[testName];

    // Otherwise derive the unit from the critical-limit rule in the catalogue.
    var rule = String((item && item.rule) || (r && r.critical_limit) || '');
    var match = rule.match(/(X\s*10\^?3\s*\/\s*µ?L|mmol\/L|mmol\/kg|µmol\/L|mol\/L|mg\/dL|g\/dL|g\/L|U\/L|kPa|sec|s|%|ratio)/i);
    return match ? match[1].replace(/\s+/g, ' ').trim() : '';
  }

  function formatNotificationResult(r) {
    var raw = String(r && r.result || '').trim();
    if (!raw) return '—';
    var item = getCatalogueItemForRecord(r);
    var unit = getResultUnit(r, item);
    if (!unit) return raw;

    // Do not duplicate the unit if it is already stored in the result.
    var unitPattern = new RegExp('(?:^|\\s)' + unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:\\s|$)', 'i');
    return unitPattern.test(raw) ? raw : raw + ' ' + unit;
  }

  function calculateRecordFlag(r) {
    var item = getCatalogueItemForRecord(r);
    if (!item) return String(r && r.flag || '');
    var raw = String(r && r.result || '').trim();
    if (!raw) return 'Awaiting result';

    if (item.type === 'qualitative') {
      var hit = (item.alerts || []).some(function (x) {
        return String(x).toLowerCase() === raw.toLowerCase();
      });
      return hit ? raw.toUpperCase() : 'REVIEW';
    }

    var itemName = String(item.name || '').trim().toLowerCase();
    // PT/APTT require a patient/reference-range comparison that is not stored
    // in this record. Do not falsely flag against an absolute number.
    if (itemName === 'pt' || itemName === 'aptt') return 'REVIEW';

    var match = raw.replace(/,/g, '').match(/-?[0-9]+(?:\.[0-9]+)?/);
    var n = match ? Number(match[0]) : NaN;

    // Bilirubin Paeds: neonate >513 µmol/L; children >428 µmol/L.
    if (itemName === 'bilirubin paeds') {
      var ageNum = Number(String(r.age || '').match(/\d+(?:\.\d+)?/)?.[0] || '');
      if (isNaN(ageNum)) return 'REVIEW';
      return n > (ageNum < 1 ? 513 : 428) ? 'HIGH CRITICAL' : 'REVIEW';
    }

    // Haematocrit supports both fraction (0.20/0.60) and percentage (20/60)
    // representations because historical reports use both formats.
    if (itemName === 'haematocrit' || itemName === 'haematocrit paeds' || itemName === 'haematocrit neonate') {
      var hLow = Number(item.low), hHigh = Number(item.high);
      if (Math.abs(n) > 1) { hLow *= 100; hHigh *= 100; }
      if (!isNaN(n) && n < hLow) return 'LOW CRITICAL';
      if (!isNaN(n) && n > hHigh) return 'HIGH CRITICAL';
      return 'REVIEW';
    }

    if (item.low != null && !isNaN(n) && n < Number(item.low)) return 'LOW CRITICAL';
    if (item.high != null && !isNaN(n) && n > Number(item.high)) return 'HIGH CRITICAL';
    return 'REVIEW';
  }

  function normalizeNotificationRecord(r) {
    r = r && typeof r === 'object' ? r : {};
    var dt = r.notification_datetime || '';
    if (dt) {
      var localParts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(String(dt)) && !/[zZ]|[+-]\d{2}:\d{2}$/.test(String(dt))
        ? window.LabAppTime.localWallClockParts(dt)
        : window.LabAppTime.parts(dt);
      if (localParts) {
        dt = localParts.year + '-' + window.LabAppTime.pad2(localParts.month) + '-' + window.LabAppTime.pad2(localParts.day) +
          'T' + window.LabAppTime.pad2(localParts.hour) + ':' + window.LabAppTime.pad2(localParts.minute);
      } else {
        dt = String(dt).replace(' ', 'T').slice(0,16);
      }
    }

    // Canonicalise imported historical values to the same vocabulary used by
    // current Notification records. This is intentionally UI-side only: the
    // original Supabase values are not modified.
    var rawDiscipline = String(r.discipline || '').trim();
    var discipline = rawDiscipline.toUpperCase();
    var rawTestName = String(r.test_name || '').trim();
    var catalogueItem = getCatalogueItemForRecord({ discipline: discipline, test_name: rawTestName });
    var testName = catalogueItem ? String(catalogueItem.name || rawTestName) : rawTestName;
    var rawResult = String(r.result || '').trim();
    var unit = String(r.unit || '').trim();
    if (!unit && catalogueItem && rawResult) unit = getResultUnit({ result: rawResult, test_name: testName, discipline: discipline, critical_limit: r.critical_limit }, catalogueItem);

    var normalized = {
      id: String(r.id || ''),
      notification_datetime: dt,
      created_at: String(r.created_at || ''),
      updated_at: String(r.updated_at || ''),
      barcode: String(r.barcode || ''),
      patient_name: String(r.patient_name || ''),
      patient_id: String(r.patient_id || ''),
      sex: String(r.sex || ''),
      age: String(r.age || ''),
      unit: unit,
      discipline: discipline,
      test_name: testName,
      critical_limit: String(r.critical_limit || ''),
      result: rawResult,
      flag: calculateRecordFlag({ discipline: discipline, test_name: testName, result: rawResult, age: String(r.age || ''), critical_limit: r.critical_limit, flag: r.flag }),
      staff: String(r.staff || ''),
      inform_to: String(r.inform_to || ''),
      status: String(r.status || 'INFORMED'),
      notes: String(r.notes || '')
    };
    return normalized;
  }

  function saveLocalRecords() {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(cacheKey, JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), records: records }));
      }
    } catch (e) {}
  }

  function loadLocalRecords() {
    try {
      var raw = window.localStorage ? window.localStorage.getItem(cacheKey) : null;
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.records)) return false;
      records = parsed.records.map(normalizeNotificationRecord);
      return true;
    } catch (e) { return false; }
  }

  function syncNotificationYearFilter() {
    var el = $('notificationYearFilter');
    if (!el) return;
    var current = String(el.value || 'ALL');
    var years = {};
    records.forEach(function (r) {
      var y = String(r.notification_datetime || '').slice(0, 4);
      if (/^\d{4}$/.test(y)) years[y] = true;
    });
    var sorted = Object.keys(years).sort(function (a, b) { return Number(b) - Number(a); });
    var options = ['<option value="ALL">All years</option>'];
    sorted.forEach(function (y) { options.push('<option value="' + esc(y) + '">' + esc(y) + '</option>'); });
    el.innerHTML = options.join('');
    if (current !== 'ALL' && years[current]) el.value = current;
    else el.value = 'ALL';
    initNotificationNeumorphicSelects();
  }

  function loadRecords() {
    if (notificationLoading) return;
    notificationLoading = true;
    var hadCache = loadLocalRecords();
    recordsHydrated = hadCache;
    if (hadCache) { syncNotificationYearFilter(); render(); }

    // Notification currently has a small enough dataset that the first page
    // can safely load up to 1000 rows. This prevents a year such as 2025 from
    // disappearing simply because the newest 100 rows are all from 2026.
    // Larger datasets still continue in background pages.
    var firstLimit = 1000, offset = 0, all = [];
    notificationApi('getNotificationRecords', [null, { limit: firstLimit, offset: 0 }])
      .then(function (result) {
        notificationUserRole = String(result.userRole || '').toUpperCase();
        notificationIsAdmin = result.isAdmin === true || notificationUserRole === 'ADMIN';
        all = Array.isArray(result.records) ? result.records.map(normalizeNotificationRecord) : [];
        records = all.slice();
        recordsHydrated = true;
        syncNotificationYearFilter();
        render();
        var more = !!result.hasMore;
        offset = firstLimit;
        function hydrate() {
          if (!more) { saveLocalRecords(); return Promise.resolve(); }
          return notificationApi('getNotificationRecords', [null, { limit: firstLimit, offset: offset }])
            .then(function (page) {
              var pageRows = Array.isArray(page.records) ? page.records.map(normalizeNotificationRecord) : [];
              all = all.concat(pageRows);
              records = all.slice();
              syncNotificationYearFilter();
              render();
              more = !!page.hasMore;
              offset += firstLimit;
              return more ? hydrate() : saveLocalRecords();
            });
        }
        return hydrate();
      })
      .catch(function (error) {
        recordsHydrated = true;
        console.error('Notification records could not be loaded from Supabase:', error);
        syncNotificationYearFilter();
        render();
      })
      .finally(function () { notificationLoading = false; });
  }

  function localNotificationDateTimeToUtc(value) {
    return window.LabAppTime.localWallClockToUtc(value);
  }

  function saveNotificationRecord(item) {
    notificationSaving = true;
    var requestLocalDateTime = String(item.notification_datetime || '').trim();
    var payload = Object.assign({}, item, {
      notification_datetime: localNotificationDateTimeToUtc(requestLocalDateTime)
    });
    // One authoritative save. The backend already performs an explicit
    // UPDATE/INSERT and verifies the persisted row. The database receives
    // the UTC instant corresponding to the user's local wall-clock time.
    return notificationApi('upsertNotificationRecord', [payload])
      .then(function (result) { return normalizeNotificationRecord(result.record || item); })
      .then(function (saved) {
        return notificationApi('getNotificationRecords', [])
          .then(function (result) {
            records = (result.records || []).map(normalizeNotificationRecord);
            var fresh = records.find(function (r) { return String(r.id) === String(saved.id); });
            if (!fresh) throw new Error('Saved notification record could not be reloaded.');
            if (requestLocalDateTime && String(fresh.notification_datetime || '').slice(0,16) !== requestLocalDateTime.slice(0,16)) {
              throw new Error('Notification Date / Time was not persisted. Requested local time ' + requestLocalDateTime + ' but database returned local time ' + String(fresh.notification_datetime || 'empty') + '.');
            }
            saveLocalRecords();
            return fresh;
          });
      })
      .finally(function () { notificationSaving = false; });
  }

  function isNotificationAdmin() {
    if (notificationIsAdmin || notificationUserRole === 'ADMIN') return true;
    try { return typeof Auth !== 'undefined' && Auth.getUser && String((Auth.getUser() || {}).role || '').toUpperCase() === 'ADMIN'; }
    catch (e) { return false; }
  }
  function isNotificationVisitor() {
    if (notificationUserRole === 'VISITOR') return true;
    try { return typeof Auth !== 'undefined' && Auth.getUser && String((Auth.getUser() || {}).role || '').toUpperCase() === 'VISITOR'; }
    catch (e) { return false; }
  }
  function deleteNotificationRecord(id) {
    if (!isNotificationAdmin()) return Promise.reject(new Error('Admin access is required to delete notification records.'));
    return notificationApi('deleteNotificationRecord', [id]).then(function () {
      records = records.filter(function (r) { return String(r.id) !== String(id); });
      if (editingId && String(editingId) === String(id)) clearForm();
      render();
      saveLocalRecords();
    });
  }

  function setDefaultForm() {
    var dt = $('notificationDateTime'); if (dt) dt.value = nowLocalInput(); var dtv = $('notificationDateTimeVisible'); if (dtv && dtv._syncNotificationDateTime) dtv._syncNotificationDateTime();
    var status = $('notificationStatus'); if (status) status.value = 'INFORMED';
    editingId = null;
    var mode = $('notificationFormMode'); if (mode) mode.textContent = 'NEW RECORD';
  }
  function clearForm() {
    var form = $('notificationForm'); if (form) form.reset(); var dtv = $('notificationDateTimeVisible'); if (dtv) dtv.value = ''; notificationDateTimeState = '';
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
    var nowParts = window.LabAppTime.nowParts(), currentYY = nowParts.year % 100;
    var year = yy <= currentYY ? 2000 + yy : 1900 + yy;
    var dob = new Date(year, mm - 1, dd);
    if (dob.getFullYear() !== year || dob.getMonth() !== mm - 1 || dob.getDate() !== dd) return;
    var age = nowParts.year - year;
    if (nowParts.month < mm || (nowParts.month === mm && nowParts.day < dd)) age--;
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
    evaluateResult(item, resultValue, $('notificationAge') ? $('notificationAge').value : '');
  }
  function evaluateAgeSensitiveResult(item, value, age) {
    var name = String(item && item.name || '').trim().toLowerCase();
    var raw = String(value || '').trim();
    var n = Number(raw.replace(/,/g, '').match(/-?[0-9]+(?:\.[0-9]+)?/)?.[0] || '');
    var years = Number(String(age == null ? '' : age).replace(/,/g, '').match(/\d+(?:\.\d+)?/)?.[0] || '');
    if (!raw || isNaN(n)) return false;

    // PT/APTT limits are relative to the laboratory reference range.
    // A patient result alone cannot calculate these limits.
    if (name === 'pt') {
      setFlag('REVIEW', 'normal');
      return true;
    }
    if (name === 'aptt') {
      if (n >= 80) setFlag('HIGH CRITICAL', 'critical');
      else setFlag('REVIEW', 'normal');
      return true;
    }

    // Bilirubin Paeds: neonate >513 µmol/L; children >428 µmol/L.
    if (name === 'bilirubin paeds') {
      if (isNaN(years)) { setFlag('REVIEW', 'normal'); return true; }
      var bilirubinLimit = years < 1 ? 513 : 428;
      if (n > bilirubinLimit) setFlag('HIGH CRITICAL', 'critical');
      else setFlag('REVIEW', 'normal');
      return true;
    }

    // Haematocrit is shown as a fraction (0.20/0.60), but some reports store
    // it as a percentage (20/60). Support both representations.
    if (name === 'haematocrit' || name === 'haematocrit paeds' || name === 'haematocrit neonate') {
      var low = Number(item.low), high = Number(item.high);
      if (Math.abs(n) > 1) { low *= 100; high *= 100; }
      if (n < low) setFlag('LOW CRITICAL', 'critical');
      else if (n > high) setFlag('HIGH CRITICAL', 'critical');
      else setFlag('REVIEW', 'normal');
      return true;
    }
    return false;
  }

  function evaluateResult(item, value, age) {
    if (evaluateAgeSensitiveResult(item, value, age)) return;
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

  function initNotificationNeumorphicDateTime() {
    var hidden = $('notificationDateTime'), visible = $('notificationDateTimeVisible');
    if (!hidden || !visible || visible._notificationDateTimeReady) return;
    visible._notificationDateTimeReady = true;

    function parseValue(value) {
      var raw = String(value || '').trim();
      if (!raw) return null;
      var m = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (m) return { year:Number(m[1]), month:Number(m[2])-1, day:Number(m[3]), hour:Number(m[4]), minute:Number(m[5]) };
      var p = window.LabAppTime && window.LabAppTime.formatDateTimeInput(raw);
      return p || null;
    }
    function toValue(parts) {
      return parts.year + '-' + window.LabAppTime.pad2(parts.month + 1) + '-' + window.LabAppTime.pad2(parts.day) + 'T' + window.LabAppTime.pad2(parts.hour) + ':' + window.LabAppTime.pad2(parts.minute);
    }
    function display(parts) {
      if (!parts) return '';
      var d = new Date(parts.year, parts.month, parts.day);
      var h = parts.hour % 12 || 12, ap = parts.hour >= 12 ? 'PM' : 'AM';
      return window.LabAppTime.pad2(d.getDate()) + '/' + window.LabAppTime.pad2(d.getMonth()+1) + '/' + d.getFullYear() + ' ' + window.LabAppTime.pad2(h) + ':' + window.LabAppTime.pad2(parts.minute) + ' ' + ap;
    }
    function cloneParts(p) { return {year:p.year, month:p.month, day:p.day, hour:p.hour, minute:p.minute}; }
    function currentParts() {
      var p = parseValue(hidden.value);
      if (p) return p;
      var nowParts = window.LabAppTime.nowParts();
      return {year:nowParts.year, month:nowParts.month - 1, day:nowParts.day, hour:nowParts.hour, minute:nowParts.minute};
    }
    function setValue(parts) {
      hidden.value = toValue(parts);
      notificationDateTimeState = hidden.value;
      visible.value = display(parts);
      hidden.dispatchEvent(new Event('input', {bubbles:true}));
      hidden.dispatchEvent(new Event('change', {bubbles:true}));
      visible.dispatchEvent(new Event('input', {bubbles:true}));
    }

    var pop = document.createElement('div');
    pop.className = 'notification-datetime-popover';
    pop.hidden = true;
    pop.innerHTML =
      '<div class="notification-datetime-head">' +
        '<div class="notification-datetime-month"></div>' +
        '<div class="notification-datetime-nav"><button type="button" data-prev aria-label="Previous month">‹</button><button type="button" data-next aria-label="Next month">›</button></div>' +
      '</div>' +
      '<div class="notification-datetime-body">' +
        '<div class="notification-datetime-calendar">' +
          '<div class="notification-datetime-week"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div>' +
          '<div class="notification-datetime-grid"></div>' +
        '</div>' +
        '<div class="notification-datetime-time">' +
          '<div class="notification-datetime-time-title">TIME</div>' +
          '<div class="notification-time-columns"><div><div class="notification-time-label">HOUR</div><div class="notification-time-list" data-hours></div></div><div><div class="notification-time-label">MIN</div><div class="notification-time-list" data-minutes></div></div><div><div class="notification-time-label">AM/PM</div><div class="notification-time-list" data-period></div></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="notification-datetime-foot"><button type="button" data-clear>Clear</button><button type="button" data-now>Now</button></div>';
    document.body.appendChild(pop);

    var view = currentParts();

    function key(parts) { return parts.year + '-' + window.LabAppTime.pad2(parts.month+1) + '-' + window.LabAppTime.pad2(parts.day); }
    function position() {
      var r = visible.getBoundingClientRect(), w = pop.offsetWidth || 470, h = pop.offsetHeight || 360;
      var left = Math.min(Math.max(10, r.left), Math.max(10, window.innerWidth - w - 10));
      var top = r.bottom + 8;
      if (top + h > window.innerHeight - 10) top = Math.max(10, r.top - h - 8);
      pop.style.left = left + 'px'; pop.style.top = top + 'px';
    }
    function chooseDate(date) {
      view.year=date.getFullYear(); view.month=date.getMonth(); view.day=date.getDate();
      setValue(view); render();
    }
    function renderTime() {
      var parts = currentParts();
      var hours = pop.querySelector('[data-hours]'), mins = pop.querySelector('[data-minutes]'), periods = pop.querySelector('[data-period]');
      hours.innerHTML = ''; mins.innerHTML = ''; periods.innerHTML = '';
      for (var h=1; h<=12; h++) {
        var hb=document.createElement('button'); hb.type='button'; hb.textContent=window.LabAppTime.pad2(h); hb.dataset.hour=String(h);
        if ((parts.hour % 12 || 12)===h) hb.classList.add('selected');
        hours.appendChild(hb);
      }
      for (var m=0; m<60; m++) {
        var mb=document.createElement('button'); mb.type='button'; mb.textContent=window.LabAppTime.pad2(m); mb.dataset.minute=String(m);
        if (parts.minute===m) mb.classList.add('selected');
        mins.appendChild(mb);
      }
      ['AM','PM'].forEach(function(ap){
        var pb=document.createElement('button'); pb.type='button'; pb.textContent=ap; pb.dataset.period=ap;
        if ((parts.hour>=12?'PM':'AM')===ap) pb.classList.add('selected');
        periods.appendChild(pb);
      });
    }
    function render() {
      var parts = currentParts();
      var monthLabel = pop.querySelector('.notification-datetime-month');
      monthLabel.textContent = new Date(view.year, view.month, 1).toLocaleDateString('en-GB',{month:'long',year:'numeric'});
      var grid = pop.querySelector('.notification-datetime-grid');
      grid.innerHTML = '';
      var first = new Date(view.year, view.month, 1), start = (first.getDay()+6)%7;
      var days = new Date(view.year, view.month+1, 0).getDate();
      var prevDays = new Date(view.year, view.month, 0).getDate();
      var todayKey = window.LabAppTime.todayKey();
      for (var i=0;i<42;i++) {
        var n=i-start+1, d=new Date(view.year,view.month,n), muted=false;
        if(n<1){d=new Date(view.year,view.month-1,prevDays+n);muted=true;}
        else if(n>days){d=new Date(view.year,view.month+1,n-days);muted=true;}
        var b=document.createElement('button'); b.type='button'; b.className='notification-datetime-day'+(muted?' muted':'')+(key({year:d.getFullYear(),month:d.getMonth(),day:d.getDate()})===todayKey?' today':'')+(d.getFullYear()===parts.year&&d.getMonth()===parts.month&&d.getDate()===parts.day?' selected':'');
        b.textContent=d.getDate(); b.dataset.date=key({year:d.getFullYear(),month:d.getMonth(),day:d.getDate()}); grid.appendChild(b);
      }
      renderTime();
    }
    function open() {
      var parts=currentParts(); view=cloneParts(parts); render(); pop.hidden=false; position();
      var selected=pop.querySelector('.notification-datetime-day.selected'); if(selected) selected.scrollIntoView({block:'nearest',inline:'nearest'});
    }
    function close() { pop.hidden=true; }
    function chooseTime(hour12, minute, period) {
      var parts=currentParts(), h=Number(hour12)%12;
      parts.hour = period==='PM' ? h+12 : h;
      if (parts.hour === 24) parts.hour = 12;
      parts.minute = Number(minute);
      setValue(parts); renderTime();
    }

    visible.value = display(currentParts());
    notificationDateTimeState = String(hidden.value || '').trim();
    visible.addEventListener('click', function(e){ e.preventDefault(); open(); });
    visible.addEventListener('focus', open);
    pop.addEventListener('click', function(e) {
      var b=e.target.closest('button'); if(!b) return;
      if(b.hasAttribute('data-prev')) { view.month--; if(view.month<0){view.month=11;view.year--;} render(); position(); }
      else if(b.hasAttribute('data-next')) { view.month++; if(view.month>11){view.month=0;view.year++;} render(); position(); }
      else if(b.dataset.date) { var parts=currentParts(), a=b.dataset.date.split('-').map(Number); parts.year=a[0];parts.month=a[1]-1;parts.day=a[2];setValue(parts);render(); }
      else if(b.dataset.hour) { var p=currentParts(); chooseTime(Number(b.dataset.hour),p.minute,p.hour>=12?'PM':'AM'); }
      else if(b.dataset.minute) { var p2=currentParts(); chooseTime(p2.hour%12||12,Number(b.dataset.minute),p2.hour>=12?'PM':'AM'); }
      else if(b.dataset.period) { var p3=currentParts(); chooseTime(p3.hour%12||12,p3.minute,b.dataset.period); }
      else if(b.hasAttribute('data-now')) { var nowParts=window.LabAppTime.nowParts(); setValue({year:nowParts.year,month:nowParts.month-1,day:nowParts.day,hour:nowParts.hour,minute:nowParts.minute}); render(); }
      else if(b.hasAttribute('data-clear')) { hidden.value=''; visible.value=''; hidden.dispatchEvent(new Event('change',{bubbles:true})); visible.focus(); close(); }
    });
    document.addEventListener('mousedown',function(e){if(!pop.hidden&&!pop.contains(e.target)&&e.target!==visible)close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!pop.hidden)close();});
    window.addEventListener('resize',function(){if(!pop.hidden)position();});
    window.addEventListener('scroll',function(){if(!pop.hidden)position();},true);
    visible._syncNotificationDateTime = function(){ var p=parseValue(hidden.value); notificationDateTimeState=String(hidden.value || '').trim(); visible.value=display(p); };
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
  function parseNotificationDisplayDateTime(value) {
    var raw = String(value || '').trim();
    if (!raw) return '';
    var m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return '';
    var hour = Number(m[4]);
    var minute = Number(m[5]);
    var ap = String(m[6]).toUpperCase();
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return '';
    if (ap === 'PM' && hour !== 12) hour += 12;
    if (ap === 'AM' && hour === 12) hour = 0;
    return m[3] + '-' + m[2] + '-' + m[1] + 'T' + window.LabAppTime.pad2(hour) + ':' + window.LabAppTime.pad2(minute);
  }

  function syncNotificationDateTimeBeforeSave() {
    var hidden = $('notificationDateTime');
    var visible = $('notificationDateTimeVisible');
    if (!hidden || !visible) return '';
    if (notificationDateTimeState) hidden.value = notificationDateTimeState;
    // The visible field is the user's actual date/time selection surface.
    // Reconcile it back to the canonical hidden value immediately before
    // collecting the payload, so an edit can never save the previous time.
    var parsed = parseNotificationDisplayDateTime(visible.value);
    if (parsed) hidden.value = parsed;
    notificationDateTimeState = String(hidden.value || '').trim();
    return notificationDateTimeState;
  }

  function collectForm() {
    return {
      id: editingId || ('N' + Date.now()),
      notification_datetime: syncNotificationDateTimeBeforeSave(),
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
    var visitorOnly = isNotificationVisitor();
    if (body) body.innerHTML = rows.map(function (r) {
      var cls = r.discipline === 'BIOCHEMISTRY' ? 'bio' : r.discipline === 'HAEMATOLOGY' ? 'hema' : 'micro';
      var statusCls = String(r.status).toLowerCase();
      return '<tr><td>' + fmtDate(r.updated_at || r.created_at || r.notification_datetime) + '</td>' +
        '<td class="patient">' + esc(r.patient_name) + '</td>' +
        '<td>' + esc(r.patient_id) + '</td>' +
        '<td>' + esc(r.unit) + '</td>' +
        '<td><span class="notification-pill ' + cls + '">' + esc(r.discipline) + '</span></td>' +
        '<td>' + esc(r.test_name || '—') + '</td>' +
        '<td class="result">' + esc(formatNotificationResult(r)) + '</td>' +
        '<td><span class="notification-pill flag">' + esc(r.flag) + '</span></td>' +
        '<td><span class="notification-pill status ' + statusCls + '">' + esc(r.status) + '</span></td>' +
        '<td class="notification-actions-cell"><div class="notification-actions">' +
        '<button type="button" class="notification-action outsource-mini icon-only" data-notification-view="' + esc(r.id) + '" title="View full details" aria-label="View full details"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.2 12s3.6-6 9.8-6 9.8 6 9.8 6-3.6 6-9.8 6-9.8-6-9.8-6Z"/><circle cx="12" cy="12" r="2.7"/></svg></button>' +
        (!visitorOnly ? '<button type="button" class="notification-action outsource-mini icon-only" data-notification-edit="' + esc(r.id) + '" title="Edit" aria-label="Edit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16.5V20h3.5L18.8 8.7l-3.5-3.5L4 16.5Z"/><path d="m13.8 6.2 3.5 3.5"/><path d="M20 4a2.1 2.1 0 0 1 0 3l-1 1-3.5-3.5 1-1a2.1 2.1 0 0 1 3 0Z"/></svg></button>' : '') +
        (!visitorOnly && isNotificationAdmin() ? '<button type="button" class="notification-action outsource-mini icon-only delete" data-notification-delete="' + esc(r.id) + '" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M7 7l1 13h8l1-13"/><path d="M10 11v5M14 11v5"/></svg></button>' : '') +
        '</div></td></tr>';
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
    var fields = [['Date / Time', fmtDate(record.updated_at || record.created_at || record.notification_datetime)],['Barcode',esc(record.barcode)],['Patient',esc(record.patient_name)],['ID / IC',esc(record.patient_id)],['Sex',esc(record.sex)],['Age',esc(record.age)],['Unit',esc(record.unit)],['Discipline',esc(record.discipline)],['Test',esc(record.test_name)],['Critical Limit',esc(record.critical_limit)],['Result',esc(record.result)],['Flag',esc(record.flag)],['Staff',esc(record.staff)],['Inform To',esc(record.inform_to)],['Status',esc(record.status)],['Notes',esc(record.notes || '—')]];
    if (grid) grid.innerHTML = fields.map(function (f) { return '<div class="notification-detail"><small>' + f[0] + '</small><strong>' + f[1] + '</strong></div>'; }).join('');
    modal.hidden = false;
  }
  function ensureNotificationSelectValue(id, value, fallbackLabel) {
    var el = $(id);
    if (!el) return;
    var v = String(value == null ? '' : value);
    if (v && !Array.prototype.some.call(el.options || [], function (opt) { return String(opt.value) === v; })) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v || fallbackLabel || '';
      el.appendChild(opt);
    }
    el.value = v;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function restoreNotificationEditFields(r) {
    /* Restore the complete persisted record, even when the reference catalogue
       is unavailable. Editing must never blank a field just because reference
       data has not finished loading. */
    $('notificationBarcode').value = r.barcode || '';
    $('notificationPatientName').value = r.patient_name || '';
    $('notificationIdIc').value = r.patient_id || '';
    $('notificationSex').value = r.sex || '';
    $('notificationAge').value = r.age || '';
    ensureNotificationSelectValue('notificationUnit', r.unit, 'Current unit');
    ensureNotificationSelectValue('notificationDiscipline', r.discipline, 'Current discipline');

    var test = $('notificationTest');
    if (test) {
      var disciplineList = testCatalogue[String(r.discipline || '')] || [];
      test.disabled = false;
      test.innerHTML = '<option value="">Select test</option>' + disciplineList.map(function (item) {
        return '<option value="' + esc(item.name) + '">' + esc(item.name) + '</option>';
      }).join('');
      ensureNotificationSelectValue('notificationTest', r.test_name, 'Current test');
    }

    var editItem = findTestItem();
    syncResultControl(editItem, r.result || '');

    /* The saved critical_limit is authoritative for an edit. If the catalogue
       is available we may show its rule, but never replace a persisted value
       with "catalogue not loaded". */
    var box = $('notificationCriticalLimit');
    var persistedRule = String(r.critical_limit || '').trim();
    var catalogueRule = editItem && editItem.rule ? String(editItem.rule).trim() : '';
    var ruleToShow = persistedRule || catalogueRule;
    if (box) {
      box.className = ruleToShow ? 'notification-critical-box' : 'notification-critical-box is-empty';
      box.innerHTML = '<strong>Critical Limit / Alert</strong><span>' +
        esc(ruleToShow || 'Reference catalogue not loaded') + '</span>';
    }

    /* Preserve the exact stored flag on edit; do not force a recalculation that
       could blank or change a historical notification when reference data is
       missing. */
    setFlag(r.flag || 'REVIEW', r.flag && r.flag !== 'REVIEW' ? 'critical' : 'normal');
    ensureNotificationSelectValue('notificationStaff', r.staff, 'Current staff');
    $('notificationInformTo').value = r.inform_to || '';
    ensureNotificationSelectValue('notificationStatus', r.status || 'INFORMED', 'Current status');
    $('notificationNotes').value = r.notes || '';
  }

  function editRecord(id) {
    if (isNotificationVisitor()) return;
    var r = records.find(function (x) { return String(x.id) === String(id); }); if (!r) return;
    editingId = r.id;

    // Restore the complete record before scrolling into edit mode.
    notificationDateTimeState = r.notification_datetime || '';
    var hiddenDateTime = $('notificationDateTime');
    if (hiddenDateTime) hiddenDateTime.value = notificationDateTimeState;
    var visibleDateTime = $('notificationDateTimeVisible');
    if (visibleDateTime && visibleDateTime._syncNotificationDateTime) visibleDateTime._syncNotificationDateTime();
    if (hiddenDateTime) {
      notificationDateTimeState = String(hiddenDateTime.value || '');
      hiddenDateTime.dispatchEvent(new Event('input', { bubbles: true }));
      hiddenDateTime.dispatchEvent(new Event('change', { bubbles: true }));
    }

    restoreNotificationEditFields(r);
    $('notificationFormMode').textContent = 'EDIT RECORD';
    var page = $('notification');
    if (page) {
      var formCard = page.querySelector('.notification-form-card');
      if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  function open() {
    if (window.Router && typeof window.Router.canAccessPage === 'function' && !window.Router.canAccessPage('notification')) {
      if (typeof window.Router.denyVisitorPageAccess === 'function') window.Router.denyVisitorPageAccess('notification');
      return;
    }
    var page = $('notification');
    if (!page) return;
    document.querySelectorAll('.page.active').forEach(function (p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav-btn.active').forEach(function (b) { b.classList.remove('active'); });
    var nav = document.querySelector('.nav-btn[data-page="notification"]'); if (nav) nav.classList.add('active');
    page.classList.add('active');
    clearForm();
    render();
    loadRecords();
  }
  function bind() {
    var form = $('notificationForm'); if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (isNotificationVisitor()) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (notificationSaving) return;
      var item = collectForm();
      if (!item.id) item.id = 'notif-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);
      // Date/Time is stored from the hidden canonical input, not the display
      // text, so the exact value selected in the picker is what gets persisted.
      if (!item.notification_datetime) {
        alert('Please select a valid Date / Time.');
        return;
      }
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      saveNotificationRecord(item)
        .then(function (saved) {
          // Re-render from the record returned by the API, so the table always
          // reflects the value that was actually persisted (especially date/time).
          var idx = records.findIndex(function (r) { return String(r.id) === String(saved.id); });
          if (idx >= 0) records[idx] = normalizeNotificationRecord(saved);
          clearForm();
          render();
        })
        .catch(function (error) {
          console.error('Notification save failed:', error);
          alert(error && error.message ? error.message : 'Unable to save Notification record.');
        })
        .finally(function () { if (submitBtn) submitBtn.disabled = false; });
    });
    var clear = $('notificationClearBtn'); if (clear) clear.addEventListener('click', function () { if (!isNotificationVisitor()) clearForm(); });
    var ic = $('notificationIdIc'); if (ic) ic.addEventListener('input', function () { parseIc(this.value); });
    var discipline = $('notificationDiscipline'); if (discipline) discipline.addEventListener('change', function () { populateTests(); updateRuleAndFlag(); });
    var test = $('notificationTest'); if (test) test.addEventListener('change', updateRuleAndFlag);
    var result = $('notificationResult'); if (result) result.addEventListener('input', updateRuleAndFlag);
    var resultSelect = $('notificationResultSelect'); if (resultSelect) resultSelect.addEventListener('change', updateRuleAndFlag);
    ['notificationSearch','notificationYearFilter','notificationMonthFilter','notificationDisciplineFilter','notificationFlagFilter','notificationStatusFilter'].forEach(function (id) { var el = $(id); if (el) { ['input','change'].forEach(function (evt) { el.addEventListener(evt, function () { currentPage = 1; render(); }); }); } });
    var body = $('notificationTableBody'); if (body) body.addEventListener('click', function (e) {
      var view = e.target.closest('[data-notification-view]'); if (view) { var r = records.find(function (x) { return String(x.id) === String(view.dataset.notificationView); }); if (r) showDetail(r); return; }
      var edit = e.target.closest('[data-notification-edit]'); if (edit) { editRecord(edit.dataset.notificationEdit); return; }
       var del = e.target.closest('[data-notification-delete]'); if (del) {
         if (!isNotificationAdmin()) return;
         var id = del.dataset.notificationDelete;
         var row = records.find(function (x) { return String(x.id) === String(id); });
         if (!row) return;
         var itemLabel = String(row.patient || row.patientName || row.name || 'this patient');
         var detailLabel = [row.dateTime || row.date || row.createdAt, row.test || row.testName, row.discipline || row.department].filter(Boolean).join(' · ');
         var confirmDelete = function () {
           del.disabled = true;
           deleteNotificationRecord(id).catch(function(error){ del.disabled = false; window.alert(error && error.message ? error.message : 'Unable to delete notification record.'); });
         };
         if (typeof window.requestAppConfirm === 'function') {
           window.requestAppConfirm(
             'DELETE NOTIFICATION RECORD?',
             'Delete notification record for ' + itemLabel + (detailLabel ? ' · ' + detailLabel : '') + '? This cannot be undone.',
             confirmDelete
           );
         } else {
           console.warn('App confirm modal is unavailable; destructive action cancelled.');
         }
       }
    });
  }

  window.LabNotification = { open: open, render: render, loadRecords: loadRecords, getRecords: function () { return records.slice(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ bind(); initNotificationNeumorphicDateTime(); initNotificationNeumorphicSelects(); }); else { bind(); initNotificationNeumorphicDateTime(); initNotificationNeumorphicSelects(); }
})(window, document);
