/* ===== ORIGINAL SCRIPT BLOCK: outsource-filter-clean-final-js ===== */
(function(){
  'use strict';
  var IDS=['outsourceYearFilter','outsourceMonthFilter','outsourceStatusFilter'];
  var active={menu:null,trigger:null,select:null};
  function closeMenu(){
    if(active.menu) active.menu.remove();
    if(active.trigger){active.trigger.classList.remove('is-open');active.trigger.setAttribute('aria-expanded','false');}
    active={menu:null,trigger:null,select:null};
  }
  function positionMenu(){
    if(!active.menu||!active.trigger)return;
    var r=active.trigger.getBoundingClientRect(), w=Math.max(r.width,180), h=active.menu.offsetHeight;
    var left=Math.min(Math.max(8,r.left),Math.max(8,window.innerWidth-w-8));
    var top=r.bottom+6;
    if(top+h>window.innerHeight-8) top=Math.max(8,r.top-h-6);
    active.menu.style.width=w+'px';active.menu.style.left=left+'px';active.menu.style.top=top+'px';
  }
  function sync(trigger,select){
    var label=trigger.querySelector('.outsource-filter-neo-label'), opt=select.options[select.selectedIndex];
    if(label)label.textContent=opt?opt.textContent:'All';
    trigger.setAttribute('aria-label',opt?opt.textContent:'All');
  }
  function openMenu(trigger,select){
    closeMenu();
    var menu=document.createElement('div'); menu.className='outsource-filter-neo-menu is-open'; menu.setAttribute('role','listbox');
    Array.prototype.forEach.call(select.options,function(opt){
      var b=document.createElement('button'); b.type='button'; b.textContent=opt.textContent; b.dataset.value=opt.value;
      if(opt.value===select.value)b.classList.add('is-selected');
      b.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        if(select.value!==opt.value){select.value=opt.value;select.dispatchEvent(new Event('change',{bubbles:true}));}
        sync(trigger,select);closeMenu();
      });
      menu.appendChild(b);
    });
    document.body.appendChild(menu);active={menu:menu,trigger:trigger,select:select};
    trigger.classList.add('is-open');trigger.setAttribute('aria-expanded','true');positionMenu();
  }
  function setup(select){
    if(!select||IDS.indexOf(select.id)<0)return;
    var search=select.closest('.outsource-search'); if(!search)return;
    var existing=select.closest('.outsource-filter-neo-wrap');
    if(existing){var t=existing.querySelector('.outsource-filter-neo-trigger');if(t)sync(t,select);return;}
    /* Remove legacy wrappers/triggers only for these three filters. */
    var parent=select.parentElement;
    if(parent && parent!==search && /outsource-(custom-select-wrap|filter-custom-wrap|select-wrap)/.test(parent.className||'')){
      var old=parent.querySelector('.outsource-select-trigger,.inventory-filter-trigger,.outsource-filter-trigger');
      if(old)old.remove(); parent.parentNode.insertBefore(select,parent); parent.remove();
    }
    search.querySelectorAll('.outsource-select-trigger,.inventory-filter-trigger,.outsource-filter-trigger').forEach(function(el){el.remove();});
    var wrap=document.createElement('div');wrap.className='outsource-filter-neo-wrap';
    var trigger=document.createElement('button');trigger.type='button';trigger.className='outsource-filter-neo-trigger';
    trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
    var label=document.createElement('span');label.className='outsource-filter-neo-label';
    var chev=document.createElement('span');chev.className='outsource-filter-neo-chevron';chev.textContent='⌄';
    trigger.append(label,chev);select.classList.add('outsource-filter-neo-native');
    select.parentNode.insertBefore(wrap,select);wrap.append(trigger,select);sync(trigger,select);
    trigger.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(active.trigger===trigger)closeMenu();else openMenu(trigger,select);});
    select.addEventListener('change',function(){sync(trigger,select);});
  }
  function init(){
    var grid=document.getElementById('moduleYearGrid');
    if(!grid||!grid.classList.contains('outsource-active-grid'))return;
    IDS.forEach(function(id){setup(document.getElementById(id));});
  }
  document.addEventListener('click',function(e){if(active.menu&&!e.target.closest('.outsource-filter-neo-menu')&&!e.target.closest('.outsource-filter-neo-trigger'))closeMenu();},true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();},true);
  window.addEventListener('resize',positionMenu);window.addEventListener('scroll',positionMenu,true);
  function start(){
    init();
    var grid=document.getElementById('moduleYearGrid');
    if(grid && window.MutationObserver){
      var pending=false;
      new MutationObserver(function(mutations){
        var added=false;
        for(var i=0;i<mutations.length;i++){
          if(mutations[i].addedNodes && mutations[i].addedNodes.length){added=true;break;}
        }
        if(!added || pending)return;
        pending=true;
        window.setTimeout(function(){pending=false;init();},40);
      }).observe(grid,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.setTimeout(init,100);
})();


/* ===== ORIGINAL SCRIPT BLOCK: inline-script-02 ===== */
/* +----------------------------------+
     * + LOGIN-SAFE THEME GUARD           +
     * +----------------------------------+ */
  (function () {
    try {
      /* Login screen must always start in light mode. Dark mode is applied only after authentication. */
      document.documentElement.classList.remove('dark-mode-preload');
    } catch (error) {
      console.warn('Theme preload failed:', error);
    }
  })();


/* ===== ORIGINAL SCRIPT BLOCK: inline-script-06 ===== */
/* +----------------------------------+
     * + CLIENT RUNTIME LOGIC             +
     * +----------------------------------+ */

/* +----------------------------------------------------------+
 * + POLYFILLS, STATE, SERVICES, ROUTING & MODULE CONTROLLERS +
 * +----------------------------------------------------------+ */
  if (window.Element && !Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  }
  if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest = function (selector) {
      var el = this;
      do {
        if (Element.prototype.matches && Element.prototype.matches.call(el, selector)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
  
  (function (window, document) {
    'use strict';
  
    if (window.LabApp && window.LabApp.__initialized) {
      console.warn('LabApp already initialized; duplicate script ignored.');
      return;
    }
  
    var currentYear = new Date().getFullYear();
  
    var config = Object.freeze({
      shortMonthNames: Object.freeze(['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']),
      fullMonthNames: Object.freeze(['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']),
      weekdayNames: Object.freeze(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
      rosterKey: 'labDailyRosterV26',
      rosterPartitionPrefix: 'labDailyRosterV26_',
      rosterTeamPartitionPrefix: 'labDailyRosterV26_team_',
  	    rosterPollMs: 120000,
  	    timeZone: 'Asia/Kuala_Lumpur',
  	    moduleYearStart: Math.max(2026, currentYear - 1),
  	    moduleYearEnd: currentYear + 4,
  	    appVersion: '2.1.4',
  	    liveChatMaxTextLength: 400,
  	    systemLogRetentionDays: 14,
  	    systemLogRetentionLabel: '14-day retention',
  	    systemLogAutoClearText: 'Logs auto-clear after 14 days.',
  	    defaultUnits: Object.freeze(['']),
        legacyDailyRosterRotation: Object.freeze({
          anchorMonth: 5,
          anchorDay: 1,
          staffNames: Object.freeze(['SHOUNNA', 'LIZA', 'JAYANTHI', 'SURIANI', 'TOMMY', 'JAPIDI'])
        }),
  	    dailyRosterRotation: Object.freeze({
          startDate: '2026-08-01',
          endDate: '2026-11-30',
          anchorDate: '2026-08-01',
          staffNames: Object.freeze(['LIZA', 'JAYANTHI', 'SURIANI', 'JAPIDI', 'SHOUNNA'])
        }),
        decemberOnCallRotation: Object.freeze({
          startDate: '2026-12-01',
          endDate: '9999-12-31',
          anchorDate: '2026-12-01',
          staffNames: Object.freeze(['SURIANI', 'JAPIDI', 'SHOUNNA', 'NAZRAN', 'LIZA', 'JAYANTHI'])
        }),
  	    defaultStaffNames: Object.freeze(['SHOUNNA', 'LIZA', 'JAYANTHI', 'SURIANI', 'TOMMY', 'JAPIDI', 'NAZRAN'])
  	  });
  

  
    var state = {
      initialized: false,
      clockTimer: null,
      clockDateKey: '',
      serverClockOffsetMs: 0,
      serverTimeSynced: false,
      timeZoneFormatter: null,
      calendarNeedsRefresh: false,
      rosterInputSaveTimer: null,
      rosterCloudSaveTimer: null,
      rosterCloudPollTimer: null,
      rosterCloudLoading: false,
      rosterCloudSaving: false,
      rosterFlushBound: false,
      rosterCalendarRenderQueued: false,
      rosterLastSavedJson: '',
      rosterCloudUpdatedAt: '',
      rosterCloudStore: {},
      rosterLocalRevision: 0,
      viewDate: new Date(),
      selectedDate: new Date(),
      calendarHasUserSelection: false,
  	    holidaysByDate: {},
  	    holidayYearsLoaded: {},
  	    holidayYearsLoading: {},
  	    holidayLoadSources: {},
  	    todayKey: '',
  	    authUserDisplayName: '',
  	    authUserId: '',
      authRole: '',
      todayFloatingCardPosition: null,
      todayFloatingCardDrag: null,
      todayFloatingCardBound: false
    };
  
  	  var moduleDisplayNames = {
      OUTSOURCE: 'OUTSOURCE',
      INVENTORY: 'INVENTORY',
      TRANSFUSION: 'TRANSFUSION',
      POCT: 'POCT',
      'Chemical Pathology': 'CHEMICAL PATHOLOGY',
      Hematology: 'HEMATOLOGY',
      Microbiology: 'MICROBIOLOGY',
      'Urine/Stool Analysis': 'URINE/STOOL ANALYSIS',
      NOTIFICATION: 'NOTIFICATION',
      'LEAVE & COURSES': 'LEAVE & COURSES',
      LEAVE: 'LEAVE',
  	    COURSES: 'COURSES'
  	  };
  
  	  var holidayRegionParserCases = Object.freeze([
  	    Object.freeze({ input: 'National', regions: Object.freeze(['National']) }),
  	    Object.freeze({ input: 'National except Sabah', regions: Object.freeze(['Selangor', 'WP Kuala Lumpur']) }),
  	    Object.freeze({ input: 'National except Selangor', regions: Object.freeze(['WP Kuala Lumpur', 'Sabah']) }),
  	    Object.freeze({ input: 'National except Kuala Lumpur', regions: Object.freeze(['Selangor', 'Sabah']) }),
  	    Object.freeze({ input: 'National except Johor, Kedah, Melaka, Negeri Sembilan, Sabah & Sarawak', regions: Object.freeze(['Selangor', 'WP Kuala Lumpur']) }),
  	    Object.freeze({ input: 'Federal Territory', regions: Object.freeze(['WP Kuala Lumpur']) }),
  	    Object.freeze({ input: 'Federal Territories', regions: Object.freeze(['WP Kuala Lumpur']) }),
  	    Object.freeze({ input: 'Wilayah Persekutuan', regions: Object.freeze(['WP Kuala Lumpur']) }),
  	    Object.freeze({ input: 'Wilayah Persekutuan Labuan', regions: Object.freeze([]) }),
  	    Object.freeze({ input: 'Kuala Lumpur & Selangor', regions: Object.freeze(['Selangor', 'WP Kuala Lumpur']) }),
  	    Object.freeze({ input: 'Sabah', regions: Object.freeze(['Sabah']) })
  	  ]);

      var holidayClientCacheVersion = 'v12-target-regions-only';
      var holidayClientCacheMaxAgeMs = 12 * 60 * 60 * 1000;

      var officialHolidaySupplementalRows = Object.freeze([
        Object.freeze({ date: '2026-02-02', name: 'Thaipusam Holiday', regions: Object.freeze(['Selangor', 'WP Kuala Lumpur']) }),
        Object.freeze({ date: '2026-02-03', name: 'Federal Territory Day Holiday', regions: Object.freeze(['WP Kuala Lumpur']) }),
        Object.freeze({ date: '2026-03-20', name: 'Hari Raya Aidilfitri Holiday', regions: Object.freeze(['National']) }),
        Object.freeze({ date: '2026-03-23', name: 'Hari Raya Aidilfitri Holiday', regions: Object.freeze(['Selangor', 'WP Kuala Lumpur', 'Sabah']) }),
        Object.freeze({ date: '2026-06-02', name: 'Wesak Day Holiday', regions: Object.freeze(['Selangor', 'WP Kuala Lumpur']) }),
        Object.freeze({ date: '2026-11-09', name: 'Deepavali Holiday', regions: Object.freeze(['Selangor', 'WP Kuala Lumpur', 'Sabah']) })
      ]);

  
    var moduleYearDescriptions = {
      'OUTSOURCE': 'Centralized yearly records for outsourced laboratory investigations, referral testing, and external service tracking to support continuity, traceability, and result follow-up.',
      'INVENTORY': 'Annual inventory records for monitoring laboratory supplies, stock movement, reagent availability, and resource control to support uninterrupted service delivery.',
      'TRANSFUSION': 'Annual transfusion service records for documenting blood bank activities, traceability, quality monitoring, and compliance with safe transfusion practices.',
      'POCT': 'Annual point-of-care testing records for monitoring device management, quality control, competency, and operational compliance across POCT services.',
      'CHEMICAL PATHOLOGY': 'Annual Chemical Pathology records for documenting service activities, quality indicators, reagent monitoring, and operational reference information.',
      'HEMATOLOGY': 'Annual Hematology records for documenting service activities, quality indicators, analyzer monitoring, and operational reference information.',
      'MICROBIOLOGY': 'Annual Microbiology records for documenting service activities, culture-related records, quality monitoring, and operational reference information.',
      'URINE/STOOL ANALYSIS': 'Annual Urine and Stool Analysis records for documenting examination activities, quality monitoring, workload tracking, and operational reference information.',
      'NOTIFICATION': 'Centralized yearly notification records for documenting and tracking all critical laboratory findings to support immediate communication with healthcare providers.'
    };
  
    var moduleYearExternalLinks = {
      'OUTSOURCE': {},
      'TRANSFUSION': {},
      'POCT': {
        '2026': 'https://drive.google.com/drive/folders/1ZjbO6Bg3Par53_TeO2WV1N518eSFBLu7?usp=sharing'
      },
      'CHEMICAL PATHOLOGY': {
        '2026': 'https://drive.google.com/drive/folders/1oGJKzU1_KJ_UUGDbO-M7MfgicAo1IGrX?usp=sharing'
      },
      'HEMATOLOGY': {
        '2026': 'https://drive.google.com/drive/folders/1AEZyThQlY3EOUadPnj-2nuNMbuAqASDF?usp=sharing'
      },
      'MICROBIOLOGY': {
        '2026': 'https://drive.google.com/drive/folders/1ad1VDY4Oi0VNIwLibanz-oQnoZmPMuOH?usp=sharing'
      },
      'URINE/STOOL ANALYSIS': {
        '2026': 'https://drive.google.com/drive/folders/1XtPFI7XT8mha3IDQgfPpHam7sThSIlG_?usp=sharing'
      },
      'NOTIFICATION': {
        '2026': 'https://docs.google.com/spreadsheets/d/1ki6SCA8NHiM6o-M1XV2hG-JHD3SQ8XqiC1AMfS5nsPo/edit?gid=0#gid=0'
      },
      'LEAVE': {
        '2026': 'https://docs.google.com/spreadsheets/d/14dH4UqPU4KV74XTc0EIz9ZRLcyEEQF4Wefq_Gtw4wgw/edit?gid=1348265286#gid=1348265286'
      },
      'COURSES': {
        '2026': 'https://drive.google.com/drive/folders/118IL4wJmTsw4qScrS01L5knnscRL3I4Z'
      }
    };
  
    /* +----------------------------------+
     * + RUNTIME UTILITIES                +
     * +----------------------------------+ */
    /* +----------------------------------+
     * + $                                +
     * +----------------------------------+ */
    function $(id) { return document.getElementById(id); }
  
    /* +----------------------------------+
     * + pad2                             +
     * +----------------------------------+ */
    function pad2(value) {
      value = String(value);
      return value.length < 2 ? '0' + value : value;
    }
  
    /* +----------------------------------+
     * + isFiniteNumber                   +
     * +----------------------------------+ */
    function isFiniteNumber(value) {
      return typeof value === 'number' && isFinite(value);
    }
  
    /* +----------------------------------+
     * + dateKey                          +
     * +----------------------------------+ */
    function dateKey(dateObj) {
      return dateObj.getFullYear() + '-' + pad2(dateObj.getMonth() + 1) + '-' + pad2(dateObj.getDate());
    }
  
    /* +----------------------------------+
     * + getTimeZoneFormatter             +
     * +----------------------------------+ */
    function getTimeZoneFormatter() {
      if (state.timeZoneFormatter) return state.timeZoneFormatter;
      if (!window.Intl || !window.Intl.DateTimeFormat) return null;
      try {
        state.timeZoneFormatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: config.timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        return state.timeZoneFormatter;
      } catch (error) {
        console.warn('Timezone formatter unavailable, using fixed MYT offset fallback:', error);
        return null;
      }
    }
  
    /* +----------------------------------+
     * + normalizeFormattedHour           +
     * +----------------------------------+ */
    function normalizeFormattedHour(hourValue) {
      var hour = Number(hourValue);
      if (!isFiniteNumber(hour)) return 0;
      return hour === 24 ? 0 : hour;
    }
  
    /* +----------------------------------+
     * + getMalaysiaTimeParts             +
     * +----------------------------------+ */
    function getMalaysiaTimeParts(instantDate) {
      var dateObj = instantDate instanceof Date ? instantDate : new Date();
      var formatter = getTimeZoneFormatter();
      if (formatter && typeof formatter.formatToParts === 'function') {
        var map = {};
        formatter.formatToParts(dateObj).forEach(function (part) {
          if (part && part.type && part.type !== 'literal') map[part.type] = part.value;
        });
        if (map.year && map.month && map.day && map.hour && map.minute && map.second) {
          return {
            year: Number(map.year),
            month: Number(map.month),
            day: Number(map.day),
            hour: normalizeFormattedHour(map.hour),
            minute: Number(map.minute),
            second: Number(map.second)
          };
        }
      }
  
      var shifted = new Date(dateObj.getTime() + (8 * 60 * 60 * 1000));
      return {
        year: shifted.getUTCFullYear(),
        month: shifted.getUTCMonth() + 1,
        day: shifted.getUTCDate(),
        hour: shifted.getUTCHours(),
        minute: shifted.getUTCMinutes(),
        second: shifted.getUTCSeconds()
      };
    }
  
    /* +----------------------------------+
     * + getWeekdayIndexFromParts         +
     * +----------------------------------+ */
    function getWeekdayIndexFromParts(parts) {
      parts = parts || {};
      return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day))).getUTCDay();
    }
  
    /* +----------------------------------+
     * + dateKeyFromParts                 +
     * +----------------------------------+ */
    function dateKeyFromParts(parts) {
      return Number(parts.year) + '-' + pad2(Number(parts.month)) + '-' + pad2(Number(parts.day));
    }
  
    /* +----------------------------------+
     * + createCalendarDateFromParts      +
     * +----------------------------------+ */
    function createCalendarDateFromParts(parts) {
      parts = parts || getAppNowParts();
      return new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day), 12, 0, 0);
    }
  
    /* +----------------------------------+
     * + getServerAlignedInstant          +
     * +----------------------------------+ */
    function getServerAlignedInstant() {
      return new Date(Date.now() + (Number(state.serverClockOffsetMs) || 0));
    }
  
    /* +----------------------------------+
     * + getAppNowParts                   +
     * +----------------------------------+ */
    function getAppNowParts() {
      return getMalaysiaTimeParts(getServerAlignedInstant());
    }
  
  
    /* +----------------------------------+
     * + getAppDateKey                    +
     * +----------------------------------+ */
    function getAppDateKey() {
      return dateKeyFromParts(getAppNowParts());
    }
  
  
    /* +----------------------------------+
     * + parseIsoMillis                   +
     * +----------------------------------+ */
    function parseIsoMillis(value) {
      var text = String(value == null ? '' : value).trim();
      var match = text.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/);
      if (!match) return NaN;
      return Date.UTC(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4]),
        Number(match[5]),
        Number(match[6]),
        Number(((match[7] || '0') + '000').substring(0, 3))
      );
    }
  
    /* +----------------------------------+
     * + syncServerClock                  +
     * +----------------------------------+ */
    function syncServerClock(envelope) {
      var serverMs = parseIsoMillis(envelope && envelope.serverIso);
      if (!isFiniteNumber(serverMs)) return false;
      state.serverClockOffsetMs = serverMs - Date.now();
      state.serverTimeSynced = true;
      return true;
    }
  
    /* +----------------------------------+
     * + isTruthy                         +
     * +----------------------------------+ */
    function isTruthy(value) {
      if (value === true || value === 1) return true;
      var text = String(value == null ? '' : value).trim().toLowerCase();
      return text === 'true' || text === '1' || text === 'yes' || text === 'y';
    }
  
    /* +----------------------------------+
     * + hasVercelBackend                 +
     * +----------------------------------+ */
    function hasVercelBackend() {
      return true; // Backend actions are served by Vercel API.
    }


    /* Vercel bridge for browser-hosted deployment */
    async function hoagApiRequest(action, payload) {
      /* Authentication uses dedicated Vercel endpoints. This keeps login and
       * session validation independent from the general application bridge. */
      var authAction = String(action || '');
      var authEndpoint = authAction === 'login' ? '/api/login' : (authAction === 'loginState' ? '/api/login-state' : (authAction === 'logout' ? '/api/logout' : ''));
      var requestBody = payload && typeof payload === 'object' ? payload : {};
      var body = authEndpoint ? JSON.stringify(requestBody) : JSON.stringify({
        action: authAction,
        payload: requestBody
      });
      const response = await fetch(authEndpoint || '/api/bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: body
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        throw new Error('API returned an invalid response.');
      }

      /* Keep the HTTP result attached to the login envelope so the login
       * screen can show an exact diagnostic instead of appearing to vanish. */
      if (authAction === 'login') {
        if (data && typeof data === 'object') {
          data._httpStatus = response.status;
          data._requestId = data.requestId || response.headers.get('X-Request-Id') || '';
        }
        if (!response.ok) return data;
      }
      if (!response.ok) {
        var apiError = data && data.error ? data.error : 'API request failed.';
        var apiRequestId = data && data.requestId ? ' [Request ID: ' + data.requestId + ']' : '';
        throw new Error(apiError + apiRequestId);
      }
      return data;
    }

    // Fluent replacement for Vercel API's former runner. Calls go to Vercel only.
    // It preserves existing success/failure callback behavior while passing the
    // method name and positional arguments to the single API dispatcher.
    const hoagApi = {
      run: new Proxy({}, {
        get: function (_target, property) {
          if (property === 'withSuccessHandler') return function (callback) {
            const chain = { success: typeof callback === 'function' ? callback : function () {}, failure: function () {} };
            return new Proxy({}, { get: function (_t, method) {
              if (method === 'withSuccessHandler') return function (fn) { chain.success = fn; return this; };
              if (method === 'withFailureHandler') return function (fn) { chain.failure = fn; return this; };
              return function () { invokeVercelAction(String(method), Array.prototype.slice.call(arguments), chain); };
            }});
          };
          if (property === 'withFailureHandler') return function (callback) {
            const chain = { success: function () {}, failure: typeof callback === 'function' ? callback : function () {} };
            return new Proxy({}, { get: function (_t, method) {
              if (method === 'withSuccessHandler') return function (fn) { chain.success = fn; return this; };
              if (method === 'withFailureHandler') return function (fn) { chain.failure = fn; return this; };
              return function () { invokeVercelAction(String(method), Array.prototype.slice.call(arguments), chain); };
            }});
          };
          return function () { invokeVercelAction(String(property), Array.prototype.slice.call(arguments), { success: function () {}, failure: function () {} }); };
        }
      })
    };

    function invokeVercelAction(action, args, handlers) {
      hoagApiRequest('action', { method: action, args: args }).then(function (result) {
        if (handlers && handlers.success) handlers.success(result);
      }).catch(function (error) {
        if (handlers && handlers.failure) handlers.failure(error);
        else console.warn('Vercel API action failed:', action, error && error.message ? error.message : error);
      });
    }
  
    /* +----------------------------------+
     * + safeParse                        +
     * +----------------------------------+ */
    function safeParse(value) {
      try {
        var parsed = JSON.parse(value || '{}');
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch (error) {
        return {};
      }
    }
  
    /* +----------------------------------+
     * + cleanText                        +
     * +----------------------------------+ */
    function cleanText(value) {
      return String(value == null ? '' : value).trim().slice(0, 500);
    }
  
    /* +----------------------------------+
     * + forEachNode                      +
     * +----------------------------------+ */
    function forEachNode(nodes, callback) {
      Array.prototype.forEach.call(nodes || [], callback);
    }
  
    /* +----------------------------------+
     * + setTextIfChanged                 +
     * +----------------------------------+ */
    function setTextIfChanged(node, value) {
      if (!node) return;
      var text = String(value == null ? '' : value);
      if (node.textContent !== text) node.textContent = text;
    }

    /* +----------------------------------+
     * + setAttributeIfChanged            +
     * +----------------------------------+ */
    function setAttributeIfChanged(node, name, value) {
      if (!node) return;
      var nextValue = String(value == null ? '' : value);
      if (node.getAttribute(name) !== nextValue) node.setAttribute(name, nextValue);
    }
  
    /* +----------------------------------+
     * + rafThrottle                      +
     * +----------------------------------+ */
    function rafThrottle(callback) {
      var queued = false;
      var lastContext = null;
      var lastArgs = null;
      return function throttledRafCallback() {
        lastContext = this;
        lastArgs = arguments;
        if (queued) return;
        queued = true;
        var runner = function () {
          queued = false;
          callback.apply(lastContext, lastArgs);
        };
        if (window.requestAnimationFrame) window.requestAnimationFrame(runner);
        else window.setTimeout(runner, 16);
      };
    }
  
    /* +----------------------------------+
     * + cloneObject                      +
     * +----------------------------------+ */
    function cloneObject(source) {
      var clone = {};
      source = source && typeof source === 'object' ? source : {};
      Object.keys(source).forEach(function (key) { clone[key] = source[key]; });
      return clone;
    }
  
    /* +----------------------------------+
     * + normalizeRoster                  +
     * +----------------------------------+ */
    function normalizeRoster(roster) {
      var normalized = {};
      if (!roster || typeof roster !== 'object' || Array.isArray(roster)) return normalized;
  
      Object.keys(roster).sort().forEach(function (key) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !Array.isArray(roster[key])) return;
        var rows = roster[key].map(function (row) {
          row = row && typeof row === 'object' ? row : {};
          var staffText = cleanText(row.staff);
          var originalStaffText = cleanText(row.originalStaff);
          return {
            time: cleanText(row.time),
            unit: cleanText(row.unit),
            originalStaff: originalStaffText,
            staff: staffText,
            task: cleanText(row.task || 'ON CALL'),
            note: cleanText(row.note),
            assigned: isTruthy(row.assigned)
          };
        }).filter(function (row) {
          return row.staff || row.originalStaff || row.note || row.unit;
        }).slice(0, 120);
        if (rows.length) normalized[key] = rows;
      });
  
      return normalized;
    }
  
    /* +----------------------------------+
     * + stableJson                       +
     * +----------------------------------+ */
    function stableJson(roster) { return JSON.stringify(normalizeRoster(roster)); }
    /* +----------------------------------+
     * + sameRoster                       +
     * +----------------------------------+ */
    function sameRoster(a, b) { return stableJson(a) === stableJson(b); }
  
    /* +----------------------------------+
     * + isSensitiveBrowserStorageKey     +
     * +----------------------------------+ */
    function isSensitiveBrowserStorageKey(key) {
      var value = String(key || '').toLowerCase();
      var protectedPrefixes = ['labDailyRosterV26', 'labAppInventory', 'labAppUserNotesLocalPreviewV1'];
      return protectedPrefixes.some(function (prefix) {
        return value.indexOf(prefix.toLowerCase()) === 0;
      }) || /(?:transfusion|outsource|patient|clinical|roster|inventory|audit|notes?|password|token|secret|credential)/i.test(value);
    }

    /* +----------------------------------+
     * + safeStorageGet                   +
     * +----------------------------------+ */
    function safeStorageGet(key) {
      if (isSensitiveBrowserStorageKey(key)) return null;
      try { return window.localStorage ? window.localStorage.getItem(key) : null; }
      catch (error) { console.warn('Local storage read failed:', error); return null; }
    }
  
    /* +----------------------------------+
     * + safeStorageSet                   +
     * +----------------------------------+ */
    function safeStorageSet(key, value) {
      try {
        if (!window.localStorage || isSensitiveBrowserStorageKey(key)) return false;
        window.localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('Local storage write failed:', error);
        return false;
      }
    }
  
    /* +----------------------------------+
     * + safeStorageRemove                +
     * +----------------------------------+ */
    function safeStorageRemove(key) {
      try {
        if (!window.localStorage) return false;
        window.localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn('Local storage remove failed:', error);
        return false;
      }
    }
  
    /* +----------------------------------+
     * + safeSessionGet                   +
     * +----------------------------------+ */
    function safeSessionGet(key) {
      if (isSensitiveBrowserStorageKey(key)) return null;
      try { return window.sessionStorage ? window.sessionStorage.getItem(key) : null; }
      catch (error) { console.warn('Session storage read failed:', error); return null; }
    }
  
    /* +----------------------------------+
     * + safeSessionSet                   +
     * +----------------------------------+ */
    function safeSessionSet(key, value) {
      try {
        if (!window.sessionStorage || isSensitiveBrowserStorageKey(key)) return false;
        window.sessionStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('Session storage write failed:', error);
        return false;
      }
    }
  
    /* +----------------------------------+
     * + safeSessionRemove                +
     * +----------------------------------+ */
    function safeSessionRemove(key) {
      try {
        if (!window.sessionStorage) return false;
        window.sessionStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn('Session storage remove failed:', error);
        return false;
      }
    }

    var appConfirmState = { bound: false, onYes: null };

    /* +----------------------------------+
     * + closeAppConfirm                  +
     * +----------------------------------+ */
    function closeAppConfirm(confirmed) {
      var modal = $('appConfirmModal');
      if (modal) modal.classList.add('is-hidden');
      var callback = appConfirmState.onYes;
      appConfirmState.onYes = null;
      if (confirmed && typeof callback === 'function') callback();
    }

    /* +----------------------------------+
     * + bindAppConfirm                   +
     * +----------------------------------+ */
    function bindAppConfirm() {
      if (appConfirmState.bound) return;
      appConfirmState.bound = true;
      var yes = $('appConfirmYes');
      var cancel = $('appConfirmCancel');
      if (yes) yes.addEventListener('click', function () { closeAppConfirm(true); });
      if (cancel) cancel.addEventListener('click', function () { closeAppConfirm(false); });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && appConfirmState.onYes) closeAppConfirm(false);
      });
    }

    /* +----------------------------------+
     * + requestAppConfirm                +
     * +----------------------------------+ */
    function requestAppConfirm(titleText, bodyText, onYes) {
      var modal = $('appConfirmModal');
      var title = $('appConfirmTitle');
      var text = $('appConfirmText');
      if (!modal || !title || !text) {
        console.warn('App confirm modal is missing; destructive action cancelled.');
        return;
      }
      bindAppConfirm();
      title.textContent = titleText || 'Confirm Action';
      text.textContent = bodyText || 'Are you sure?';
      appConfirmState.onYes = onYes;
      modal.classList.remove('is-hidden');
      var cancel = $('appConfirmCancel');
      if (cancel) cancel.focus();
    }
  
    /* +----------------------------------+
     * + normalizeRosterStorageUserId     +
     * +----------------------------------+ */
    function normalizeRosterStorageUserId(value) {
      return String(value || 'LOCAL')
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 48) || 'LOCAL';
    }
  
    /* +----------------------------------+
     * + getRosterStorageUserId           +
     * +----------------------------------+ */
    function getRosterStorageUserId() {
      return 'TEAM';
    }
  
    /* +----------------------------------+
     * + getRosterPartitionPrefix         +
     * +----------------------------------+ */
    function getRosterPartitionPrefix() {
      return config.rosterTeamPartitionPrefix + getRosterStorageUserId() + '_';
    }
  
    /* +----------------------------------+
     * + getRosterPartitionKey            +
     * +----------------------------------+ */
    function getRosterPartitionKey(year) {
      return getRosterPartitionPrefix() + Number(year);
    }
  
    /* +----------------------------------+
     * + shouldReadLegacyLocalRoster      +
     * +----------------------------------+ */
    function shouldReadLegacyLocalRoster() {
      return !state.authUserId;
    }
  
    /* +----------------------------------+
     * + addRosterYear                    +
     * +----------------------------------+ */
    function addRosterYear(years, year) {
      year = Number(year);
      if (isFiniteNumber(year) && year >= 1900 && year <= 2200) years[String(year)] = true;
    }
  
    /* +----------------------------------+
     * + getYearsFromRoster               +
     * +----------------------------------+ */
    function getYearsFromRoster(roster) {
      var years = {};
      roster = normalizeRoster(roster);
      Object.keys(roster).forEach(function (key) {
        addRosterYear(years, key.slice(0, 4));
      });
      return Object.keys(years).sort().map(Number);
    }
  
    var rosterMemoryPartitions = {};

    /* +----------------------------------+
     * + getStoredRosterPartitionYears    +
     * +----------------------------------+ */
    function getStoredRosterPartitionYears() {
      var years = {};
      var storage = null;
      var i;
      var key;
      var suffix;
      var scopedPrefix = getRosterPartitionPrefix();
      Object.keys(rosterMemoryPartitions).forEach(function (year) {
        if (rosterMemoryPartitions[year] && Object.keys(rosterMemoryPartitions[year]).length) {
          addRosterYear(years, year);
        }
      });
      if (state.rosterCloudStore && typeof state.rosterCloudStore === 'object') {
        Object.keys(state.rosterCloudStore).forEach(function (dateKeyStr) {
          addRosterYear(years, dateKeyStr.slice(0, 4));
        });
      }
      try {
        storage = window.localStorage || null;
        if (storage && typeof storage.length === 'number') {
          for (i = 0; i < storage.length; i += 1) {
            key = storage.key(i) || '';
            if (key.indexOf(scopedPrefix) !== 0) continue;
            suffix = key.slice(scopedPrefix.length);
            if (/^\d{4}$/.test(suffix)) addRosterYear(years, suffix);
          }
        }
      } catch (error) {
        console.warn('Local roster partition scan failed:', error);
      }
      return Object.keys(years).sort().map(Number);
    }
  
    /* +----------------------------------+
     * + getLegacyRosterPartitionYears    +
     * +----------------------------------+ */
    function getLegacyRosterPartitionYears() {
      var years = {};
      var storage = null;
      var i;
      var key;
      var suffix;
      try {
        storage = window.localStorage || null;
        if (!storage || typeof storage.length !== 'number') return [];
        for (i = 0; i < storage.length; i += 1) {
          key = storage.key(i) || '';
          if (key.indexOf(config.rosterPartitionPrefix) !== 0) continue;
          suffix = key.slice(config.rosterPartitionPrefix.length);
          if (/^\d{4}$/.test(suffix)) addRosterYear(years, suffix);
        }
      } catch (error) {
        console.warn('Legacy local roster partition scan failed:', error);
        return [];
      }
      return Object.keys(years).sort().map(Number);
    }
  
    /* +----------------------------------+
     * + readLegacyLocalRoster            +
     * +----------------------------------+ */
    function readLegacyLocalRoster() {
      var merged = normalizeRoster(safeParse(safeStorageGet(config.rosterKey)));
      getLegacyRosterPartitionYears().forEach(function (year) {
        mergeRosterInto(merged, safeParse(safeStorageGet(config.rosterPartitionPrefix + year)), [year]);
      });
      return normalizeRoster(merged);
    }
  
    /* +----------------------------------+
     * + getRelevantRosterYears           +
     * +----------------------------------+ */
    function getRelevantRosterYears() {
      var years = {};
      var nowParts = getAppNowParts();
      addRosterYear(years, nowParts.year);
      addRosterYear(years, Number(nowParts.year) - 1);
      addRosterYear(years, state.viewDate && state.viewDate.getFullYear());
      addRosterYear(years, state.selectedDate && state.selectedDate.getFullYear());
      return Object.keys(years).sort().map(Number);
    }
  
    /* +----------------------------------+
     * + normalizeRosterYearScope         +
     * +----------------------------------+ */
    function normalizeRosterYearScope(years) {
      var out = {};
      if (years === 'all') {
        getStoredRosterPartitionYears().forEach(function (year) { addRosterYear(out, year); });
        if (shouldReadLegacyLocalRoster()) {
          getYearsFromRoster(readLegacyLocalRoster()).forEach(function (year) { addRosterYear(out, year); });
        }
      } else if (Array.isArray(years)) {
        years.forEach(function (year) { addRosterYear(out, year); });
      } else if (years && typeof years === 'object' && Array.isArray(years.years)) {
        years.years.forEach(function (year) { addRosterYear(out, year); });
      }
      if (!Object.keys(out).length && years !== 'all') {
        getRelevantRosterYears().forEach(function (year) { addRosterYear(out, year); });
      }
      return Object.keys(out).sort().map(Number);
    }
  
    /* +----------------------------------+
     * + mergeRosterInto                  +
     * +----------------------------------+ */
    function mergeRosterInto(target, source, years) {
      var yearMap = {};
      target = target && typeof target === 'object' ? target : {};
      source = normalizeRoster(source);
      if (Array.isArray(years)) {
        years.forEach(function (year) { yearMap[String(year)] = true; });
      }
      Object.keys(source).forEach(function (key) {
        if (Array.isArray(years) && !yearMap[key.slice(0, 4)]) return;
        target[key] = source[key];
      });
      return target;
    }
  
    /* +----------------------------------+
     * + writeLocalRoster                 +
     * +----------------------------------+ */
    function writeLocalRoster(roster, yearsToTouch) {
      var normalized = normalizeRoster(roster);
      var byYear = {};
      var touchedYears = {};
      var ok = true;
  
      Object.keys(normalized).forEach(function (key) {
        var year = key.slice(0, 4);
        if (!byYear[year]) byYear[year] = {};
        byYear[year][key] = normalized[key];
        touchedYears[year] = true;
      });
  
      if (Array.isArray(yearsToTouch)) {
        yearsToTouch.forEach(function (year) { addRosterYear(touchedYears, year); });
      } else {
        getStoredRosterPartitionYears().forEach(function (year) { addRosterYear(touchedYears, year); });
      }
  
      Object.keys(touchedYears).sort().forEach(function (year) {
        var payload = byYear[year] || {};
        if (Object.keys(payload).length) {
          rosterMemoryPartitions[String(year)] = normalizeRoster(payload);
          if (!safeStorageSet(getRosterPartitionKey(year), JSON.stringify(payload))) ok = false;
        } else {
          delete rosterMemoryPartitions[String(year)];
          safeStorageRemove(getRosterPartitionKey(year));
        }
      });
      var combinedMemory = {};
      Object.keys(rosterMemoryPartitions).sort().forEach(function (year) {
        mergeRosterInto(combinedMemory, rosterMemoryPartitions[year], [year]);
      });
      state.rosterCloudStore = normalizeRoster(combinedMemory);
      if (shouldReadLegacyLocalRoster()) safeStorageRemove(config.rosterKey);
      if (!ok) setSyncStatus('Cloud sync active', 'warning');
      return ok;
    }
  
    /* +----------------------------------+
     * + migrateLegacyLocalRoster         +
     * +----------------------------------+ */
    function migrateLegacyLocalRoster() {
      var legacy;
      if (!shouldReadLegacyLocalRoster()) return {};
      legacy = readLegacyLocalRoster();
      if (Object.keys(legacy).length) {
        writeLocalRoster(legacy, getYearsFromRoster(legacy));
        safeStorageRemove(config.rosterKey);
        getLegacyRosterPartitionYears().forEach(function (year) {
          safeStorageRemove(config.rosterPartitionPrefix + year);
        });
      }
      return legacy;
    }
  
    /* +----------------------------------+
     * + readLocalRoster                  +
     * +----------------------------------+ */
    function readLocalRoster(years) {
      var requestedYears = normalizeRosterYearScope(years);
      var legacy = migrateLegacyLocalRoster();
      var merged = {};
      requestedYears.forEach(function (year) {
        mergeRosterInto(merged, safeParse(safeStorageGet(getRosterPartitionKey(year))), [year]);
        if (rosterMemoryPartitions[String(year)]) {
          mergeRosterInto(merged, rosterMemoryPartitions[String(year)], [year]);
        } else if (state.rosterCloudStore && typeof state.rosterCloudStore === 'object') {
          mergeRosterInto(merged, state.rosterCloudStore, [year]);
        }
      });
      mergeRosterInto(merged, legacy, requestedYears);
      return normalizeRoster(merged);
    }
  
    /* +----------------------------------+
     * + readAllLocalRoster               +
     * +----------------------------------+ */
    function readAllLocalRoster() {
      return readLocalRoster('all');
    }
  
    /* +----------------------------------+
     * + setSyncStatus                    +
     * +----------------------------------+ */
    function setSyncStatus(text, status) {
      var badge = $('calendarSyncStatus');
      if (!badge) return;
      badge.className = 'calendar-sync-status ' + (status ? 'is-' + status : '');
      badge.textContent = text;
    }
  
    /* +----------------------------------+
     * + CLIENT MODULE                    +
     * +----------------------------------+ */
    var Router = (function () {
      var pageNodes = [];
      var navButtons = [];
      var LAST_PAGE_KEY = 'labAppLastPageV1';
      var historyBound = false;
      var suppressHistoryWrite = false;
  
      /* +----------------------------------+
       * + cacheDom                         +
       * +----------------------------------+ */
      function cacheDom() {
        pageNodes = Array.prototype.slice.call(document.querySelectorAll('.page'));
        navButtons = Array.prototype.slice.call(document.querySelectorAll('.nav-btn'));
      }
  
      /* +----------------------------------+
       * + getPages                         +
       * +----------------------------------+ */
      function getPages() {
        if (!pageNodes.length) cacheDom();
        return pageNodes;
      }
  
      /* +----------------------------------+
       * + getNavButtons                    +
       * +----------------------------------+ */
      function getNavButtons() {
        if (!navButtons.length) cacheDom();
        return navButtons;
      }
  
      /* +----------------------------------+
       * + getNavButtonForPage              +
       * +----------------------------------+ */
      function getNavButtonForPage(pageId) {
        pageId = String(pageId || '');
        var buttons = getNavButtons();
        for (var index = 0; index < buttons.length; index += 1) {
          if (buttons[index] && buttons[index].dataset && buttons[index].dataset.page === pageId) return buttons[index];
        }
        return null;
      }
  
      /* +----------------------------------+
       * + isRestorablePage                 +
       * +----------------------------------+ */
      function isRestorablePage(pageId) {
        return !!(pageId && (pageId === 'notification' || $(pageId)) && (pageId === 'dashboard' || getNavButtonForPage(pageId)));
      }
  
      /* +----------------------------------+
       * + saveLastPage                     +
       * +----------------------------------+ */
      function saveLastPage(pageId) {
        if (!isRestorablePage(pageId)) return;
        safeSessionSet(LAST_PAGE_KEY, pageId);
      }
  
      /* +----------------------------------+
       * + getLastPage                      +
       * +----------------------------------+ */
      function getLastPage() {
        var pageId = safeSessionGet(LAST_PAGE_KEY) || 'dashboard';
        return isRestorablePage(pageId) ? pageId : 'dashboard';
      }
  
      /* +----------------------------------+
       * + clearLastPage                    +
       * +----------------------------------+ */
      function clearLastPage() {
        safeSessionRemove(LAST_PAGE_KEY);
      }
  
      /* +----------------------------------+
       * + preparePageBeforeOpen            +
       * +----------------------------------+ */
      function preparePageBeforeOpen(pageId) {
        if (pageId === 'leavesCourses' && typeof Modules !== 'undefined' && Modules && Modules.renderLeavesCoursesYears) {
          Modules.renderLeavesCoursesYears();
        }
      }
  
      /* +----------------------------------+
       * + getActiveRouterPageId            +
       * +----------------------------------+ */
      function getActiveRouterPageId() {
        var active = document.querySelector('.page.active');
        return active && active.id ? active.id : 'dashboard';
      }
  
      /* +----------------------------------+
       * + canUseBrowserHistory             +
       * +----------------------------------+ */
      function canUseBrowserHistory() {
        return !!(window.history && typeof window.history.pushState === 'function' && typeof window.history.replaceState === 'function');
      }
  
      /* +----------------------------------+
       * + writeRouteHistory                +
       * +----------------------------------+ */
      function writeRouteHistory(pageId, replace) {
        if (suppressHistoryWrite || !canUseBrowserHistory() || !isRestorablePage(pageId)) return;
        try {
          var currentState = window.history.state && window.history.state.labApp ? window.history.state : null;
          if (!replace && currentState && currentState.page === pageId) return;
          var stateObject = { labApp: true, page: pageId };
          if (replace || !currentState) window.history.replaceState(stateObject, '', window.location.href);
          else window.history.pushState(stateObject, '', window.location.href);
        } catch (error) {
          console.warn('Route history update failed:', error);
        }
      }
  
      /* +----------------------------------+
       * + bindRouteHistory                 +
       * +----------------------------------+ */
      function bindRouteHistory() {
        if (historyBound || !canUseBrowserHistory()) return;
        historyBound = true;
        writeRouteHistory(getActiveRouterPageId(), true);
        window.addEventListener('popstate', function (event) {
          if (!state.authUserId) return;
          var routeState = event.state && event.state.labApp ? event.state : null;
          var pageId = routeState && isRestorablePage(routeState.page) ? routeState.page : 'dashboard';
          if (getActiveRouterPageId() === pageId) return;
          suppressHistoryWrite = true;
          try {
            preparePageBeforeOpen(pageId);
            goPage(pageId, getNavButtonForPage(pageId));
          } finally {
            suppressHistoryWrite = false;
          }
        }, { passive: true });
      }
  
      /* +----------------------------------+
       * + restoreLastPage                  +
       * +----------------------------------+ */
      function restoreLastPage() {
        var pageId = getLastPage();
        preparePageBeforeOpen(pageId);
        goPage(pageId, getNavButtonForPage(pageId));
      }
  
      /* +----------------------------------+
       * + openDashboard                    +
       * +----------------------------------+ */
      function openDashboard() {
        clearLastPage();
        preparePageBeforeOpen('dashboard');
        goPage('dashboard', getNavButtonForPage('dashboard'));
      }
  
      /* +----------------------------------+
       * + getBackButtonHost                +
       * +----------------------------------+ */
      function getBackButtonHost(page) {
        if (!page) return null;
        return page.querySelector(':scope > .page-scroll') || page;
      }
  
      /* +----------------------------------+
       * + handleBackButtonClick            +
       * +----------------------------------+ */
      function handleBackButtonClick(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        goPage('dashboard', document.querySelector('[data-page="dashboard"]'));
      }
  
      /* +----------------------------------+
       * + bindBackButton                   +
       * +----------------------------------+ */
      function bindBackButton(button) {
        if (!button) return null;
        button.type = 'button';
        button.className = 'page-back-dashboard-btn';
        button.textContent = '← BACK TO DASHBOARD';
        button.removeAttribute('onclick');
        if (button.dataset.neoBackBound !== '1') {
          button.dataset.neoBackBound = '1';
          button.addEventListener('click', handleBackButtonClick);
        }
        return button;
      }
  
      /* +----------------------------------+
       * + createBackButton                 +
       * +----------------------------------+ */
      function createBackButton() {
        var button = document.createElement('button');
        return bindBackButton(button);
      }
  
      /* +----------------------------------+
       * + renderBackButton                 +
       * +----------------------------------+ */
      function renderBackButton(pageId) {
        var page = $(pageId);
        if (!page || pageId === 'dashboard') return;
        var host = getBackButtonHost(page);
        if (!host) return;
  
        forEachNode(page.querySelectorAll('.has-page-back'), function (node) {
          if (node !== host) node.classList.remove('has-page-back');
        });
  
        var button = bindBackButton(page.querySelector('.page-back-dashboard-btn') || createBackButton());
        host.classList.add('has-page-back');
        if (button.parentElement !== host || host.firstElementChild !== button) {
          host.insertBefore(button, host.firstElementChild || null);
        }
      }
  
      /* +----------------------------------+
       * + goPage                           +
       * +----------------------------------+ */
      function goPage(pageId, btn) {
        if (pageId !== 'calendar' && typeof Calendar !== 'undefined' && Calendar && Calendar.flushPendingInputSave) {
          Calendar.flushPendingInputSave();
        }
        if (pageId === 'notification' && typeof Modules !== 'undefined' && Modules && Modules.open) {
          Modules.open('NOTIFICATION', btn || getNavButtonForPage('notification'));
          saveLastPage(pageId);
          writeRouteHistory(pageId, false);
          if (typeof ActivityTracker !== 'undefined' && ActivityTracker && ActivityTracker.track) {
            ActivityTracker.track('PAGE_VIEW', 'Opened ' + ActivityTracker.getPageLabel(pageId) + '.', { page: pageId }, { dedupeMs: 8000 });
          }
          return;
        }
        var targetPage = $(pageId);
        if (!targetPage) {
          console.warn('Page not found:', pageId);
          return;
        }
  
        var activePage = document.querySelector('.page.active');
        if (activePage === targetPage) {
          saveLastPage(pageId);
          writeRouteHistory(pageId, pageId === 'dashboard');
          return;
        }
        if (activePage) activePage.classList.remove('active');
  
        var activeButton = document.querySelector('.nav-btn.active');
        if (activeButton) activeButton.classList.remove('active');
  
        targetPage.classList.add('active');
        if (btn) btn.classList.add('active');
        saveLastPage(pageId);
        writeRouteHistory(pageId, pageId === 'dashboard');
  
        renderBackButton(pageId);
  
        if (pageId === 'calendar' && state.calendarNeedsRefresh) {
          state.calendarNeedsRefresh = false;
          Calendar.render();
        }
        if (typeof RosterSync !== 'undefined' && RosterSync && RosterSync.handlePageChange) {
          RosterSync.handlePageChange(pageId);
        }
        if (typeof Settings !== 'undefined' && Settings && Settings.handlePageChange) {
          Settings.handlePageChange(pageId);
        }
        if (typeof ActivityTracker !== 'undefined' && ActivityTracker && ActivityTracker.track) {
          ActivityTracker.track('PAGE_VIEW', 'Opened ' + ActivityTracker.getPageLabel(pageId) + '.', { page: pageId }, { dedupeMs: 8000 });
        }
      }
  
      /* +----------------------------------+
       * + bindNavButtons                   +
       * +----------------------------------+ */
      function bindNavButtons() {
        cacheDom();
        bindRouteHistory();
        forEachNode(getNavButtons(), function (button) {
          if (button.dataset.neoNavBound === '1') return;
          button.dataset.neoNavBound = '1';
          button.addEventListener('click', function () {
            var pageId = button.dataset.page;
            preparePageBeforeOpen(pageId);
            goPage(pageId, button);
          });
        });
      }
  
      return {
        goPage: goPage,
        restoreLastPage: restoreLastPage,
        openDashboard: openDashboard,
        clearLastPage: clearLastPage,
        renderBackButton: renderBackButton,
        bindNavButtons: bindNavButtons
      };
    })();
  
    /* +----------------------------------+
     * + CLIENT MODULE                    +
     * +----------------------------------+ */
    var Dashboard = (function () {
      var domNodes = {
        title: null,
        date: null,
        greeting: null,
        clock: null,
        aboutAppVersion: null
      };
      var lastClockTimeText = '';
      var lastClockDateText = '';
      var lastGreetingText = '';
  
      /* +----------------------------------+
       * + cacheDomNodes                    +
       * +----------------------------------+ */
      function cacheDomNodes() {
        domNodes.title = $('displayBoardTitle');
        domNodes.date = $('liveDate');
        domNodes.greeting = $('displayGreeting');
        domNodes.clock = $('liveClock');
        domNodes.aboutAppVersion = $('aboutAppVersion');
      }
  
      /* +----------------------------------+
       * + getGreeting                      +
       * +----------------------------------+ */
      function getGreeting(hour) {
        var name = cleanText(state.authUserDisplayName || 'Team Member') || 'Team Member';
        if (hour >= 5 && hour < 12) return 'Good Morning, ' + name + ' 🌤️';
        if (hour >= 12 && hour < 17) return 'Good Afternoon, ' + name + ' 🌞';
        if (hour >= 17 && hour < 21) return 'Good Evening, ' + name + ' 🌇';
        return 'Good Night, ' + name + ' 🌙';
      }
  
      /* +----------------------------------+
       * + updateDisplayClock               +
       * +----------------------------------+ */
      function updateDisplayClock(nowParts) {
        nowParts = nowParts || getAppNowParts();
        var rawHours = Number(nowParts.hour) || 0;
        var hours = rawHours % 12 || 12;
        var ampm = rawHours >= 12 ? 'PM' : 'AM';
        var weekdayIndex = getWeekdayIndexFromParts(nowParts);
        var timeText = pad2(hours) + ':' + pad2(nowParts.minute) + ':' + pad2(nowParts.second) + ' ' + ampm;
        var dateText = Number(nowParts.day) + ' ' + config.shortMonthNames[Number(nowParts.month) - 1] + ' ' + Number(nowParts.year) + ' | ' + config.weekdayNames[weekdayIndex];
        var greetingText = getGreeting(rawHours);
        if (!domNodes.title || !domNodes.date || !domNodes.greeting) cacheDomNodes();
        if (domNodes.title && lastClockTimeText !== timeText) {
          setTextIfChanged(domNodes.title, timeText);
          lastClockTimeText = timeText;
        }
        if (domNodes.date && lastClockDateText !== dateText) {
          setTextIfChanged(domNodes.date, dateText);
          lastClockDateText = dateText;
        }
        if (domNodes.greeting && lastGreetingText !== greetingText) {
          renderGreeting(domNodes.greeting, greetingText);
          lastGreetingText = greetingText;
        }
      }
  
      /* +----------------------------------+
       * + renderGreeting                   +
       * +----------------------------------+ */
      function renderGreeting(node, text) {
        var match = text.match(/^(.*?)(\s*[🌤️🌞🌇🌙]+)$/u);
        if (!match) {
          setTextIfChanged(node, text);
          return;
        }
        node.textContent = '';
        node.appendChild(document.createTextNode(match[1].trim() + ' '));
        var icon = document.createElement('span');
        icon.className = 'greeting-icon';
        icon.textContent = match[2].trim();
        node.appendChild(icon);
      }
  
      /* +----------------------------------+
       * + renderDashboard                  +
       * +----------------------------------+ */
      function renderDashboard(data) {
        if (!domNodes.clock || !domNodes.aboutAppVersion) cacheDomNodes();
        setTextIfChanged(domNodes.clock, (data && data.boardTitle) || 'HOAG PATHOLOGY');
        var appVersion = (data && data.version) || config.appVersion;
        if (document.documentElement.getAttribute('data-labapp-version') !== appVersion) {
          document.documentElement.setAttribute('data-labapp-version', appVersion);
        }
        setTextIfChanged(domNodes.aboutAppVersion, appVersion);
        syncServerClock(data || {});
        runClockTick();
      }
  
      /* +----------------------------------+
       * + loadDashboard                    +
       * +----------------------------------+ */
      async function loadDashboard() {
        try {
          var envelope;
          if (hasVercelBackend()) {
            envelope = await new Promise(function (resolve, reject) {
              hoagApi.run
                .withSuccessHandler(resolve)
                .withFailureHandler(reject)
                .getDashboardData();
            });
          } else {
            envelope = await hoagApiRequest('dashboard', {});
          }

          if (!envelope || envelope.ok === false) {
            throw new Error(envelope && envelope.error ? envelope.error : 'Dashboard data unavailable.');
          }
          renderDashboard(envelope);
        } catch (error) {
          console.warn('Dashboard load failed:', error && error.message ? error.message : error);
          renderDashboard({ ok: true, boardTitle: 'HOAG PATHOLOGY' });
        }
      }
  
      /* +----------------------------------+
       * + getCurrentDateKey                +
       * +----------------------------------+ */
      function getCurrentDateKey() {
        return getAppDateKey();
      }
  
      /* +----------------------------------+
       * + runClockTick                     +
       * +----------------------------------+ */
      function runClockTick() {
        var nowParts = getAppNowParts();
        var currentDateKey = dateKeyFromParts(nowParts);
        updateDisplayClock(nowParts);
        if (state.clockDateKey && state.clockDateKey !== currentDateKey) {
          Calendar.handleDateRollover(currentDateKey, state.clockDateKey);
        }
        state.clockDateKey = currentDateKey;
      }
  
      /* +----------------------------------+
       * + startClock                       +
       * +----------------------------------+ */
      function startClock() {
        stopClock();
        state.clockDateKey = getCurrentDateKey();
        state.clockTimer = window.setInterval(runClockTick, 1000);
      }
  
      /* +----------------------------------+
       * + stopClock                        +
       * +----------------------------------+ */
      function stopClock() {
        if (!state.clockTimer) return;
        window.clearInterval(state.clockTimer);
        state.clockTimer = null;
      }
  
      /* +----------------------------------+
       * + bindVisibility                   +
       * +----------------------------------+ */
      function bindVisibility() {
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) {
            stopClock();
          } else {
            runClockTick();
            startClock();
          }
        }, { passive: true });
      }
  
      /* +----------------------------------+
       * + bindDashboardCards               +
       * +----------------------------------+ */
      function bindDashboardCards() {
        var cards = document.querySelectorAll('[data-dashboard-module]');
        forEachNode(cards, function (card) {
          if (card.dataset.dashboardCardBound === '1') return;
          card.dataset.dashboardCardBound = '1';
          var moduleName = card.getAttribute('data-dashboard-module');
          if (!moduleName) return;
          card.setAttribute('aria-label', 'Open ' + moduleName);
          var openCard = function (event) {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }
            if (window.LabApp && window.LabApp.Modules && typeof window.LabApp.Modules.open === 'function') {
              window.LabApp.Modules.open(moduleName);
            }
          };
          card.addEventListener('click', openCard);
          card.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') openCard(event);
          });
        });
      }

      /* +----------------------------------+
       * + init                             +
       * +----------------------------------+ */
      function init() {
        cacheDomNodes();
        bindDashboardCards();
        loadDashboard();
        updateDisplayClock();
        bindVisibility();
        startClock();
      }
  
      return {
        init: init,
        refreshClock: updateDisplayClock,
        startClock: startClock,
        stopClock: stopClock
      };
    })();
  
    /* +----------------------------------+
     * + CLIENT MODULE                    +
     * +----------------------------------+ */
    var Theme = (function () {
      var initialized = false;
      var mediaQuery = null;
  
      /* +----------------------------------+
       * + getSystemPrefersDark             +
       * +----------------------------------+ */
      function getSystemPrefersDark() {
        return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
  
      /* +----------------------------------+
       * + getPreferredDark                 +
       * +----------------------------------+ */
      function getPreferredDark() {
        var savedTheme = safeStorageGet('neoTheme');
        if (savedTheme === 'dark') return true;
        if (savedTheme === 'light') return false;
        return getSystemPrefersDark();
      }
  
      /* +----------------------------------+
       * + apply                            +
       * +----------------------------------+ */
      function apply(isDark, shouldPersist) {
        document.body.classList.toggle('dark-mode', isDark);
        document.documentElement.classList.remove('dark-mode-preload');
        var icon = $('themeIcon');
        var text = $('themeText');
        if (icon) icon.textContent = isDark ? '🌙' : '☀️';
        if (text) text.textContent = isDark ? 'Dark Mode' : 'Light Mode';
        if (shouldPersist) {
          safeStorageSet('neoTheme', isDark ? 'dark' : 'light');
        }
      }
  
      /* +----------------------------------+
       * + toggle                           +
       * +----------------------------------+ */
      function toggle() {
        apply(!document.body.classList.contains('dark-mode'), true);
      }
  
      /* +----------------------------------+
       * + bindSystemPreference             +
       * +----------------------------------+ */
      function bindSystemPreference() {
        if (mediaQuery) return;
        mediaQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        if (!mediaQuery) return;
  
        var handleThemeChange = function (event) {
          if (safeStorageGet('neoTheme') === null && state.authUserId) {
            apply(event.matches, false);
          }
        };
  
        if (typeof mediaQuery.addEventListener === 'function') {
          mediaQuery.addEventListener('change', handleThemeChange);
        } else if (typeof mediaQuery.addListener === 'function') {
          mediaQuery.addListener(handleThemeChange);
        }
      }
  
      /* +----------------------------------+
       * + init                             +
       * +----------------------------------+ */
      function init() {
        if (!initialized) {
          initialized = true;
          bindSystemPreference();
        }
        apply(getPreferredDark(), false);
      }
  
      /* +----------------------------------+
       * + suspendForLogin                  +
       * +----------------------------------+ */
      function suspendForLogin() {
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode-preload');
      }
  
      return {
        init: init,
        apply: apply,
        toggle: toggle,
        activateForApp: init,
        suspendForLogin: suspendForLogin
      };
    })();
  
  
    /* +----------------------------------+
     * + DAILY QUOTE MODULE               +
     * +----------------------------------+ */
    var DailyQuote = (function () {
      /*
       * INSTANT LOCAL QUOTE POOL
       * The quote is rendered locally immediately after login.
       * No network/API request is required before the quote appears.
       */
      var SESSION_KEY = 'labAppDailyQuoteSessionV1';
      var initialized = false;
      var lastRenderedKey = '';
      var QUOTE_POOL = [
        { q: 'Success is the sum of small efforts, repeated day in and day out.', a: 'Robert Collier' },
        { q: 'The secret of getting ahead is getting started.', a: 'Mark Twain' },
        { q: 'It always seems impossible until it is done.', a: 'Nelson Mandela' },
        { q: 'Great things are done by a series of small things brought together.', a: 'Vincent van Gogh' },
        { q: 'The future depends on what you do today.', a: 'Mahatma Gandhi' },
        { q: 'Well done is better than well said.', a: 'Benjamin Franklin' },
        { q: 'The best way out is always through.', a: 'Robert Frost' },
        { q: 'Start where you are. Use what you have. Do what you can.', a: 'Arthur Ashe' },
        { q: 'You do not have to be great to start, but you have to start to be great.', a: 'Zig Ziglar' },
        { q: 'A little progress each day adds up to big results.', a: 'Satya Nani' },
        { q: 'Quality means doing it right when no one is looking.', a: 'Henry Ford' },
        { q: 'Excellence is not an act, but a habit.', a: 'Aristotle' },
        { q: 'The harder I work, the luckier I get.', a: 'Samuel Goldwyn' },
        { q: 'Believe you can and you are halfway there.', a: 'Theodore Roosevelt' },
        { q: 'Do the hard jobs first. The easy jobs will take care of themselves.', a: 'Dale Carnegie' },
        { q: 'A calm mind brings inner strength and self-confidence.', a: 'Dalai Lama' },
        { q: 'What we do today is what matters most.', a: 'Buddha' },
        { q: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
        { q: 'If you can dream it, you can achieve it.', a: 'Zig Ziglar' },
        { q: 'Act as if what you do makes a difference. It does.', a: 'William James' },
        { q: 'Nothing will work unless you do.', a: 'Maya Angelou' },
        { q: 'The journey of a thousand miles begins with one step.', a: 'Lao Tzu' },
        { q: 'Keep your face always toward the sunshine, and shadows will fall behind you.', a: 'Walt Whitman' },
        { q: 'You are never too old to set another goal or to dream a new dream.', a: 'C. S. Lewis' },
        { q: 'Energy and persistence conquer all things.', a: 'Benjamin Franklin' },
        { q: 'Do what you can, with what you have, where you are.', a: 'Theodore Roosevelt' },
        { q: 'The way to get started is to quit talking and begin doing.', a: 'Walt Disney' },
        { q: 'Success is the doing, not the getting; in the trying, not the triumph.', a: 'Zig Ziglar' },
        { q: 'Small deeds done are better than great deeds planned.', a: 'Peter Marshall' },
        { q: 'The difference between ordinary and extraordinary is that little extra.', a: 'Jimmy Johnson' },
        { q: 'Nothing great was ever achieved without enthusiasm.', a: 'Ralph Waldo Emerson' },
        { q: 'Wherever you go, go with all your heart.', a: 'Confucius' },
        { q: 'Make each day your masterpiece.', a: 'John Wooden' },
        { q: 'The key is not to prioritize what is on your schedule, but to schedule your priorities.', a: 'Stephen Covey' },
        { q: 'It is never too late to be what you might have been.', a: 'George Eliot' },
        { q: 'Do not wait for opportunity. Create it.', a: 'George Bernard Shaw' },
        { q: 'A goal without a plan is just a wish.', a: 'Antoine de Saint-Exupery' },
        { q: 'Perseverance is not a long race; it is many short races one after another.', a: 'Walter Elliott' },
        { q: 'You miss one hundred percent of the shots you do not take.', a: 'Wayne Gretzky' },
        { q: 'The best preparation for tomorrow is doing your best today.', a: 'H. Jackson Brown Jr.' }
      ];

      function getNodes() {
        return {
          host: $('displayDailyQuote'),
          text: $('displayDailyQuoteText'),
          author: $('displayDailyQuoteAuthor')
        };
      }

      function makeSessionNonce() {
        return String(Date.now()) + '-' + String(Math.random()).slice(2) + '-' + String(Math.random()).slice(2);
      }

      function getSessionNonce(freshLogin) {
        var current = safeSessionGet(SESSION_KEY) || '';
        if (freshLogin || !current) {
          current = makeSessionNonce();
          safeSessionSet(SESSION_KEY, current);
        }
        return current;
      }

      function hashSeed(seed) {
        var hash = 2166136261;
        seed = String(seed || '');
        for (var i = 0; i < seed.length; i += 1) {
          hash ^= seed.charCodeAt(i);
          hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
      }

      function render(quote, author) {
        var nodes = getNodes();
        if (!nodes.text || !nodes.author) return;
        var text = cleanText(quote).replace(/\s+/g, ' ').trim();
        var by = cleanText(author).replace(/\s+/g, ' ').trim();
        if (!text) return;
        nodes.text.textContent = '"' + text + '"';
        nodes.author.textContent = by ? '— ' + by : '';
        if (nodes.host) nodes.host.hidden = false;
      }

      function clear() {
        var nodes = getNodes();
        if (nodes.text) nodes.text.textContent = '';
        if (nodes.author) nodes.author.textContent = '';
        if (nodes.host) nodes.host.hidden = true;
      }

      function load(options) {
        options = options && typeof options === 'object' ? options : {};
        var nodes = getNodes();
        if (!nodes.text) return;
        var user = (typeof Auth !== 'undefined' && Auth && typeof Auth.getUser === 'function') ? Auth.getUser() : {};
        var userId = cleanText(user && user.id);
        if (!userId) return;

        var sessionNonce = getSessionNonce(!!options.freshLogin);
        var requestKey = userId + '|' + sessionNonce;
        if (!options.freshLogin && lastRenderedKey === requestKey && cleanText(nodes.text.textContent)) return;

        /* Render immediately. This path never waits for Vercel API or an API. */
        var selected = QUOTE_POOL[hashSeed(requestKey) % QUOTE_POOL.length];
        clear();
        render(selected.q, selected.a);
        lastRenderedKey = requestKey;
      }

      function init(options) {
        if (!initialized) initialized = true;
        load(options || {});
      }

      return {
        init: init,
        load: load,
        clear: clear
      };
    })();

    /* +----------------------------------+
     * + CLIENT MODULE                    +
     * +----------------------------------+ */
    var Auth = (function () {
      var HTTPONLY_SESSION_SENTINEL = '__HTTPONLY_SESSION__';
      var TOKEN_KEY = 'labAppAuthTokenV1';
      var USER_KEY = 'labAppAuthUserV1';
      var UPDATE_BYPASS_KEY = 'labAppUpdateInProgressV1';
      var UPDATE_BYPASS_USER_KEY = 'labAppUpdateUserV1';
      var IDLE_TIMEOUT_MS = 15 * 60 * 1000;
      var IDLE_WARNING_MS = 60 * 1000;
      var SESSION_CHECK_MS = 10 * 60 * 1000;
      var LOGIN_WAIT_NOTICE_MS = 12000;
      var LOGIN_TIMEOUT_MS = 60000;
      var nodes = {};
      var busy = false;
      var changeBusy = false;
      var idleWarningTimer = null;
      var idleLogoutTimer = null;
      var sessionCheckTimer = null;
      var activityResetTimer = null;
      var activityEventsBound = false;
      var sessionCheckBusy = false;
      var sessionVisibilityBound = false;
      var loginTimeoutTimer = null;
      var loginHardTimeoutTimer = null;
      var loginRequestId = 0;
      var loginMfaRequired = false;
  
      /* +----------------------------------+
       * + cacheDomNodes                    +
       * +----------------------------------+ */
      function cacheDomNodes() {
        nodes.screen = $('authScreen');
        nodes.app = document.querySelector('.app');
        nodes.loginPanel = $('authLoginPanel');
        nodes.changePanel = $('authChangePanel');
        nodes.form = $('loginForm');
        nodes.username = $('loginUsername');
        nodes.password = $('loginPassword');
        nodes.mfaField = $('loginMfaCode') ? $('loginMfaCode').closest('.auth-field') : null;
        nodes.mfaCode = $('loginMfaCode');
        nodes.passwordToggle = $('loginPasswordToggle');
        nodes.submit = $('loginSubmit');
        nodes.resume = $('resumeSessionButton');
        nodes.message = $('loginMessage');
        nodes.showChangePassword = $('showChangePassword');
        nodes.backToLogin = $('backToLogin');
        nodes.changeForm = $('changePasswordForm');
        nodes.changeUsername = $('changeUsername');
        nodes.changeCurrentPassword = $('changeCurrentPassword');
        nodes.changeNewPassword = $('changeNewPassword');
        nodes.changeConfirmPassword = $('changeConfirmPassword');
        nodes.changeSubmit = $('changePasswordSubmit');
        nodes.changeMessage = $('changePasswordMessage');
      }
  
      /* +----------------------------------+
       * + setButtonBusy                    +
       * +----------------------------------+ */
      function setButtonBusy(button, isBusy, label) {
        if (!button) return;
        button.disabled = !!isBusy;
        button.classList.toggle('is-loading', !!isBusy);
        var labelNode = button.querySelector('.auth-submit-label');
        if (labelNode) labelNode.textContent = isBusy ? '' : (label || 'Sign In');
      }
  
      /* +----------------------------------+
       * + setBusy                          +
       * +----------------------------------+ */
      function setBusy(isBusy, label) {
        busy = !!isBusy;
        setButtonBusy(nodes.submit, busy, label || (busy ? 'Signing In...' : 'Sign In'));
        if (nodes.username) nodes.username.disabled = busy;
        if (nodes.password) nodes.password.disabled = busy;
        if (nodes.mfaCode) nodes.mfaCode.disabled = busy;
        if (nodes.passwordToggle) nodes.passwordToggle.disabled = busy;
        if (nodes.showChangePassword) nodes.showChangePassword.disabled = busy;
      }
  
      /* +----------------------------------+
       * + setChangeBusy                    +
       * +----------------------------------+ */
      function setChangeBusy(isBusy, label) {
        changeBusy = !!isBusy;
        setButtonBusy(nodes.changeSubmit, changeBusy, label || (changeBusy ? 'Updating...' : 'Update Password'));
        [
          nodes.changeUsername,
          nodes.changeCurrentPassword,
          nodes.changeNewPassword,
          nodes.changeConfirmPassword,
          nodes.backToLogin
        ].forEach(function (node) {
          if (node) node.disabled = changeBusy;
        });
      }
  
      /* +----------------------------------+
       * + setLoginMessage                  +
       * +----------------------------------+ */
      function setLoginMessage(message, type) {
        if (!nodes.message) return;
        nodes.message.textContent = message || '';
        nodes.message.classList.toggle('is-error', type === 'error');
        nodes.message.classList.toggle('is-ok', type === 'ok');
      }
  
      /* +----------------------------------+
       * + setChangeMessage                 +
       * +----------------------------------+ */
      function setChangeMessage(message, type) {
        if (!nodes.changeMessage) return;
        nodes.changeMessage.textContent = message || '';
        nodes.changeMessage.classList.toggle('is-error', type === 'error');
        nodes.changeMessage.classList.toggle('is-ok', type === 'ok');
      }
  
      /* +----------------------------------+
       * + resetPasswordVisibility          +
       * +----------------------------------+ */
      function resetPasswordVisibility() {
        if (nodes.password) nodes.password.type = 'password';
        if (nodes.passwordToggle) {
          nodes.passwordToggle.classList.remove('is-visible');
          nodes.passwordToggle.setAttribute('aria-label', 'Show password');
        }
      }
  
      /* +----------------------------------+
       * + clearAuthInput                   +
       * +----------------------------------+ */
      function clearAuthInput(node) {
        if (!node) return;
        node.value = '';
        node.defaultValue = '';
        node.setAttribute('value', '');
        try {
          var inputEvent;
          if (typeof Event === 'function') {
            inputEvent = new Event('input', { bubbles: true });
          } else {
            inputEvent = document.createEvent('Event');
            inputEvent.initEvent('input', true, false);
          }
          node.dispatchEvent(inputEvent);
        } catch (error) {
          console.warn('Auth input clear event failed:', error);
        }
      }
  
      /* +----------------------------------+
       * + resetAuthForms                   +
       * +----------------------------------+ */
      function resetAuthForms() {
        /* IMPORTANT: Never clear the login credentials from a generic auth lock.
         * Session checks, heartbeat failures, and other asynchronous auth paths
         * may call lock() while the user is entering or submitting credentials.
         * Clearing the login form here makes the username/password visibly vanish.
         * submitLogin() owns login-field clearing: it clears only the password on
         * an actual authentication failure.
         */
        if (nodes.changeForm && typeof nodes.changeForm.reset === 'function') nodes.changeForm.reset();
  
        [
          nodes.changeUsername,
          nodes.changeCurrentPassword,
          nodes.changeNewPassword,
          nodes.changeConfirmPassword
        ].forEach(clearAuthInput);
        loginMfaRequired = false;
        if (nodes.mfaField) nodes.mfaField.hidden = true;
  
        resetPasswordVisibility();
      }
  
      /* +----------------------------------+
       * + showLoginPanel                   +
       * +----------------------------------+ */
      function showLoginPanel(message, type) {
        if (nodes.changePanel) nodes.changePanel.hidden = true;
        if (nodes.loginPanel) nodes.loginPanel.hidden = false;
        setChangeBusy(false);
        setBusy(false);
        setChangeMessage('', '');
        setLoginMessage(message || '', type || '');
        window.setTimeout(function () {
          if (nodes.username && !nodes.username.disabled) nodes.username.focus();
        }, 50);
      }
  
      /* +----------------------------------+
       * + showChangePanel                  +
       * +----------------------------------+ */
      function showChangePanel() {
        if (busy || changeBusy) return;
        if (nodes.loginPanel) nodes.loginPanel.hidden = true;
        if (nodes.changePanel) nodes.changePanel.hidden = false;
        if (nodes.changeUsername && nodes.username) nodes.changeUsername.value = nodes.username.value || '';
        [nodes.changeCurrentPassword, nodes.changeNewPassword, nodes.changeConfirmPassword].forEach(function (node) {
          if (node) node.value = '';
        });
        setLoginMessage('', '');
        setChangeMessage('', '');
        window.setTimeout(function () {
          var target = nodes.changeUsername && !nodes.changeUsername.value ? nodes.changeUsername : nodes.changeCurrentPassword;
          if (target && !target.disabled) target.focus();
        }, 50);
      }
  
      /* +----------------------------------+
       * + getStoredToken                   +
       * +----------------------------------+ */
      function getStoredToken() {
        /* AUTH POLICY: the real credential is an HttpOnly cookie and is never
         * readable by JavaScript. Existing modules receive a non-secret
         * sentinel only so their API signatures remain compatible. */
        return state.authUserId ? HTTPONLY_SESSION_SENTINEL : '';
      }

      /* +----------------------------------+
       * + normalizePublicAuthUser_         +
       * +----------------------------------+ */
      function normalizePublicAuthUser_(user) {
        user = user && typeof user === 'object' ? user : {};
        var userId = cleanText(user.id || user.userId || user.username);
        if (!userId) return null;
        return {
          id: userId,
          name: cleanText(user.name || user.displayName || userId) || userId,
          role: cleanText(user.role || 'USER') || 'USER'
        };
      }

      /* +----------------------------------+
       * + getStoredPublicUser_             +
       * +----------------------------------+ */
      function getStoredPublicUser_() {
        /* Keep the cached identity only for this page session. */
        var raw = safeSessionGet(USER_KEY) || '';
        if (!raw) return null;

        var payload = safeParse(raw);
        var expiresAtMs = Date.parse(payload.expiresAt || '');
        if (expiresAtMs && expiresAtMs <= Date.now()) {
          safeSessionRemove(USER_KEY);
          return null;
        }

        return normalizePublicAuthUser_(payload.user || payload);
      }

      /* +----------------------------------+
       * + storePublicAuthUser_             +
       * +----------------------------------+ */
      function storePublicAuthUser_(envelope) {
        envelope = envelope && typeof envelope === 'object' ? envelope : {};
        var publicUser = normalizePublicAuthUser_(envelope.user || envelope);
        if (!publicUser) return false;

        var payload = JSON.stringify({
          user: publicUser,
          expiresAt: cleanText(envelope.expiresAt),
          cachedAt: new Date().toISOString(),
          version: cleanText(envelope.version)
        });
        safeSessionSet(USER_KEY, payload);
        // Remove any legacy persistent auth cache from older builds.
        safeStorageRemove(USER_KEY);
        return true;
      }
  
      /* +----------------------------------+
       * + storeSession                     +
       * +----------------------------------+ */
      function storeSession(envelope) {
        envelope = envelope && typeof envelope === 'object' ? envelope : {};
        // Never persist or inspect the server session credential in JavaScript.
        safeSessionRemove(TOKEN_KEY);
        safeStorageRemove(TOKEN_KEY);
        storePublicAuthUser_(envelope);
      }
  
      /* +----------------------------------+
       * + clearStoredSession               +
       * +----------------------------------+ */
      function clearStoredSession() {
        safeSessionRemove(TOKEN_KEY);
        safeSessionRemove(USER_KEY);
        safeStorageRemove(TOKEN_KEY);
        safeStorageRemove(USER_KEY);
      }
  
      /* +----------------------------------+
       * + applyUser                        +
       * +----------------------------------+ */
      function applyUser(user) {
        user = normalizePublicAuthUser_(user) || {};
        state.authUserId = cleanText(user.id);
        state.authUserDisplayName = cleanText(user.name || user.id || 'Team Member') || 'Team Member';
        state.authRole = cleanText(user.role || 'USER') || 'USER';
  
      }
  
      /* +----------------------------------+
       * + setSystemToast                   +
       * +----------------------------------+ */
      function setSystemToast(titleText, bodyText, durationMs) {
        var toast = $('systemNoticeToast');
        var title = $('systemNoticeTitle');
        var text = $('systemNoticeText');
        if (!toast || !title || !text) return;
        title.textContent = titleText || '';
        text.textContent = bodyText || '';
        toast.classList.toggle('is-hidden', !bodyText);
        if (durationMs) {
          window.setTimeout(function () {
            if (title.textContent === titleText && text.textContent === bodyText) {
              toast.classList.add('is-hidden');
              text.textContent = '';
            }
          }, durationMs);
        }
      }
  
      /* +----------------------------------+
       * + clearIdleWarning                 +
       * +----------------------------------+ */
      function clearIdleWarning() {
        var modal = $('idleWarningModal');
        if (modal) modal.classList.add('is-hidden');
      }
  
      /* +----------------------------------+
       * + stopIdleTimers                   +
       * +----------------------------------+ */
      function stopIdleTimers() {
        if (idleWarningTimer) window.clearTimeout(idleWarningTimer);
        if (idleLogoutTimer) window.clearTimeout(idleLogoutTimer);
        idleWarningTimer = null;
        idleLogoutTimer = null;
      }
  
      /* +----------------------------------+
       * + triggerIdleWarning               +
       * +----------------------------------+ */
      function triggerIdleWarning() {
        if (!getStoredToken() || !state.authUserId) return;
        var modal = $('idleWarningModal');
        if (modal) modal.classList.remove('is-hidden');
        else setSystemToast('Session Timeout Warning', 'No activity detected. You will be signed out in about 1 minute.', 0);
      }
  
      /* +----------------------------------+
       * + triggerIdleLogout                +
       * +----------------------------------+ */
      function triggerIdleLogout() {
        if (!getStoredToken() || !state.authUserId) return;
        logout('Signed out automatically because there was no activity.', 'error', 'idleTimeout');
      }
  
      /* +----------------------------------+
       * + resetIdleTimer                   +
       * +----------------------------------+ */
      function resetIdleTimer() {
        if (!getStoredToken() || !state.authUserId) return;
        stopIdleTimers();
        clearIdleWarning();
        idleWarningTimer = window.setTimeout(triggerIdleWarning, Math.max(0, IDLE_TIMEOUT_MS - IDLE_WARNING_MS));
        idleLogoutTimer = window.setTimeout(triggerIdleLogout, IDLE_TIMEOUT_MS);
      }
  
      /* +----------------------------------+
       * + handleUserActivity               +
       * +----------------------------------+ */
      function handleUserActivity() {
        if (activityResetTimer) return;
        activityResetTimer = window.setTimeout(function () {
          activityResetTimer = null;
          resetIdleTimer();
        }, 250);
      }
  
      /* +----------------------------------+
       * + bindActivityEvents               +
       * +----------------------------------+ */
      function bindActivityEvents() {
        if (activityEventsBound) return;
        activityEventsBound = true;
        ['click', 'touchstart', 'pointerdown', 'keydown', 'scroll'].forEach(function (eventName) {
          window.addEventListener(eventName, handleUserActivity, { passive: true, capture: true });
        });
      }
  
      /* +----------------------------------+
       * + stopSessionWatchdog              +
       * +----------------------------------+ */
      function stopSessionWatchdog() {
        if (sessionCheckTimer) window.clearInterval(sessionCheckTimer);
        sessionCheckTimer = null;
        sessionCheckBusy = false;
      }
  
      /* +----------------------------------+
       * + forceLockFromServer              +
       * +----------------------------------+ */
      function forceLockFromServer(message) {
        clearStoredSession();
        if (window.LabApp && window.LabApp.Router && typeof window.LabApp.Router.clearLastPage === 'function') {
          window.LabApp.Router.clearLastPage();
        }
        stopSessionControls();
        if (typeof RosterSync !== 'undefined' && RosterSync && typeof RosterSync.handleAuthLogout === 'function') {
          RosterSync.handleAuthLogout();
        }
        lock(message || 'Your secure session has expired. Please sign in again.', 'error');
      }
  
      /* +----------------------------------+
       * + checkServerSession               +
       * +----------------------------------+ */
      async function checkServerSession() {
        var token = getStoredToken();
        if (document.hidden) return;
        if (!token || !state.authUserId || sessionCheckBusy) return;
        sessionCheckBusy = true;
        try {
          var envelope = await hoagApiRequest('loginState', {});
          if (!envelope || envelope.ok === false || !envelope.authenticated) {
            forceLockFromServer(envelope && envelope.error ? envelope.error : 'Your secure session has expired. Please sign in again.');
            return;
          }
          storePublicAuthUser_(envelope);
        } catch (error) {
          console.warn('Session verification failed:', error);
        } finally {
          sessionCheckBusy = false;
        }
      }
  
      /* +----------------------------------+
       * + startSessionWatchdog             +
       * +----------------------------------+ */
      function startSessionWatchdog() {
        stopSessionWatchdog();
        if (!getStoredToken()) return;
        sessionCheckTimer = window.setInterval(checkServerSession, SESSION_CHECK_MS);
        if (!sessionVisibilityBound) {
          sessionVisibilityBound = true;
          document.addEventListener('visibilitychange', function () {
            if (!document.hidden) checkServerSession();
          });
        }
      }
  
      /* +----------------------------------+
       * + startSessionControls             +
       * +----------------------------------+ */
      function startSessionControls() {
        bindActivityEvents();
        resetIdleTimer();
        startSessionWatchdog();
      }
  
      /* +----------------------------------+
       * + stopSessionControls              +
       * +----------------------------------+ */
      function stopSessionControls() {
        if (activityResetTimer) window.clearTimeout(activityResetTimer);
        activityResetTimer = null;
        stopIdleTimers();
        clearIdleWarning();
        stopSessionWatchdog();
      }

      /* +----------------------------------+
       * + clearLoginTimeout_               +
       * +----------------------------------+ */
      function clearLoginTimeout_() {
        if (loginTimeoutTimer) window.clearTimeout(loginTimeoutTimer);
        if (loginHardTimeoutTimer) window.clearTimeout(loginHardTimeoutTimer);
        loginTimeoutTimer = null;
        loginHardTimeoutTimer = null;
      }

      /* +----------------------------------+
       * + startLoginTimeout_               +
       * +----------------------------------+ */
      function startLoginTimeout_(requestId) {
        clearLoginTimeout_();
        loginTimeoutTimer = window.setTimeout(function () {
          if (requestId !== loginRequestId || !busy) return;
          setBusy(true, 'Still Signing In...');
          setLoginMessage('Still signing in securely. Please wait...', '');

          loginHardTimeoutTimer = window.setTimeout(function () {
            if (requestId !== loginRequestId || !busy) return;
            loginRequestId += 1;
            setBusy(false);
            setLoginMessage('The server is taking too long. Please try again.', 'error');
            if (nodes.password) {
              nodes.password.value = '';
              nodes.password.focus();
            }
          }, Math.max(5000, LOGIN_TIMEOUT_MS - LOGIN_WAIT_NOTICE_MS));
        }, LOGIN_WAIT_NOTICE_MS);
      }

      /* +----------------------------------+
       * + afterAuthPaint_                  +
       * +----------------------------------+ */
      function afterAuthPaint_(callback) {
        if (typeof callback !== 'function') return;
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(callback);
          });
          return;
        }
        window.setTimeout(callback, 0);
      }

      /* +----------------------------------+
       * + schedulePostUnlockTask_          +
       * +----------------------------------+ */
      function schedulePostUnlockTask_(callback, delayMs) {
        if (typeof callback !== 'function') return;
        window.setTimeout(function () {
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(callback, { timeout: 1500 });
            return;
          }
          window.setTimeout(callback, 0);
        }, Math.max(0, Number(delayMs || 0)));
      }

      /* +-----------------------------------+
       * + recordSuccessfulLoginAfterUnlock_ +
       * +-----------------------------------+ */
      function recordSuccessfulLoginAfterUnlock_(options) {
        /* /api/login already records the LOGIN audit entry with clientInfo.
         * Avoid a second post-unlock bridge round-trip and duplicate log write. */
        return;
      }

      /* +----------------------------------+
       * + runPostUnlockWork_               +
       * +----------------------------------+ */
      function runPostUnlockWork_(options) {
        options = options && typeof options === 'object' ? options : {};
        var appWasInitialized = !!(window.LabApp && window.LabApp.__initialized);

        if (window.LabApp && !window.LabApp.__initialized) {
          window.LabApp.init({ deferSecondary: true, secondaryDelayMs: options.freshLogin ? 350 : 250 });
        } else if (window.LabApp && window.LabApp.Dashboard) {
          window.LabApp.Dashboard.refreshClock();
        }

        if (typeof DailyQuote !== 'undefined' && DailyQuote && typeof DailyQuote.init === 'function') {
          DailyQuote.init({ freshLogin: !!options.freshLogin });
        }

        if (window.LabApp && window.LabApp.Router) {
          if (options.freshLogin && typeof window.LabApp.Router.openDashboard === 'function') {
            window.LabApp.Router.openDashboard();
          } else if (options.freshLogin && typeof window.LabApp.Router.goPage === 'function') {
            window.LabApp.Router.goPage('dashboard', document.querySelector('.nav-btn[data-page="dashboard"]'));
          } else if (typeof window.LabApp.Router.restoreLastPage === 'function') {
            window.LabApp.Router.restoreLastPage();
          } else if (typeof window.LabApp.Router.goPage === 'function') {
            window.LabApp.Router.goPage('dashboard', document.querySelector('.nav-btn[data-page="dashboard"]'));
          }
        }

        if (typeof Calendar !== 'undefined' && Calendar && typeof Calendar.renderTodayFloatingCards === 'function') {
          Calendar.renderTodayFloatingCards();
        }

        schedulePostUnlockTask_(function () {
          if (window.LabApp && typeof window.LabApp.initSecondaryModules === 'function') {
            window.LabApp.initSecondaryModules();
          }

          if (appWasInitialized) {
            if (typeof Settings !== 'undefined' && Settings && Settings.handleAuthChange) {
              Settings.handleAuthChange();
            }
          }

          if (typeof RosterSync !== 'undefined' && RosterSync && typeof RosterSync.handleAuthChange === 'function') {
            RosterSync.handleAuthChange({ freshLogin: !!options.freshLogin });
          }
          try { if(typeof OutSource!=='undefined'&&OutSource.initPage) window.setTimeout(function(){OutSource.initPage();},0); } catch(e) {}

          recordSuccessfulLoginAfterUnlock_(options);
        }, options.freshLogin ? 250 : 120);
      }
  
      /* +----------------------------------+
       * + lock                             +
       * +----------------------------------+ */
      function lock(message, type) {
        /* Never erase credentials while a login attempt is in progress.
         * A late session/heartbeat response can otherwise call lock() between
         * the button click and the /api/login response, and resetAuthForms()
         * clears both username and password. The login request itself owns
         * the form lifecycle while busy === true. */
        var preserveActiveLogin = !!busy;

        clearLoginTimeout_();
        stopSessionControls();
        document.body.classList.add('auth-locked');
        document.body.classList.remove('auth-ready');
        Theme.suspendForLogin();
  
        if (nodes.app) nodes.app.setAttribute('aria-hidden', 'true');
        if (nodes.screen) nodes.screen.removeAttribute('hidden');
        state.authUserId = '';
        state.authUserDisplayName = '';
        state.authRole = '';
  
        if (!preserveActiveLogin) resetAuthForms();
        showLoginPanel(message || '', type || (message ? 'error' : ''));
      }
  
      /* +----------------------------------+
       * + unlock                           +
       * +----------------------------------+ */
      function unlock(user, options) {
        options = options && typeof options === 'object' ? options : {};
        clearLoginTimeout_();
        applyUser(user);
        Theme.activateForApp();
        document.body.classList.remove('auth-locked');
        document.body.classList.add('auth-ready');
  
        if (nodes.app) nodes.app.setAttribute('aria-hidden', 'false');
        if (nodes.screen) nodes.screen.setAttribute('hidden', 'hidden');
  
        setBusy(false);
        setLoginMessage('', '');
        updateResumeSessionButton_();
  
        startSessionControls();
        afterAuthPaint_(function () {
          runPostUnlockWork_(options);
        });
      }
  
      /* +----------------------------------+
       * + handleEnvelope                   +
       * +----------------------------------+ */
      function handleEnvelope(envelope, options) {
        if (!envelope || envelope.ok === false || !envelope.authenticated) {
          clearStoredSession();
          lock(envelope && envelope.error ? envelope.error : 'Please sign in to continue.', 'error');
          return;
        }
  
        storeSession(envelope);
  
        unlock(envelope.user || getStoredPublicUser_() || {}, options || {});
        if (!envelope.token && typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
          ActivityTracker.track('SESSION_RESUME', 'Verified saved login session.', { page: 'session' }, { dedupeMs: 60000 });
        }
      }
  
      /* +----------------------------------+
       * + consumeUpdateResume              +
       * +----------------------------------+ */
      function consumeUpdateResume_() {
        /* Legacy compatibility only: persistent update-resume login bypasses
         * are intentionally disabled. An application update returns to login. */
        try {
          safeStorageRemove(UPDATE_BYPASS_KEY);
          safeStorageRemove(UPDATE_BYPASS_USER_KEY);
        } catch (error) {
          console.warn('Legacy update-resume cleanup failed:', error);
        }
        return null;
      }

      /* +----------------------------------+
       * + checkStoredSession               +
       * +----------------------------------+ */
      function checkStoredSession() {
        /* Do not let the asynchronous startup session check wipe credentials
         * that the user has already started typing. A previous implementation
         * called lock() when the initial /api/login-state request completed;
         * lock() resets the login form, so a slow network response could erase
         * the username/password while the user was signing in. */
        updateResumeSessionButton_();
        var hasPageSession = !!getStoredPublicUser_();
        var credentialsTouched = function () {
          return !!(
            (nodes.username && String(nodes.username.value || '').length) ||
            (nodes.password && String(nodes.password.value || '').length) ||
            (nodes.mfaCode && String(nodes.mfaCode.value || '').length) ||
            busy ||
            state.authUserId
          );
        };

        if (!hasPageSession) {
          // A brand-new page starts in the login state. Do not make a network
          // request here: there is no page-session identity to restore, and an
          // asynchronous session check can race the user's first keystroke and
          // reset the form. The login endpoint is authoritative when the user
          // submits credentials.
          return;
        }

        // A verified page-session marker means this is a refresh/reload of the
        // same page session. Keep the current page visible while the HttpOnly
        // cookie is re-verified so the login screen never flashes on refresh.
        document.body.classList.remove('auth-locked');
        document.body.classList.add('auth-ready');
        if (nodes.app) nodes.app.setAttribute('aria-hidden', 'false');
        if (nodes.screen) nodes.screen.setAttribute('hidden', 'hidden');

        hoagApiRequest('loginState', { freshSession: !hasPageSession })
          .then(function (envelope) {
            if (!envelope || envelope.ok === false || !envelope.authenticated) {
              // Never reset an active login attempt because the startup check
              // finished late. Let submitLogin own the login form lifecycle.
              if (credentialsTouched()) return;
              clearStoredSession();
              lock('', '');
              return;
            }
            storePublicAuthUser_(envelope);
            var restoredUser = envelope.user || getStoredPublicUser_() || {};
            applyUser(restoredUser);
            unlock(restoredUser, { freshLogin:false, restoredSession:true });
          })
          .catch(function (error) {
            console.warn('Initial session verification failed:', error);
            // A temporary startup/network failure must not clear credentials the
            // user has already entered. Keep the login panel intact and allow
            // submitLogin to report the real authentication result.
            if (credentialsTouched()) return;
            clearStoredSession();
            lock('', '');
          });
      }

      /* +----------------------------------+
       * + verifyStoredSessionInBackground_ +
       * +----------------------------------+ */
      function verifyStoredSessionInBackground_(token) {
        if (!state.authUserId) return;
        hoagApiRequest('loginState', {})
          .then(function (envelope) {
            if (!envelope || envelope.ok === false || !envelope.authenticated) {
              forceLockFromServer(envelope && envelope.error ? envelope.error : 'Your secure session has expired. Please sign in again.');
              return;
            }
            storePublicAuthUser_(envelope);
            var restoredUser = envelope.user || getStoredPublicUser_() || {};
            applyUser(restoredUser);
            unlock(restoredUser, { freshLogin:false, restoredSession:true });
          })
          .catch(function (error) {
            console.warn('Saved session verification temporarily unavailable:', error);
          });
      }

      /* +----------------------------------+
       * + submitLogin                      +
       * +----------------------------------+ */
      function updateResumeSessionButton_() {
        // Continue Session UI is intentionally disabled. Session restoration is automatic on refresh.
        if (nodes.resume) nodes.resume.hidden = true;
      }

      function submitLogin(event) {
        if (event && typeof event.preventDefault === 'function') event.preventDefault();
        if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
        if (busy) return;

        var username = nodes.username ? nodes.username.value : '';
        var password = nodes.password ? nodes.password.value : '';

        if (!String(username || '').trim() || String(password || '') === '') {
          setLoginMessage('Please enter your username and password.', 'error');
          return;
        }

        var mfaValue = nodes.mfaCode ? String(nodes.mfaCode.value || '') : '';
        if (loginMfaRequired && !mfaValue) {
          setLoginMessage('Enter your authenticator code or a recovery code.', 'error');
          if (nodes.mfaCode) nodes.mfaCode.focus();
          return;
        }

        setBusy(true);
        setLoginMessage('', '');
        loginRequestId += 1;
        var requestId = loginRequestId;
        startLoginTimeout_(requestId);

        var clientInfo = typeof ActivityTracker !== 'undefined' && ActivityTracker.getClientInfo
          ? ActivityTracker.getClientInfo({ page: 'login', platform: 'web', source: 'vercel' })
          : { page: 'login', platform: 'web', source: 'vercel' };

        var credentials = {
          username: username,
          password: password,
          clientInfo: clientInfo
        };
        if (loginMfaRequired && mfaValue) {
          if (/^\d{6}$/.test(mfaValue)) credentials.mfaCode = mfaValue;
          else credentials.recoveryCode = mfaValue;
        }
        hoagApiRequest('login', credentials)
          .then(function (envelope) {
            if (requestId !== loginRequestId) return;
            clearLoginTimeout_();
            setBusy(false);

            if (!envelope || envelope.ok === false || !envelope.authenticated) {
              if (envelope && envelope.mfaRequired) {
                loginMfaRequired = true;
                if (nodes.mfaField) nodes.mfaField.hidden = false;
                if (nodes.mfaCode) {
                  nodes.mfaCode.value = '';
                  nodes.mfaCode.focus();
                }
                setLoginMessage(envelope.error || 'Enter your authenticator code.', 'error');
                return;
              }
              loginMfaRequired = false;
              if (nodes.mfaField) nodes.mfaField.hidden = true;
              clearStoredSession();
              /* Diagnostic mode: NEVER clear the password here. Keep both fields
               * visible so a failed request cannot look like the form disappeared. */
              var loginError = envelope && envelope.error ? envelope.error : 'Invalid username or password.';
              var httpInfo = envelope && envelope._httpStatus ? ' (HTTP ' + envelope._httpStatus + ')' : '';
              var reqInfo = envelope && envelope._requestId ? ' [Request ID: ' + envelope._requestId + ']' : '';
              setLoginMessage(loginError + httpInfo + reqInfo, 'error');
              if (nodes.password) nodes.password.focus();
              return;
            }

            loginMfaRequired = false;
            if (nodes.mfaCode) nodes.mfaCode.value = '';
            if (nodes.mfaField) nodes.mfaField.hidden = true;
            handleEnvelope(envelope, {
              freshLogin: true,
              loginServerMs: envelope.loginServerMs
            });
          })
          .catch(function (error) {
            if (requestId !== loginRequestId) return;
            clearLoginTimeout_();
            setBusy(false);
            var networkMessage = error && error.message ? error.message : 'Login failed. Please try again.';
            setLoginMessage(networkMessage, 'error');
          });
      }

      /* +----------------------------------+
       * + submitPasswordChange             +
       * +----------------------------------+ */
      function submitPasswordChange(event) {
        event.preventDefault();
        if (changeBusy) return;
  
        var username = nodes.changeUsername ? nodes.changeUsername.value : '';
        var currentPassword = nodes.changeCurrentPassword ? nodes.changeCurrentPassword.value : '';
        var newPassword = nodes.changeNewPassword ? nodes.changeNewPassword.value : '';
        var confirmPassword = nodes.changeConfirmPassword ? nodes.changeConfirmPassword.value : '';
  
        if (!String(username || '').trim() || String(currentPassword || '') === '' || String(newPassword || '') === '' || String(confirmPassword || '') === '') {
          setChangeMessage('Please complete all password change fields.', 'error');
          return;
        }
  
        if (String(newPassword) !== String(confirmPassword)) {
          setChangeMessage('New password and confirmation do not match.', 'error');
          return;
        }
  
        if (!hasVercelBackend()) {
          setChangeMessage('Password change service is unavailable. Please try again.', 'error');
          return;
        }
  
        setChangeBusy(true);
        setChangeMessage('', '');
  
        hoagApi.run
          .withSuccessHandler(function (envelope) {
            setChangeBusy(false);
            if (!envelope || envelope.ok === false) {
              setChangeMessage(envelope && envelope.error ? envelope.error : 'Password update failed.', 'error');
              if (nodes.changeCurrentPassword) {
                nodes.changeCurrentPassword.value = '';
                nodes.changeCurrentPassword.focus();
              }
              return;
            }
  
            [nodes.changeCurrentPassword, nodes.changeNewPassword, nodes.changeConfirmPassword].forEach(function (node) {
              if (node) node.value = '';
            });
            if (envelope.authenticated) {
              setChangeMessage(envelope.message || 'Password updated successfully.', 'ok');
              handleEnvelope(envelope, { freshLogin: true });
              return;
            }
            setChangeMessage(envelope.message || 'Password updated. Go back and sign in.', 'ok');
            if (nodes.username && nodes.changeUsername) nodes.username.value = nodes.changeUsername.value;
            if (nodes.password) nodes.password.value = '';
          })
          .withFailureHandler(function (error) {
            setChangeBusy(false);
            setChangeMessage(error && error.message ? error.message : 'Password update failed. Please try again.', 'error');
          })
          .changeAuthPassword(username, currentPassword, newPassword, typeof ActivityTracker !== 'undefined' && ActivityTracker.getClientInfo ? ActivityTracker.getClientInfo({ page: 'changePassword' }) : {}, getStoredToken());
      }
  
      /* +----------------------------------+
       * + togglePassword                   +
       * +----------------------------------+ */
      function togglePassword() {
        if (!nodes.password || !nodes.passwordToggle) return;
        var showing = nodes.password.type === 'text';
        nodes.password.type = showing ? 'password' : 'text';
        nodes.passwordToggle.classList.toggle('is-visible', !showing);
        nodes.passwordToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
        nodes.password.focus();
      }
  
      /* +----------------------------------+
       * + submitOnEnter                    +
       * +----------------------------------+ */
      /* Login intentionally uses the browser's native form submission for ENTER.
       * A custom keydown -> requestSubmit() path caused duplicate/competing
       * submit flows and made the auth form vulnerable to asynchronous lock/reset
       * races. The login button is type=submit, so ENTER follows the same single
       * submit handler as clicking Sign In. */
      function submitOnEnter(event) {
        var target = event && event.target ? event.target : null;
        if (!target) return;

        /* Keep the change-password form's keyboard navigation, but never intercept
         * ENTER on the actual login form. */
        if (nodes.changeForm && nodes.changeForm.contains(target)) {
          if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
          var fieldOrder = [
            nodes.changeUsername,
            nodes.changeCurrentPassword,
            nodes.changeNewPassword,
            nodes.changeConfirmPassword
          ];
          var index = fieldOrder.indexOf(target);
          if (index < 0) return;
          event.preventDefault();
          event.stopPropagation();
          for (var i = index + 1; i < fieldOrder.length; i += 1) {
            var node = fieldOrder[i];
            if (node && !node.disabled && !node.hidden) {
              node.focus();
              if (typeof node.select === 'function') node.select();
              return;
            }
          }
          if (nodes.changeForm.requestSubmit) nodes.changeForm.requestSubmit();
          else nodes.changeForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }

      /* +----------------------------------+
       * + logout                           +
       * +----------------------------------+ */
      function logout(message, type, reason) {
        // The real credential lives in the HttpOnly cookie and is intentionally
        // not readable from JavaScript. Always call the logout endpoint so the
        // server can revoke the cookie-backed session.
        stopSessionControls();
        clearStoredSession();
        if (window.LabApp && window.LabApp.Router && typeof window.LabApp.Router.clearLastPage === 'function') {
          window.LabApp.Router.clearLastPage();
        }
        if (typeof RosterSync !== 'undefined' && RosterSync && typeof RosterSync.handleAuthLogout === 'function') {
          RosterSync.handleAuthLogout();
        }
  
hoagApiRequest('logout', {
  clientInfo: typeof ActivityTracker !== 'undefined' &&
    ActivityTracker.getClientInfo
    ? ActivityTracker.getClientInfo({ page: reason || 'logout' })
    : {}
}).catch(function (error) {
  console.warn('Vercel logout request failed:', error);
});
        lock(message || '', type || '');
      }
  
      /* +----------------------------------+
       * + init                             +
       * +----------------------------------+ */
      function init() {
        cacheDomNodes();
        // Remove any credentials left by pre-HttpOnly builds.
        safeStorageRemove(TOKEN_KEY);
        safeStorageRemove(USER_KEY);
        Theme.suspendForLogin();
  
        if (nodes.form) {
          /* Login is handled entirely in JavaScript. Do not allow the browser's
           * implicit/native form submission to navigate/reload the page. */
          nodes.form.addEventListener('submit', submitLogin);
          nodes.form.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
            var target = event.target;
            event.preventDefault();
            event.stopPropagation();

            /* Login keyboard flow: USERNAME -> PASSWORD -> LOGIN. */
            if (target === nodes.username) {
              if (nodes.password && !nodes.password.disabled && !nodes.password.hidden) {
                nodes.password.focus();
                if (typeof nodes.password.select === 'function') nodes.password.select();
              }
              return;
            }

            if (target === nodes.password) {
              submitLogin(event);
              return;
            }

            if (target === nodes.mfaCode) {
              submitLogin(event);
            }
          });
        }
        if (nodes.changeForm) {
          nodes.changeForm.addEventListener('submit', submitPasswordChange);
          nodes.changeForm.addEventListener('keydown', submitOnEnter);
        }
        if (nodes.passwordToggle) nodes.passwordToggle.addEventListener('click', togglePassword);
        if (nodes.submit) nodes.submit.addEventListener('click', submitLogin);
        if (nodes.showChangePassword) nodes.showChangePassword.addEventListener('click', showChangePanel);

        // CSP-safe replacements for legacy inline handlers.
        var logoutButton = $('logoutBtn');
        if (logoutButton) logoutButton.addEventListener('click', function () { logout(); });
        var themeButton = $('themeToggleBtn');
        if (themeButton && window.LabApp && window.LabApp.Theme) {
          themeButton.addEventListener('click', function () { window.LabApp.Theme.toggle(); });
        }
        var clockBlock = document.querySelector('.display-time-block');
        if (clockBlock && window.LabApp && window.LabApp.Dashboard) {
          clockBlock.addEventListener('click', function () { window.LabApp.Dashboard.refreshClock(); });
        }
        var prevMonth = document.querySelector('.calendar-roster-nav-btn[aria-label="Previous month"]');
        if (prevMonth) prevMonth.addEventListener('click', function () { window.LabApp.Calendar.changeMonth(-1); });
        var nextMonth = document.querySelector('.calendar-roster-nav-btn[aria-label="Next month"]');
        if (nextMonth) nextMonth.addEventListener('click', function () { window.LabApp.Calendar.changeMonth(1); });
        var todayMonth = $('calendarCurrentMonthBtn');
        if (todayMonth) todayMonth.addEventListener('click', function () { window.LabApp.Calendar.goToday(); });
        var exportMonth = document.querySelector('.calendar-roster-export-btn');
        if (exportMonth) exportMonth.addEventListener('click', function () { window.LabApp.Calendar.exportMonthlySchedulePdfs(); });
        var addRoster = document.querySelector('.calendar-toolbar-btn');
        if (addRoster) addRoster.addEventListener('click', function () { window.LabApp.Calendar.addRosterRow(); });
        if (nodes.backToLogin) {
          nodes.backToLogin.addEventListener('click', function () {
            showLoginPanel('', '');
          });
        }
  
        updateResumeSessionButton_();
        checkStoredSession();
      }
  
      return {
        init: init,
        logout: logout,
        getToken: getStoredToken,
        isAuthenticated: function () {
          return !!(getStoredToken() && state.authUserId);
        },
        getUser: function () {
          return {
            id: state.authUserId,
            name: state.authUserDisplayName,
            role: state.authRole
          };
        },
        getUserName: function () {
          return state.authUserDisplayName || '';
        }
      };
    })();

    /* +----------------------------------+
     * + CLIENT MODULE                    +
     * +----------------------------------+ */
    /* Firebase client connection disabled: all application data flows through the
     * Vercel bridge. Keeping this compatibility shim avoids changing unrelated callers. */
    var ActivityTracker = (function () {
      var lastEvents = {};
      var defaultDedupeMs = 5000;
  
      /* +----------------------------------+
       * + trim                             +
       * +----------------------------------+ */
      function trim(value, maxLength) {
        return cleanText(value).slice(0, maxLength || 240);
      }
  
      /* +----------------------------------+
       * + getActivePageId                  +
       * +----------------------------------+ */
      function getActivePageId() {
        var active = document.querySelector('.page.active');
        return active ? active.id : 'dashboard';
      }
  
      /* +----------------------------------+
       * + getPageLabel                     +
       * +----------------------------------+ */
      function getPageLabel(pageId) {
        var labels = {
          dashboard: 'Dashboard',
          profile: 'Profile',
          access: 'Access',
          calendar: 'Calendar',
          notification: 'Notification',
          leavesCourses: 'Leave & Courses',
          settings: 'Setting',
          moduleYears: 'Module Year Selector'
        };
        return labels[pageId] || trim(pageId || 'Dashboard', 80);
      }
  
      /* +----------------------------------+
       * + detectBrowser                    +
       * +----------------------------------+ */
      function detectBrowser(ua) {
        if (/Edg\//i.test(ua)) return 'Microsoft Edge';
        if (/OPR\//i.test(ua)) return 'Opera';
        if (/SamsungBrowser/i.test(ua)) return 'Samsung Internet';
        if (/Firefox\//i.test(ua)) return 'Firefox';
        if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome';
        if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Safari';
        return 'Browser';
      }
  
      /* +----------------------------------+
       * + detectOs                         +
       * +----------------------------------+ */
      function detectOs(ua, platform) {
        if (/Android/i.test(ua)) return 'Android';
        if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS / iPadOS';
        if (/Windows/i.test(ua) || /Win/i.test(platform)) return 'Windows';
        if (/Macintosh|Mac OS/i.test(ua) || /Mac/i.test(platform)) return 'macOS';
        if (/Linux/i.test(ua)) return 'Linux';
        return platform || 'Unknown OS';
      }
  
      /* +----------------------------------+
       * + detectDeviceType                 +
       * +----------------------------------+ */
      function detectDeviceType(ua) {
        var hasTouch = Number(navigator.maxTouchPoints || 0) > 0;
        var width = Math.max(window.innerWidth || 0, window.screen && window.screen.width || 0);
        var isAndroid = /Android/i.test(ua);
        var isIOS = /iPhone|iPad|iPod/i.test(ua);
        var isMobileUA = /Mobi|Mobile|Android|iPhone|iPod/i.test(ua);
        var isTabletUA = /iPad|Tablet/i.test(ua) || (isAndroid && !/Mobile/i.test(ua));
        var isWebView = /; wv\)/i.test(ua) || /\bwv\b/i.test(ua) || (/Version\/\d+\.\d+.*Chrome\//i.test(ua) && isAndroid);
  
        if (isWebView && isAndroid) return 'APK WEBVIEW';
        if (isWebView) return 'WEBVIEW';
        if (isTabletUA || (hasTouch && width >= 768 && width <= 1366 && !/Windows NT/i.test(ua))) return 'TABLET';
        if (isMobileUA || isIOS || (hasTouch && width < 768)) return 'MOBILE';
        return 'PC';
      }
  
      /* +----------------------------------+
       * + getClientInfo                    +
       * +----------------------------------+ */
      function getClientInfo(extra) {
        extra = extra && typeof extra === 'object' ? extra : {};
        var ua = String(navigator.userAgent || '');
        var platform = String(navigator.platform || '');
        var isElectron = /Electron\/\d+/i.test(ua);
        var deviceType = detectDeviceType(ua);
        var os = detectOs(ua, platform);
        var appMode = isElectron ? 'Desktop App' : (deviceType === 'APK WEBVIEW' ? 'APK WebView' : (deviceType === 'WEBVIEW' ? 'WebView' : 'Browser'));
        var width = window.screen && window.screen.width ? window.screen.width : window.innerWidth;
        var height = window.screen && window.screen.height ? window.screen.height : window.innerHeight;
        var screenText = String(width || '') + 'x' + String(height || '') + '@' + String(window.devicePixelRatio || 1);
        var viewportText = String(window.innerWidth || '') + 'x' + String(window.innerHeight || '');
        var page = extra.page || getActivePageId();
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  
        var info = {
          deviceType: deviceType,
          deviceLabel: [deviceType, os].filter(Boolean).join(' · '),
          appMode: appMode,
          browser: detectBrowser(ua),
          os: os,
          platform: platform,
          screen: screenText,
          viewport: viewportText,
          language: navigator.language || '',
          timezone: (typeof Intl !== 'undefined' && Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions ? Intl.DateTimeFormat().resolvedOptions().timeZone : '') || '',
          online: navigator.onLine !== false ? 'online' : 'offline',
          visibility: document.hidden ? 'hidden' : 'visible',
          runtimeMode: isElectron ? 'Electron' : ((typeof WebView !== 'undefined' && WebView && typeof WebView.getRuntimeMode === 'function') ? WebView.getRuntimeMode() : appMode),
          connectionType: connection && connection.effectiveType ? connection.effectiveType : '',
          page: page,
          path: window.location ? window.location.pathname : '',
          urlHash: window.location ? window.location.hash : '',
          referrer: document.referrer || '',
          userAgent: ua
        };
  
        Object.keys(extra).forEach(function (key) {
          if (extra[key] == null) return;
          info[key] = String(extra[key]);
        });
        return info;
      }
  
      /* +----------------------------------+
       * + shouldSkip                       +
       * +----------------------------------+ */
      function shouldSkip(action, details, dedupeMs) {
        var now = Date.now();
        var key = trim(action, 60) + '|' + trim(details, 160);
        var previous = lastEvents[key] || 0;
        lastEvents[key] = now;
        return now - previous < dedupeMs;
      }
  
      /* +----------------------------------+
       * + track                            +
       * +----------------------------------+ */
      function track(action, details, extra, options) {
        action = trim(action || 'ACTIVITY', 60).toUpperCase();
        details = trim(details || '', 500);
        options = options || {};
        var dedupeMs = Number(options.dedupeMs || defaultDedupeMs);
        if (shouldSkip(action, details, dedupeMs)) return;
        if (!hasVercelBackend() || !Auth || !Auth.getToken || !Auth.getToken()) return;
  
        hoagApi.run
          .withFailureHandler(function () {})
          .logClientActivity(Auth.getToken(), action, details, getClientInfo(extra || {}));
      }
  
      return {
        track: track,
        getClientInfo: getClientInfo,
        getActivePageId: getActivePageId,
        getPageLabel: getPageLabel
      };
    })();

    /* +----------------------------------+
     * + CLIENT MODULE                    +
     * +----------------------------------+ */
    var Modules = (function () {
      /* +----------------------------------+
       * + normalizeModuleName              +
       * +----------------------------------+ */
      function normalizeModuleName(cardName) {
        return moduleDisplayNames[cardName] || String(cardName || '').toUpperCase();
      }
  
      /* +----------------------------------+
       * + currentYear                      +
       * +----------------------------------+ */
      function currentYear() {
        return Number(getAppNowParts().year);
      }
  
      /* +----------------------------------+
       * + getModuleYearExternalLink        +
       * +----------------------------------+ */
      function getModuleYearExternalLink(moduleName, year) {
        var moduleLinks = moduleYearExternalLinks[normalizeModuleName(moduleName)];
        if (!moduleLinks) return '';
        return moduleLinks[String(year)] || '';
      }
  
      /* +----------------------------------+
       * + handleYearCardClick              +
       * +----------------------------------+ */
      function handleYearCardClick(moduleName, year) {
        var message = moduleName + ' - ' + year + ' opened.';
        var toast = $('systemNoticeToast');
        var title = $('systemNoticeTitle');
        var text = $('systemNoticeText');
        if (toast && title && text && toast.classList.contains('is-hidden')) {
          title.textContent = 'Module Opened';
          text.textContent = message;
          toast.classList.remove('is-hidden');
          window.setTimeout(function () {
            if (title.textContent === 'Module Opened' && text.textContent === message) {
              toast.classList.add('is-hidden');
              text.textContent = '';
            }
          }, 3000);
        } else if (window.console && typeof window.console.log === 'function') {
          window.console.log(message);
        }
      }
  
      /* +----------------------------------+
       * + OUTSOURCE REGISTER               +
       * +----------------------------------+ */
      function outsourceEsc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
      function outsourceToday(){
        var p=getAppNowParts();
        return Number(p.year)+'-'+pad2(Number(p.month))+'-'+pad2(Number(p.day));
      }
      function outsourceNewId(){return 'outsource-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
      var OUTSOURCE_REJECT_REASONS=["Quantity Not Sufficient","Clotted Sample","Haemolysed Sample","Lipemic Sample","Icteric Sample","Wrong Specimen Type","Wrong Container","Wrong Anticoagulant","Wrong Volume/Ratio","Unlabelled Sample","Mismatched Identification","Incomplete Identification","No Requester Stamp/Sign","Leaking Container","Broken Container","Contaminated Sample","Delayed Transport","Improper Storage","Exceeded Stability","Duplicate Sample","No Specimen Received","Improper Sample Collection","Unsuitable Specimen","Test/Specimen Mismatch","Test Not Offered","Redundant Request","Other"];
      function outsourceResultClass(value){
        var v=String(value||'').trim().toUpperCase();
        if(v==='REJECT')return 'status-reject';
        if(v==='ADA'||v==='COMPLETED'||v==='POSITIVE'||v==='NEGATIVE')return 'status-done';
        return 'status-pending';
      }
      var OUTSOURCE_TEST_CATALOG={"BIOCHEMISTRY":["24 Hours Urine Magnesium","24 Hours Urine Microalbumin","24 Hours Urine Potassium","24 Hours Urine Protein","24 Hours Urine Sodium","Acetaminophen","Adenocorticotrophic Hormone (ACTH)","Adenosine Deaminase (ADA)","Aldosterone","Alpha Feto Protein (AFP)","Alpha-1-Antitrypsin","Amino Acid","Ammonia","Amylase","Anti Acetylcholine Receptor Antibody (AChR)","Anti-Thyroglobulin Antibody (Anti-Tg)","Anti-TPO (Anti-Thyroid Peroxidase Antibodies)","Beta Human Chorionic Gonadotropin (B-hCG)","Body Fluid FEME","Body Fluid pH","Brain Natriuretic Peptide (BNP)","C-Peptide","C-Reactive Protein (CRP)","Caeruloplasmin","Calcitonin","Calcium (Ca)","Cancer Antigen 125","Cancer Antigen 15-3","Cancer Antigen 19-9","Carbamazepine","Carcinoembryonic Antigen (CEA)","Cardiac Enzyme","Ceruloplasmin","Cholinesterase","Complement C3","Complement C4","Congenital Hypothyroidism","Creatinine Clearance","Creatinine Kinase (CK)","Creatinine Kinase Isoenzyme (CKMB)","Dehydroxyepiendrosteron Sulphate (DHEA-S)","Estradiol (Oestradiol/E2)","Estrogen","Ferritin","Folate","Folic Acid","Follicle Stimulating Hormone (FSH)","Free Tri-iodothyronine (FT3)","Fructosamine","Gamma Glutamyl Transpeptidase (GGT)","Growth Hormone (GH)","Haemoglobin A1c (HbA1c)","Haptoglobin","IGF-1 (Insulin-like Growth Factor 1)","Immunoglobulin A","Immunoglobulin G","Immunoglobulin M","Inborn Error Metabolism (IEM)","Insulin","Intact Parathyroid Hormone (iPTH)","Iron Profile","Lactate","Lactate Dehydrogenase (LDH)","Lithium","Luteinising Hormone (LH)","Magnesium (Mg)","Phosphate (PO4)","Pleural Fluid Biochemistry","Pleural Fluid FEME","Pleural Fluid Glucose","Pleural Fluid Protein","Progesterone","Prolactin","Prostate Specific Antigen (PSA)","Protein Albumin","Protein Creatinine Index (PCI)","Protein Electrophoresis","Pyruvate","Renin","Rheumatoid Factor (RF)","Serum Copper","Serum Cortisol","Serum Immunoglobulin","Serum Osmolality","Stool Occult Blood","Testosterone","Therapeutic Drug Monitoring (TDM) Acetaminophen","Therapeutic Drug Monitoring (TDM) Amikacin","Therapeutic Drug Monitoring (TDM) Benzodiazepine","Therapeutic Drug Monitoring (TDM) Carbamazepine","Therapeutic Drug Monitoring (TDM) Cyclosporine","Therapeutic Drug Monitoring (TDM) Digoxin","Therapeutic Drug Monitoring (TDM) Ethanol","Therapeutic Drug Monitoring (TDM) Everolimus","Therapeutic Drug Monitoring (TDM) Gentamicin","Therapeutic Drug Monitoring (TDM) Methotrexate","Therapeutic Drug Monitoring (TDM) Mycophenolic Acid","Therapeutic Drug Monitoring (TDM) Phenytoin","Therapeutic Drug Monitoring (TDM) Valproic Acid","Therapeutic Drug Monitoring (TDM) Vancomycin","Thyroglobulin","Thyroid Function Test (TFT)","Thyroid Stimulating Hormone (TSH)","Thyroid Stimulating Hormone (TSH) Cord Blood","Thyrotropin Receptor Antibody (TRAb)","Thyroxine Free (T4)","Thyroxine Free (T4) Cord Blood","Total Iron Binding Capacity (TIBC)","Transferrin","Troponin I","Troponin T","Urine Copper","Urine Cortisol","Urine Creatinine Albumin Ratio (ACR)","Urine Drug","Urine Mercury","Urine Organic Acid","Urine Osmolality","Urine Paraquat","Urine PCR","Urine Sodium","Urine Toxicology","Vitamin B12","Vitamin D"],"MICROBIOLOGY":["Adenovirus Antigen Detection (IFAT)","Anti B2 Glycoprotein IgG/M","Anti Cardiolipin IgG/M","Anti Double Stranded DNA (DsDNA)","Anti Gastric Parietal Cell Antibody (GPA)","Anti HBc","Anti HBe","Anti HBs","Anti HCV","Anti HIV","Anti Mitochondrial Antibody (AMA)","Anti Neutrophil Cytoplasmic Antigen (ANCA)","Anti Nuclear Antibody (ANA)","Anti Smooth Muscle (ASMA)","Anti Thyroglobulin Antibody","Anti Thyroid Peroxidase","Anti-Cyclic Citrulinated Peptide (CCP)","Anti-Liver Kidney Microsomal Antibody (Anti-LKM)","Anti-Mitochondrial Antibody (AMA)","Anti-Smooth Muscle Antibody (ASMA)","Antistreptolysin O Titer (ASOT)","Aspirate Culture & Sensitivity","Blood Culture & Sensitivity","Body Fluid Culture & Sensitivity","Body Fluid Fungal Culture & Sensitivity","Chlamydia Pneumonia Antibody","Clostridium Defficile Ag / Toxin","Coxsackie Virus Serology","CSF Bacterial Ag","CSF C&S","CSF Cryptococcal Ag","Cytomegalovirus (CMV)","Dengue Serology","Ear Culture & Sensitivity","ELEK Test","Enterovirus PCR","Epstein–Barr Virus","Extractable Nuclear Antibody (ENA)","Eye Culture & Sensitivity","Fungal Culture & Sensitivity","Gastric Lavage Culture & Sensitivity","Glomerular Basement Membrane Antibody (GBM)","Gram Stain","Hand, Feet and Mouth Disease (HFMD)","Hepatitis A","Hepatitis B","Hepatitis B Surface Antigen (HBsAg)","Hepatitis B Virus DNA (HBV DNA)","Hepatitis C","Hepatitis C Virus RNA (HCV RNA)","Herpes Simplex Virus (HSV)","High Vaginal Swab Culture & Sensitivity","HIV Viral Load","Human Immunodeficiency Virus (HIV)","Human Papilloma Virus (HPV)","Indian Ink","Legionella Pneumophilia Antigen","Leptospira Serology","Leptospirosis Microagglutination Test (MAT)","Leptospirosis Polymerase Chain Reaction (PCR)","Liver Specific Antibody","Measles","Measles PCR","Measles Serology","Melioidosis Serology","Mers-COV PCR","MTB Body Fluid Culture & Sensitivity","MTB Gastric Lavage Culture & Sensitivity","MTB IGRA","MTB MGIT","MTB Pleural Fluid Culture & Sensitivity","MTB Polymerase Chain Reaction (PCR)","MTB Sputum Culture & Sensitivity","MTB Stool Culture & Sensitivity","MTB Urine Culture & Sensitivity","Mumps","Mycoplasma Antibody Total","Mycoplasma IgM","Nasal Culture & Sensitivity","Parvo Virus B19","Peritoneal Dialysis Fluid Culture & Sensitivity","Pleural Fluid AFB","Pleural Fluid Gram Stain","Polio, Acute Flaccid Paralysis","Pus/Wound Culture & Sensitivity","Rabies","Rapid Plasma Reagin (RPR)","Respiratory Culture & Sensitivity","Respiratory Screen Virus","Rotavirus","Rubella IgG/M","Sputum Culture & Sensitivity","Sputum For Leprosy PCR","Sputum Gene Xpert/RIF","Sputum Line Probe Assay (LPA)","Sputum Xpert XDR","Stool Culture & Sensitivity","Stool Line Probe Assay (LPA)","Swab Culture & Sensitivity","Tissue Culture & Sensitivity","Torches","Toxoplasma","Treponema Pallidum HaemaAgglutination (TPHA)","Treponema Pallidum Particle Agglutination (TPPA)","Urine Culture & Sensitivity","Urine Gene Xpert/RIF","Urine Line Probe Assay (LPA)","Varicella Zoster Virus DNA PCR","Varicella Zoster Virus Serology","Venereal Disease Research Laboratory (VDRL)","Vibrio Cholera","Zika Polymerase Chain Reaction (PCR)"],"HEMATOLOGY":["Activated Partial Thrombin Time (APTT)","Bone Marrow Aspiration","Bone Marrow Trephine Biopsy","CD4/CD8 Enumeration","Coagulation Profile","Coomb's Test","Cryoglobulin","CSF For Blast","D-Dimer","Direct Antiglobulin Test (DAT)","DNA Analysis","Factor IX","Factor VIII Assay","FBC In Citrate","Fibrinogen","Full Blood Picture (FBP)","Group Screen & Hold (GSH)","Grouping & Cross Matching (GXM)","H Inclusion","Haemoglobin Analysis","Hb F Quantitation","Heinz Bodies","HLA Typing","Immunoglobulin","Kleihauer Test","LAP/NAP Score","Leukaemia/Lymphoma Immunophenotyping","Molecular Alpha Thalassaemia","Molecular JAK-2","Osmotic Fragility Test (OFT)","Paroxysmal Nocturnal Haemoglobinuria (PNH)","Plasmin Inhibitor","Plasminogen","Platelet Function Test","Pleural Fluid Differential Count","Prothrombin Time (PT)/INR","RBC Phenotyping","Reticulocyte Count","Rh Typing","Seminal Fluid Analysis (SFA)","Serum Erythropoeitin","Sickling Test","Stem Cell Enumeration","Thrombin Time(TT)","Urine Hemosiderin","Von Willebrand Assay"],"CYTOLOGY":["Body Fluid Cytology","Fine Needle Aspiration","High Vaginal Swab","Non Gynaecology","PAP Smear","Seminal Fluid Analysis"],"HISTOLOGY":["Enzyme Histochemistry","Histophatological Examination (HPE)"]};
      function populateOutsourceTests(selectedValue){
        var labEl=$('osLab'), testEl=$('osTest');
        if(!labEl||!testEl)return;
        var lab=String(labEl.value||'').trim().toUpperCase();
        var previous=String(selectedValue!=null?selectedValue:testEl.value||'').trim();
        var list=OUTSOURCE_TEST_CATALOG[lab]||[];
        testEl.innerHTML='<option value="">Select test / investigation</option>'+list.map(function(name){
          return '<option value="'+outsourceEsc(name)+'">'+outsourceEsc(name)+'</option>';
        }).join('');
        if(previous&&list.indexOf(previous)>=0)testEl.value=previous;
        else testEl.value='';
        testEl.dispatchEvent(new Event('change',{bubbles:true}));
      }
      function bindOutsourceTestCatalog(){
        var lab=$('osLab');
        if(!lab)return;
        if(lab.dataset.testCatalogBound==='1')return;
        lab.dataset.testCatalogBound='1';
        lab.addEventListener('change',function(){populateOutsourceTests('');});
        populateOutsourceTests('');
      }
      var outsourceCatalogRemote={labs:[],testsByLab:{},rejectionReasons:[],updatedAt:''};
      function getOutsourceRejectReasons(){
        var remote=Array.isArray(outsourceCatalogRemote.rejectionReasons)?outsourceCatalogRemote.rejectionReasons:[];
        return OUTSOURCE_REJECT_REASONS.concat(remote).filter(function(v,i,a){return v&&a.findIndex(function(x){return String(x).toUpperCase()===String(v).toUpperCase();})===i;});
      }
      function renderOutsourceRejectReasonOptions(selectedValue){
        var sel=$('outsourceModalRejectReason');if(!sel)return;
        var selected=String(selectedValue!=null?selectedValue:sel.value||'');
        sel.innerHTML='<option value="">Select reject reason</option>'+getOutsourceRejectReasons().map(function(reason){return '<option value="'+outsourceEsc(reason)+'">'+outsourceEsc(reason)+'</option>';}).join('');
        if(selected)sel.value=selected;
      }
      function outsourceAdminAllowed(){ return String(state.authRole||'').toUpperCase()==='ADMIN'; }
      function outsourceAdminToken(){ return (typeof Auth!=='undefined'&&Auth.getToken)?Auth.getToken():''; }
      function mergeOutsourceCatalog(remote){
        remote=remote&&typeof remote==='object'?remote:{};
        (Array.isArray(remote.labs)?remote.labs:[]).forEach(function(lab){
          lab=String(lab||'').trim().toUpperCase();
          if(lab&&!Object.keys(OUTSOURCE_TEST_CATALOG).some(function(k){return k.toUpperCase()===lab;}))OUTSOURCE_TEST_CATALOG[lab]=[];
        });
        var tests=remote.testsByLab&&typeof remote.testsByLab==='object'?remote.testsByLab:{};
        Object.keys(tests).forEach(function(lab){
          var canonical=Object.keys(OUTSOURCE_TEST_CATALOG).find(function(k){return k.toUpperCase()===String(lab).toUpperCase();})||String(lab).trim().toUpperCase();
          if(!OUTSOURCE_TEST_CATALOG[canonical])OUTSOURCE_TEST_CATALOG[canonical]=[];
          (Array.isArray(tests[lab])?tests[lab]:[]).forEach(function(test){
            test=String(test||'').trim();if(!test)return;
            if(!OUTSOURCE_TEST_CATALOG[canonical].some(function(x){return String(x).toUpperCase()===test.toUpperCase();}))OUTSOURCE_TEST_CATALOG[canonical].push(test);
          });
        });
        outsourceCatalogRemote={labs:Array.isArray(remote.labs)?remote.labs.slice():[],testsByLab:tests,rejectionReasons:Array.isArray(remote.rejectionReasons)?remote.rejectionReasons.map(function(v){return String(v||'').trim();}).filter(Boolean):[],updatedAt:String(remote.updatedAt||'')};
        renderOutsourceRejectReasonOptions();
      }
      function loadOutsourceCatalog(){
        if(!hasVercelBackend())return;
        hoagApiRequest('action',{method:'getOutsourceCatalog',args:[outsourceAdminToken()]}).then(function(result){
          if(!result||result.ok===false)return;
          mergeOutsourceCatalog(result);
          var lab=$('osLab'),selected=lab?String(lab.value||''):'';
          renderOutsourceLabs(selected);
          populateOutsourceTests($('osTest')?$('osTest').value:'');
          var b=$('outsourceAdminCatalogBtn');if(b)b.hidden=!outsourceAdminAllowed();
        }).catch(function(error){console.warn('Outsource catalog load failed:',error&&error.message?error.message:error);});
      }
      function renderOutsourceLabs(selectedValue){
        var lab=$('osLab');if(!lab)return;var selected=String(selectedValue||lab.value||'');
        var keys=Object.keys(OUTSOURCE_TEST_CATALOG);
        lab.innerHTML='<option value="">Select laboratory</option>'+keys.map(function(name){return '<option value="'+outsourceEsc(name)+'">'+outsourceEsc(name)+'</option>';}).join('');
        if(selected){var canonical=keys.find(function(k){return k.toUpperCase()===selected.toUpperCase();});if(canonical)lab.value=canonical;}
      }
      function renderOutsourceAdminCatalog(){
        var list=$('outsourceAdminCatalogList');if(!list)return;var labs=Object.keys(OUTSOURCE_TEST_CATALOG);
        var html=labs.map(function(lab){var key=Object.keys(outsourceCatalogRemote.testsByLab||{}).find(function(k){return k.toUpperCase()===lab.toUpperCase();});var extra=key&&Array.isArray(outsourceCatalogRemote.testsByLab[key])?outsourceCatalogRemote.testsByLab[key]:[];return '<div class="outsource-admin-catalog-row"><div><strong>'+outsourceEsc(lab)+'</strong><span>'+outsourceEsc((OUTSOURCE_TEST_CATALOG[lab]||[]).length)+' tests available</span></div><em>'+outsourceEsc(extra.length)+' added by admin</em></div>';}).join('');
        var reasons=Array.isArray(outsourceCatalogRemote.rejectionReasons)?outsourceCatalogRemote.rejectionReasons:[];
        if(reasons.length){html+='<div class="outsource-admin-catalog-row"><div><strong>REJECTION REASONS</strong><span>'+outsourceEsc(reasons.length)+' added by admin</span></div><em>'+outsourceEsc(reasons.join(' • '))+'</em></div>';}
        list.innerHTML=html;
      }
      function openOutsourceAdminCatalog(){
        if(!outsourceAdminAllowed()){requestAppConfirm('ADMIN ONLY','Only administrators can manage outsource laboratories and tests.',function(){});return;}
        var m=$('outsourceAdminCatalogModal');if(m)m.hidden=false;renderOutsourceAdminCatalog();renderOutsourceAdminTestLabOptions();
      }
      function closeOutsourceAdminCatalog(){var m=$('outsourceAdminCatalogModal');if(m)m.hidden=true;var a=$('outsourceAdminLabInput'),t=$('outsourceAdminTestInput');if(a)a.value='';if(t)t.value='';setOutsourceAdminMessage('',false);}
      function renderOutsourceAdminTestLabOptions(){
        var sel=$('outsourceAdminTestLab');if(!sel)return;var previous=sel.value,labs=Object.keys(OUTSOURCE_TEST_CATALOG);
        sel.innerHTML=labs.map(function(lab){return '<option value="'+outsourceEsc(lab)+'">'+outsourceEsc(lab)+'</option>';}).join('');
        if(previous){var canonical=labs.find(function(x){return x.toUpperCase()===previous.toUpperCase();});if(canonical)sel.value=canonical;}
      }
      function setOutsourceAdminMessage(text,error){var msg=$('outsourceAdminCatalogMessage');if(msg){msg.textContent=text||'';msg.classList.toggle('error',!!error);}}
      function addOutsourceAdminLab(){
        if(!outsourceAdminAllowed())return;var input=$('outsourceAdminLabInput'),lab=String(input&&input.value||'').trim();if(!lab){setOutsourceAdminMessage('Laboratory name is required.',true);return;}
        setOutsourceAdminMessage('Adding laboratory...');
        hoagApiRequest('action',{method:'adminAddOutsourceLab',args:[outsourceAdminToken(),lab]}).then(function(result){if(!result||result.ok===false)throw new Error(result&&result.error||'Unable to add laboratory.');mergeOutsourceCatalog(result);renderOutsourceLabs(lab);populateOutsourceTests('');renderOutsourceAdminCatalog();renderOutsourceAdminTestLabOptions();input.value='';setOutsourceAdminMessage('Laboratory added successfully.');}).catch(function(error){setOutsourceAdminMessage(error&&error.message?error.message:'Unable to add laboratory.',true);});
      }
      function addOutsourceAdminTest(){
        if(!outsourceAdminAllowed())return;var lab=$('outsourceAdminTestLab'),input=$('outsourceAdminTestInput'),name=String(input&&input.value||'').trim();if(!lab||!lab.value){setOutsourceAdminMessage('Select a laboratory first.',true);return;}if(!name){setOutsourceAdminMessage('Test name is required.',true);return;}
        setOutsourceAdminMessage('Adding test...');
        hoagApiRequest('action',{method:'adminAddOutsourceTest',args:[outsourceAdminToken(),lab.value,name]}).then(function(result){if(!result||result.ok===false)throw new Error(result&&result.error||'Unable to add test.');mergeOutsourceCatalog(result);renderOutsourceLabs($('osLab')?$('osLab').value:'');populateOutsourceTests('');renderOutsourceAdminCatalog();input.value='';setOutsourceAdminMessage('Test added successfully.');}).catch(function(error){setOutsourceAdminMessage(error&&error.message?error.message:'Unable to add test.',true);});
      }
      function addOutsourceAdminRejectReason(){
        if(!outsourceAdminAllowed())return;
        var input=$('outsourceAdminRejectReasonInput'),reason=String(input&&input.value||'').trim();
        if(!reason){setOutsourceAdminMessage('Rejection reason is required.',true);return;}
        if(getOutsourceRejectReasons().some(function(x){return String(x).toUpperCase()===reason.toUpperCase();})){setOutsourceAdminMessage('This rejection reason already exists.',true);return;}
        setOutsourceAdminMessage('Adding rejection reason...');
        hoagApiRequest('action',{method:'adminAddOutsourceRejectReason',args:[outsourceAdminToken(),reason]}).then(function(result){if(!result||result.ok===false)throw new Error(result&&result.error||'Unable to add rejection reason.');mergeOutsourceCatalog(result);renderOutsourceAdminCatalog();renderOutsourceRejectReasonOptions();input.value='';setOutsourceAdminMessage('Rejection reason added successfully.');}).catch(function(error){setOutsourceAdminMessage(error&&error.message?error.message:'Unable to add rejection reason.',true);});
      }
      function renderOutsourcePage(options){
        options=options||{};
        var grid=$('moduleYearGrid'); if(!grid)return;
        /* OUTSOURCE workspace may be rebuilt by live inventory sync. The post-save
           modal is intentionally BODY-level, so NEVER remove it from here. */
        /* The Inventory module is loaded lazily. A first render can happen
           before Inventory.load() has replaced its local/remote dataset.
           Never let an earlier empty cache mask the current 1,954+ rows. */
        invalidateOutsourceRowsCache();
        grid.classList.add('outsource-active-grid');
        $('moduleYearsTitle').textContent='OUTSOURCE';
        $('moduleYearsDesc').textContent='Register, track and follow up outsourced laboratory samples in one live workspace. No external spreadsheet required.';
        var rows=(typeof OutSource!=='undefined'&&OutSource.getSamples)?OutSource.getSamples():[];
        outsourceDataSignature=getOutsourceRowSignature(rows);
        rows.sort(function(a,b){return String(b.sampleDate||b.createdAt||'').localeCompare(String(a.sampleDate||a.createdAt||''));});
        var total=rows.length,pending=rows.filter(function(r){return !String(r.result||'').trim()||String(r.result).toUpperCase()==='PENDING';}).length;
        var done=rows.filter(function(r){return ['ADA','COMPLETED','POSITIVE','NEGATIVE'].indexOf(String(r.result||'').toUpperCase())>=0;}).length;
        var rejected=rows.filter(function(r){return String(r.result||'').toUpperCase()==='REJECT';}).length;
        var today=outsourceToday();
        grid.innerHTML='<div class="outsource-register">'+
          '<div class="outsource-grid">'+
            '<section class="outsource-card"><div class="outsource-card-head"><h3>REGISTER SAMPLE</h3><span id="outsourceEditHint">NEW RECORD</span></div>'+
              '<form class="outsource-form" id="outsourceForm" autocomplete="off">'+
                '<input type="hidden" id="outsourceEditId">'+
                '<div class="outsource-field outsource-date-field"><label>Sample Date *</label><input type="hidden" id="osSampleDate" value="'+outsourceEsc(today)+'"><input type="text" id="osSampleDateVisible" class="outsource-neumorphic-date" required readonly placeholder="dd/mm/yyyy" autocomplete="off"></div>'+
                '<div class="outsource-field"><label>Bar Code</label><input id="osBarCode" placeholder="e.g. 1036733"></div>'+
                '<div class="outsource-field"><label>Name *</label><input id="osName" required placeholder="Patient name"></div>'+
                '<div class="outsource-field"><label>ID / IC</label><input id="osIdIc" placeholder="NRIC / Passport"></div>'+
                '<div class="outsource-field"><label>Sex <span class="os-auto-badge">AUTO FROM IC</span></label><input id="osSex" placeholder="Auto from IC" readonly></div>'+
                '<div class="outsource-field"><label>Age <span class="os-auto-badge">AUTO FROM IC</span></label><input type="number" min="0" max="130" id="osAge" placeholder="Auto from IC" readonly></div>'+
                '<div class="outsource-field"><label>Unit</label><select id="osUnit"><option value="">Select unit</option><option>WAD1</option><option>WAD2</option><option>WAD3</option><option>WAD4</option><option>ED</option><option>OPD</option><option>UKIA</option><option>PRIMER</option><option>VEKTOR</option><option>TB/KUSTA</option></select></div>'+
                '<div class="outsource-field outsource-date-field"><label>Dispatch Date</label><input type="hidden" id="osDispatchDate" value="'+outsourceEsc(today)+'"><input type="text" id="osDispatchDateVisible" class="outsource-neumorphic-date" readonly placeholder="dd/mm/yyyy" autocomplete="off"></div>'+
                '<div class="outsource-field"><label>Referral</label><select id="osReferral"><option value="">Select referral</option><option>H SELAYANG</option><option>HKL</option><option>IPR</option><option>MKAK</option><option>MVN BOTANIK</option><option>H AMPANG</option><option>IMR/NIH</option><option>HTA</option><option>H PUTRAJAYA</option></select></div>'+
                '<div class="outsource-field"><label>Outsource Lab</label><select id="osLab"><option value="">Select laboratory</option></select></div>'+
                '<div class="outsource-field outsource-test-field"><label>Test / Investigation *</label><select id="osTest" required><option value="">Select test / investigation</option></select></div>'+
                
                '<div class="outsource-form-actions"><button class="outsource-btn admin" type="button" id="outsourceAdminCatalogBtn" hidden>⚙ ADMIN CONTROL</button><button class="outsource-btn secondary" type="button" id="outsourceClearBtn">CLEAR</button><button class="outsource-btn primary" type="submit" id="outsourceSaveBtn">REGISTER SAMPLE</button></div>'+
              '</form></section>'+
            '<section class="outsource-card"><div class="outsource-card-head"><h3>REGISTERED SAMPLES</h3><span>'+outsourceEsc(total)+' TOTAL</span></div>'+
              '<div class="outsource-summary"><div class="outsource-stat"><div class="num">'+total+'</div><div class="lbl">Total</div></div><div class="outsource-stat"><div class="num">'+pending+'</div><div class="lbl">Pending</div></div><div class="outsource-stat"><div class="num">'+done+'</div><div class="lbl">Completed</div></div><div class="outsource-stat"><div class="num">'+rejected+'</div><div class="lbl">Rejected</div></div></div>'+
              '<div class="outsource-search">'+
                '<input id="outsourceSearch" placeholder="Search barcode, name or IC / ID..." aria-label="Search outsource samples">'+
                '<select id="outsourceYearFilter"><option value="ALL">All years</option></select>'+                '<select id="outsourceMonthFilter"><option value="ALL">All months</option><option value="01">January</option><option value="02">February</option><option value="03">March</option><option value="04">April</option><option value="05">May</option><option value="06">June</option><option value="07">July</option><option value="08">August</option><option value="09">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select>'+                '<select id="outsourceStatusFilter"><option value="ALL">All status</option><option value="COMPLETED">Completed</option><option value="REJECT">Rejected</option></select>'+              '</div>'+
              '<div class="outsource-table-wrap"><table class="outsource-table"><thead><tr><th>#</th><th>Sample Date</th><th>Bar Code</th><th>Name</th><th>ID/IC</th><th>Sex</th><th>Age</th><th>Unit</th><th>Dispatch</th><th>Referral</th><th>Lab</th><th>Test</th><th>Result</th><th>Result Date</th><th>Reference No.</th><th>Reject Reason</th><th>Notes</th><th>Action</th></tr></thead><tbody id="outsourceTableBody"></tbody></table><div class="outsource-empty" id="outsourceEmpty" hidden>No outsource sample registered yet.</div></div><div class="outsource-pager" id="outsourceVirtualInfo">Showing 0–0 of 0</div>'+
            '</section>'+
          '</div></div>';
        grid.insertAdjacentHTML('beforeend','<div class="outsource-result-modal" id="outsourceResultModal" hidden><div class="outsource-result-dialog"><button type="button" class="outsource-result-close" id="outsourceResultClose">×</button><div class="outsource-modal-kicker">UPDATE RESULT</div><h2 id="outsourceResultTitle">RESULT</h2><div class="outsource-modal-sub" id="outsourceResultSub"></div><div class="outsource-modal-field"><label>RESULT</label><select id="outsourceModalResult"><option value="PENDING">PENDING</option><option value="COMPLETED">COMPLETED</option><option value="REJECT">REJECT</option></select></div><div class="outsource-modal-row"><div class="outsource-modal-field outsource-date-field"><label>RESULT DATE</label><input type="hidden" id="outsourceModalResultDate"><input type="text" id="outsourceModalResultDateVisible" class="outsource-neumorphic-date" readonly placeholder="dd/mm/yyyy" autocomplete="off"></div><div class="outsource-modal-field"><label>REFERENCE NO.</label><input id="outsourceModalReferenceNo" placeholder="External report / accession no."></div></div><div class="outsource-modal-field"><label>REJECT REASON</label><select id="outsourceModalRejectReason"><option value="">Select reject reason</option></select></div><div class="outsource-modal-field"><label>NOTES</label><textarea id="outsourceModalNotes" placeholder="Additional result / follow-up notes"></textarea></div><div class="outsource-modal-actions"><button type="button" class="outsource-btn secondary" id="outsourceResultCancel">CANCEL</button><button type="button" class="outsource-btn primary" id="outsourceResultSave">UPDATE RESULT</button></div></div></div>');
        grid.insertAdjacentHTML('beforeend','<div class="outsource-admin-modal" id="outsourceAdminCatalogModal" hidden><div class="outsource-admin-backdrop" data-outsource-admin-close></div><div class="outsource-admin-dialog"><div class="outsource-admin-head"><div><div class="outsource-admin-kicker">ADMIN ONLY</div><h2>OUTSOURCE CONTROL</h2><p>Add outsource laboratories and tests.</p></div><button type="button" class="outsource-admin-close" data-outsource-admin-close>×</button></div><div class="outsource-admin-section"><label>ADD OUTSOURCE LAB</label><div class="outsource-admin-inline"><input id="outsourceAdminLabInput" placeholder="e.g. IMMUNOLOGY" maxlength="100"><button type="button" class="outsource-btn primary" id="outsourceAdminAddLabBtn">ADD LAB</button></div></div><div class="outsource-admin-section"><label>ADD TEST / INVESTIGATION</label><div class="outsource-admin-grid"><select id="outsourceAdminTestLab"></select><input id="outsourceAdminTestInput" placeholder="e.g. New external test" maxlength="200"></div><button type="button" class="outsource-btn primary outsource-admin-add-test" id="outsourceAdminAddTestBtn">ADD TEST</button></div><div class="outsource-admin-section"><label>ADD REJECTION REASON</label><div class="outsource-admin-inline"><input id="outsourceAdminRejectReasonInput" placeholder="e.g. Insufficient specimen" maxlength="200"><button type="button" class="outsource-btn primary" id="outsourceAdminAddRejectReasonBtn">ADD REASON</button></div></div><div class="outsource-admin-message" id="outsourceAdminCatalogMessage"></div><div class="outsource-admin-list" id="outsourceAdminCatalogList"></div></div></div>');
        /* The post-register modal is managed as a persistent BODY-level element.
           Do not create it inside moduleYearGrid: this grid is rebuilt by module,
           inventory and realtime refresh paths, which can otherwise destroy the
           modal between saveOutsourceSample() and its display call. */
        var persistentPostSaveModal=ensureOutsourcePostSaveModal();
        bindOutsourcePostSaveModalEvents();
        if(persistentPostSaveModal && window.__outsourcePostSaveModalOpen){
          persistentPostSaveModal.hidden=false;
          persistentPostSaveModal.removeAttribute('aria-hidden');
          persistentPostSaveModal.style.display='flex';
          persistentPostSaveModal.style.visibility='visible';
          persistentPostSaveModal.style.opacity='1';
          persistentPostSaveModal.style.zIndex='2147483647';
        }
        renderOutsourceFilterYears(rows);
        renderOutsourceRows();
        var form=$('outsourceForm');
        if(form){
          form.addEventListener('submit',function(e){e.preventDefault();saveOutsourceSample();});
          var saveBtn=$('outsourceSaveBtn');
          if(saveBtn && !saveBtn._outsourceDirectSaveBound){
            saveBtn._outsourceDirectSaveBound=true;
            saveBtn.addEventListener('click',function(e){
              /* The register button must own the save action. This prevents a form
                 submit from being lost when OutSource.upsertSample()
                 synchronously refreshes/rebuilds the OUTSOURCE workspace. */
              e.preventDefault();
              e.stopPropagation();
              if(typeof form.reportValidity==='function' && !form.reportValidity()) return;
              saveOutsourceSample();
            });
          }
        }
        bindOutsourceKeyboardFlow();
        bindOutsourceIcAutofill();
        bindOutsourceTestCatalog();
        renderOutsourceLabs('');
        var outsourceAdminBtn=$('outsourceAdminCatalogBtn');if(outsourceAdminBtn){outsourceAdminBtn.hidden=!outsourceAdminAllowed();outsourceAdminBtn.addEventListener('click',openOutsourceAdminCatalog);}
        var outsourceAddLabBtn=$('outsourceAdminAddLabBtn');if(outsourceAddLabBtn)outsourceAddLabBtn.addEventListener('click',addOutsourceAdminLab);
        var outsourceAddTestBtn=$('outsourceAdminAddTestBtn');if(outsourceAddTestBtn)outsourceAddTestBtn.addEventListener('click',addOutsourceAdminTest);
        var outsourceAddRejectReasonBtn=$('outsourceAdminAddRejectReasonBtn');if(outsourceAddRejectReasonBtn)outsourceAddRejectReasonBtn.addEventListener('click',addOutsourceAdminRejectReason);
        renderOutsourceRejectReasonOptions();
        document.querySelectorAll('[data-outsource-admin-close]').forEach(function(n){n.addEventListener('click',closeOutsourceAdminCatalog);});
        bindOutsourcePostSaveModalEvents();
        loadOutsourceCatalog();
        initOutsourceNeumorphicDates(); window.setTimeout(initOutsourceNeumorphicDates,0);
        var clear=$('outsourceClearBtn'); if(clear)clear.addEventListener('click',clearOutsourceForm);
        var search=$('outsourceSearch'); if(search){
          var searchDebounceTimer=null;
          search.addEventListener('input',function(){
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer=setTimeout(queueOutsourceRowsRender,150);
          });
        }
        var yearFilter=$('outsourceYearFilter'); if(yearFilter)yearFilter.addEventListener('change',queueOutsourceRowsRender);
        var monthFilter=$('outsourceMonthFilter'); if(monthFilter)monthFilter.addEventListener('change',queueOutsourceRowsRender);
        var filter=$('outsourceStatusFilter'); if(filter)filter.addEventListener('change',queueOutsourceRowsRender);
        bindOutsourceVirtualScroll();
        initOutsourceFilterDropdowns();
        var body=$('outsourceTableBody'); if(body)body.addEventListener('click',function(e){if(e.target.closest('.outsource-notes-cell'))return;var btn=e.target.closest('[data-outsource-action]');if(btn){e.preventDefault();e.stopPropagation();var id=btn.getAttribute('data-id');var action=btn.getAttribute('data-outsource-action');if(action==='edit')editOutsourceSample(id);if(action==='delete')deleteOutsourceSample(id);return;}var row=e.target.closest('[data-result-id]');if(row)openOutsourceResultModal(row.getAttribute('data-result-id'));});
        bindOutsourceResultModal();
        bindOutsourceNotesEditing();
      }
      function initOutsourceFilterDropdowns(){
        /* OUTSOURCE FILTER FIX v2: use the native select controls.
           The previous custom body-level menus caused delayed opening,
           duplicate initializers and selected-label desynchronisation. */
        var ids=['outsourceYearFilter','outsourceMonthFilter','outsourceStatusFilter'];
        ids.forEach(function(id){
          var select=$(id);
          if(!select)return;
          select.classList.remove('inventory-filter-native');
          select.removeAttribute('aria-hidden');
          select.style.removeProperty('position');
          select.style.removeProperty('width');
          select.style.removeProperty('height');
          select.style.removeProperty('opacity');
          select.style.removeProperty('pointer-events');
          select.style.removeProperty('left');
          select.style.removeProperty('top');
        });
      }
      function syncOutsourceFilterTrigger(select){
        if(!select)return;
        var wrap=select.parentElement, trigger=wrap&&wrap.querySelector('.inventory-filter-trigger'), label=trigger&&trigger.querySelector('[data-filter-label]');
        var opt=select.options[select.selectedIndex];
        if(label)label.textContent=opt?opt.textContent:'Select...';
      }
      function renderOutsourceFilterYears(sourceRows){
        var select=$('outsourceYearFilter'); if(!select)return;
        var previous=String(select.value||'ALL');
        var rows=Array.isArray(sourceRows)?sourceRows:((typeof OutSource!=='undefined'&&OutSource.getSamples)?OutSource.getSamples():[]);
        var years={};
        rows.forEach(function(r){var d=String(r.sampleDate||'');var y=d.slice(0,4);if(/^\d{4}$/.test(y))years[y]=true;});
        var list=Object.keys(years).sort(function(a,b){return Number(b)-Number(a);});
        select.innerHTML='<option value="ALL">All years</option>'+list.map(function(y){return '<option value="'+y+'">'+y+'</option>';}).join('');
        if(list.indexOf(previous)>=0)select.value=previous; else select.value='ALL';
        syncOutsourceFilterTrigger(select);
      }
      var outsourceRowsRenderTimer=null;
      var outsourceRowsCache=null;
      var outsourceRowsViewCache=null;
      var outsourceRowsDomSignature='';
      var outsourceRowsDomMap=null;
      var outsourceRowsSorted=null;
      var outsourceRowsFiltered=null;
      var outsourceRowsPage=1;
      var OUTSOURCE_ROW_HEIGHT=36;
      var OUTSOURCE_OVERSCAN=10;
      var outsourceViewportRaf=0;
      var outsourceDataSignature='';
      var outsourceLastRenderStart=-1;
      var outsourceLastRenderEnd=-1;
      var outsourceLastRenderTotal=-1;

      function getOutsourceRowsCached(){
        if(!Array.isArray(outsourceRowsCache)) outsourceRowsCache=(typeof OutSource!=='undefined'&&OutSource.getSamples?OutSource.getSamples():[]);
        return outsourceRowsCache;
      }
      function invalidateOutsourceRowsCache(){
        outsourceRowsCache=null;
        outsourceRowsViewCache=null;
        outsourceRowsSorted=null;
        outsourceRowsFiltered=null;
        outsourceRowsDomSignature='';
        outsourceRowsDomMap=null;
        outsourceLastRenderStart=-1;
        outsourceLastRenderEnd=-1;
        outsourceLastRenderTotal=-1;
      }
      function queueOutsourceRowsRender(){
        outsourceRowsPage=1;
        if(outsourceRowsRenderTimer) return;
        outsourceRowsRenderTimer=requestAnimationFrame(function(){
          outsourceRowsRenderTimer=null;
          renderOutsourceRows();
        });
      }
      function getOutsourceRowSignature(rows){
        if(!Array.isArray(rows)) return '';
        var len=rows.length;
        if(!len) return '0:empty';
        var rev=(typeof OutSource!=='undefined'&&OutSource.getRevision)?OutSource.getRevision():0;
        var first=rows[0], last=rows[len-1];
        return len+':'+rev+':'+(first&&first.id||'')+'='+(first&&(first.updatedAt||first.createdAt)||'')+':'+(last&&last.id||'')+'='+(last&&(last.updatedAt||last.createdAt)||'');
      }
      function buildOutsourceRowHtml(r, index){
        var result=String(r.result||'PENDING').toUpperCase();
        if(result==='ADA')result='COMPLETED';
        var cls=result==='COMPLETED'?'status-done':result==='REJECT'?'status-reject':'status-pending';
        /* Existing rows may have been saved before the M-prefix NB/no-IC rule.
           Derive the displayed values from the identifier so old and new rows
           follow the same Register Sample logic. */
        var displaySex=r.sex||'';
        var displayAge=r.age||'';
        if(r._displaySex!==undefined){
          displaySex=r._displaySex;
          displayAge=r._displayAge;
        }else if(r.idIc){
          var icDetails=calculateMalaysianIcDetails(r.idIc, new Date());
          if(icDetails&&icDetails.special){
            displaySex=icDetails.sex;
            displayAge=icDetails.age;
          }
          r._displaySex=displaySex;
          r._displayAge=displayAge;
        }
        var rowNum = typeof index === 'number' ? (index + 1) : '';
        return '<tr class="outsource-data-row" data-result-id="'+outsourceEsc(r.id)+'" title="Double-click Notes to edit notes">'+
          '<td>'+rowNum+'</td><td>'+outsourceEsc(r.sampleDate)+'</td><td>'+outsourceEsc(r.barCode)+'</td><td><strong>'+outsourceEsc(r.name)+'</strong></td><td>'+outsourceEsc(r.idIc)+'</td><td>'+outsourceEsc(displaySex)+'</td><td>'+outsourceEsc(displayAge)+'</td><td>'+outsourceEsc(r.unit)+'</td><td>'+outsourceEsc(r.dispatchDate)+'</td><td>'+outsourceEsc(r.referral)+'</td><td>'+outsourceEsc(r.lab)+'</td><td>'+outsourceEsc(r.test)+'</td><td class="outsource-result"><span class="outsource-result-pill '+cls+'">'+outsourceEsc(result)+'</span></td><td>'+outsourceEsc(r.resultDate)+'</td><td>'+outsourceEsc(r.referenceNo)+'</td><td>'+outsourceEsc(r.rejectReason)+'</td><td class="outsource-notes-cell" data-notes-id="'+outsourceEsc(r.id)+'" title="Double-click to edit notes">'+outsourceEsc(r.notes)+'</td><td><div class="outsource-actions"><button type="button" class="outsource-mini" data-outsource-action="edit" data-id="'+outsourceEsc(r.id)+'">EDIT</button><button type="button" class="outsource-mini delete" data-outsource-action="delete" data-id="'+outsourceEsc(r.id)+'">DELETE</button></div></td></tr>';
      }
      function renderOutsourceRows(){
        var body=$('outsourceTableBody'),empty=$('outsourceEmpty'); if(!body)return;
        var allRows=getOutsourceRowsCached();
        var signature=getOutsourceRowSignature(allRows);
        if(signature!==outsourceRowsDomSignature || !Array.isArray(outsourceRowsSorted)){
          outsourceRowsDomSignature=signature;
          outsourceRowsSorted=allRows.slice().sort(function(a,b){return String(b.sampleDate||b.createdAt||'').localeCompare(String(a.sampleDate||a.createdAt||''));});
        }
        var q=String(($('outsourceSearch')||{}).value||'').trim().toLowerCase();
        var year=String(($('outsourceYearFilter')||{}).value||'ALL');
        var month=String(($('outsourceMonthFilter')||{}).value||'ALL');
        var status=String(($('outsourceStatusFilter')||{}).value||'ALL').toUpperCase();
        var filtered=[];
        outsourceRowsSorted.forEach(function(r){
          var result=String(r.result||'PENDING').toUpperCase(); if(result==='ADA')result='COMPLETED';
          var sampleDate=String(r.sampleDate||''); var match=true;
          if(status!=='ALL'&&result!==status)match=false;
          if(match&&year!=='ALL'&&sampleDate.slice(0,4)!==year)match=false;
          if(match&&month!=='ALL'&&sampleDate.slice(5,7)!==month)match=false;
          if(match&&q){
            var hay=r._haystack;
            if(!hay){
              hay=[r.barCode,r.name,r.idIc,r.sex,r.age,r.unit,r.dispatchDate,r.referral,r.lab,r.test,r.result,r.resultDate,r.referenceNo,r.rejectReason,r.notes].join(' ').toLowerCase();
              r._haystack=hay;
            }
            if(hay.indexOf(q)<0)match=false;
          }
          if(match)filtered.push(r);
        });
        outsourceRowsFiltered=filtered;
        outsourceRowsPage=1;
        if(empty)empty.hidden=filtered.length>0;
        outsourceLastRenderStart=-1;
        renderOutsourceViewport(true);
      }
      function renderOutsourceViewport(force){
        var body=$('outsourceTableBody'), wrap=body&&body.closest('.outsource-table-wrap');
        if(!body||!wrap)return;
        var rows=Array.isArray(outsourceRowsFiltered)?outsourceRowsFiltered:[];
        var total=rows.length, height=OUTSOURCE_ROW_HEIGHT;
        var viewport=wrap.clientHeight||560;
        var scrollTop=wrap.scrollTop||0;
        var start=Math.max(0,Math.floor(scrollTop/height)-OUTSOURCE_OVERSCAN);
        var count=Math.ceil(viewport/height)+OUTSOURCE_OVERSCAN*2;
        var end=Math.min(total,start+count);

        if(!force && start===outsourceLastRenderStart && end===outsourceLastRenderEnd && total===outsourceLastRenderTotal){
          return;
        }
        outsourceLastRenderStart=start;
        outsourceLastRenderEnd=end;
        outsourceLastRenderTotal=total;

        var topSpacer=start*height;
        var bottomSpacer=Math.max(0,(total-end)*height);

        var html='';
        if(topSpacer>0){
          html+='<tr class="outsource-virtual-spacer top" style="height:'+topSpacer+'px"><td colspan="18" style="height:'+topSpacer+'px"></td></tr>';
        }
        for(var i=start;i<end;i++){
          html+=buildOutsourceRowHtml(rows[i],i);
        }
        if(bottomSpacer>0){
          html+='<tr class="outsource-virtual-spacer bottom" style="height:'+bottomSpacer+'px"><td colspan="18" style="height:'+bottomSpacer+'px"></td></tr>';
        }

        body.innerHTML=html;

        var info=$('outsourceVirtualInfo');
        if(info)info.textContent=total?('Showing '+(start+1)+'–'+end+' of '+total):'No matching records';
      }
      function bindOutsourceVirtualScroll(){
        var body=$('outsourceTableBody'),wrap=body&&body.closest('.outsource-table-wrap');
        if(!wrap||wrap._virtualScrollBound)return;
        wrap._virtualScrollBound=true;
        wrap.addEventListener('scroll',function(){
          if(outsourceViewportRaf)return;
          outsourceViewportRaf=requestAnimationFrame(function(){
            outsourceViewportRaf=0;
            renderOutsourceViewport(false);
          });
        },{passive:true});
      }

      function bindOutsourceNotesEditing(){
        var body=$('outsourceTableBody');
        if(!body || body._notesEditBound) return;
        body._notesEditBound=true;
        body.addEventListener('dblclick',function(e){
          var cell=e.target.closest('.outsource-notes-cell');
          if(!cell || cell.querySelector('input,textarea')) return;
          e.preventDefault(); e.stopPropagation();
          var id=String(cell.getAttribute('data-notes-id')||'');
          if(!id) return;
          var rows=(typeof OutSource!=='undefined'&&OutSource.getSamples)?OutSource.getSamples():[];
          var row=rows.find(function(x){return String(x.id||'')===id;});
          if(!row) return;
          var oldValue=String(row.notes||'');
          var input=document.createElement('input');
          input.type='text'; input.value=oldValue; input.placeholder='Enter notes...';
          input.className='outsource-inline-notes-input';
          cell.textContent=''; cell.appendChild(input); input.focus(); input.select();
          var finished=false;
          function finish(save){
            if(finished)return; finished=true;
            var value=String(input.value||'').trim();
            if(save && value!==oldValue){
              row.notes=value; row.updatedAt=new Date().toISOString();
              if(typeof OutSource!=='undefined'&&OutSource.upsertSample) OutSource.upsertSample(row);
              invalidateOutsourceRowsCache();
            }
            cell.textContent=save?value:oldValue;
            if(save && value!==oldValue) renderOutsourceRows();
          }
          input.addEventListener('keydown',function(ev){
            if(ev.key==='Enter'){ev.preventDefault();finish(true);}
            else if(ev.key==='Escape'){ev.preventDefault();finish(false);}
          });
          input.addEventListener('blur',function(){finish(true);});
        });
      }
      function calculateMalaysianIcDetails(rawIc, referenceDate){
        var original=String(rawIc||'').trim();
        /* Special non-NRIC identifier format used for NB / no-IC patients.
           Examples: M930506126729 and M930506126729-1.
           These must not be parsed as a Malaysian NRIC. */
        if(/^M\d{12}(?:-\d+)?$/i.test(original)){
          return {sex:'TBC',age:'NB/NO IC',special:true};
        }
        var raw=original.replace(/[^0-9]/g,'');
        if(!/^\d{12}$/.test(raw)) return null;
        var yy=Number(raw.slice(0,2)), mm=Number(raw.slice(2,4)), dd=Number(raw.slice(4,6));
        var now=referenceDate instanceof Date?referenceDate:new Date();
        var currentYY=Number(String(now.getFullYear()).slice(-2));
        var year=yy<=currentYY?2000+yy:1900+yy;
        var dob=new Date(year,mm-1,dd);
        if(dob.getFullYear()!==year||dob.getMonth()!==mm-1||dob.getDate()!==dd) return null;
        var genderDigit=Number(raw.charAt(11));
        var sex=(genderDigit%2===1)?'L':'P';
        var age=now.getFullYear()-year;
        if(now.getMonth()<(mm-1)||(now.getMonth()===(mm-1)&&now.getDate()<dd)) age--;
        if(age<0||age>130) return null;
        return {sex:sex,age:age,dob:year+'-'+String(mm).padStart(2,'0')+'-'+String(dd).padStart(2,'0')};
      }
      function applyOutsourceIcAutofill(){
        var ic=$('osIdIc'),sex=$('osSex'),age=$('osAge'); if(!ic||!sex||!age)return;
        var ref=$('osSampleDate');
        var refDate=ref&&ref.value?new Date(ref.value+'T12:00:00'):new Date();
        var details=calculateMalaysianIcDetails(ic.value,refDate);
        if(details){sex.value=details.sex;age.value=String(details.age);ic.setCustomValidity('');}
        else {sex.value='';age.value='';ic.setCustomValidity('');}
      }
      function bindOutsourceIcAutofill(){
        var ic=$('osIdIc');if(ic){ic.addEventListener('input',applyOutsourceIcAutofill);ic.addEventListener('blur',applyOutsourceIcAutofill);}
        var date=$('osSampleDate');if(date)date.addEventListener('change',applyOutsourceIcAutofill);
      }
      function bindOutsourceKeyboardFlow(){
        var flow=['osBarCode','osName','osIdIc','osTest'];
        flow.forEach(function(id,index){
          var el=$(id);if(!el)return;
          el.addEventListener('keydown',function(e){
            if(e.key!=='Enter')return;
            e.preventDefault();
            e.stopPropagation();
            if(index<flow.length-1){var next=$(flow[index+1]);if(next){next.focus();if(next.select)next.select();}}
            else {el.blur();}
          });
        });
        var form=$('outsourceForm');if(form)form.addEventListener('keydown',function(e){
          if(e.key==='Enter'&&flow.indexOf(document.activeElement.id)===-1){
            if(document.activeElement.tagName==='TEXTAREA')return;
            e.preventDefault();e.stopPropagation();
          }
        },true);
      }
      function clearOutsourceForm(){
        resetOutsourceFormForNext('clear');
      }
      function ensureOutsourcePostSaveModal(){
        var existing=document.getElementById('outsourcePostSaveModal');
        if(existing){
          if(existing.parentNode!==document.body && document.body) document.body.appendChild(existing);
          return existing;
        }
        if(!document.body)return null;
        var modal=document.createElement('div');
        modal.className='outsource-post-save-modal';
        modal.id='outsourcePostSaveModal';
        modal.hidden=true;
        modal.setAttribute('aria-hidden','true');
        modal.innerHTML='<div class="outsource-post-save-backdrop" data-outsource-post-save-close></div><div class="outsource-post-save-dialog" role="dialog" aria-modal="true" aria-labelledby="outsourcePostSaveTitle"><div class="outsource-post-save-kicker">SAMPLE REGISTERED</div><h2 id="outsourcePostSaveTitle">WHAT NEXT?</h2><p>Choose what you want to register next.</p><div class="outsource-post-save-actions"><button type="button" class="outsource-post-save-option" id="outsourceNewSampleBtn"><span class="outsource-post-save-icon">＋</span><span><strong>NEW SAMPLE</strong><small>Keep Name, ID/IC and Unit</small></span></button><button type="button" class="outsource-post-save-option patient" id="outsourceNewPatientBtn"><span class="outsource-post-save-icon">↻</span><span><strong>NEW PATIENT</strong><small>Clear every field</small></span></button></div></div>';
        document.body.appendChild(modal);
        return modal;
      }
      function bindOutsourcePostSaveModalEvents(){
        if(document._outsourcePostSaveModalEventsBound)return;
        document._outsourcePostSaveModalEventsBound=true;
        document.addEventListener('click',function(e){
          var target=e.target;
          if(!target || !target.closest)return;
          if(target.closest('#outsourceNewSampleBtn')){e.preventDefault();closeOutsourcePostSaveModal();resetOutsourceFormForNext('sample');return;}
          if(target.closest('#outsourceNewPatientBtn')){e.preventDefault();closeOutsourcePostSaveModal();resetOutsourceFormForNext('patient');return;}
          if(target.closest('[data-outsource-post-save-close]')){e.preventDefault();closeOutsourcePostSaveModal();return;}
        });
      }
      function closeOutsourcePostSaveModal(){
        window.__outsourcePostSaveModalOpen=false;
        var modal=ensureOutsourcePostSaveModal();
        if(modal){modal.hidden=true;modal.setAttribute('aria-hidden','true');modal.style.display='none';}
      }
      function resetOutsourceFormForNext(mode){
        var form=$('outsourceForm');if(!form)return;
        var keepName=mode==='sample'?String($('osName').value||'').trim():'';
        var keepIdIc=mode==='sample'?String($('osIdIc').value||'').trim():'';
        var keepSex=mode==='sample'?String($('osSex').value||'').trim():'';
        var keepAge=mode==='sample'?String($('osAge').value||'').trim():'';
        var keepUnit=mode==='sample'?String($('osUnit').value||'').trim():'';
        /* The visible date fields are the user-facing source of truth. Fall back to the hidden
           ISO value when available so NEW SAMPLE survives either date-input implementation. */
        function readOutsourceDate(hiddenId,visibleId){
          var h=$(hiddenId),v=$(visibleId);
          var hv=String(h&&h.value||'').trim();
          if(hv)return hv;
          var vv=String(v&&v.value||'').trim();
          var m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(vv);
          return m?m[3]+'-'+m[2]+'-'+m[1]:vv;
        }
        var keepSampleDate=mode==='sample'?readOutsourceDate('osSampleDate','osSampleDateVisible'):'';
        var keepDispatchDate=mode==='sample'?readOutsourceDate('osDispatchDate','osDispatchDateVisible'):'';
        form.reset();
        /* New Sample keeps patient/sample context and both dates; only barcode, referral, lab and test are cleared. */
        $('outsourceEditId').value='';
        if(mode==='sample'){
          $('osName').value=keepName;
          $('osIdIc').value=keepIdIc;
          $('osSex').value=keepSex;
          $('osAge').value=keepAge;
          $('osUnit').value=keepUnit;
          restoreOutsourceDate('osSampleDate','osSampleDateVisible',keepSampleDate);
          restoreOutsourceDate('osDispatchDate','osDispatchDateVisible',keepDispatchDate);
        }else{
          /* NEW PATIENT clears patient/sample fields, but keeps the registration dates
             so the next patient can be entered for the same working date. */
          restoreOutsourceDate('osSampleDate','osSampleDateVisible',keepSampleDate);
          restoreOutsourceDate('osDispatchDate','osDispatchDateVisible',keepDispatchDate);
          window.setTimeout(function(){
            restoreOutsourceDate('osSampleDate','osSampleDateVisible',keepSampleDate);
            restoreOutsourceDate('osDispatchDate','osDispatchDateVisible',keepDispatchDate);
          },0);
          window.setTimeout(function(){
            restoreOutsourceDate('osSampleDate','osSampleDateVisible',keepSampleDate);
            restoreOutsourceDate('osDispatchDate','osDispatchDateVisible',keepDispatchDate);
          },50);
        }
        /* Native form.reset() does not fire change, so refresh every custom Neumorphism trigger. */
        ['osSex','osUnit','osReferral','osLab','osTest'].forEach(function(id){var el=$(id);if(el)el.dispatchEvent(new Event('change',{bubbles:true}));});
        populateOutsourceTests('');
        var test=$('osTest');if(test)test.dispatchEvent(new Event('change',{bubbles:true}));
        /* Some page-level reset/render handlers run on the next tick. Re-apply the preserved dates
           after those handlers so they cannot wipe the visible date fields. */
        if(mode==='sample'){
          window.setTimeout(function(){
            restoreOutsourceDate('osSampleDate','osSampleDateVisible',keepSampleDate);
            restoreOutsourceDate('osDispatchDate','osDispatchDateVisible',keepDispatchDate);
          },0);
          window.setTimeout(function(){
            restoreOutsourceDate('osSampleDate','osSampleDateVisible',keepSampleDate);
            restoreOutsourceDate('osDispatchDate','osDispatchDateVisible',keepDispatchDate);
          },50);
        }
        $('outsourceEditHint').textContent='NEW RECORD';
        $('outsourceSaveBtn').textContent='REGISTER SAMPLE';
      }
      function restoreOutsourceDate(hiddenId,visibleId,value){
        var h=$(hiddenId),v=$(visibleId);
        if(h)h.value=String(value||'');
        if(v){v.value='';if(h&&h._syncDate)h._syncDate();else if(v._syncDate)v._syncDate();}
        if(h&&h._syncDate)h._syncDate();
      }
      function showOutsourcePostSaveModal(){
        window.__outsourcePostSaveModalOpen=true;
        var modal=ensureOutsourcePostSaveModal();
        if(!modal)return;
        if(modal.parentNode!==document.body)document.body.appendChild(modal);
        modal.hidden=false;
        modal.removeAttribute('aria-hidden');
        modal.style.display='flex';
        modal.style.visibility='visible';
        modal.style.opacity='1';
        modal.style.zIndex='2147483647';
        bindOutsourcePostSaveModalEvents();
        try{modal.querySelector('#outsourceNewSampleBtn')?.focus();}catch(_e){}
      }
      function saveOutsourceSample(){
        var name=String($('osName').value||'').trim(),test=String($('osTest').value||'').trim(),sampleDate=String($('osSampleDate').value||'').trim(); if(!sampleDate){alert('Sample Date is required.');return;} if(!name||!test){alert('Name and Test / Investigation are required.');return;}
        var editId=String($('outsourceEditId').value||'').trim(),existing=(typeof OutSource!=='undefined'&&OutSource.getSamples?OutSource.getSamples():[]).find(function(r){return String(r.id||'')===editId;});
        var row={id:editId||outsourceNewId(),sampleDate:String($('osSampleDate').value||''),barCode:String($('osBarCode').value||'').trim(),name:name,idIc:String($('osIdIc').value||'').trim(),sex:String($('osSex').value||''),age:String($('osAge').value||''),unit:String($('osUnit').value||'').trim(),dispatchDate:String($('osDispatchDate').value||''),referral:String($('osReferral').value||'').trim(),lab:String($('osLab').value||'').trim(),test:test,result:existing?String(existing.result||'PENDING').trim()||'PENDING':'PENDING',resultDate:existing?String(existing.resultDate||''):'',referenceNo:existing?String(existing.referenceNo||''):'',rejectReason:existing?String(existing.rejectReason||''):'',notes:existing?String(existing.notes||'').trim():'',createdAt:existing&&existing.createdAt?existing.createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),createdBy:(typeof state!=='undefined'&&state.currentUser)?String(state.currentUser.name||state.currentUser.email||''):''};
        if(editId){
          if(typeof OutSource!=='undefined'&&OutSource.upsertSample) OutSource.upsertSample(row);
          invalidateOutsourceRowsCache();
          renderOutsourceRows();
          clearOutsourceForm();
          return;
        }
        /* New registration: mark/open the BODY-level modal before the independent
           OUTSOURCE store is updated. This keeps the confirmation flow isolated from Inventory. */
        try{
          /* Save first without re-entering the Inventory renderer. The OUTSOURCE
             page owns the visible table and the modal lifecycle. */
          if(typeof OutSource==='undefined'||typeof OutSource.upsertSample!=='function') throw new Error('Outsource save function is unavailable.');
          OutSource.upsertSample(row);
          invalidateOutsourceRowsCache();
          renderOutsourceRows();
          /* Only show the post-save choice after the record is actually persisted
             locally. This prevents a renderer exception from being mistaken for a
             modal problem. */
          showOutsourcePostSaveModal();
        }catch(error){
          console.error('OUTSOURCE register failed:',error);
          alert('Unable to register sample. '+(error&&error.message?error.message:'Please try again.'));
        }
      }
      function editOutsourceSample(id){
        var r=(typeof OutSource!=='undefined'&&OutSource.getSamples?OutSource.getSamples():[]).find(function(x){return String(x.id||'')===String(id||'');});if(!r)return;
        $('outsourceEditId').value=r.id||'';$('osSampleDate').value=r.sampleDate||'';$('osBarCode').value=r.barCode||'';$('osName').value=r.name||'';$('osIdIc').value=r.idIc||'';$('osSex').value=r.sex||'';$('osAge').value=r.age||'';applyOutsourceIcAutofill();$('osUnit').value=r.unit||'';$('osDispatchDate').value=r.dispatchDate||'';$('osReferral').value=r.referral||'';$('osLab').value=r.lab||'';populateOutsourceTests(r.test||'');$('outsourceEditHint').textContent='EDITING RECORD';$('outsourceSaveBtn').textContent='SAVE CHANGES';
        var form=$('outsourceForm');if(form)form.scrollIntoView({behavior:'smooth',block:'start'});
      }
      function bindOutsourceResultModal(){
        var body=$('outsourceTableBody');if(body&&!body._resultModalBound){body._resultModalBound=true;body.addEventListener('click',function(e){if(e.target.closest('[data-outsource-action]'))return;var row=e.target.closest('[data-result-id]');if(row)openOutsourceResultModal(row.getAttribute('data-result-id'));});}
        var close=$('outsourceResultClose'),cancel=$('outsourceResultCancel'),save=$('outsourceResultSave');
        if(close)close.addEventListener('click',closeOutsourceResultModal);if(cancel)cancel.addEventListener('click',closeOutsourceResultModal);if(save)save.addEventListener('click',saveOutsourceResult);
        var result=$('outsourceModalResult');if(result)result.addEventListener('change',function(){var reject=$('outsourceModalRejectReason');if(reject)reject.disabled=result.value!=='REJECT';});
      }
      function openOutsourceResultModal(id){
        var r=(typeof OutSource!=='undefined'&&OutSource.getSamples?OutSource.getSamples():[]).find(function(x){return String(x.id||'')===String(id||'');});if(!r)return;
        window.__outsourceResultEditId=String(r.id||'');$('outsourceResultTitle').textContent=String(r.test||'RESULT');$('outsourceResultSub').textContent=[r.name,r.idIc,r.barCode].filter(Boolean).join(' • ');
        var currentResult=String(r.result||'PENDING').toUpperCase();if(currentResult==='ADA')currentResult='COMPLETED';
        $('outsourceModalResult').value=(currentResult==='REJECT'?'REJECT':currentResult==='COMPLETED'?'COMPLETED':'PENDING');$('outsourceModalResultDate').value=r.resultDate||'';$('outsourceModalResultDateVisible').value='';if($('outsourceModalResultDateVisible')._syncDate)$('outsourceModalResultDateVisible')._syncDate();$('outsourceModalReferenceNo').value=r.referenceNo||'';$('outsourceModalRejectReason').value=r.rejectReason||'';$('outsourceModalRejectReason').disabled=$('outsourceModalResult').value!=='REJECT';$('outsourceModalNotes').value=r.notes||'';$('outsourceResultModal').hidden=false;
      }
      function closeOutsourceResultModal(){var m=$('outsourceResultModal');if(m)m.hidden=true;window.__outsourceResultEditId='';}
      function saveOutsourceResult(){
        var id=String(window.__outsourceResultEditId||'');if(!id)return;var rows=(typeof OutSource!=='undefined'&&OutSource.getSamples?OutSource.getSamples():[]),r=rows.find(function(x){return String(x.id||'')===id;});if(!r)return;
        r.result=String($('outsourceModalResult').value||'PENDING');r.resultDate=String($('outsourceModalResultDate').value||'');r.referenceNo=String($('outsourceModalReferenceNo').value||'').trim();r.rejectReason=r.result==='REJECT'?String($('outsourceModalRejectReason').value||'').trim():'';r.notes=String($('outsourceModalNotes').value||'').trim();r.updatedAt=new Date().toISOString();
        if(typeof OutSource!=='undefined'&&OutSource.upsertSample)OutSource.upsertSample(r); invalidateOutsourceRowsCache(); closeOutsourceResultModal(); renderOutsourceRows();
      }
      function deleteOutsourceSample(id){
        var r=(typeof OutSource!=='undefined'&&OutSource.getSamples?OutSource.getSamples():[]).find(function(x){return String(x.id||'')===String(id||'');});
        if(!r)return;
        if(typeof OutSource==='undefined'||typeof OutSource.deleteSample!=='function'){alert('Delete function is unavailable.');return;}
        var itemLabel=String(r.name||'this patient');
        var sampleLabel=[r.sampleDate,r.test,r.lab].filter(Boolean).join(' · ');
        requestAppConfirm(
          'DELETE OUTSOURCE SAMPLE?',
          'Delete outsource sample for '+itemLabel+(sampleLabel?' · '+sampleLabel:'')+'? This cannot be undone.',
          function(){
            OutSource.deleteSample(id).then(function(){
              invalidateOutsourceRowsCache();
              renderOutsourceRows();
              /* Re-read the independent OUTSOURCE store after the committed delete. */
              return OutSource.refresh(true);
            }).catch(function(error){
              console.error('OUTSOURCE delete failed:',error);
              alert(error&&error.message?error.message:'Unable to delete outsource sample.');
              if(typeof OutSource!=='undefined'&&OutSource.refresh)OutSource.refresh(true);
            });
          }
        );
      }

      function refreshOutsourceLive(){
        /* Realtime refresh must NOT rebuild the form while a user is typing.
           Only the summary/table are refreshed; form state remains intact. */
        if(!$('moduleYears')||!$('moduleYears').classList.contains('active')) return;
        var root=$('moduleYearGrid'); if(!root||!root.classList.contains('outsource-active-grid')) return;
        var rows=(typeof OutSource!=='undefined'&&OutSource.getSamples)?OutSource.getSamples():[];
        var liveSignature=getOutsourceRowSignature(rows);
        if(liveSignature!==outsourceDataSignature){outsourceDataSignature=liveSignature;invalidateOutsourceRowsCache();renderOutsourceRows();}
        var card=root.querySelector('.outsource-grid .outsource-card:nth-child(2)');
        if(card){var head=card.querySelector('.outsource-card-head span');if(head)head.textContent=rows.length+' TOTAL';
          var nums=card.querySelectorAll('.outsource-summary .num');
          var pending=rows.filter(function(r){return !String(r.result||'').trim()||String(r.result).toUpperCase()==='PENDING';}).length;
          var done=rows.filter(function(r){return ['ADA','COMPLETED','POSITIVE','NEGATIVE'].indexOf(String(r.result||'').toUpperCase())>=0;}).length;
          var rejected=rows.filter(function(r){return String(r.result||'').toUpperCase()==='REJECT';}).length;
          if(nums[0])nums[0].textContent=rows.length;if(nums[1])nums[1].textContent=pending;if(nums[2])nums[2].textContent=done;if(nums[3])nums[3].textContent=rejected;
        }
      }

      /* +----------------------------------+
       * + renderModuleYearCards            +
       * +----------------------------------+ */
      function renderModuleYearCards(moduleName) {
        var grid = $('moduleYearGrid');
        var title = $('moduleYearsTitle');
        var desc = $('moduleYearsDesc');
        if (!grid || !title || !desc) return;
  
        var displayName = normalizeModuleName(moduleName);
        if(displayName!=='OUTSOURCE') grid.classList.remove('outsource-active-grid');
        if(displayName==='OUTSOURCE'){
          /* OUTSOURCE depends on the shared Inventory dataset, but Inventory is
             intentionally lazy. Initialize/load it when OUTSOURCE is opened,
             then render immediately from local state; Inventory.loadRemote()
             will refresh the view when the cloud snapshot arrives. */
          try { if(typeof OutSource!=='undefined' && OutSource.initPage) OutSource.initPage(); } catch(error) {
            console.warn('OUTSOURCE init deferred:', error);
          }
          try { if(typeof OutSource!=='undefined' && OutSource.ensureReady) OutSource.ensureReady(); } catch(error) {
            console.warn('OUTSOURCE readiness deferred:', error);
          }
          invalidateOutsourceRowsCache();
          renderOutsourcePage();
          if(typeof OutSource!=='undefined'&&OutSource.loadCatalog)OutSource.loadCatalog();
          if(window.outsourceInitNeumorphicDropdowns)setTimeout(window.outsourceInitNeumorphicDropdowns,30);
          return;
        }
        var activeYear = currentYear();
        title.textContent = displayName;
        desc.textContent = moduleYearDescriptions[displayName] || 'Select a year for ' + displayName + '. The current year and previous year are open. Future years are locked and will unlock automatically when the new year begins.';
        grid.textContent = '';
  
        for (var year = config.moduleYearStart; year <= config.moduleYearEnd; year += 1) {
          grid.appendChild(createYearCard(displayName, year, year > activeYear, year === activeYear, 'year-card'));
        }
      }
  
      /* +----------------------------------+
       * + getYearCardStatus                +
       * +----------------------------------+ */
      function getYearCardStatus(isFuture, isCurrent) {
        return isFuture ? 'Locked' : (isCurrent ? 'Current year access' : 'Open archive access');
      }
  
      /* +----------------------------------+
       * + createYearCard                   +
       * +----------------------------------+ */
      function createYearCard(moduleName, year, isFuture, isCurrent, baseClass) {
        var isLeaveCourses = baseClass === 'leave-course-mini-year';
        var externalUrl = getModuleYearExternalLink(moduleName, year);
        var card = (!isFuture && externalUrl) ? document.createElement('a') : document.createElement('button');
        var iconShell = document.createElement('div');
        var icon = document.createElement('div');
        var yearText = document.createElement('div');
        var spacer = document.createElement('div');
        var status = document.createElement('div');
  
        if (card.tagName === 'BUTTON') {
          card.type = 'button';
          if (isFuture) card.disabled = true;
        } else {
          card.href = externalUrl;
          card.target = '_blank';
          card.rel = 'noopener noreferrer';
        }
  
        card.className = baseClass + (isFuture ? ' locked' : '') + (isCurrent ? ' current-year' : '') + (!isFuture && externalUrl ? ' external-link' : '');
        card.dataset.year = String(year);
        if (externalUrl) card.dataset.externalUrl = externalUrl;
        card.setAttribute('aria-label', moduleName + ' ' + year + (isFuture ? ' locked' : (externalUrl ? ' external link' : ' open')));
        card.setAttribute('aria-disabled', isFuture ? 'true' : 'false');
        if (isFuture) card.setAttribute('title', '🚫 Locked');
        else if (externalUrl) card.setAttribute('title', 'Open external link');
  
        iconShell.className = isLeaveCourses ? 'leave-course-mini-icon-shell' : 'year-card-icon-shell';
        icon.className = isLeaveCourses ? 'leave-course-mini-icon' : 'year-card-icon';
        icon.textContent = isFuture ? '🔐' : (isCurrent ? '🗂️' : '📁');
        iconShell.appendChild(icon);
  
        yearText.className = isLeaveCourses ? 'leave-course-mini-year-text' : 'year-card-year';
        yearText.textContent = String(year);
  
        status.className = (isLeaveCourses ? 'leave-course-mini-status' : 'year-card-status') + (isFuture ? ' is-locked' : (isCurrent ? ' is-current' : ''));
        status.textContent = getYearCardStatus(isFuture, isCurrent);
  
        card.appendChild(iconShell);
        card.appendChild(yearText);
        card.appendChild(spacer);
        card.appendChild(status);
  
        card.addEventListener('click', function () {
          if (isFuture) return;
          if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
            ActivityTracker.track('OPEN_YEAR', 'Opened ' + moduleName + ' ' + year + '.', { page: 'moduleYears', module: moduleName, year: year }, { dedupeMs: 2000 });
          }
          if (!externalUrl) {
            if (normalizeModuleName(moduleName) === 'TRANSFUSION' && typeof Transfusion !== 'undefined') Transfusion.open(year);
            else handleYearCardClick(moduleName, year);
          }
        });
        return card;
      }
  
      /* +----------------------------------+
       * + open                             +
       * +----------------------------------+ */
      function open(cardName, activeButton) {
        var normalizedName = normalizeModuleName(cardName);
        if (normalizedName === 'INVENTORY' && typeof Inventory !== 'undefined') {
          Inventory.open();
          return;
        }
        if (normalizedName === 'TRANSFUSION' && typeof Transfusion !== 'undefined') {
          Transfusion.open(state.selectedModuleYear || new Date().getFullYear());
          return;
        }

        /* Activate the module page before rendering. OUTSOURCE is an internal live workspace. */
        var activePage = document.querySelector('.page.active');
        if (activePage) activePage.classList.remove('active');

        var activeNavButton = document.querySelector('.nav-btn.active');
        if (activeNavButton) activeNavButton.classList.remove('active');

        if (activeButton) activeButton.classList.add('active');
        var modulePage = $('moduleYears');
        if (modulePage) {
          modulePage.classList.add('active');
          Router.renderBackButton('moduleYears');
        }

        try {
          renderModuleYearCards(normalizedName);
        } catch (error) {
          /* OUTSOURCE must never depend on Inventory/remote initialization to paint its UI. */
          if (normalizedName === 'OUTSOURCE') {
            console.error('OUTSOURCE initialization failed; rendering local workspace fallback.', error);
            try { renderOutsourcePage({fallback:true}); } catch (fallbackError) {
              console.error('OUTSOURCE fallback render failed.', fallbackError);
            }
          } else {
            throw error;
          }
        }
        if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
          ActivityTracker.track('OPEN_MODULE', 'Opened ' + normalizedName + '.', { page: 'moduleYears', module: normalizedName }, { dedupeMs: 2000 });
        }
      }
  
      /* +----------------------------------+
       * + renderLeaveCourseYearGrid        +
       * +----------------------------------+ */
      function renderLeaveCourseYearGrid(gridId, moduleName) {
        var grid = $(gridId);
        if (!grid) return;
        var activeYear = currentYear();
        grid.textContent = '';
        for (var year = config.moduleYearStart; year <= config.moduleYearEnd; year += 1) {
          grid.appendChild(createYearCard(moduleName, year, year > activeYear, year === activeYear, 'leave-course-mini-year'));
        }
      }
  
      /* +----------------------------------+
       * + renderLeavesCoursesYears         +
       * +----------------------------------+ */
      function renderLeavesCoursesYears() {
        renderLeaveCourseYearGrid('leaveYearGrid', 'LEAVE');
        renderLeaveCourseYearGrid('coursesYearGrid', 'COURSES');
      }
  
      return {
        renderOutsourcePage: renderOutsourcePage,
        refreshOutsourceLive: refreshOutsourceLive,
        open: open,
        renderLeavesCoursesYears: renderLeavesCoursesYears
      };
    })();
  
    /* +----------------------------------+
     * + CLIENT MODULE                    +
     * +----------------------------------+ */
    var Calendar = (function () {
      /* +----------------------------------+
       * + getRosterForDate                 +
       * +----------------------------------+ */
      function getRosterForDate(dateObj, store) {
        store = store || readLocalRoster();
        var key = dateKey(dateObj);
        var baseRows = Array.isArray(store[key]) ? store[key] : [];
        if (state.rosterDirtyDates && state.rosterDirtyDates[key]) {
          return baseRows;
        }

        /* IMPORTANT: Firebase team roster is authoritative for confirmed
           assignments. Older builds could leave a stale local roster-change
           snapshot in front of the cloud data, which made the calendar show
           the original rotation and suppressed the expected struck-through
           original name + replacement name. */
        var cloudStore = state.rosterCloudStore && typeof state.rosterCloudStore === 'object' ? state.rosterCloudStore : {};
        var cloudRows = Array.isArray(cloudStore[key]) ? cloudStore[key] : [];

        /* Preserve an unsaved local assignment only while Firebase has not yet
           confirmed an assignment for this date. Once Firebase contains an
           assigned row, it wins so the calendar always reflects the shared
           roster-change record. */
        var changeStore = safeParse(safeStorageGet('labDailyRosterChangesV1_' + getRosterStorageUserId()));
        var changedRows = changeStore && Array.isArray(changeStore[key]) ? changeStore[key] : [];
        var cloudHasAssignment = cloudRows.some(function (row) { return isAssignedRow(row); });
        var localHasAssignment = changedRows.some(function (row) { return isAssignedRow(row); });

        if (cloudRows.length && cloudHasAssignment) return cloudRows;
        if (localHasAssignment) return changedRows;
        if (cloudRows.length) return cloudRows;
        if (changedRows.length) return changedRows;
        return baseRows;
      }
  
      /* +----------------------------------+
       * + getRotationStartDate             +
       * +----------------------------------+ */
      function getRotationStartDate(year) {
        return new Date(year, 0, 1, 12, 0, 0);
      }
  
      /* +----------------------------------+
       * + getRotationEndDate               +
       * +----------------------------------+ */
      function getRotationEndDate(year) {
        return new Date(year, 11, 31, 12, 0, 0);
      }
  
      /* +----------------------------------+
       * + getRotationAnchorDate            +
       * +----------------------------------+ */
      function getRotationAnchorDate(dateObj) {
        var rotation = getDailyRosterRotationForDate(dateObj);
        var anchorDate = rotation && rotation.anchorDate
          ? dateFromKey(rotation.anchorDate, dateObj)
          : new Date(dateObj.getFullYear(), rotation.anchorMonth, rotation.anchorDay, 12, 0, 0);
        return new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate(), 12, 0, 0);
      }

      /* +----------------------------------+
       * + isNewDailyRosterRotationDate     +
       * +----------------------------------+ */
      function isNewDailyRosterRotationDate(dateObj) {
        if (!dateObj || typeof dateObj.getFullYear !== 'function') return false;
        var rotation = config.dailyRosterRotation || {};
        var key = dateKey(dateObj);
        return !!(rotation.startDate && rotation.endDate && key >= rotation.startDate && key <= rotation.endDate);
      }

      /* +----------------------------------+
       * + isDecemberOnCallRotationDate     +
       * +----------------------------------+ */
      function isDecemberOnCallRotationDate(dateObj) {
        if (!dateObj || typeof dateObj.getFullYear !== 'function') return false;
        var rotation = config.decemberOnCallRotation || {};
        var key = dateKey(dateObj);
        return !!(rotation.startDate && rotation.endDate && key >= rotation.startDate && key <= rotation.endDate);
      }

      /* +----------------------------------+
       * + getDailyRosterRotationForDate    +
       * +----------------------------------+ */
      function getDailyRosterRotationForDate(dateObj) {
        if (!dateObj || typeof dateObj.getFullYear !== 'function') return null;
        if (isDecemberOnCallRotationDate(dateObj)) return config.decemberOnCallRotation;
        if (isNewDailyRosterRotationDate(dateObj)) return config.dailyRosterRotation;
        return config.legacyDailyRosterRotation;
      }
  
      /* +----------------------------------+
       * + isRotationDate                   +
       * +----------------------------------+ */
      function isRotationDate(dateObj) {
        if (!dateObj || typeof dateObj.getFullYear !== 'function') return false;
        var year = dateObj.getFullYear();
        var current = new Date(year, dateObj.getMonth(), dateObj.getDate(), 12, 0, 0).getTime();
        return current >= getRotationStartDate(year).getTime() && current <= getRotationEndDate(year).getTime();
      }
  
      /* +----------------------------------+
       * + getDefaultStaffForDate           +
       * +----------------------------------+ */
      function getDefaultStaffForDate(dateObj) {
        if (!isRotationDate(dateObj)) return '';
        var rotation = getDailyRosterRotationForDate(dateObj);
        var names = (rotation && rotation.staffNames) || config.defaultStaffNames || [];
        if (!names.length) return '';
        var current = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 12, 0, 0).getTime();
        var diffDays = Math.floor((current - getRotationAnchorDate(dateObj).getTime()) / 86400000);
        return names[((diffDays % names.length) + names.length) % names.length] || '';
      }
  
      /* +----------------------------------+
       * + getAssignedStaffForDate          +
       * +----------------------------------+ */
      function getAssignedStaffForDate(dateObj) {
        var rows = getRosterForDate(dateObj);
        for (var i = 0; i < rows.length; i += 1) {
          if (isAssignedRow(rows[i]) && cleanText(rows[i].staff)) return cleanText(rows[i].staff);
        }
        return '';
      }
  
      /* +----------------------------------+
       * + getCalendarStaffStateForDate     +
       * +----------------------------------+ */
      function getCalendarStaffStateForDate(dateObj) {
        var originalStaff = getDefaultStaffForDate(dateObj) || '';
        var assignedStaff = getAssignedStaffForDate(dateObj);
        var sameStaff = !!assignedStaff && originalStaff.toUpperCase() === assignedStaff.toUpperCase();
        return {
          originalStaff: originalStaff,
          assignedStaff: assignedStaff,
          hasAssignedStaff: !!assignedStaff,
          isChanged: !!assignedStaff && !!originalStaff && !sameStaff
        };
      }
  
      /* +----------------------------------+
       * + getCalendarStaffForDate          +
       * +----------------------------------+ */
      function getCalendarStaffForDate(dateObj) {
        var staffState = getCalendarStaffStateForDate(dateObj);
        if (staffState.isChanged) return staffState.originalStaff + ' changed to ' + staffState.assignedStaff;
        return staffState.assignedStaff || staffState.originalStaff || '';
      }
  
      /* +----------------------------------+
       * + getOriginalStaffForRow           +
       * +----------------------------------+ */
      function getOriginalStaffForRow(row, fallbackDateObj) {
        row = row && typeof row === 'object' ? row : {};
        var rowDate = dateFromKey(getRowDateKey(row, fallbackDateObj), fallbackDateObj || state.selectedDate);
        return cleanText(row.originalStaff) || getDefaultStaffForDate(rowDate) || cleanText(row.staff) || '';
      }
  
      /* +------------------------------------+
       * + shouldShowEditActionForAssignedRow +
       * +------------------------------------+ */
      function shouldShowEditActionForAssignedRow(row, rowKey) {
        rowKey = /^\d{4}-\d{2}-\d{2}$/.test(rowKey || '') ? rowKey : getRowDateKey(row, state.selectedDate);
        return isAssignedRow(row) && rowKey === dateKey(state.selectedDate);
      }

      /* +----------------------------------+
       * + buildDefaultRosterRowForDate     +
       * +----------------------------------+ */
      function buildDefaultRosterRowForDate(dateObj) {
        var staff = getDefaultStaffForDate(dateObj);
        if (!staff) return null;
        return {
          time: dateKey(dateObj),
          unit: '',
          originalStaff: staff,
          staff: staff,
          task: 'ON CALL',
          note: '',
          assigned: false
        };
      }
  
      /* +----------------------------------+
       * + getEditableRowsForDate           +
       * +----------------------------------+ */
      function getEditableRowsForDate(dateObj, store) {
        var key = dateKey(dateObj);
        var existing = getRosterForDate(dateObj, store);
        if (!existing.length) {
          var defaultRow = buildDefaultRosterRowForDate(dateObj);
          return defaultRow ? [defaultRow] : [];
        }
        return existing.map(function (item) {
          var row = cloneObject(item);
          row.time = /^\d{4}-\d{2}-\d{2}$/.test(row.time || '') ? row.time : key;
          row.originalStaff = getOriginalStaffForRow(row, dateObj);
          row.assigned = isAssignedRow(row);
          row.showEditAction = shouldShowEditActionForAssignedRow(row, row.time);
          row.task = row.task || 'ON CALL';
          return row;
        });
      }
  
      /* +----------------------------------+
       * + isAssignedRow                    +
       * +----------------------------------+ */
      function isAssignedRow(row) {
        return !!(row && isTruthy(row.assigned));
      }
  
      /* +----------------------------------+
       * + getRowDateKey                    +
       * +----------------------------------+ */
      function getRowDateKey(row, fallbackDateObj) {
        var rawKey = cleanText(row && row.time);
        return /^\d{4}-\d{2}-\d{2}$/.test(rawKey) ? rawKey : dateKey(fallbackDateObj || state.selectedDate);
      }
  
      /* +----------------------------------+
       * + dateFromKey                      +
       * +----------------------------------+ */
      function dateFromKey(key, fallbackDateObj) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key || '')) return fallbackDateObj || state.selectedDate;
        var parts = String(key).split('-').map(Number);
        return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
      }
  
      /* +----------------------------------+
       * + isHolidayDateInYear              +
       * +----------------------------------+ */
      function isHolidayDateInYear(date, year) {
        return new RegExp('^' + Number(year) + '-\\d{2}-\\d{2}$').test(String(date || ''));
      }

      /* +----------------------------------+
       * + getHolidayEntriesForDate         +
       * +----------------------------------+ */
      function getHolidayEntriesForDate(dateObj) {
        var entries = state.holidaysByDate[dateKey(dateObj)];
        return Array.isArray(entries) ? entries : [];
      }
  
          /* +----------------------------------+
           * + getHolidayDisplayName            +
           * +----------------------------------+ */
          function getHolidayDisplayName(name) {
        var text = cleanText(name).replace(/\s*\([^)]*\)/g, '').replace(/\s+\/\s+/g, ' / ');
        if (!text) return '';
        var upper = text.toUpperCase();
        var isHoliday = upper.indexOf('HOLIDAY') !== -1 || upper.indexOf('CUTI') !== -1 || upper.indexOf('HARI KEDUA') !== -1 || upper.indexOf('GANTIAN') !== -1 || upper.indexOf('REPLACEMENT') !== -1 || upper.indexOf('SUBSTITUTE') !== -1 || upper.indexOf('OBSERVED') !== -1;
        var isReplacement = upper.indexOf('GANTIAN') !== -1 || upper.indexOf('REPLACEMENT') !== -1 || upper.indexOf('SUBSTITUTE') !== -1 || upper.indexOf('OBSERVED') !== -1;
  
        // Malay display labels with natural HARI wording for calendar badges.
        if (upper.indexOf('AIDILFITRI') !== -1 || upper.indexOf('RAYA PUASA') !== -1 || upper.indexOf('EID AL-FITR') !== -1) return buildHolidayDisplayName('HARI RAYA AIDILFITRI', isHoliday, isReplacement);
        if (upper.indexOf('RAYA HAJI') !== -1 || upper.indexOf('AIDILADHA') !== -1 || upper.indexOf('EID AL-ADHA') !== -1 || upper.indexOf('KORBAN') !== -1 || upper.indexOf('QURBAN') !== -1) return buildHolidayDisplayName('HARI RAYA AIDILADHA', isHoliday, isReplacement);
        if (upper.indexOf('NUZUL') !== -1 || upper.indexOf('QURAN') !== -1 || upper.indexOf('QUR\'AN') !== -1) return buildHolidayDisplayName('NUZUL QURAN', isHoliday, isReplacement);
        if (upper.indexOf('MAULID') !== -1 || upper.indexOf('MAWLID') !== -1 || upper.indexOf('MAULIDUR') !== -1 || upper.indexOf('MUHAMMAD') !== -1 || upper.indexOf('PROPHET') !== -1 || upper.indexOf('KEPUTERAAN NABI') !== -1 || upper.indexOf('RASUL') !== -1) return buildHolidayDisplayName('MAULIDUR RASUL', isHoliday, isReplacement);
        if ((upper.indexOf('AWAL') !== -1 && /MUH?A?RR?AM/.test(upper)) || upper.indexOf('MAAL HIJRAH') !== -1 || upper.indexOf('ISLAMIC NEW YEAR') !== -1) return buildHolidayDisplayName('AWAL MUHARRAM', isHoliday, isReplacement);
        if (upper.indexOf('ISRAK') !== -1 || upper.indexOf('ISRA') !== -1 || upper.indexOf('MIKRAJ') !== -1 || upper.indexOf('MI\'RAJ') !== -1 || upper.indexOf('MIRAJ') !== -1) return buildHolidayDisplayName('ISRAK MIKRAJ', isHoliday, isReplacement);
        if (upper.indexOf('CHINESE NEW YEAR') !== -1 || upper.indexOf('TAHUN BARU CINA') !== -1) return buildHolidayDisplayName('TAHUN BARU CINA', isHoliday, isReplacement);
        if (upper.indexOf('THAIPUSAM') !== -1) return buildHolidayDisplayName('THAIPUSAM', isHoliday, isReplacement);
        if (upper.indexOf('DEEPAVALI') !== -1 || upper.indexOf('DIWALI') !== -1) return buildHolidayDisplayName('DEEPAVALI', isHoliday, isReplacement);
        if (upper.indexOf('MERDEKA') !== -1 || upper.indexOf('INDEPENDENCE') !== -1 || upper.indexOf('HARI KEBANGSAAN') !== -1) return buildHolidayDisplayName('HARI KEBANGSAAN', isHoliday, isReplacement);
        if (upper.indexOf('MALAYSIA DAY') !== -1 || upper.indexOf('HARI MALAYSIA') !== -1) return buildHolidayDisplayName('HARI MALAYSIA', isHoliday, isReplacement);
        if (upper.indexOf('NEW YEAR') !== -1 || upper.indexOf('TAHUN BARU') !== -1) return buildHolidayDisplayName('TAHUN BARU', isHoliday, isReplacement);
        if (upper.indexOf('GOOD FRIDAY') !== -1 || upper.indexOf('JUMAAT AGUNG') !== -1) return buildHolidayDisplayName('JUMAAT AGUNG', isHoliday, isReplacement);
        if (upper.indexOf('KAAMATAN') !== -1 || upper.indexOf('HARVEST FESTIVAL') !== -1 || upper.indexOf('PESTA MENUAI') !== -1 || upper.indexOf('PESTA KAAMATAN') !== -1) return buildHolidayDisplayName('PESTA KAAMATAN', isHoliday, isReplacement);
        if (upper.indexOf('AGONG') !== -1 || upper.indexOf('KING') !== -1 || upper.indexOf('YANG DI-PERTUAN AGONG') !== -1) return buildHolidayDisplayName('HARI KEPUTERAAN AGONG', isHoliday, isReplacement);
        if (upper.indexOf('SULTAN') !== -1 && upper.indexOf('SELANGOR') !== -1) return buildHolidayDisplayName('HARI SULTAN SELANGOR', isHoliday, isReplacement);
        if (upper.indexOf('SABAH') !== -1 && (upper.indexOf('GOVERNOR') !== -1 || upper.indexOf('YANG DI-PERTUA') !== -1 || upper.indexOf('YANG DIPERTUA') !== -1)) return buildHolidayDisplayName('HARI TYT SABAH', isHoliday, isReplacement);
        if (upper.indexOf('FEDERAL TERRITORY') !== -1 || upper.indexOf('WILAYAH PERSEKUTUAN') !== -1) return buildHolidayDisplayName('HARI WILAYAH', isHoliday, isReplacement);
        if (upper.indexOf('CHRISTMAS EVE') !== -1 || upper.indexOf('MALAM KRISMAS') !== -1) return buildHolidayDisplayName('MALAM KRISMAS', isHoliday, isReplacement);
        if (upper.indexOf('CHRISTMAS') !== -1 || upper.indexOf('KRISMAS') !== -1) return buildHolidayDisplayName('HARI KRISMAS', isHoliday, isReplacement);
        if (upper.indexOf('LABOUR') !== -1 || upper.indexOf('LABOR') !== -1 || upper.indexOf('HARI PEKERJA') !== -1 || upper.indexOf('HARI BURUH') !== -1) return buildHolidayDisplayName('HARI PEKERJA', isHoliday, isReplacement);
        if (upper.indexOf('WESAK') !== -1) return buildHolidayDisplayName('HARI WESAK', isHoliday, isReplacement);
        if (upper.indexOf('GAWAI') !== -1) return buildHolidayDisplayName('HARI GAWAI', isHoliday, isReplacement);
        if (upper.indexOf('PUBLIC HOLIDAY') !== -1 || upper.indexOf('CUTI UMUM') !== -1 || upper.indexOf('HARI KELEPASAN AM') !== -1) return 'CUTI UMUM';
  
        text = text
          .replace(/\bPublic\s+Holiday\b/ig, 'Cuti Umum')
          .replace(/\bHoliday\b/ig, '')
          .replace(/\bReplacement\b|\bSubstitute\b|\bObserved\b/ig, 'Gantian')
          .replace(/\bMaal\s+Hijrah\b/ig, 'Awal Muharram')
          .replace(/\bIslamic\s+New\s+Year\b/ig, 'Awal Muharram')
          .replace(/\bNuzul\s+(?:Quran|Qur'an|Al-Quran)\b/ig, 'Nuzul Quran')
          .replace(/\b(?:Maulidur\s+Rasul|Prophet\s+Muhammad's\s+Birthday)\b/ig, 'Maulidur Rasul')
          .replace(/\bKaamatan\s+Day\b/ig, 'Pesta Kaamatan')
          .replace(/\bHarvest\s+Festival\b/ig, 'Pesta Kaamatan')
          .replace(/\bHari\s+Raya\s+Aidilfitri\b/ig, 'Hari Raya Aidilfitri')
          .replace(/\bHari\s+Raya\s+(?:Haji|Aidiladha)\b/ig, 'Hari Raya Aidiladha')
          .replace(/\bChinese\s+New\s+Year\b/ig, 'Tahun Baru Cina')
          .replace(/\bIndependence\s+Day\b/ig, 'Hari Kebangsaan')
          .replace(/\bLabou?r\s+Day\b/ig, 'Hari Pekerja')
          .replace(/\bChristmas\s+Day\b/ig, 'Hari Krismas')
          .replace(/\bWesak\s+Day\b/ig, 'Hari Wesak')
          .replace(/\bFederal\s+Territory\s+Day\b/ig, 'Hari Wilayah')
          .replace(/\bKing's\s+Birthday\b/ig, 'Hari Keputeraan Agong')
          .replace(/\bMalaysia\s+Day\b/ig, 'Hari Malaysia')
          .replace(/\bNew\s+Year's\s+Day\b/ig, 'Tahun Baru')
          .replace(/\bHari\s+Buruh\b/ig, 'Hari Pekerja')
          .replace(/\s+/g, ' ')
          .trim();
        return text.toUpperCase();
      }

      /* +----------------------------------+
       * + buildHolidayDisplayName          +
       * +----------------------------------+ */
      function buildHolidayDisplayName(baseName, isHoliday, isReplacement) {
        var base = cleanText(baseName)
          .toUpperCase()
          .replace(/\s+/g, ' ')
          .trim();
        if (!base) return '';
        if (isReplacement && base.indexOf('GANTIAN ') !== 0) return 'GANTIAN ' + base;
        return base;
      }
  
      /* +----------------------------------+
       * + getHolidayDisplayRegions         +
       * +----------------------------------+ */
      function getHolidayDisplayRegions(regions) {
        var list = Array.isArray(regions) ? regions.map(cleanText).filter(Boolean) : [];
        var output = [];
  
        /* +----------------------------------+
         * + pushRegion                       +
         * +----------------------------------+ */
        function pushRegion(region) {
          if (region && output.indexOf(region) === -1) output.push(region);
        }
  
        if (list.indexOf('National') !== -1) return 'NATIONAL';
        list.forEach(function (region) {
          if (region === 'Selangor') pushRegion('SELANGOR');
          else if (region === 'WP Kuala Lumpur') pushRegion('KL');
          else if (region === 'Sabah') pushRegion('SABAH');
        });
        return output.join(' / ');
      }
  
      /* +----------------------------------+
       * + getHolidayBadgeData              +
       * +----------------------------------+ */
      function getHolidayBadgeData(entry) {
        var regions = Array.isArray(entry && entry.regions) ? entry.regions : [];
        return {
          name: getHolidayDisplayName((entry && (entry.displayName || entry.name)) || ''),
          regions: cleanText((entry && entry.displayRegions) || getHolidayDisplayRegions(regions))
        };
      }
  
      /* +----------------------------------+
       * + getHolidayLabelForDate           +
       * +----------------------------------+ */
      function getHolidayLabelForDate(dateObj) {
        var entries = getHolidayEntriesForDate(dateObj);
        if (!entries.length) return '';
        return entries.map(function (entry) {
          var badge = getHolidayBadgeData(entry);
          return [badge.regions, badge.name].filter(Boolean).join(' • ');
        }).filter(Boolean).join(' / ');
      }


      /* +----------------------------------+
       * + FLOATING TODAY ROSTER CARD       +
       * +----------------------------------+ */
      function getTodayFloatingCardStorageKey() {
        return 'labAppTodayFloatingRosterCardPositionV1';
      }

      /* +----------------------------------+
       * + getTodayFloatingDate             +
       * +----------------------------------+ */
      function getTodayFloatingDate() {
        return createCalendarDateFromParts(getAppNowParts());
      }

      /* +----------------------------------+
       * + readTodayFloatingCardPosition    +
       * +----------------------------------+ */
      function readTodayFloatingCardPosition() {
        if (state.todayFloatingCardPosition) return state.todayFloatingCardPosition;
        var saved = safeParse(safeStorageGet(getTodayFloatingCardStorageKey()));
        if (isFiniteNumber(Number(saved.left)) && isFiniteNumber(Number(saved.top))) {
          state.todayFloatingCardPosition = { left: Number(saved.left), top: Number(saved.top) };
        }
        return state.todayFloatingCardPosition;
      }

      /* +----------------------------------+
       * + saveTodayFloatingCardPosition    +
       * +----------------------------------+ */
      function saveTodayFloatingCardPosition(position) {
        if (!position) return;
        state.todayFloatingCardPosition = { left: Number(position.left), top: Number(position.top) };
        safeStorageSet(getTodayFloatingCardStorageKey(), JSON.stringify(state.todayFloatingCardPosition));
      }

      /* +----------------------------------+
       * + clampTodayFloatingCardPosition   +
       * +----------------------------------+ */
      function clampTodayFloatingCardPosition(card, left, top) {
        var padding = 10;
        var width = card && card.offsetWidth ? card.offsetWidth : 286;
        var height = card && card.offsetHeight ? card.offsetHeight : 126;
        var viewportWidth = window.innerWidth || document.documentElement.clientWidth || width + padding * 2;
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight || height + padding * 2;
        return {
          left: Math.max(padding, Math.min(Number(left) || padding, Math.max(padding, viewportWidth - width - padding))),
          top: Math.max(padding, Math.min(Number(top) || padding, Math.max(padding, viewportHeight - height - padding)))
        };
      }

      /* +----------------------------------+
       * + applyTodayFloatingCardPosition   +
       * +----------------------------------+ */
      function applyTodayFloatingCardPosition(card, position, persist) {
        if (!card || !position) return;
        var clamped = clampTodayFloatingCardPosition(card, position.left, position.top);
        card.style.left = clamped.left + 'px';
        card.style.top = clamped.top + 'px';
        card.style.right = 'auto';
        card.style.bottom = 'auto';
        if (persist) saveTodayFloatingCardPosition(clamped);
      }

      /* +----------------------------------+
       * + getTodayFloatingCardElement      +
       * +----------------------------------+ */
      function getTodayFloatingCardElement() {
        var host = $('todayFloatingCards');
        var card;
        if (!host) {
          host = document.createElement('div');
          host.id = 'todayFloatingCards';
          host.className = 'today-floating-cards';
          host.setAttribute('aria-live', 'polite');
          document.body.appendChild(host);
        }
        card = $('todayFloatingCard');
        if (!card) {
          card = document.createElement('section');
          card.id = 'todayFloatingCard';
          card.className = 'today-floating-card';
          card.setAttribute('role', 'status');
          card.setAttribute('aria-label', 'Today roster card');
          card.innerHTML = '<div class="today-floating-date" data-role="today-date"></div><div class="today-floating-duty" data-role="today-duty">ON CALL</div><div class="today-floating-name" data-role="today-name"></div><div class="today-floating-holiday" data-role="today-holiday" hidden></div>';
          host.appendChild(card);
        }
        bindTodayFloatingCardDrag(card);
        return card;
      }

      /* +----------------------------------+
       * + getTodayFloatingHolidayText      +
       * +----------------------------------+ */
      function getTodayFloatingHolidayText(dateObj) {
        return getHolidayEntriesForDate(dateObj).map(function (entry) {
          var badge = getHolidayBadgeData(entry);
          return [badge.regions, badge.name].filter(Boolean).join(' • ');
        }).filter(Boolean).join(' / ');
      }

      /* +----------------------------------+
       * + getTodayFloatingNameColor        +
       * +----------------------------------+ */
      function getTodayFloatingNameColor(dateObj) {
        var palette = [
          '#0f766e',
          '#2563eb',
          '#7c3aed',
          '#db2777',
          '#ea580c',
          '#0891b2',
          '#16a34a',
          '#dc2626'
        ];
        var date = dateObj instanceof Date ? dateObj : getTodayFloatingDate();
        var dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
        var dayIndex = Math.floor(dayStart.getTime() / 86400000);
        return palette[Math.abs(dayIndex) % palette.length] || palette[0];
      }

      /* +----------------------------------+
       * + positionTodayFloatingCardDefault +
       * +----------------------------------+ */
      function positionTodayFloatingCardDefault(card) {
        if (!card || card.dataset.positionReady === '1') return;
        var saved = readTodayFloatingCardPosition();
        if (saved) {
          applyTodayFloatingCardPosition(card, saved, false);
        }
        card.dataset.positionReady = '1';
      }

      /* +----------------------------------+
       * + resizeTodayFloatingCard          +
       * +----------------------------------+ */
      function resizeTodayFloatingCard() {
        var card = $('todayFloatingCard');
        var position = readTodayFloatingCardPosition();
        if (card && position) applyTodayFloatingCardPosition(card, position, true);
      }

      /* +----------------------------------+
       * + bindTodayFloatingCardDrag        +
       * +----------------------------------+ */
      function bindTodayFloatingCardDrag(card) {
        if (!card || card.dataset.dragBound === '1') return;
        card.dataset.dragBound = '1';

        card.addEventListener('pointerdown', function (event) {
          if (event.button != null && event.button !== 0) return;
          var rect = card.getBoundingClientRect();
          state.todayFloatingCardDrag = {
            pointerId: event.pointerId,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top
          };
          card.classList.add('is-dragging');
          if (card.setPointerCapture) {
            try { card.setPointerCapture(event.pointerId); } catch (captureError) {}
          }
          event.preventDefault();
        });

        card.addEventListener('pointermove', function (event) {
          var drag = state.todayFloatingCardDrag;
          if (!drag || drag.pointerId !== event.pointerId) return;
          applyTodayFloatingCardPosition(card, {
            left: event.clientX - drag.offsetX,
            top: event.clientY - drag.offsetY
          }, false);
          event.preventDefault();
        });

        function finishDrag(event) {
          var drag = state.todayFloatingCardDrag;
          if (!drag || (event && drag.pointerId !== event.pointerId)) return;
          var rect = card.getBoundingClientRect();
          card.classList.remove('is-dragging');
          state.todayFloatingCardDrag = null;
          applyTodayFloatingCardPosition(card, { left: rect.left, top: rect.top }, true);
          if (event && card.releasePointerCapture) {
            try { card.releasePointerCapture(event.pointerId); } catch (releaseError) {}
          }
        }

        card.addEventListener('pointerup', finishDrag);
        card.addEventListener('pointercancel', finishDrag);

        if (!state.todayFloatingCardBound) {
          state.todayFloatingCardBound = true;
          window.addEventListener('resize', rafThrottle(resizeTodayFloatingCard), { passive: true });
        }
      }

      /* +----------------------------------+
       * + renderTodayFloatingCards         +
       * +----------------------------------+ */
      function renderTodayFloatingCards() {
        var host = $('todayFloatingCards');
        if (!state.authUserId || !document.body.classList.contains('auth-ready')) {
          if (host) host.hidden = true;
          return;
        }

        var today = getTodayFloatingDate();
        var todayKey = dateKey(today);
        var card = getTodayFloatingCardElement();
        var dateNode = card.querySelector('[data-role="today-date"]');
        var nameNode = card.querySelector('[data-role="today-name"]');
        var holidayNode = card.querySelector('[data-role="today-holiday"]');
        var staffState = getCalendarStaffStateForDate(today);
        var displayName = staffState.assignedStaff || staffState.originalStaff || 'NO NAME SET';
        var holidayText = getTodayFloatingHolidayText(today);
        var nameColor = getTodayFloatingNameColor(today);

        if (host) host.hidden = false;
        state.todayKey = todayKey;
        loadHolidayDataForYear(today.getFullYear());

        card.classList.toggle('is-assigned', !!staffState.assignedStaff);
        card.classList.toggle('has-holiday', !!holidayText);
        card.style.setProperty('--today-floating-name-color', nameColor);
        if (dateNode) dateNode.textContent = formatDateLabel(today);
        if (nameNode) nameNode.textContent = displayName;
        if (holidayNode) {
          holidayNode.textContent = holidayText;
          holidayNode.hidden = !holidayText;
        }
        card.setAttribute('aria-label', 'Today roster card. ' + formatDateLabel(today) + '. On call. ' + displayName + (holidayText ? '. Holiday: ' + holidayText : '.'));
        positionTodayFloatingCardDefault(card);
      }

      /* +----------------------------------+
       * + getHolidayPopoverElement         +
       * +----------------------------------+ */
      function getHolidayPopoverElement() {
        var popover = $('calendarHolidayPopover');
        if (popover) return popover;
        popover = document.createElement('div');
        popover.id = 'calendarHolidayPopover';
        popover.className = 'calendar-holiday-popover';
        popover.setAttribute('role', 'dialog');
        popover.setAttribute('aria-live', 'polite');
        popover.innerHTML = '<div class="calendar-holiday-popover-head"><div class="calendar-holiday-popover-title" data-role="holiday-title"></div><button type="button" class="calendar-holiday-popover-close" data-role="holiday-close" aria-label="Close holiday popup">×</button></div><div class="calendar-holiday-popover-list" data-role="holiday-list"></div>';
        ($('calendar') || document.body).appendChild(popover);
        var closeButton = popover.querySelector('[data-role="holiday-close"]');
        if (closeButton) closeButton.addEventListener('click', hideHolidayPopover);
        return popover;
      }
  
      /* +----------------------------------+
       * + hideHolidayPopover               +
       * +----------------------------------+ */
      function hideHolidayPopover() {
        var popover = $('calendarHolidayPopover');
        if (!popover || !popover.classList.contains('is-visible')) return;
        popover.classList.remove('is-visible');
        popover.style.left = '';
        popover.style.top = '';
      }
  
      /* +----------------------------------+
       * + positionHolidayPopover           +
       * +----------------------------------+ */
      function positionHolidayPopover(popover, cell) {
        if (!popover || !cell) return;
        var rect = cell.getBoundingClientRect();
        var padding = 14;
        var gap = 10;
        var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        var width = popover.offsetWidth || 280;
        var height = popover.offsetHeight || 120;
        var left = rect.left + rect.width / 2;
        var aboveTop = rect.top - height - gap;
        var belowTop = rect.bottom + gap;
        var top = aboveTop;
  
        left = Math.max(padding + width / 2, Math.min(left, viewportWidth - padding - width / 2));
        if (aboveTop < padding && belowTop + height <= viewportHeight - padding) {
          top = belowTop;
        }
        top = Math.max(padding, Math.min(top, viewportHeight - padding - height));
        popover.style.left = left + 'px';
        popover.style.top = top + 'px';
      }
  
      /* +----------------------------------+
       * + showHolidayPopoverForDate        +
       * +----------------------------------+ */
      function showHolidayPopoverForDate(dateObj) {
        var entries = getHolidayEntriesForDate(dateObj);
        if (!entries.length) {
          hideHolidayPopover();
          return;
        }
        var key = dateKey(dateObj);
        var grid = $('calendarMiniGrid');
        var cell = grid ? grid.querySelector('.calendar-mini-day[data-date="' + key + '"]') : null;
        if (!cell) return;
        var popover = getHolidayPopoverElement();
        var title = popover.querySelector('[data-role="holiday-title"]');
        var list = popover.querySelector('[data-role="holiday-list"]');
        if (title) title.textContent = formatDateLabel(dateObj);
        if (list) {
          list.textContent = '';
          entries.forEach(function (entry) {
            var badge = getHolidayBadgeData(entry);
            var item = document.createElement('div');
            var region = document.createElement('span');
            var name = document.createElement('span');
            item.className = 'calendar-holiday-popover-item';
            region.className = 'calendar-holiday-popover-region';
            region.textContent = badge.regions || 'CUTI';
            name.className = 'calendar-holiday-popover-name';
            name.textContent = badge.name || cleanText(entry && entry.name) || 'CUTI UMUM';
            item.appendChild(region);
            item.appendChild(name);
            list.appendChild(item);
          });
        }
        popover.classList.add('is-visible');
        positionHolidayPopover(popover, cell);
      }
  
  
      /* +----------------------------------+
       * + isAllowedHolidayRegion           +
       * +----------------------------------+ */
      function isAllowedHolidayRegion(region) {
        var value = cleanText(region).toUpperCase();
        return value === 'NATIONAL' ||
          value === 'SELANGOR' ||
          value === 'WP KUALA LUMPUR' ||
          value === 'KUALA LUMPUR' ||
          value === 'WILAYAH PERSEKUTUAN KUALA LUMPUR' ||
          value === 'FEDERAL TERRITORY KUALA LUMPUR';
      }

      /* +----------------------------------+
       * + filterAllowedHolidayRegions      +
       * +----------------------------------+ */
      function filterAllowedHolidayRegions(regions) {
        var output = [];
        (Array.isArray(regions) ? regions : []).map(cleanText).filter(Boolean).forEach(function (region) {
          var value = region.toUpperCase();
          var canonical = '';
          if (value === 'NATIONAL') canonical = 'National';
          else if (value === 'SELANGOR') canonical = 'Selangor';
          else if (value === 'WP KUALA LUMPUR' || value === 'KUALA LUMPUR' || value === 'WILAYAH PERSEKUTUAN KUALA LUMPUR' || value === 'FEDERAL TERRITORY KUALA LUMPUR') canonical = 'WP Kuala Lumpur';
          if (canonical && isAllowedHolidayRegion(canonical) && output.indexOf(canonical) === -1) output.push(canonical);
        });
        return output;
      }

      /* +----------------------------------+
       * + mergeHolidayData                 +
       * +----------------------------------+ */
      function mergeHolidayData(envelope, expectedYear) {
        if (!envelope || envelope.ok === false || !Array.isArray(envelope.holidays)) return false;
        var envelopeYear = Number(envelope.year);
        var targetYear = Number(expectedYear || envelopeYear);
        if (!envelopeYear || !targetYear || envelopeYear !== targetYear) return false;
        var added = 0;
        envelope.holidays.forEach(function (holiday) {
          if (!holiday || !isHolidayDateInYear(holiday.date, targetYear)) return;
          var cleanName = cleanText(holiday.name);
          if (!cleanName) return;
          var regions = filterAllowedHolidayRegions(holiday.regions);
          // CALENDAR ONLY: National + Kuala Lumpur + Selangor.
          // Holidays belonging exclusively to other states are ignored.
          if (!regions.length) return;
          var displayName = getHolidayDisplayName(holiday.displayName || cleanName);
          // Always derive the badge from the filtered regions so no other state can appear.
          var displayRegions = getHolidayDisplayRegions(regions);
          if (!state.holidaysByDate[holiday.date]) state.holidaysByDate[holiday.date] = [];
          var exists = state.holidaysByDate[holiday.date].some(function (item) {
            return cleanText(item && item.name) === cleanName && cleanText(item && item.displayRegions) === displayRegions;
          });
          if (exists) return;
          state.holidaysByDate[holiday.date].push({
            name: cleanName,
            displayName: displayName,
            regions: regions,
            displayRegions: displayRegions
          });
          added += 1;
        });
        return added > 0;
      }

      /* +----------------------------------+
       * + clearHolidayDataForYear          +
       * +----------------------------------+ */
      function clearHolidayDataForYear(year) {
        var prefix = String(Number(year)) + '-';
        Object.keys(state.holidaysByDate || {}).forEach(function (key) {
          if (String(key).indexOf(prefix) === 0) delete state.holidaysByDate[key];
        });
      }
  


      /* +------------------------------------------+
       * + buildOfficialHolidaySupplementalEnvelope +
       * +------------------------------------------+ */
      function buildOfficialHolidaySupplementalEnvelope(year) {
        var holidays = [];
        officialHolidaySupplementalRows.forEach(function (row) {
          var date = cleanText(row && row.date);
          var name = cleanText(row && row.name);
          var regions = Array.isArray(row && row.regions) ? row.regions.map(cleanText).filter(Boolean) : [];
          if (!isHolidayDateInYear(date, year) || !name || !regions.length) return;
          holidays.push({
            date: date,
            name: name,
            displayName: getHolidayDisplayName(name),
            regions: regions,
            displayRegions: getHolidayDisplayRegions(regions)
          });
        });
        return { ok: holidays.length > 0, year: Number(year), holidays: holidays, sourceName: 'Official holiday supplement table' };
      }

      /* +------------------------------------------+
       * + mergeOfficialHolidaySupplementalData     +
       * +------------------------------------------+ */
      function mergeOfficialHolidaySupplementalData(year) {
        return mergeHolidayData(buildOfficialHolidaySupplementalEnvelope(year), year);
      }

      /* +----------------------------------+
       * + buildHolidayEnvelopeFromState    +
       * +----------------------------------+ */
      function buildHolidayEnvelopeFromState(year, sourceName) {
        var holidays = [];
        var prefix = String(Number(year)) + '-';
        Object.keys(state.holidaysByDate || {}).sort().forEach(function (date) {
          if (String(date).indexOf(prefix) !== 0) return;
          (state.holidaysByDate[date] || []).forEach(function (item) {
            var name = cleanText(item && item.name);
            var regions = Array.isArray(item && item.regions) ? item.regions.map(cleanText).filter(Boolean) : [];
            if (!name || !regions.length) return;
            holidays.push({
              date: date,
              name: name,
              displayName: getHolidayDisplayName(item.displayName || name),
              regions: regions,
              displayRegions: cleanText(item.displayRegions || getHolidayDisplayRegions(regions))
            });
          });
        });
        return { ok: holidays.length > 0, year: Number(year), holidays: holidays, sourceName: cleanText(sourceName) || 'Holiday cache' };
      }

      /* +----------------------------------+
       * + getHolidayClientCacheKey         +
       * +----------------------------------+ */
      function getHolidayClientCacheKey(year) {
        return 'labAppHolidayData_' + holidayClientCacheVersion + '_' + Number(year);
      }

      /* +----------------------------------+
       * + writeHolidayDataToClientCache    +
       * +----------------------------------+ */
      function writeHolidayDataToClientCache(year, envelope) {
        try {
          if (!window.localStorage || !envelope || envelope.ok === false || !Array.isArray(envelope.holidays) || !envelope.holidays.length) return;
          window.localStorage.setItem(getHolidayClientCacheKey(year), JSON.stringify({
            savedAt: Date.now(),
            envelope: envelope
          }));
        } catch (error) {
          console.warn('Holiday client cache write skipped:', error && error.message ? error.message : error);
        }
      }

      /* +----------------------------------+
       * + loadHolidayDataFromClientCache   +
       * +----------------------------------+ */
      function loadHolidayDataFromClientCache(year) {
        try {
          if (!window.localStorage) return false;
          var raw = window.localStorage.getItem(getHolidayClientCacheKey(year));
          if (!raw) return false;
          var cached = JSON.parse(raw);
          if (!cached || !cached.savedAt || Date.now() - Number(cached.savedAt) > holidayClientCacheMaxAgeMs) return false;
          var added = mergeHolidayData(cached.envelope, year);
          if (!added) return false;
          state.holidayYearsLoading[year] = false;
          state.holidayYearsLoaded[year] = true;
          rememberHolidayLoadSource(year, 'Client cached ' + cleanText(cached.envelope && cached.envelope.sourceName || 'holiday data'));
          buildMonthCalendar();
          return true;
        } catch (error) {
          console.warn('Holiday client cache read skipped:', error && error.message ? error.message : error);
          return false;
        }
      }

      /* +----------------------------------+
       * + rememberHolidayLoadSource        +
       * +----------------------------------+ */
      function rememberHolidayLoadSource(year, sourceName) {
        var source = cleanText(sourceName) || 'Unknown holiday source';
        state.holidayLoadSources[year] = source;
        console.info('Holiday data ' + year + ' loaded from: ' + source);
      }
  
      /* +----------------------------------+
       * + normalizeBrowserHolidayDate      +
       * +----------------------------------+ */
      function normalizeBrowserHolidayDate(value) {
        var text = cleanText(value);
        return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
      }
  
      /* +----------------------------------+
       * + getBrowserHolidayStateCodes      +
       * +----------------------------------+ */
      function getBrowserHolidayStateCodes(row) {
        var raw = row && (row.state_codes || row.states || row.stateCodes || row.counties || row.state_code || row.state);
        var list = Array.isArray(raw) ? raw : (raw ? String(raw).split(/[\s,|/]+/) : []);
        return list.map(function (code) { return cleanText(code).toUpperCase(); }).filter(Boolean);
      }
  
      /* +----------------------------------+
       * + getBrowserHolidayRegions         +
       * +----------------------------------+ */
      function getBrowserHolidayRegions(row, holidayName) {
        var regions = [];
        var stateMap = { SGR: 'Selangor', KUL: 'WP Kuala Lumpur', SBH: 'Sabah' };
        var stateCodes = getBrowserHolidayStateCodes(row);
        var scope = cleanText((row && (row.scope || row.type)) || '').toUpperCase();
        var isExplicitNationalScope = scope === 'NATIONAL' || scope === 'FEDERAL';
        var isFullNationalByStates = stateCodes.length >= 16;
        var isReplacementName = isReplacementHolidayName(holidayName);
        var isNational = isFullNationalByStates || (isExplicitNationalScope && !isReplacementName);
  
        /* +----------------------------------+
         * + pushRegion                       +
         * +----------------------------------+ */
        function pushRegion(region) {
          if (region && regions.indexOf(region) === -1) regions.push(region);
        }
  
        if (isNational) pushRegion('National');
        stateCodes.forEach(function (code) { pushRegion(stateMap[code]); });
        return regions;
      }

      /* +----------------------------------+
       * + isReplacementHolidayName         +
       * +----------------------------------+ */
      function isReplacementHolidayName(name) {
        return /\b(HOLIDAY|GANTIAN|REPLACEMENT|SUBSTITUTE|OBSERVED)\b/i.test(cleanText(name));
      }
  

      /* +----------------------------------+
       * + buildBrowserHolidayEnvelope      +
       * +----------------------------------+ */
      function buildBrowserHolidayEnvelope(year, payload) {
        var rows = Array.isArray(payload) ? payload : (Array.isArray(payload && payload.data) ? payload.data : []);
        var holidays = [];
        rows.forEach(function (row) {
          var date = normalizeBrowserHolidayDate(row && row.date);
          var name = cleanText((row && (row.name || row.holiday_name || row.localName || row.local_name)) || 'Public Holiday');
          var regions = getBrowserHolidayRegions(row, name);
          if (!isHolidayDateInYear(date, year) || !name || !regions.length) return;
          holidays.push({
            date: date,
            name: name,
            displayName: getHolidayDisplayName(name),
            regions: regions,
            displayRegions: getHolidayDisplayRegions(regions)
          });
        });
        return { ok: holidays.length > 0, year: year, holidays: holidays, sourceName: 'Malaysia Holiday API browser fallback' };
      }
  
  
      /* +----------------------------------+
       * + browserHolidayPlainText          +
       * +----------------------------------+ */
      function browserHolidayPlainText(value) {
        return String(value || '')
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<br\s*\/?\s*>/gi, ' ')
          .replace(/<\/p>|<\/div>|<\/tr>|<\/li>|<\/h[1-6]>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&amp;/gi, '&')
          .replace(/&#8217;|&rsquo;/gi, "'")
          .replace(/&#0?39;/g, "'")
          .replace(/&quot;/gi, '"')
          .replace(/\s+/g, ' ')
          .trim();
      }
  
      /* +----------------------------------+
       * + getBrowserHolidayMonthNumber     +
       * +----------------------------------+ */
      function getBrowserHolidayMonthNumber(monthName) {
        var months = {
          JAN: '01', JANUARY: '01', FEB: '02', FEBRUARY: '02', MAR: '03', MARCH: '03', MAC: '03', APR: '04', APRIL: '04',
          MAY: '05', MEI: '05', JUN: '06', JUNE: '06', JUL: '07', JULY: '07', AUG: '08', AUGUST: '08', OGOS: '08',
          SEP: '09', SEPT: '09', SEPTEMBER: '09', OCT: '10', OCTOBER: '10', NOV: '11', NOVEMBER: '11',
          DEC: '12', DECEMBER: '12', DIS: '12', DISEMBER: '12'
        };
        return months[cleanText(monthName).toUpperCase()] || '';
      }
  
      /* +-----------------------------------+
       * + normalizePublicHolidayBrowserDate +
       * +-----------------------------------+ */
      function normalizePublicHolidayBrowserDate(day, month, year) {
        var monthNo = getBrowserHolidayMonthNumber(month);
        var dayNo = pad2(day || '');
        return monthNo && /^\d{2}$/.test(dayNo) ? String(year) + '-' + monthNo + '-' + dayNo : '';
      }
  
      /* +----------------------------------------+
       * + splitPublicHolidayBrowserNameAndStates +
       * +----------------------------------------+ */
      function splitPublicHolidayBrowserNameAndStates(value, forcedRegion) {
        var text = cleanText(value);
        if (!text) return { name: '', states: '' };
        if (forcedRegion) return { name: text, states: forcedRegion };
  
        var markers = [
          'National except', 'National', 'All States except', 'All States', 'Federal', 'Nationwide',
          'Semua Negeri kecuali', 'Semua Negeri', 'Kebangsaan', 'Seluruh Negara',
          'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Melaka', 'Negeri Sembilan',
          'Pahang', 'Penang', 'Pulau Pinang', 'Perak', 'Perlis', 'Putrajaya', 'Sabah', 'Sarawak',
          'Selangor', 'Terengganu', 'Wilayah Persekutuan Kuala Lumpur', 'Wilayah Persekutuan Labuan',
          'Wilayah Persekutuan Putrajaya'
        ];
        var foundIndex = -1;
        markers.forEach(function (marker) {
          var escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var match = new RegExp('(?:^|\s)' + escaped + '(?:\s|$)', 'i').exec(text);
          if (!match) return;
          var index = match.index + (match[0].charAt(0) === ' ' ? 1 : 0);
          if (foundIndex === -1 || index < foundIndex) foundIndex = index;
        });
        if (foundIndex === -1) return { name: text, states: 'National' };
        return {
          name: cleanText(text.slice(0, foundIndex)),
          states: cleanText(text.slice(foundIndex))
        };
      }
  
      /* +----------------------------------+
       * + getPublicHolidayBrowserRegions   +
       * +----------------------------------+ */
      function getPublicHolidayBrowserRegions(states) {
        var text = cleanText(states).toUpperCase();
        var regions = [];
        /* +----------------------------------+
         * + push                             +
         * +----------------------------------+ */
        function push(region) {
          if (region && regions.indexOf(region) === -1) regions.push(region);
        }
        if (!text) return regions;
  
        var exceptIndex = text.indexOf('EXCEPT');
        var kecualiIndex = text.indexOf('KECUALI');
        var exclusionIndex = exceptIndex !== -1 && kecualiIndex !== -1
          ? Math.min(exceptIndex, kecualiIndex)
          : Math.max(exceptIndex, kecualiIndex);
        var hasExclusions = exclusionIndex !== -1;
        var excluded = hasExclusions ? text.slice(exclusionIndex) : '';
        var explicitScope = hasExclusions ? text.slice(0, exclusionIndex) : text;
  
        /* +----------------------------------+
         * + hasTargetKualaLumpurScope        +
         * +----------------------------------+ */
        function hasTargetKualaLumpurScope(value) {
          var textValue = String(value || '');
          if (textValue.indexOf('KUALA LUMPUR') !== -1 || textValue.indexOf('WILAYAH PERSEKUTUAN KUALA LUMPUR') !== -1) return true;
          if (textValue.indexOf('FEDERAL TERRITORY') === -1 && textValue.indexOf('FEDERAL TERRITORIES') === -1 && textValue.indexOf('WILAYAH PERSEKUTUAN') === -1) return false;
          return textValue.indexOf('LABUAN') === -1 && textValue.indexOf('PUTRAJAYA') === -1;
        }
  
        var excludesSelangor = excluded.indexOf('SELANGOR') !== -1;
        var excludesKualaLumpur = hasTargetKualaLumpurScope(excluded);
        var excludesSabah = excluded.indexOf('SABAH') !== -1;
  
        if (
          text.indexOf('NATIONAL') !== -1 ||
          text.indexOf('ALL STATES') !== -1 ||
          text.indexOf('SEMUA NEGERI') !== -1 ||
          text.indexOf('KEBANGSAAN') !== -1 ||
          text.indexOf('SELURUH NEGARA') !== -1 ||
          text.indexOf('NATIONWIDE') !== -1
        ) {
          if (hasExclusions) {
            if (!excludesSelangor) push('Selangor');
            if (!excludesKualaLumpur) push('WP Kuala Lumpur');
            if (!excludesSabah) push('Sabah');
            return regions;
          }
          push('National');
        }
        if (explicitScope.indexOf('SELANGOR') !== -1) push('Selangor');
        if (hasTargetKualaLumpurScope(explicitScope)) push('WP Kuala Lumpur');
        if (explicitScope.indexOf('SABAH') !== -1) push('Sabah');
        return regions;
      }
  
      /* +----------------------------------+
       * + validateHolidayRegionParser      +
       * +----------------------------------+ */
      function validateHolidayRegionParser() {
        var failures = [];
        holidayRegionParserCases.forEach(function (testCase) {
          var expected = Array.isArray(testCase.regions) ? testCase.regions : [];
          var actual = getPublicHolidayBrowserRegions(testCase.input);
          if (actual.join('|') !== expected.join('|')) {
            failures.push({
              input: testCase.input,
              expected: expected,
              actual: actual
            });
          }
        });
        if (failures.length) {
          console.warn('Holiday region parser validation failed:', failures);
        }
        return failures.length === 0;
      }
  
      /* +----------------------------------------+
       * + extractPublicHolidayBrowserYearSection +
       * +----------------------------------------+ */
      function extractPublicHolidayBrowserYearSection(text, year) {
        var value = browserHolidayPlainText(text);
        if (!value) return '';
        var headers = [
          new RegExp('(?:^|\s)' + year + '\s+Public\s+Holidays(?:\s|$)', 'i'),
          new RegExp('(?:^|\s)Public\s+Holidays\s+' + year + '(?:\s|$)', 'i'),
          new RegExp('(?:^|\s)Cuti\s+Umum\s+' + year + '(?:\s|$)', 'i'),
          new RegExp('(?:^|\s)' + year + '\s+Cuti\s+Umum(?:\s|$)', 'i')
        ];
        var start = -1;
        headers.some(function (re) {
          var match = re.exec(value);
          if (!match) return false;
          start = match.index + match[0].length;
          return true;
        });
        if (start < 0) return '';
  
        var tail = value.slice(start);
        var nextHeader = new RegExp('(?:^|\s)(?:' + (Number(year) + 1) + '|' + (Number(year) - 1) + '|20\\d{2})\s+(?:Public\s+Holidays|Cuti\s+Umum)(?:\s|$)', 'i');
        var nextMatch = nextHeader.exec(tail);
        var section = nextMatch ? tail.slice(0, nextMatch.index) : tail;
        return section
          .replace(/^Date\s+Day\s+Holiday(?:\s+States)?\s*/i, '')
          .replace(/^Tarikh\s+Hari\s+Cuti(?:\s+Negeri)?\s*/i, '')
          .trim();
      }
  
      /* +------------------------------------+
       * + hasPublicHolidayBrowserYearMarkers +
       * +------------------------------------+ */
      function hasPublicHolidayBrowserYearMarkers(text) {
        var clean = browserHolidayPlainText(text);
        return /(?:^|\s)(?:19|20)\d{2}\s+(?:Public\s+Holidays|Cuti\s+Umum)(?:\s|$)/i.test(clean) ||
          /(?:^|\s)(?:Public\s+Holidays|Cuti\s+Umum)\s+(?:19|20)\d{2}(?:\s|$)/i.test(clean);
      }

      /* +---------------------------------------+
       * + hasLoosePublicHolidayBrowserYears    +
       * +---------------------------------------+ */
      function hasLoosePublicHolidayBrowserYears(text) {
        var clean = browserHolidayPlainText(text);
        var matches = clean.match(/(?:^|\s)(?:19|20)\d{2}(?:\s|$)/g);
        return Array.isArray(matches) && matches.length > 0;
      }
  
      /* +----------------------------------+
       * + parsePublicHolidayBrowserRows    +
       * +----------------------------------+ */
      function parsePublicHolidayBrowserRows(text, year, forcedRegion) {
        var rows = [];
        var months = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|Mac|Mei|Ogos|Dis|Disember';
        var days = 'Mon|Tue|Wed|Thu|Fri|Sat|Sun|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Isnin|Selasa|Rabu|Khamis|Jumaat|Sabtu|Ahad';
        var section = extractPublicHolidayBrowserYearSection(text, year);
        var hasScopedYearSection = !!section;
        if (!section && hasPublicHolidayBrowserYearMarkers(text)) return rows;
        var requireExplicitRowYear = !hasScopedYearSection && hasLoosePublicHolidayBrowserYears(text);
        section = section || browserHolidayPlainText(text);
        var pattern = new RegExp('(?:((?:19|20)\\d{2})\s+)?(\\d{1,2})\s+(' + months + ')\s+(' + days + ')(?:\s+|(?=[A-ZÀ-Ý]))([\s\\S]*?)(?=\s+(?:(?:19|20)\\d{2}\s+)?\\d{1,2}\s+(?:' + months + ')\s+(?:' + days + ')(?:\s+|(?=[A-ZÀ-Ý]))|\s+Visit\s+kabinet|\s+Lawati\s+kabinet|\s+The\s+dates|\s+Tarikh|\s+Choose\s+your\s+state|\s+Pilih\s+negeri|$)', 'gi');
        var match;
        while ((match = pattern.exec(section)) !== null) {
          if (match[1]) {
            if (Number(match[1]) !== Number(year)) continue;
          } else if (requireExplicitRowYear) {
            continue;
          }
          var split = splitPublicHolidayBrowserNameAndStates(match[5], forcedRegion || '');
          var date = normalizePublicHolidayBrowserDate(match[2], match[3], year);
          var regions = forcedRegion ? [forcedRegion] : getPublicHolidayBrowserRegions(split.states);
          if (!date || !split.name || !regions.length) continue;
          rows.push({ date: date, name: split.name, regions: regions, states: split.states });
        }
        return rows;
      }
  
      /* +-----------------------------------+
       * + buildPublicHolidayBrowserEnvelope +
       * +-----------------------------------+ */
      function buildPublicHolidayBrowserEnvelope(year, text, forcedRegion) {
        var holidays = [];
        parsePublicHolidayBrowserRows(text, year, forcedRegion).forEach(function (row) {
          holidays.push({
            date: row.date,
            name: row.name,
            displayName: getHolidayDisplayName(row.name),
            regions: row.regions,
            displayRegions: getHolidayDisplayRegions(row.regions)
          });
        });
        return { ok: holidays.length > 0, year: year, holidays: holidays, sourceName: 'PublicHolidays.com.my browser reader fallback' };
      }

      /* +----------------------------------+
       * + fetchPublicHolidayReaderSource   +
       * +----------------------------------+ */
      function fetchPublicHolidayReaderSource(year, source) {
        var readerUrl = 'https://r.jina.ai/' + source.url;
        return fetch(readerUrl, { cache: 'default' })
          .then(function (response) {
            if (!response.ok) throw new Error('PublicHolidays reader HTTP ' + response.status);
            return response.text();
          })
          .then(function (text) {
            return mergeHolidayData(buildPublicHolidayBrowserEnvelope(year, text, source.region), year);
          })
          .catch(function (error) {
            console.warn('PublicHolidays browser fallback skipped:', source.url, error && error.message ? error.message : error);
            return false;
          });
      }
  
      /* +------------------------------------------+
       * + loadPublicHolidaysDataForYearFromBrowser +
       * +------------------------------------------+ */
      function loadPublicHolidaysDataForYearFromBrowser(year) {
        if (typeof window.fetch === 'undefined') {
          return Promise.resolve(false);
        }
        var sources = [
          { url: 'https://publicholidays.com.my/', region: '' },
          { url: 'https://publicholidays.com.my/selangor/', region: 'Selangor' },
          { url: 'https://publicholidays.com.my/kuala-lumpur/', region: 'WP Kuala Lumpur' }
        ];
        return Promise.all(sources.map(function (source) {
          return fetchPublicHolidayReaderSource(year, source);
        })).then(function (results) {
          return results.some(Boolean);
        });
      }
  
      /* +-----------------------------------+
       * + loadHolidayDataForYearFromBrowser +
       * +-----------------------------------+ */
      function loadHolidayDataForYearFromBrowser(year) {
        var supplementalAdded = mergeOfficialHolidaySupplementalData(year);

        if (!window.fetch) {
          state.holidayYearsLoading[year] = false;
          state.holidayYearsLoaded[year] = supplementalAdded;
          if (supplementalAdded) {
            rememberHolidayLoadSource(year, 'Official holiday supplement table');
            writeHolidayDataToClientCache(year, buildHolidayEnvelopeFromState(year, 'Official holiday supplement table'));
            buildMonthCalendar();
          } else {
            state.holidayLoadSources[year] = 'Browser fallback unavailable';
            console.warn('Holiday browser fallback is not available in this WebView.');
          }
          return;
        }

        fetch('https://malaysia-holiday.dydxsoft.my/api/v1/holidays?year=' + encodeURIComponent(year), { cache: 'default' })
          .then(function (response) {
            if (!response.ok) throw new Error('Malaysia Holiday API browser fallback HTTP ' + response.status);
            return response.json();
          })
          .then(function (payload) {
            var envelope = buildBrowserHolidayEnvelope(year, payload);
            var malaysiaApiAdded = mergeHolidayData(envelope, year);
            var loaded = malaysiaApiAdded || supplementalAdded;
            state.holidayYearsLoading[year] = false;
            state.holidayYearsLoaded[year] = loaded;
            if (loaded) {
              rememberHolidayLoadSource(year, malaysiaApiAdded ? envelope.sourceName + ' + official supplement table' : 'Official holiday supplement table');
              writeHolidayDataToClientCache(year, buildHolidayEnvelopeFromState(year, state.holidayLoadSources[year]));
              buildMonthCalendar();
            } else {
              state.holidayLoadSources[year] = 'No matching holiday rows';
              console.warn('Holiday browser fallback returned no matching holiday rows.');
            }
          })
          .catch(function (error) {
            console.warn('Malaysia Holiday API browser fallback failed:', error && error.message ? error.message : error);
            state.holidayYearsLoading[year] = false;
            state.holidayYearsLoaded[year] = supplementalAdded;
            if (supplementalAdded) {
              rememberHolidayLoadSource(year, 'Official holiday supplement table');
              writeHolidayDataToClientCache(year, buildHolidayEnvelopeFromState(year, 'Official holiday supplement table'));
              buildMonthCalendar();
            } else {
              state.holidayLoadSources[year] = 'No matching holiday rows';
            }
          });
      }
  
      /* +----------------------------------+
       * + loadHolidayDataForYear           +
       * +----------------------------------+ */
      function loadHolidayDataForYear(year) {
        year = Number(year);
        if (!year || state.holidayYearsLoaded[year] || state.holidayYearsLoading[year]) return;

        clearHolidayDataForYear(year);
        state.holidayYearsLoading[year] = true;
        if (loadHolidayDataFromClientCache(year)) return;

        // Show confirmed replacement holidays immediately, then let the
        // faster server/API load fill the rest of the year.
        if (mergeOfficialHolidaySupplementalData(year)) buildMonthCalendar();

        if (!hasVercelBackend()) {
          loadHolidayDataForYearFromBrowser(year);
          return;
        }

        hoagApi.run
          .withSuccessHandler(function (envelope) {
            var serverAdded = mergeHolidayData(envelope, year);
            var supplementalAdded = mergeOfficialHolidaySupplementalData(year);
            var loaded = serverAdded || supplementalAdded;
            state.holidayYearsLoading[year] = false;
            state.holidayYearsLoaded[year] = loaded;

            if (loaded) {
              rememberHolidayLoadSource(year, (envelope && envelope.fromCache ? 'Cached ' : '') + ((envelope && envelope.sourceName) || 'Vercel holiday service') + ' + official supplement table');
              writeHolidayDataToClientCache(year, buildHolidayEnvelopeFromState(year, state.holidayLoadSources[year]));
              buildMonthCalendar();
              return;
            }

            loadHolidayDataForYearFromBrowser(year);
          })
          .withFailureHandler(function (error) {
            console.warn('Holiday server load failed, trying browser fallback:', error && error.message ? error.message : error);
            loadHolidayDataForYearFromBrowser(year);
          })
          .getMalaysiaHolidayData(year);
      }
  
      /* +----------------------------------+
       * + ensureHolidayDataForView         +
       * +----------------------------------+ */
      function ensureHolidayDataForView() {
        loadHolidayDataForYear(state.viewDate.getFullYear());
      }
  
      /* +----------------------------------+
       * + getVisibleRowsForSelection       +
       * +----------------------------------+ */
      function getVisibleRowsForSelection() {
        return getEditableRowsForDate(state.selectedDate, readLocalRoster());
      }
  
      /* +----------------------------------+
       * + setRosterStore                   +
       * +----------------------------------+ */
      function setRosterStore(store) {
        var touchYears = {};
        getYearsFromRoster(store).forEach(function (year) { addRosterYear(touchYears, year); });
        addRosterYear(touchYears, state.selectedDate && state.selectedDate.getFullYear());
        addRosterYear(touchYears, state.viewDate && state.viewDate.getFullYear());
        writeLocalRoster(store, Object.keys(touchYears).sort().map(Number));
        state.rosterCloudStore = normalizeRoster(store);
        state.rosterLocalRevision += 1;
        RosterSync.localSave();
      }
  
      /* +----------------------------------+
       * + scheduleMonthCalendarBuild       +
       * +----------------------------------+ */
      function scheduleMonthCalendarBuild() {
        if (state.rosterCalendarRenderQueued) return;
        state.rosterCalendarRenderQueued = true;
        (window.requestAnimationFrame || function (callback) { return window.setTimeout(callback, 1000 / 60); })(function () {
          state.rosterCalendarRenderQueued = false;
          buildMonthCalendar();
        });
      }
  
      /* +----------------------------------+
       * + saveRosterRows                   +
       * +----------------------------------+ */
      function saveRosterRows(rows, options) {
        var store = readAllLocalRoster();
        var selectedKey = dateKey(state.selectedDate);
        var grouped = {};
        options = options || {};
        state.rosterDirtyDates = state.rosterDirtyDates || {};
        state.rosterDirtyDates[selectedKey] = true;
  
        (Array.isArray(rows) ? rows : []).forEach(function (row) {
          row = row && typeof row === 'object' ? row : {};
          var key = getRowDateKey(row, state.selectedDate);
          var item = cloneObject(row);
          item.time = key;
          item.unit = item.unit || '';
          item.originalStaff = getOriginalStaffForRow(item, dateFromKey(key, state.selectedDate));
          item.task = item.task || 'ON CALL';
          item.note = item.note || '';
          item.assigned = isAssignedRow(item);
          state.rosterDirtyDates[key] = true;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        });
  
        if (options.replaceSelectedDate) delete store[selectedKey];
  
        Object.keys(grouped).forEach(function (key) {
          var payload = {};
          payload[key] = grouped[key];
          var cleanedRows = normalizeRoster(payload)[key] || [];
          if (cleanedRows.length) store[key] = cleanedRows;
          else delete store[key];
        });
  
        setRosterStore(store);
        /* Keep the editable roster/change layer independent from the default
           rotation. The PDF 'after' view reads this layer only. */
        try { safeStorageSet('labDailyRosterChangesV1_' + getRosterStorageUserId(), JSON.stringify(store)); } catch (e) {}
        scheduleMonthCalendarBuild();
      }
  
      /* +----------------------------------+
       * + saveSelectedDate                 +
       * +----------------------------------+ */
      function saveSelectedDate(rows) {
        var selectedKey = dateKey(state.selectedDate);
        saveRosterRows((Array.isArray(rows) ? rows : []).map(function (row) {
          var item = cloneObject(row);
          item.time = selectedKey;
          return item;
        }), { replaceSelectedDate: true });
      }
  
      /* +----------------------------------+
       * + scheduleInputSave                +
       * +----------------------------------+ */
      function scheduleInputSave() {
        window.clearTimeout(state.rosterInputSaveTimer);
        state.rosterInputSaveTimer = window.setTimeout(function () {
          state.rosterInputSaveTimer = null;
          saveRosterRows(readRowsFromDom(), { replaceSelectedDate: true });
        }, 500);
      }
  
      /* +----------------------------------+
       * + readRowsFromDom                  +
       * +----------------------------------+ */
      function readRowsFromDom(options) {
        var list = $('dailyRosterList');
        options = options || {};
        if (!list) return [];
        return Array.prototype.map.call(list.querySelectorAll('.daily-roster-row'), function (row) {
          var timeInput = row.querySelector('[data-field="time"]');
          var staffInput = row.querySelector('[data-field="staff"]');
          var originalStaffInput = row.querySelector('[data-field="originalStaff"]');
          var taskInput = row.querySelector('[data-field="task"]');
          var timeKey = /^\d{4}-\d{2}-\d{2}$/.test((timeInput || {}).value || '') ? timeInput.value : dateKey(state.selectedDate);
          var rowDate = dateFromKey(timeKey, state.selectedDate);
          var isEditingAssignment = row.dataset.editingAssigned === '1';
          var selectedStaff = cleanText((staffInput || {}).value || '');
          var savedAssignedStaff = cleanText(row.dataset.savedAssignedStaff || '');
          var shouldCommitEdit = isEditingAssignment && options.commitEditingRow === row;
          return {
            time: timeKey,
            unit: '',
            originalStaff: (originalStaffInput || {}).value || row.dataset.originalStaff || getDefaultStaffForDate(rowDate) || '',
            staff: isEditingAssignment && !shouldCommitEdit ? (savedAssignedStaff || selectedStaff) : selectedStaff,
            task: (taskInput || {}).value || 'ON CALL',
            note: '',
            assigned: row.dataset.assigned === '1' || isEditingAssignment
          };
        });
      }
  
      /* +----------------------------------+
       * + formatDateLabel                  +
       * +----------------------------------+ */
      function formatDateLabel(dateObj) {
        return pad2(dateObj.getDate()) + ' ' + config.fullMonthNames[dateObj.getMonth()] + ' ' + dateObj.getFullYear() + ' | ' + config.weekdayNames[dateObj.getDay()];
      }

      /* +----------------------------------+
       * + getOnCallScheduleStaffForDate    +
       * +----------------------------------+ */
      function getOnCallScheduleStaffForDate(dateObj, mode) {
        var staffState = getCalendarStaffStateForDate(dateObj);
        if (mode === 'after') return staffState.assignedStaff || staffState.originalStaff || '';
        return staffState.originalStaff || '';
      }

      /* +----------------------------------+
       * + getOnCallScheduleHolidayText     +
       * +----------------------------------+ */
      function getOnCallScheduleHolidayText(dateObj) {
        var entries = getHolidayEntriesForDate(dateObj).filter(function (entry) {
          var regions = Array.isArray(entry && entry.regions) ? entry.regions.map(cleanText) : [];
          var displayRegions = cleanText(entry && entry.displayRegions).toUpperCase();
          return regions.indexOf('National') !== -1 ||
            regions.indexOf('Selangor') !== -1 ||
            /\bNATIONAL\b/.test(displayRegions) ||
            /\bSELANGOR\b/.test(displayRegions);
        });
        var label = entries.map(function (entry) {
          return getHolidayBadgeData(entry).name;
        }).filter(Boolean).join(' / ');
        var upper = cleanText(label).toUpperCase();
        if (!upper) return '';
        if (upper.indexOf('AGONG') !== -1) return 'HARI KEPUTERAAN AGONG';
        if (upper.indexOf('AWAL MUHARRAM') !== -1) return 'AWAL MUHARRAM';
        if (upper.indexOf('RAYA AIDILFITRI') !== -1 || upper.indexOf('AIDILFITRI') !== -1) return 'HARI RAYA AIDILFITRI';
        if (upper.indexOf('RAYA AIDILADHA') !== -1 || upper.indexOf('RAYA HAJI') !== -1 || upper.indexOf('AIDILADHA') !== -1) return 'HARI RAYA AIDILADHA';
        if (upper.indexOf('TAHUN BARU CINA') !== -1) return 'TAHUN BARU CINA';
        if (upper.indexOf('DEEPAVALI') !== -1) return 'DEEPAVALI';
        if (upper.indexOf('WESAK') !== -1) return 'HARI WESAK';
        if (upper.indexOf('KRISMAS') !== -1) return 'HARI KRISMAS';
        if (upper.indexOf('PEKERJA') !== -1) return 'HARI PEKERJA';
        if (upper.indexOf('MALAYSIA') !== -1) return 'HARI MALAYSIA';
        if (upper.indexOf('KEBANGSAAN') !== -1 || upper.indexOf('MERDEKA') !== -1) return 'HARI KEBANGSAAN';
        return upper
          .replace(/^[A-Z ]+\s+\*\s+/, '')
          .replace(/\b(?:NATIONAL|SELANGOR|HOLIDAY|PUBLIC|DAY|CUTI)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 22);
      }

      /* +----------------------------------+
       * + escapePdfText                    +
       * +----------------------------------+ */
      function escapePdfText(value) {
        return String(value == null ? '' : value)
          .replace(/[^\x20-\x7E]/g, ' ')
          .replace(/\\/g, '\\\\')
          .replace(/\(/g, '\\(')
          .replace(/\)/g, '\\)')
          .replace(/\s+/g, ' ')
          .trim();
      }

      /* +----------------------------------+
       * + estimatePdfTextWidth             +
       * +----------------------------------+ */
      /* +----------------------------------+
       * + getPdfCharWidth                  +
       * +----------------------------------+ */
      function getPdfCharWidth(charValue, bold) {
        var widths = {
          ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
          '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556, '8': 556, '9': 556, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015,
          'A': 667, 'B': 667, 'C': 722, 'D': 722, 'E': 667, 'F': 611, 'G': 778, 'H': 722, 'I': 278, 'J': 500, 'K': 667, 'L': 556, 'M': 833, 'N': 722, 'O': 778, 'P': 667, 'Q': 778, 'R': 722, 'S': 667, 'T': 611, 'U': 722, 'V': 667, 'W': 944, 'X': 667, 'Y': 667, 'Z': 611,
          '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556, '`': 333,
          'a': 556, 'b': 556, 'c': 500, 'd': 556, 'e': 556, 'f': 278, 'g': 556, 'h': 556, 'i': 222, 'j': 222, 'k': 500, 'l': 222, 'm': 833, 'n': 556, 'o': 556, 'p': 556, 'q': 556, 'r': 333, 's': 500, 't': 278, 'u': 556, 'v': 500, 'w': 722, 'x': 500, 'y': 500, 'z': 500,
          '{': 334, '|': 260, '}': 334, '~': 584
        };
        var boldWidths = {
          "'": 278,
          'A': 722, 'B': 722, 'J': 556, 'K': 722, 'L': 611,
          'a': 556, 'b': 611, 'c': 556, 'd': 611, 'e': 556, 'f': 333, 'g': 611, 'h': 611, 'i': 278, 'j': 278, 'k': 556, 'l': 278, 'm': 889, 'n': 611, 'o': 611, 'p': 611, 'q': 611, 'r': 389, 's': 556, 't': 333, 'u': 611, 'v': 556, 'w': 778, 'x': 556, 'y': 556
        };
        var width = bold && boldWidths[charValue] ? boldWidths[charValue] : widths[charValue];
        if (!width) width = /[A-Z]/.test(charValue) ? 667 : 500;
        return width;
      }

      /* +----------------------------------+
       * + estimatePdfTextWidth             +
       * +----------------------------------+ */
      function estimatePdfTextWidth(text, size, bold) {
        text = escapePdfText(text);
        try {
          if (document && document.createElement) {
            estimatePdfTextWidth._canvas = estimatePdfTextWidth._canvas || document.createElement('canvas');
            var context = estimatePdfTextWidth._canvas.getContext && estimatePdfTextWidth._canvas.getContext('2d');
            if (context && context.measureText) {
              context.font = (bold ? '700 ' : '400 ') + size + 'px Helvetica, Arial, sans-serif';
              return context.measureText(text).width;
            }
          }
        } catch (error) {
          /* Fall back to PDF width table when canvas measurement is unavailable. */
        }
        var units = 0;
        for (var i = 0; i < text.length; i += 1) {
          units += getPdfCharWidth(text.charAt(i), bold);
        }
        return units * size / 1000;
      }

      /* +----------------------------------+
       * + appendPdfText                    +
       * +----------------------------------+ */
      function appendPdfText(commands, text, x, y, size, options) {
        options = options || {};
        text = escapePdfText(text);
        if (!text) return;
        if (options.align === 'center') x -= estimatePdfTextWidth(text, size, options.bold) / 2;
        if (options.align === 'right') x -= estimatePdfTextWidth(text, size, options.bold);
        commands.push('BT /' + (options.bold ? 'F2' : 'F1') + ' ' + size + ' Tf ' + x.toFixed(2) + ' ' + (595.28 - y).toFixed(2) + ' Td (' + text + ') Tj ET');
      }

      /* +----------------------------------+
       * + appendPdfStruckCenteredText      +
       * +----------------------------------+ */
      function appendPdfStruckCenteredText(commands, text, x, y, size, options) {
        options = options || {};
        var width = estimatePdfTextWidth(text, size, options.bold) + 3.5;
        appendPdfText(commands, text, x, y, size, { align: 'center', bold: options && options.bold });
        appendPdfLine(commands, x - (width / 2), y - (size * .35), x + (width / 2), y - (size * .35), .55);
      }

      /* +----------------------------------+
       * + appendPdfLine                    +
       * +----------------------------------+ */
      function appendPdfLine(commands, x1, y1, x2, y2, width) {
        commands.push((width || .6).toFixed(2) + ' w ' + x1.toFixed(2) + ' ' + (595.28 - y1).toFixed(2) + ' m ' + x2.toFixed(2) + ' ' + (595.28 - y2).toFixed(2) + ' l S');
      }

      /* +----------------------------------+
       * + appendPdfRect                    +
       * +----------------------------------+ */
      function appendPdfRect(commands, x, y, width, height, lineWidth) {
        commands.push((lineWidth || .6).toFixed(2) + ' w ' + x.toFixed(2) + ' ' + (595.28 - y - height).toFixed(2) + ' ' + width.toFixed(2) + ' ' + height.toFixed(2) + ' re S');
      }

      /* +----------------------------------+
       * + wrapPdfText                      +
       * +----------------------------------+ */
      function wrapPdfText(text, maxChars, maxLines) {
        var words = escapePdfText(text).split(/\s+/).filter(Boolean);
        var lines = [];
        var current = '';
        words.forEach(function (word) {
          var next = current ? current + ' ' + word : word;
          if (next.length > maxChars && current) {
            lines.push(current);
            current = word;
          } else {
            current = next;
          }
        });
        if (current) lines.push(current);
        if (maxLines && lines.length > maxLines) {
          lines = lines.slice(0, maxLines);
          lines[lines.length - 1] = lines[lines.length - 1].slice(0, Math.max(0, maxChars - 3)) + '...';
        }
        return lines;
      }

      /* +----------------------------------+
       * + appendPdfWrappedCenteredText     +
       * +----------------------------------+ */
      function appendPdfWrappedCenteredText(commands, text, x, y, width, size, options) {
        var maxChars = Math.max(4, Math.floor(width / (size * .55)));
        wrapPdfText(text, maxChars, options && options.maxLines || 2).forEach(function (line, index) {
          appendPdfText(commands, line, x + width / 2, y + (index * (size + 2)), size, { align: 'center', bold: options && options.bold });
        });
      }

      /* +----------------------------------+
       * + appendPdfHolidayText             +
       * +----------------------------------+ */
      function appendPdfHolidayText(commands, text, x, y, width, size) {
        text = cleanText(text);
        if (!text) return;
        appendPdfText(commands, '(' + text + ')', x + width / 2, y, size, { align: 'center', bold: true });
      }

      /* +----------------------------------+
       * + buildPdfDocument                 +
       * +----------------------------------+ */
      function buildPdfDocument(commands) {
        var stream = commands.join('\n');
        var objects = [
          '<< /Type /Catalog /Pages 2 0 R >>',
          '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
          '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
          '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
          '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
          '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream'
        ];
        var pdf = '%PDF-1.4\n';
        var offsets = [0];
        objects.forEach(function (body, index) {
          offsets.push(pdf.length);
          pdf += (index + 1) + ' 0 obj\n' + body + '\nendobj\n';
        });
        var xref = pdf.length;
        pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
        for (var i = 1; i < offsets.length; i += 1) {
          pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
        }
        pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
        return pdf;
      }

      /* +----------------------------------+
       * + buildOnCallSchedulePdf           +
       * +----------------------------------+ */
      function buildOnCallSchedulePdf(mode) {
        var commands = [];
        var monthDate = state.viewDate || new Date();
        var year = monthDate.getFullYear();
        var month = monthDate.getMonth();
        var monthName = config.fullMonthNames[month];
        var titleText = (mode === 'after' ? 'PINDAAN ' : '') + 'JADUAL TUGAS "ON CALL" ' + monthName + ' ' + year;
        var gridX = 36;
        var gridY = 84;
        var gridW = 770;
        var headerH = 35;
        var colW = gridW / 7;
        var weekdays = ['ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT', 'SABTU', 'AHAD'];
        var firstDay = (new Date(year, month, 1, 12, 0, 0).getDay() + 6) % 7;
        var daysInMonth = new Date(year, month + 1, 0, 12, 0, 0).getDate();
        var weekRows = Math.max(5, Math.ceil((firstDay + daysInMonth) / 7));
        var rowH = weekRows > 5 ? 45 : 52;
        var gridBottomY = gridY + headerH + (rowH * weekRows);
        var detailTopY = gridBottomY + 22;
        var staffContacts = isDecemberOnCallRotationDate(monthDate)
          ? [
            ['1. SURIANI BT RAMLI', 'NO. TEL', '010-2902351'],
            ['2. JAPIDI NOIN', 'NO. TEL', '014-8682707'],
            ['3. SHOUNNA NELSON CHIEW', 'NO. TEL', '011-61172405'],
            ['4. NAZRAN', 'NO. TEL', ''],
            ['5. PN NUR LIZA BINTI HAJI MAT ISA', 'NO. TEL', '019-2570482'],
            ['6. PN JAYANTHI A/P SATHIVELU', 'NO. TEL', '010-2937300']
          ]
          : isNewDailyRosterRotationDate(monthDate)
          ? [
            ['1. PN NUR LIZA BINTI HAJI MAT ISA', 'NO. TEL', '019-2570482'],
            ['2. PN JAYANTHI A/P SATHIVELU', 'NO. TEL', '010-2937300'],
            ['3. SURIANI BT RAMLI', 'NO. TEL', '010-2902351'],
            ['4. JAPIDI NOIN', 'NO. TEL', '014-8682707'],
            ['5. SHOUNNA NELSON CHIEW', 'NO. TEL', '011-61172405']
          ]
          : [
            ['1. PN NUR LIZA BINTI HAJI MAT ISA', 'NO. TEL', '019-2570482'],
            ['2. PN JAYANTHI A/P SATHIVELU', 'NO. TEL', '010-2937300'],
            ['3. SURIANI BT RAMLI', 'NO. TEL', '010-2902351'],
            ['4. TOMMY BIN JAIMIN', 'NO. TEL', '011-33139753'],
            ['5. JAPIDI NOIN', 'NO. TEL', '014-8682707'],
            ['6. SHOUNNA NELSON CHIEW', 'NO. TEL', '011-61172405']
          ];
        var workRows = [
          ['* Waktu bekerja biasa (Isnin hingga Jumaat)', '8.00 pagi - 5.00 petang'],
          ['* Kerja lebih masa (Isnin hingga Jumaat)', '5.00 petang - 12.00 pagi'],
          ['  (Sabtu/Ahad/Kelepasan Am)', '8.00 pagi - 10.00 malam'],
          ['* Tugas atas panggilan (Isnin hingga Jumaat)', '12.00 pagi - 8.00 pagi'],
          ['  (Sabtu/Ahad/Kelepasan Am)', '10.00 malam - 8.00 pagi']
        ];

        appendPdfText(commands, titleText, 420.95, 23, 10, { align: 'center', bold: true });
        appendPdfText(commands, 'UNIT PATOLOGI', 420.95, 37, 9, { align: 'center', bold: true });
        appendPdfText(commands, 'HOSPITAL ORANG ASLI GOMBAK', 420.95, 50, 9, { align: 'center', bold: true });
        appendPdfText(commands, 'HOAG/PAT/JS/OT24-01', 805, 32, 7.5, { align: 'right' });

        appendPdfRect(commands, gridX, gridY, gridW, headerH + (rowH * weekRows), .75);
        for (var c = 1; c < 7; c += 1) appendPdfLine(commands, gridX + (colW * c), gridY, gridX + (colW * c), gridBottomY, .55);
        appendPdfLine(commands, gridX, gridY + headerH, gridX + gridW, gridY + headerH, .65);
        for (var r = 1; r < weekRows; r += 1) appendPdfLine(commands, gridX, gridY + headerH + (rowH * r), gridX + gridW, gridY + headerH + (rowH * r), .45);
        weekdays.forEach(function (weekday, index) {
          appendPdfText(commands, weekday, gridX + (colW * index) + (colW / 2), gridY + 21, 8, { align: 'center', bold: true });
        });

        for (var day = 1; day <= daysInMonth; day += 1) {
          var slot = firstDay + day - 1;
          var row = Math.floor(slot / 7);
          var col = slot % 7;
          var cellX = gridX + (colW * col);
          var cellY = gridY + headerH + (rowH * row);
          var cellDate = new Date(year, month, day, 12, 0, 0);
          var staffState = getCalendarStaffStateForDate(cellDate);
          var staff = getOnCallScheduleStaffForDate(cellDate, mode);
          var holiday = getOnCallScheduleHolidayText(cellDate);
          var isChangedAfterAssign = mode === 'after' && staffState.isChanged;
          appendPdfText(commands, String(day), cellX + colW / 2, cellY + 13, 7.6, { align: 'center', bold: true });
          if (isChangedAfterAssign) {
            appendPdfStruckCenteredText(commands, staffState.originalStaff, cellX + colW / 2, cellY + 27, staffState.originalStaff.length > 12 ? 6.2 : 6.8, { bold: true });
            appendPdfWrappedCenteredText(commands, staffState.assignedStaff, cellX + 5, cellY + 38, colW - 10, staffState.assignedStaff.length > 12 ? 6.8 : 7.2, { bold: true, maxLines: 1 });
          } else {
            appendPdfWrappedCenteredText(commands, staff, cellX + 5, cellY + 29, colW - 10, staff && staff.length > 12 ? 7.2 : 7.8, { bold: true, maxLines: 1 });
          }
          if (holiday) appendPdfHolidayText(commands, holiday, cellX, cellY + (isChangedAfterAssign ? (rowH > 48 ? 47 : 43) : 42), colW, isChangedAfterAssign ? 5.4 : 6.3);
        }

        staffContacts.forEach(function (item, index) {
          var y = detailTopY + (index * 12);
          appendPdfText(commands, item[0], 42, y, 7.2, {});
          appendPdfText(commands, item[1], 280, y, 7.2, {});
          appendPdfText(commands, ':', 342, y, 7.2, {});
          appendPdfText(commands, item[2], 373, y, 7.2, {});
        });

        workRows.forEach(function (item, index) {
          var y = detailTopY + (index * 12);
          appendPdfText(commands, item[0], 512, y, 6.8, {});
          appendPdfText(commands, ':', 717, y, 6.8, {});
          appendPdfText(commands, item[1], 733, y, 6.8, {});
        });
        appendPdfText(commands, '* Segala pertukaran perlu dimaklumkan pada ketua unit untuk makluman.', 512, detailTopY + 61, 6.8, {});

        var signMarginX = 70;
        var signW = 220;
        var signGap = (841.89 - (signMarginX * 2) - (signW * 3)) / 2;
        var signX1 = signMarginX;
        var signX2 = signX1 + signW + signGap;
        var signX3 = signX2 + signW + signGap;
        appendPdfText(commands, 'DISEDIAKAN :', signX1, 508, 7.2, {});
        appendPdfText(commands, 'DISEMAK :', signX2, 508, 7.2, {});
        appendPdfText(commands, 'DILULUSKAN :', signX3, 508, 7.2, {});
        appendPdfLine(commands, signX1, 548, signX1 + signW, 548, .45);
        appendPdfLine(commands, signX2, 548, signX2 + signW, 548, .45);
        appendPdfLine(commands, signX3, 548, signX3 + signW, 548, .45);
        appendPdfText(commands, '(JAYANTHI A/P SATHIVELU)', signX1, 558, 6.7, { bold: true });
        appendPdfText(commands, 'TEKNIKAL UNIT MAKMAL PATOLOGI', signX1, 567, 6.1, {});
        appendPdfText(commands, 'JURUTEKNOLOGI MAKMAL PERUBATAN U6', signX1, 576, 6.1, {});
        appendPdfText(commands, 'HOSPITAL ORANG ASLI GOMBAK', signX1, 585, 6.1, {});
        appendPdfText(commands, '(DR REGIXIANA A/P AYOB)', signX2, 558, 6.7, { bold: true });
        appendPdfText(commands, 'MMC: 85375', signX2, 567, 6.1, {});
        appendPdfText(commands, 'PEGAWAI PERUBATAN UD10', signX2, 576, 6.1, {});
        appendPdfText(commands, 'PEGAWAI PERUBATAN TADBIR URUS KLINIKAL 2', signX2, 585, 6.1, {});
        appendPdfText(commands, '(DR IZANDIS BIN MOHAMED SAYED)', signX3, 558, 6.7, { bold: true });
        appendPdfText(commands, 'MMC: 36384 & 132232', signX3, 567, 6.1, {});
        appendPdfText(commands, 'PAKAR PERUBATAN KESIHATAN AWAM UD15', signX3, 576, 6.1, {});
        appendPdfText(commands, 'PENGARAH HOSPITAL', signX3, 585, 6.1, {});

        return buildPdfDocument(commands);
      }

      /* +----------------------------------+
       * + downloadPdfFile                  +
       * +----------------------------------+ */
      function downloadPdfFile(filename, pdfText) {
        var blob = new Blob([pdfText], { type: 'application/pdf' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      }

      /* +----------------------------------+
       * + exportMonthlySchedulePdfs        +
       * +----------------------------------+ */
function exportMonthlySchedulePdfs() {
  flushPendingInputSave();
  buildMonthCalendar();
  var monthDate = state.viewDate || new Date();
  var slug = config.fullMonthNames[monthDate.getMonth()].toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  downloadPdfFile('ROSTER_' + slug + '.pdf', buildOnCallSchedulePdf('before'));
  window.setTimeout(function () {
    downloadPdfFile('ROSTER_CHANGE_' + slug + '.pdf', buildOnCallSchedulePdf('after'));
  }, 250);
  if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
    ActivityTracker.track('ROSTER_EXPORT_PDF', 'Downloaded monthly on-call schedule PDFs.', { page: 'calendar', month: slug }, { dedupeMs: 2000 });
  }
}
  
  
      /* +----------------------------------+
       * + createStaffSelect                +
       * +----------------------------------+ */
      function createStaffSelect(value) {
        var select = document.createElement('select');
        select.setAttribute('data-field', 'staff');
  
        var placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Select staff';
        select.appendChild(placeholder);
  
        config.defaultStaffNames.forEach(function (staffName) {
          var option = document.createElement('option');
          option.value = staffName;
          option.textContent = staffName;
          select.appendChild(option);
        });
  
        if (value && config.defaultStaffNames.indexOf(value) === -1) {
          var customOption = document.createElement('option');
          customOption.value = value;
          customOption.textContent = value;
          select.appendChild(customOption);
        }
  
        select.value = value || '';
        return select;
      }
  
      /* +----------------------------------+
       * + createStaffCell                  +
       * +----------------------------------+ */
      function createStaffCell(originalStaff, assignedStaff, isAssigned) {
        originalStaff = cleanText(originalStaff);
        assignedStaff = cleanText(assignedStaff) || originalStaff;
  
        if (!isAssigned) {
          var select = createStaffSelect(assignedStaff || originalStaff);
          select.setAttribute('aria-label', 'Staff Name');
          return select;
        }
  
        var wrapper = document.createElement('div');
        var originalInput = document.createElement('input');
        var assignedInput = document.createElement('input');
        var singleLine = document.createElement('div');
  
        wrapper.className = 'daily-roster-staff-pair';
        wrapper.setAttribute('aria-label', 'Assigned staff ' + (assignedStaff || 'None'));
  
        originalInput.type = 'hidden';
        originalInput.value = originalStaff;
        originalInput.setAttribute('data-field', 'originalStaff');
  
        assignedInput.type = 'hidden';
        assignedInput.value = assignedStaff;
        assignedInput.setAttribute('data-field', 'staff');
  
        singleLine.className = 'daily-roster-staff-single';
        singleLine.textContent = assignedStaff || '-';
  
        wrapper.appendChild(originalInput);
        wrapper.appendChild(assignedInput);
        wrapper.appendChild(singleLine);
        return wrapper;
      }
  
      /* +----------------------------------+
       * + createRosterRow                  +
       * +----------------------------------+ */
      function createRosterRow(data) {
        data = data || {};
        var isAssigned = isTruthy(data.assigned);
        var isEditingAssignment = isTruthy(data.editingAssigned);
        var row = document.createElement('div');
        row.className = 'daily-roster-row';
        if (isAssigned) {
          row.classList.add('is-assigned');
          row.dataset.assigned = '1';
        }
        if (isEditingAssignment) {
          row.classList.add('is-editing-assignment');
          row.dataset.editingAssigned = '1';
          row.dataset.assigned = '0';
        }
  
        var dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.placeholder = 'YYYY-MM-DD';
        dateInput.value = /^\d{4}-\d{2}-\d{2}$/.test(data.time || '') ? data.time : dateKey(state.selectedDate);
        dateInput.maxLength = 50;
        dateInput.setAttribute('data-field', 'time');
        dateInput.setAttribute('aria-label', 'Date');
        dateInput.disabled = true;
        dateInput.tabIndex = -1;
  
        var originalStaff = getOriginalStaffForRow(data, dateFromKey(dateInput.value, state.selectedDate));
        var assignedStaff = cleanText(data.staff) || originalStaff;
        var showEditAction = isAssigned && isTruthy(data.showEditAction);
        var staffCell = createStaffCell(originalStaff, assignedStaff, isAssigned && !isEditingAssignment);
        row.dataset.originalStaff = originalStaff;
  
        var taskInput = document.createElement('input');
        taskInput.type = 'text';
        taskInput.placeholder = 'ON CALL';
        taskInput.value = data.task || 'ON CALL';
        taskInput.maxLength = 200;
        taskInput.readOnly = true;
        taskInput.setAttribute('data-field', 'task');
        taskInput.setAttribute('aria-label', 'Task or Duty');
        if (isAssigned) {
          taskInput.tabIndex = -1;
        }
  
        var noteInput = document.createElement('button');
        noteInput.type = 'button';
        noteInput.className = 'daily-roster-assign-btn';
        noteInput.textContent = isEditingAssignment ? 'SAVE' : (showEditAction ? 'EDIT' : (isAssigned ? 'ASSIGNED' : 'ASSIGN'));
        noteInput.setAttribute('data-roster-action', isAssigned && !isEditingAssignment ? 'edit-row' : 'assign-row');
        noteInput.setAttribute('aria-label', isEditingAssignment ? 'Save assigned staff' : (showEditAction ? 'Edit assigned staff' : (isAssigned ? 'Assigned' : 'Assign')));
        if (isAssigned && !showEditAction) {
          noteInput.classList.add('is-locked');
          noteInput.disabled = true;
        }
  
        var deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'roster-delete-btn';
        deleteButton.textContent = '×';
        if (isEditingAssignment) {
          deleteButton.classList.add('roster-cancel-edit-btn');
          deleteButton.setAttribute('aria-label', 'Cancel assignment edit');
          deleteButton.setAttribute('title', 'Cancel edit');
          deleteButton.setAttribute('data-roster-action', 'cancel-edit');
        } else {
          deleteButton.setAttribute('aria-label', 'Delete roster row');
          deleteButton.setAttribute('data-roster-action', 'delete-row');
          if (isAssigned) {
            deleteButton.disabled = true;
            deleteButton.setAttribute('aria-hidden', 'true');
            deleteButton.tabIndex = -1;
          }
        }
  
        row.appendChild(dateInput);
        row.appendChild(staffCell);
        row.appendChild(taskInput);
        row.appendChild(noteInput);
        row.appendChild(deleteButton);
        row._labappFocusTarget = staffCell && staffCell.tagName === 'SELECT' ? staffCell : dateInput;
        return row;
      }
  
      /* +----------------------------------+
       * + replaceAssignedRowWithEditor     +
       * +----------------------------------+ */
      function replaceAssignedRowWithEditor(row) {
        if (!row) return;
        window.clearTimeout(state.rosterInputSaveTimer);
        state.rosterInputSaveTimer = null;
        var timeInput = row.querySelector('[data-field="time"]');
        var staffInput = row.querySelector('[data-field="staff"]');
        var originalStaffInput = row.querySelector('[data-field="originalStaff"]');
        var taskInput = row.querySelector('[data-field="task"]');
        var timeKey = /^\d{4}-\d{2}-\d{2}$/.test((timeInput || {}).value || '') ? timeInput.value : dateKey(state.selectedDate);
        var rowDate = dateFromKey(timeKey, state.selectedDate);
        var editorRow = createRosterRow({
          time: timeKey,
          unit: '',
          originalStaff: (originalStaffInput || {}).value || row.dataset.originalStaff || getDefaultStaffForDate(rowDate) || '',
          staff: (staffInput || {}).value || '',
          task: (taskInput || {}).value || 'ON CALL',
          note: '',
          assigned: false,
          editingAssigned: true
        });
        editorRow.dataset.savedAssignedStaff = cleanText((staffInput || {}).value || '');
        if (row.parentNode) {
          row.parentNode.replaceChild(editorRow, row);
        }
        var staffSelect = editorRow.querySelector('select[data-field="staff"]');
        if (staffSelect) {
          if (window.requestAnimationFrame) {
            window.requestAnimationFrame(function () { staffSelect.focus(); });
          } else {
            window.setTimeout(function () { staffSelect.focus(); }, 0);
          }
        }
      }
  
  
      /* +----------------------------------+
       * + buildRosterList                  +
       * +----------------------------------+ */
      function buildRosterList() {
        var list = $('dailyRosterList');
        var dateLabel = $('calendarSelectedDateLabel');
        var dateSub = $('calendarSelectedDateSub');
        if (!list || !dateLabel || !dateSub) return;
        var rows = getVisibleRowsForSelection();
        dateLabel.textContent = formatDateLabel(state.selectedDate);
        dateSub.textContent = 'Select staff, then press ASSIGN. Use EDIT to change and SAVE to confirm.';
        var fragment = document.createDocumentFragment();
        rows.forEach(function (item) {
          fragment.appendChild(createRosterRow(item));
        });
        list.textContent = '';
        list.appendChild(fragment);
      }
  
      /* +----------------------------------+
       * + buildMonthCalendar               +
       * +----------------------------------+ */
      function buildMonthCalendar() {
        var grid = $('calendarMiniGrid');
        var label = $('calendarCurrentMonthLabel');
        var monthBtn = $('calendarCurrentMonthBtn');
        if (!grid || !label || !monthBtn) return;
  
        var year = state.viewDate.getFullYear();
        var month = state.viewDate.getMonth();
        var todayParts = getAppNowParts();
        var firstDay = (new Date(year, month, 1, 12, 0, 0).getDay() + 6) % 7;
        var daysInMonth = new Date(year, month + 1, 0, 12, 0, 0).getDate();
        var fragment = document.createDocumentFragment();
        var renderedCells = 0;
  
        label.textContent = config.fullMonthNames[month] + ' ' + year;
        monthBtn.textContent = config.fullMonthNames[month] + ' ' + year;
  
        for (var i = 0; i < firstDay; i += 1) {
          var empty = document.createElement('div');
          empty.className = 'calendar-mini-empty';
          fragment.appendChild(empty);
          renderedCells += 1;
        }
  
        for (var day = 1; day <= daysInMonth; day += 1) {
          var cellDate = new Date(year, month, day, 12, 0, 0);
          var cellKey = dateKey(cellDate);
          var cell = document.createElement('button');
          var dayNum = document.createElement('span');
          var staffName = document.createElement('span');
          var staffState = getCalendarStaffStateForDate(cellDate);
          var staffLabel = getCalendarStaffForDate(cellDate);
          var holidayEntries = getHolidayEntriesForDate(cellDate);
          var holidayLabel = getHolidayLabelForDate(cellDate);
  
          cell.type = 'button';
          cell.className = 'calendar-mini-day';
          cell.dataset.date = cellKey;
          cell.setAttribute('aria-label', day + ' ' + config.fullMonthNames[month] + ' ' + year + (staffLabel ? ' ' + staffLabel : '') + (holidayLabel ? ' cuti ' + holidayLabel : ''));
  
          dayNum.className = 'calendar-mini-day-num';
          dayNum.textContent = day;
          cell.appendChild(dayNum);
  
          staffName.className = 'calendar-mini-day-staff';
          if (staffState.isChanged) {
            var originalLine = document.createElement('span');
            var assignedLine = document.createElement('span');
            staffName.classList.add('has-assigned-staff');
            cell.classList.add('has-assigned-staff');
            originalLine.className = 'calendar-mini-day-staff-original';
            originalLine.textContent = staffState.originalStaff;
            assignedLine.className = 'calendar-mini-day-staff-assigned';
            assignedLine.textContent = staffState.assignedStaff;
            staffName.appendChild(originalLine);
            staffName.appendChild(assignedLine);
          } else {
            var currentLine = document.createElement('span');
            currentLine.className = 'calendar-mini-day-staff-current';
            currentLine.textContent = staffState.assignedStaff || staffState.originalStaff || '';
            staffName.appendChild(currentLine);
          }
          cell.appendChild(staffName);
  
          if (holidayEntries.length) {
            cell.classList.add('is-holiday');
            cell.dataset.holidayLabel = holidayLabel;
            cell.dataset.holidayCount = String(holidayEntries.length);
          }
  
          if (cellDate.getDay() === 0 || cellDate.getDay() === 6) {
            cell.classList.add('is-weekend');
          }
  
          if (day === Number(todayParts.day) && month === Number(todayParts.month) - 1 && year === Number(todayParts.year)) {
            cell.classList.add('is-today');
          }
  
          if (state.calendarHasUserSelection && day === state.selectedDate.getDate() && month === state.selectedDate.getMonth() && year === state.selectedDate.getFullYear()) {
            cell.classList.add('is-selected');
          }
  
          fragment.appendChild(cell);
          renderedCells += 1;
        }
  
        while (renderedCells < 42) {
          var trailingEmpty = document.createElement('div');
          trailingEmpty.className = 'calendar-mini-empty';
          fragment.appendChild(trailingEmpty);
          renderedCells += 1;
        }
  
        grid.textContent = '';
        grid.appendChild(fragment);
        renderTodayFloatingCards();
      }
  
      /* +----------------------------------+
       * + render                           +
       * +----------------------------------+ */
      function render() {
        ensureHolidayDataForView();
        buildMonthCalendar();
        buildRosterList();
        renderTodayFloatingCards();
      }
  
      /* +----------------------------------+
       * + changeMonth                      +
       * +----------------------------------+ */
      function changeMonth(direction) {
        flushPendingInputSave();
        var selectedDay = state.selectedDate.getDate();
        state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + direction, 1, 12, 0, 0);
        var daysInMonth = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + 1, 0, 12, 0, 0).getDate();
        state.selectedDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth(), Math.min(selectedDay, daysInMonth), 12, 0, 0);
        state.calendarHasUserSelection = false;
        if ($('calendar') && $('calendar').classList.contains('active')) {
          render();
        } else {
          state.calendarNeedsRefresh = true;
        }
        if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
          ActivityTracker.track('CALENDAR_MONTH', 'Changed calendar month.', { page: 'calendar', calendarDate: dateKey(state.selectedDate) }, { dedupeMs: 2000 });
        }
      }
  
      /* +----------------------------------+
       * + goToday                          +
       * +----------------------------------+ */
      function goToday() {
        flushPendingInputSave();
        var todayParts = getAppNowParts();
        var today = createCalendarDateFromParts(todayParts);
        state.viewDate = new Date(Number(todayParts.year), Number(todayParts.month) - 1, 1, 12, 0, 0);
        state.selectedDate = today;
        state.calendarHasUserSelection = true;
        state.todayKey = dateKeyFromParts(todayParts);
        if ($('calendar') && $('calendar').classList.contains('active')) {
          render();
        } else {
          state.calendarNeedsRefresh = true;
        }
        if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
          ActivityTracker.track('CALENDAR_TODAY', 'Jumped to today in calendar.', { page: 'calendar', calendarDate: dateKey(state.selectedDate) }, { dedupeMs: 2000 });
        }
      }
  
      /* +----------------------------------+
       * + handleDateRollover               +
       * +----------------------------------+ */
      function handleDateRollover(newDateKey, oldDateKey) {
        var selectedWasToday = dateKey(state.selectedDate) === (oldDateKey || state.todayKey);
        state.todayKey = newDateKey || getAppDateKey();
        renderTodayFloatingCards();
        if (!selectedWasToday) return;
        var nowParts = getAppNowParts();
        var now = createCalendarDateFromParts(nowParts);
        state.selectedDate = now;
        state.calendarHasUserSelection = false;
        state.viewDate = new Date(Number(nowParts.year), Number(nowParts.month) - 1, 1, 12, 0, 0);
        var calendarPage = $('calendar');
        if (calendarPage && calendarPage.classList.contains('active')) {
          render();
        } else {
          state.calendarNeedsRefresh = true;
        }
      }
  
      /* +----------------------------------+
       * + addRosterRow                     +
       * +----------------------------------+ */
      function addRosterRow() {
        var list = $('dailyRosterList');
        if (!list) return;
        var defaultStaff = getDefaultStaffForDate(state.selectedDate) || '';
        var row = createRosterRow({ time: dateKey(state.selectedDate), unit: '', originalStaff: defaultStaff, staff: defaultStaff, task: 'ON CALL', note: '', assigned: false });
        list.appendChild(row);
        scheduleInputSave();
        var firstInput = row._labappFocusTarget || null;
        if (firstInput) firstInput.focus();
        if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
          ActivityTracker.track('ROSTER_ADD_ROW', 'Added roster row for ' + dateKey(state.selectedDate) + '.', { page: 'calendar', calendarDate: dateKey(state.selectedDate) }, { dedupeMs: 1500 });
        }
      }
  
      /* +----------------------------------+
       * + clearSelectedDate                +
       * +----------------------------------+ */
      function clearSelectedDate() {
        requestAppConfirm('Clear Roster Date?', 'Clear all roster rows for this date? This cannot be undone.', function () {
          saveSelectedDate([]);
          render();
          if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
            ActivityTracker.track('ROSTER_CLEAR_DATE', 'Cleared roster rows for ' + dateKey(state.selectedDate) + '.', { page: 'calendar', calendarDate: dateKey(state.selectedDate) }, { dedupeMs: 2000 });
          }
        });
      }
  
      /* +----------------------------------+
       * + flushPendingInputSave            +
       * +----------------------------------+ */
      function flushPendingInputSave() {
        if (!state.rosterInputSaveTimer) return;
        window.clearTimeout(state.rosterInputSaveTimer);
        state.rosterInputSaveTimer = null;
        saveRosterRows(readRowsFromDom(), { replaceSelectedDate: true });
      }
  
      /* +----------------------------------+
       * + bindLifecycleFlush               +
       * +----------------------------------+ */
      function bindLifecycleFlush() {
        if (state.rosterFlushBound) return;
        state.rosterFlushBound = true;
        window.addEventListener('pagehide', flushPendingInputSave);
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'hidden') flushPendingInputSave();
        });
        window.addEventListener('beforeunload', flushPendingInputSave);
      }
  
      /* +----------------------------------+
       * + bindDelegatedEvents              +
       * +----------------------------------+ */
      function bindDelegatedEvents() {
        var list = $('dailyRosterList');
        if (list && list.dataset.neoRosterDelegated !== '1') {
          list.dataset.neoRosterDelegated = '1';
          list.addEventListener('input', function (event) {
            if (event.target && event.target.closest('.daily-roster-row.is-assigned, .daily-roster-row.is-editing-assignment')) return;
            if (event.target && event.target.matches('[data-field]')) {
              scheduleInputSave();
            }
          });
          list.addEventListener('change', function (event) {
            if (!event.target || !event.target.matches('[data-field]')) return;
            if (event.target.closest('.daily-roster-row.is-assigned, .daily-roster-row.is-editing-assignment')) return;
            scheduleInputSave();
          });
          list.addEventListener('click', function (event) {
            var editButton = event.target && event.target.closest('[data-roster-action="edit-row"]');
            if (editButton) {
              if (editButton.disabled) return;
              replaceAssignedRowWithEditor(editButton.closest('.daily-roster-row'));
              if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
                ActivityTracker.track('ROSTER_EDIT_ASSIGNMENT', 'Edited assigned roster row for ' + dateKey(state.selectedDate) + '.', { page: 'calendar', calendarDate: dateKey(state.selectedDate) }, { dedupeMs: 1500 });
              }
              return;
            }

            var cancelEditButton = event.target && event.target.closest('[data-roster-action="cancel-edit"]');
            if (cancelEditButton) {
              buildRosterList();
              if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
                ActivityTracker.track('ROSTER_CANCEL_EDIT', 'Cancelled roster assignment edit for ' + dateKey(state.selectedDate) + '.', { page: 'calendar', calendarDate: dateKey(state.selectedDate) }, { dedupeMs: 1500 });
              }
              return;
            }
  
            var assignButton = event.target && event.target.closest('[data-roster-action="assign-row"]');
            if (assignButton) {
              var rowToAssign = assignButton.closest('.daily-roster-row');
              if (rowToAssign && rowToAssign.dataset.assigned === '1' && rowToAssign.dataset.editingAssigned !== '1') return;
              if (assignButton.disabled) return;
              var rowNodes = Array.prototype.slice.call(list.querySelectorAll('.daily-roster-row'));
              var rowIndex = rowNodes.indexOf(rowToAssign);
              var rows = readRowsFromDom({ commitEditingRow: rowToAssign });
              if (rowIndex > -1 && rows[rowIndex]) {
                rows[rowIndex].time = rows[rowIndex].time || dateKey(state.selectedDate);
                rows[rowIndex].unit = rows[rowIndex].unit || '';
                rows[rowIndex].originalStaff = rows[rowIndex].originalStaff || getDefaultStaffForDate(dateFromKey(rows[rowIndex].time, state.selectedDate)) || '';
                rows[rowIndex].staff = rows[rowIndex].staff || rows[rowIndex].originalStaff || '';
                rows[rowIndex].task = rows[rowIndex].task || 'ON CALL';
                rows[rowIndex].note = rows[rowIndex].note || '';
                rows[rowIndex].assigned = true;
              }
              window.clearTimeout(state.rosterInputSaveTimer);
              state.rosterInputSaveTimer = null;
              saveRosterRows(rows, { replaceSelectedDate: true });
              buildRosterList();
              if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
                ActivityTracker.track('ROSTER_ASSIGN', 'Assigned roster row for ' + dateKey(state.selectedDate) + '.', { page: 'calendar', calendarDate: dateKey(state.selectedDate) }, { dedupeMs: 1500 });
              }
              return;
            }
  
            var deleteButton = event.target && event.target.closest('[data-roster-action="delete-row"]');
            if (!deleteButton || deleteButton.disabled) return;
            requestAppConfirm('Delete Roster Row?', 'Delete this roster row? This cannot be undone.', function () {
              var row = deleteButton.closest('.daily-roster-row');
              if (row && row.dataset.assigned !== '1') row.remove();
              window.clearTimeout(state.rosterInputSaveTimer);
              state.rosterInputSaveTimer = null;
              saveRosterRows(readRowsFromDom(), { replaceSelectedDate: true });
              if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
                ActivityTracker.track('ROSTER_DELETE_ROW', 'Deleted roster row for ' + dateKey(state.selectedDate) + '.', { page: 'calendar', calendarDate: dateKey(state.selectedDate) }, { dedupeMs: 1500 });
              }
            });
              });
        }
  
        var grid = $('calendarMiniGrid');
        if (grid && grid.dataset.neoCalendarDelegated !== '1') {
          grid.dataset.neoCalendarDelegated = '1';
          grid.addEventListener('click', function (event) {
            var cell = event.target && event.target.closest('.calendar-mini-day[data-date]');
            if (!cell) return;
            flushPendingInputSave();
            var parts = String(cell.dataset.date).split('-').map(Number);
            state.selectedDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
            state.calendarHasUserSelection = true;
            state.viewDate = new Date(parts[0], parts[1] - 1, 1, 12, 0, 0);
            render();
            window.requestAnimationFrame(function () {
              showHolidayPopoverForDate(state.selectedDate);
            });
            if (typeof ActivityTracker !== 'undefined' && ActivityTracker.track) {
              ActivityTracker.track('CALENDAR_DATE', 'Selected calendar date ' + cell.dataset.date + '.', { page: 'calendar', calendarDate: cell.dataset.date }, { dedupeMs: 1500 });
            }
          });
        }
  
        if (document.body && document.body.dataset.neoHolidayPopupBound !== '1') {
          document.body.dataset.neoHolidayPopupBound = '1';
          document.addEventListener('click', function (event) {
            var target = event.target;
            var popover = $('calendarHolidayPopover');
            if (!popover || !popover.classList.contains('is-visible')) return;
            if (target && target.closest && target.closest('#calendarHolidayPopover')) return;
            if (target && target.closest && target.closest('#calendar .calendar-mini-day.is-holiday[data-date]')) return;
            hideHolidayPopover();
          });
          document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') hideHolidayPopover();
          });
          window.addEventListener('resize', hideHolidayPopover);
          window.addEventListener('scroll', hideHolidayPopover, { capture: true, passive: true });
        }
      }
  
      /* +----------------------------------+
       * + init                             +
       * +----------------------------------+ */
  	    function init() {
  	      validateHolidayRegionParser();
  	      state.todayKey = getAppDateKey();
  	      bindDelegatedEvents();
  	      bindLifecycleFlush();
  	      render();
  	    }
  
      return {
        init: init,
        render: render,
        changeMonth: changeMonth,
        goToday: goToday,
        addRosterRow: addRosterRow,
        exportMonthlySchedulePdfs: exportMonthlySchedulePdfs,
        clearSelectedDate: clearSelectedDate,
        flushPendingInputSave: flushPendingInputSave,
        handleDateRollover: handleDateRollover,
        renderTodayFloatingCards: renderTodayFloatingCards
      };
    })();
  
    /* +----------------------------------+
     * + CLIENT MODULE                    +
     * +----------------------------------+ */
    var RosterSync = (function () {
      var activeRosterStorageId = '';
      var rosterRealtimeRef = null;
      var rosterRealtimeListening = false;
  
      /* +----------------------------------+
       * + extractRosterFromEnvelope        +
       * +----------------------------------+ */
      function extractRosterFromEnvelope(envelope) {
        if (!envelope) return {};
        if (envelope.ok === false) {
          console.warn('Roster endpoint returned error:', envelope.error || envelope);
          return {};
        }
        return normalizeRoster(envelope.roster || envelope.data || envelope);
      }
  
      /* +----------------------------------+
       * + mergeRosters                     +
       * +----------------------------------+ */
      function mergeRosters(cloudRoster, localRoster, dirtyDates) {
        var cloud = normalizeRoster(cloudRoster);
        var local = normalizeRoster(localRoster);
        var merged = {};
        Object.keys(cloud).forEach(function (key) { merged[key] = cloud[key]; });
        var dirtyKeys = dirtyDates && typeof dirtyDates === 'object' ? Object.keys(dirtyDates) : [];
        if (dirtyKeys.length) {
          dirtyKeys.forEach(function (key) {
            if (Array.isArray(local[key]) && local[key].length) merged[key] = local[key];
            else delete merged[key];
          });
          return normalizeRoster(merged);
        }
        Object.keys(local).forEach(function (key) { merged[key] = local[key]; });
        return normalizeRoster(merged);
      }

      /* +----------------------------------+
       * + hasRosterRows                    +
       * +----------------------------------+ */
      function hasRosterRows(roster) {
        return Object.keys(normalizeRoster(roster)).length > 0;
      }

      /* +----------------------------------+
       * + isEmptyCloudBootstrap            +
       * +----------------------------------+ */
      function isEmptyCloudBootstrap(cloudRoster, envelope) {
        return !hasRosterRows(cloudRoster) && !cleanText(envelope && envelope.updatedAt);
      }
  
      /* +----------------------------------+
       * + refreshCalendar                  +
       * +----------------------------------+ */
      function refreshCalendar() {
        /* The floating ON-CALL card is visible outside the Calendar page too.
           Always refresh it when roster data changes; previously it only updated
           after the user opened/clicked the Calendar page. */
        if (typeof Calendar !== 'undefined' && Calendar && typeof Calendar.renderTodayFloatingCards === 'function') {
          Calendar.renderTodayFloatingCards();
        }
        if ($('calendar') && $('calendar').classList.contains('active')) {
          Calendar.render();
        } else {
          state.calendarNeedsRefresh = true;
        }
      }

      function stopRealtimeListener() {
        if (rosterRealtimeRef && rosterRealtimeListening) {
          try { rosterRealtimeRef.off('value', handleRealtimeUpdatedAt); } catch (e) {}
        }
        rosterRealtimeRef = null;
        rosterRealtimeListening = false;
      }

      function handleRealtimeUpdatedAt(snapshot) {
        var remoteStamp = cleanText(snapshot && snapshot.val ? snapshot.val() : '');
        if (!remoteStamp || remoteStamp === state.rosterCloudUpdatedAt) return;
        if (hasRosterEditInProgress() || state.rosterInputSaveTimer || state.rosterCloudSaveTimer || state.rosterCloudSaving || state.rosterCloudLoading) return;
        loadCloudRoster({ silent: true, reason: 'realtime' });
      }

      function startRealtimeListener() {
        if (rosterRealtimeListening || !activeRosterStorageId) return;
        var db = null;
        if (!db) return;
        try {
          rosterRealtimeRef = db.ref('labapp/roster/team/updatedAt');
          rosterRealtimeListening = true;
          rosterRealtimeRef.on('value', handleRealtimeUpdatedAt, function (error) {
            rosterRealtimeListening = false;
            console.warn('Roster realtime updatedAt listener failed:', error);
          });
        } catch (error) {
          rosterRealtimeListening = false;
        }
      }
  
      /* +----------------------------------+
       * + resetSyncState                   +
       * +----------------------------------+ */
      function resetSyncState() {
        clearTimeout(state.rosterCloudSaveTimer);
        clearTimeout(state.rosterCloudPollTimer);
        stopRealtimeListener();
        state.rosterCloudPollTimer = null;
        state.rosterCloudLoading = false;
        state.rosterCloudSaving = false;
        state.rosterLastSavedJson = '';
        state.rosterCloudUpdatedAt = '';
        state.rosterCloudStore = {};
        state.rosterDirtyDates = {};
        rosterMemoryPartitions = {};
      }
  
      /* +----------------------------------+
       * + stopCloudPoll                    +
       * +----------------------------------+ */
      function stopCloudPoll() {
        if (!state.rosterCloudPollTimer) return;
        clearTimeout(state.rosterCloudPollTimer);
        state.rosterCloudPollTimer = null;
      }
  
      /* +----------------------------------+
       * + hasRosterEditInProgress          +
       * +----------------------------------+ */
      function hasRosterEditInProgress() {
        var list = $('dailyRosterList');
        return !!(list && list.querySelector('.daily-roster-row.is-editing-assignment'));
      }

      /* +----------------------------------+
       * + scheduleCloudPoll                +
       * +----------------------------------+ */
      function scheduleCloudPoll() {
        stopCloudPoll();
        if (!hasVercelBackend() || !activeRosterStorageId) return;
        if (rosterRealtimeListening) return;
        state.rosterCloudPollTimer = setTimeout(function () {
          state.rosterCloudPollTimer = null;
          if (document.hidden || hasRosterEditInProgress() || state.rosterInputSaveTimer || state.rosterCloudSaveTimer || state.rosterCloudLoading || state.rosterCloudSaving) {
            scheduleCloudPoll();
            return;
          }
          loadCloudRoster({ silent: true, reason: 'poll' });
        }, config.rosterPollMs);
      }
  
      /* +----------------------------------+
       * + saveCloudRoster                  +
       * +----------------------------------+ */
      function saveCloudRoster(roster, options) {
        options = options || {};
        var requestStorageId = getRosterStorageUserId();
        var normalized = normalizeRoster(roster);
        var json = stableJson(normalized);
        var requestRevision = state.rosterLocalRevision;
        if (!hasVercelBackend()) {
          setSyncStatus('Local only', 'offline');
          return;
        }
        if (state.rosterCloudSaving) {
          clearTimeout(state.rosterCloudSaveTimer);
          setSyncStatus('Saving latest...', 'saving');
          state.rosterCloudSaveTimer = setTimeout(function () {
            state.rosterCloudSaveTimer = null;
            saveCloudRoster(readAllLocalRoster(), { force: true });
          }, 350);
          return;
        }
        if (!options.force && json === state.rosterLastSavedJson) {
          setSyncStatus('Synced', 'synced');
          scheduleCloudPoll();
          return;
        }
        stopCloudPoll();
        state.rosterCloudSaving = true;
        setSyncStatus('Saving...', 'saving');
        hoagApi.run
          .withSuccessHandler(function (result) {
            state.rosterCloudSaving = false;
            if (requestStorageId !== getRosterStorageUserId()) return;
            if (result && result.ok === false) {
              if (result.conflict) {
                var latest = extractRosterFromEnvelope(result);
                var current = readAllLocalRoster();
                var merged = mergeRosters(latest, current, state.rosterDirtyDates);
                writeLocalRoster(merged);
                refreshCalendar();
                state.rosterLastSavedJson = stableJson(latest);
                state.rosterCloudUpdatedAt = String(result.updatedAt || '');
                if (!sameRoster(merged, latest)) {
                  setSyncStatus('Merging roster changes...', 'saving');
                  saveCloudRoster(merged, { force: true });
                  return;
                }
                state.rosterDirtyDates = {};
                setSyncStatus('Synced', 'synced');
                scheduleCloudPoll();
                return;
              }
              setSyncStatus('Save failed', 'error');
              console.warn('Roster cloud save failed:', result.error || result);
              scheduleCloudPoll();
              return;
            }
            state.rosterCloudUpdatedAt = String(result && result.updatedAt || state.rosterCloudUpdatedAt || '');
            if (requestRevision !== state.rosterLocalRevision) {
              state.rosterLastSavedJson = json;
              setSyncStatus('Saving latest...', 'saving');
              saveCloudRoster(readAllLocalRoster(), { force: true });
              return;
            }
            state.rosterDirtyDates = {};
            state.rosterLastSavedJson = json;
            setSyncStatus('Synced', 'synced');
            scheduleCloudPoll();
          })
          .withFailureHandler(function (error) {
            state.rosterCloudSaving = false;
            if (requestStorageId !== getRosterStorageUserId()) return;
            setSyncStatus('Save failed', 'error');
            console.warn('Roster cloud save failed:', error && error.message ? error.message : error);
            scheduleCloudPoll();
          })
          .saveUserRoster(normalized, typeof Auth !== 'undefined' && Auth.getToken ? Auth.getToken() : '', state.rosterCloudUpdatedAt);
      }
  
      /* +----------------------------------+
       * + localSave                        +
       * +----------------------------------+ */
      function localSave() {
        clearTimeout(state.rosterCloudSaveTimer);
        stopCloudPoll();
        setSyncStatus(hasVercelBackend() ? 'Pending save...' : 'Local only', hasVercelBackend() ? 'saving' : 'offline');
        state.rosterCloudSaveTimer = setTimeout(function () {
          state.rosterCloudSaveTimer = null;
          saveCloudRoster(readAllLocalRoster(), { force: true });
        }, 50);
      }
  
      /* +----------------------------------+
       * + loadCloudRoster                  +
       * +----------------------------------+ */
      function loadCloudRoster(options) {
        options = options || {};
        var requestStorageId = getRosterStorageUserId();
        var requestRevision = state.rosterLocalRevision;
        if (hasRosterEditInProgress() || state.rosterInputSaveTimer || state.rosterCloudSaveTimer || state.rosterCloudSaving) {
          scheduleCloudPoll();
          return;
        }
        if (state.rosterCloudLoading) return;
        if (!hasVercelBackend()) {
          state.rosterCloudStore = readAllLocalRoster();
          state.rosterLastSavedJson = stableJson(state.rosterCloudStore);
          state.rosterCloudUpdatedAt = '';
          setSyncStatus('Local only', 'offline');
          refreshCalendar();
          return;
        }
        stopCloudPoll();
        state.rosterCloudLoading = true;
        if (!options.silent) setSyncStatus('Syncing...', 'saving');
        hoagApi.run
          .withSuccessHandler(function (envelope) {
            var cloud;
            if (requestStorageId !== getRosterStorageUserId()) {
              state.rosterCloudLoading = false;
              return;
            }
            state.rosterCloudLoading = false;
            if (envelope && envelope.ok === false) {
              setSyncStatus('Sync failed', 'error');
              console.warn('Roster endpoint returned error:', envelope.error || envelope);
              scheduleCloudPoll();
              return;
            }
            cloud = extractRosterFromEnvelope(envelope);
            var local = readAllLocalRoster();
            if (requestRevision !== state.rosterLocalRevision || (state.rosterDirtyDates && Object.keys(state.rosterDirtyDates).length)) {
              var mergedPending = mergeRosters(cloud, local, state.rosterDirtyDates);
              writeLocalRoster(mergedPending);
              state.rosterCloudUpdatedAt = String(envelope && envelope.updatedAt || '');
              setSyncStatus('Pending save...', 'saving');
              saveCloudRoster(mergedPending, { force: true });
              return;
            }
            state.rosterCloudStore = normalizeRoster(cloud);
            if (isEmptyCloudBootstrap(cloud, envelope) && hasRosterRows(local)) {
              state.rosterLastSavedJson = stableJson(cloud);
              state.rosterCloudUpdatedAt = '';
              setSyncStatus('Saving local roster...', 'saving');
              saveCloudRoster(local, { force: true });
              return;
            }
            writeLocalRoster(cloud);
            state.rosterCloudStore = normalizeRoster(cloud);
            refreshCalendar();
            state.rosterLastSavedJson = stableJson(cloud);
            state.rosterCloudUpdatedAt = String(envelope && envelope.updatedAt || '');
            if (!options.silent) {
              setSyncStatus('Synced', 'synced');
            }
            scheduleCloudPoll();
          })
          .withFailureHandler(function (error) {
            if (requestStorageId !== getRosterStorageUserId()) {
              state.rosterCloudLoading = false;
              return;
            }
            state.rosterCloudLoading = false;
            console.warn('Roster cloud envelope load failed, trying legacy load:', error && error.message ? error.message : error);
            hoagApi.run
              .withSuccessHandler(function (legacyEnvelope) {
                var cloud;
                if (requestStorageId !== getRosterStorageUserId()) return;
                cloud = extractRosterFromEnvelope(legacyEnvelope);
                state.rosterCloudStore = normalizeRoster(cloud);
                var local = readAllLocalRoster();
                if (requestRevision !== state.rosterLocalRevision) {
                  setSyncStatus('Pending save...', 'saving');
                  scheduleCloudPoll();
                  return;
                }
                if (isEmptyCloudBootstrap(cloud, legacyEnvelope) && hasRosterRows(local)) {
                  state.rosterLastSavedJson = stableJson(cloud);
                  state.rosterCloudUpdatedAt = '';
                  setSyncStatus('Saving local roster...', 'saving');
                  saveCloudRoster(local, { force: true });
                  return;
                }
                if (!sameRoster(cloud, local)) {
                  writeLocalRoster(cloud);
                  refreshCalendar();
                }
                state.rosterLastSavedJson = stableJson(cloud);
                state.rosterCloudUpdatedAt = String(legacyEnvelope && legacyEnvelope.updatedAt || '');
                if (!options.silent) setSyncStatus('Synced', 'synced');
                scheduleCloudPoll();
              })
              .withFailureHandler(function (legacyError) {
                if (requestStorageId !== getRosterStorageUserId()) return;
                setSyncStatus('Sync failed', 'error');
                console.warn('Roster cloud load failed:', legacyError && legacyError.message ? legacyError.message : legacyError);
                scheduleCloudPoll();
              })
              .getUserRoster(typeof Auth !== 'undefined' && Auth.getToken ? Auth.getToken() : '');
          })
          .getUserRosterEnvelope(typeof Auth !== 'undefined' && Auth.getToken ? Auth.getToken() : '');
      }
  
      /* +----------------------------------+
       * + handleAuthChange                 +
       * +----------------------------------+ */
      function handleAuthChange() {
        var nextStorageId = getRosterStorageUserId();
        installControls();
        if (activeRosterStorageId !== nextStorageId) {
          activeRosterStorageId = nextStorageId;
          resetSyncState();
        } else {
          clearTimeout(state.rosterCloudSaveTimer);
          state.rosterCloudSaveTimer = null;
        }
        startRealtimeListener();
        loadCloudRoster();
      }
  
      /* +----------------------------------+
       * + handleAuthLogout                 +
       * +----------------------------------+ */
      function handleAuthLogout() {
        resetSyncState();
        activeRosterStorageId = '';
        setSyncStatus('Signed out', 'offline');
      }
  
      /* +----------------------------------+
       * + handlePageChange                 +
       * +----------------------------------+ */
      function handlePageChange(pageId) {
        if (pageId === 'calendar') {
          loadCloudRoster({ silent: true, reason: 'page' });
        } else {
          scheduleCloudPoll();
        }
      }
  
      /* +----------------------------------+
       * + exportRoster                     +
       * +----------------------------------+ */
      function exportRoster() {
        var payload = JSON.stringify({
          app: 'LabLink App | HOAG Pathology',
          type: 'daily-roster-export',
          userId: getRosterStorageUserId(),
          exportedAt: new Date().toISOString(),
          roster: readAllLocalRoster()
        }, null, 2);
        var blob = new Blob([payload], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'labapp_roster_export_' + getRosterStorageUserId().toLowerCase() + '_' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
  
      /* +----------------------------------+
       * + importRosterFromFile             +
       * +----------------------------------+ */
      function importRosterFromFile(file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          var parsed = safeParse(String(reader.result || '{}'));
          var incoming = normalizeRoster(parsed.roster || parsed);
          var merged = mergeRosters(readAllLocalRoster(), incoming);
          writeLocalRoster(merged);
          state.rosterLocalRevision += 1;
          refreshCalendar();
          saveCloudRoster(merged, { force: true });
        };
        reader.onerror = function () { setSyncStatus('Import failed', 'error'); };
        reader.readAsText(file);
      }
  
      /* +----------------------------------+
       * + installControls                  +
       * +----------------------------------+ */
      function installControls() {
        var head = document.querySelector('#calendar .calendar-roster-head');
        if (head && !$('calendarSyncStatus')) {
          var status = document.createElement('div');
          status.id = 'calendarSyncStatus';
          status.className = 'calendar-sync-status is-saving';
          status.textContent = 'Starting sync...';
          head.appendChild(status);
        }
        return;
      }
  
      /* +----------------------------------+
       * + init                             +
       * +----------------------------------+ */
      function init() {
        installControls();
        setSyncStatus('Ready', 'saving');
      }
  
      return {
        init: init,
        syncNow: loadCloudRoster,
        localSave: localSave,
        saveCloudRoster: saveCloudRoster,

        handleAuthChange: handleAuthChange,
        handleAuthLogout: handleAuthLogout,
        handlePageChange: handlePageChange,
        exportRoster: exportRoster,
        importRosterFromFile: importRosterFromFile
      };
    })();
  
  
    /* +----------------------------------+
     * + CLIENT MODULE                    +
     * +----------------------------------+ */
    var WebView = (function () {
      var lastAppliedViewportHeight = 0;
      var lastAppliedViewportWidth = 0;
      var viewportHeightThreshold = 16;
      var lifecycleBound = false;
      var dragGuardBound = false;
  
      /* +----------------------------------+
       * + getViewportSize                  +
       * +----------------------------------+ */
      function getViewportSize() {
        var visual = window.visualViewport || null;
        var width = visual && visual.width ? visual.width : (window.innerWidth || document.documentElement.clientWidth || 0);
        var height = visual && visual.height ? visual.height : (window.innerHeight || document.documentElement.clientHeight || 0);
        return {
          width: Math.max(0, Math.round(width || 0)),
          height: Math.max(0, Math.round(height || 0)),
          offsetTop: Math.max(0, Math.round((visual && visual.offsetTop) || 0)),
          offsetLeft: Math.max(0, Math.round((visual && visual.offsetLeft) || 0))
        };
      }
  
      /* +----------------------------------+
       * + setViewportHeightVar             +
       * +----------------------------------+ */
      function setViewportHeightVar(force) {
        var viewport = getViewportSize();
        if (!viewport.height) return;
        if (!force && lastAppliedViewportHeight && Math.abs(viewport.height - lastAppliedViewportHeight) <= viewportHeightThreshold && Math.abs(viewport.width - lastAppliedViewportWidth) <= viewportHeightThreshold) return;
        lastAppliedViewportHeight = viewport.height;
        lastAppliedViewportWidth = viewport.width;
        document.documentElement.style.setProperty('--apk-vh', viewport.height + 'px');
        document.documentElement.style.setProperty('--apk-vw', viewport.width + 'px');
        document.documentElement.style.setProperty('--apk-vv-top', viewport.offsetTop + 'px');
        document.documentElement.style.setProperty('--apk-vv-left', viewport.offsetLeft + 'px');
      }
  
      /* +----------------------------------+
       * + lockHorizontalOverflow           +
       * +----------------------------------+ */
      function lockHorizontalOverflow() {
        var app = document.querySelector('.app');
        if (app) app.style.overflowX = 'hidden';
      }
  
      /* +----------------------------------+
       * + detectWebViewMode                +
       * +----------------------------------+ */
      function detectWebViewMode() {
        var ua = navigator.userAgent || '';
        var isElectron = /Electron\/\d+/i.test(ua);
        var isAndroid = /Android/i.test(ua);
        var isWebView = /; wv\)/i.test(ua) || /\bwv\b/i.test(ua) || (/Version\/\d+(?:\.\d+)?.*Chrome\//i.test(ua) && isAndroid);
        if (isElectron) return 'electron';
        if (isWebView && isAndroid) return 'apk-webview';
        if (isWebView) return 'webview';
        return 'browser';
      }
  
      /* +----------------------------------+
       * + addWebViewClasses                +
       * +----------------------------------+ */
      function addWebViewClasses() {
        var root = document.documentElement;
        var ua = navigator.userAgent || '';
        var mode = detectWebViewMode();
        root.classList.add('apk-webview-ready');
        root.classList.toggle('electron-app', mode === 'electron');
        root.classList.toggle('android-webview', mode === 'apk-webview');
        root.classList.toggle('embedded-webview', mode === 'apk-webview' || mode === 'webview' || mode === 'electron');
        root.classList.toggle('touch-device', /Mobile|Android|iPhone|iPad|iPod/i.test(ua) || Number(navigator.maxTouchPoints || 0) > 0);
        root.setAttribute('data-runtime-mode', mode);
      }
  
      /* +----------------------------------+
       * + setNetworkClass                  +
       * +----------------------------------+ */
      function setNetworkClass() {
        var online = navigator.onLine !== false;
        document.documentElement.classList.toggle('is-offline', !online);
        document.documentElement.classList.toggle('is-online', online);
        document.documentElement.setAttribute('data-network', online ? 'online' : 'offline');
      }
  
      /* +----------------------------------+
       * + protectExternalLinks             +
       * +----------------------------------+ */
      function protectExternalLinks() {
        forEachNode(document.querySelectorAll('a[href]'), function (link) {
          var href = link.getAttribute('href') || '';
          if (!/^(mailto:|tel:|sms:|https?:)/i.test(href)) return;
          if (link.getAttribute('rel') !== 'noopener noreferrer') {
            link.setAttribute('rel', 'noopener noreferrer');
          }
        });
      }
  
      /* +----------------------------------+
       * + refreshForegroundModules         +
       * +----------------------------------+ */
      function refreshForegroundModules() {
        if (document.hidden || !state.authUserId) return;
        var active = document.querySelector('.page.active');
        var pageId = active ? active.id : 'dashboard';
        if (window.LabApp && window.LabApp.Dashboard && typeof window.LabApp.Dashboard.refreshClock === 'function') {
          window.LabApp.Dashboard.refreshClock();
        }
        if (window.LabApp && window.LabApp.RosterSync && typeof window.LabApp.RosterSync.handlePageChange === 'function') {
          window.LabApp.RosterSync.handlePageChange(pageId);
        }
        if (window.LabApp && window.LabApp.Settings && typeof window.LabApp.Settings.handlePageChange === 'function') {
          window.LabApp.Settings.handlePageChange(pageId);
        }
      }
  
      /* +----------------------------------+
       * + flushBeforeBackground            +
       * +----------------------------------+ */
      function flushBeforeBackground() {
        if (typeof Calendar !== 'undefined' && Calendar && typeof Calendar.flushPendingInputSave === 'function') {
          Calendar.flushPendingInputSave();
        }
      }
  
      /* +----------------------------------+
       * + bindLifecycleEvents              +
       * +----------------------------------+ */
      function bindLifecycleEvents(requestViewportHeightRefresh) {
        if (lifecycleBound) return;
        lifecycleBound = true;
  
        window.addEventListener('online', function () {
          setNetworkClass();
          setViewportHeightVar(true);
          refreshForegroundModules();
        }, { passive: true });
  
        window.addEventListener('offline', setNetworkClass, { passive: true });
        window.addEventListener('focus', function () {
          setViewportHeightVar(true);
          refreshForegroundModules();
        }, { passive: true });
  
        window.addEventListener('pageshow', function () {
          setViewportHeightVar(true);
          refreshForegroundModules();
        }, { passive: true });
  
        window.addEventListener('pagehide', flushBeforeBackground, { passive: true });
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) {
            flushBeforeBackground();
            return;
          }
          setViewportHeightVar(true);
          refreshForegroundModules();
        }, { passive: true });
  
        window.addEventListener('resize', requestViewportHeightRefresh, { passive: true });
        window.addEventListener('orientationchange', function () {
          setTimeout(function () { setViewportHeightVar(true); }, 80);
          setTimeout(function () { setViewportHeightVar(true); lockHorizontalOverflow(); }, 300);
        }, { passive: true });
  
        if (window.visualViewport) {
          window.visualViewport.addEventListener('resize', requestViewportHeightRefresh, { passive: true });
          window.visualViewport.addEventListener('scroll', requestViewportHeightRefresh, { passive: true });
        }
      }
  
      /* +----------------------------------+
       * + bindNavigationGuards             +
       * +----------------------------------+ */
      function bindNavigationGuards() {
        if (dragGuardBound) return;
        dragGuardBound = true;
        ['dragover', 'drop'].forEach(function (eventName) {
          document.addEventListener(eventName, function (event) {
            event.preventDefault();
          });
        });
      }
  
      /* +----------------------------------+
       * + init                             +
       * +----------------------------------+ */
      function init() {
        var requestViewportHeightRefresh = rafThrottle(function () {
          setViewportHeightVar(false);
        });
  
        setViewportHeightVar(true);
        lockHorizontalOverflow();
        addWebViewClasses();
        setNetworkClass();
        protectExternalLinks();
        bindNavigationGuards();
        bindLifecycleEvents(requestViewportHeightRefresh);
      }
  
      return {
        init: init,
        refreshViewport: setViewportHeightVar,
        refreshForegroundModules: refreshForegroundModules,
        getRuntimeMode: detectWebViewMode
      };
    })();
  
  
    /* +----------------------------------+
     * + CLIENT HELPER                    +
     * +----------------------------------+ */
    var SharedEmojiPanel = (function () {
      var fallbackEmojis = Object.freeze(['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😍','😘','😎','🤔','😢','😭','😡','👍','👎','👏','🙏','💪','👌','🙌','🔥','✨','🎉','❤️','💙','✅','❌','⚠️','📌','📎','📍','🧪','🩸','💉','🧬','🔬','🏥']);
  
      /* +----------------------------------+
       * + applyEmojiPickerTheme            +
       * +----------------------------------+ */
      function applyEmojiPickerTheme(panel, picker, isDark) {
        var useDark = typeof isDark === 'boolean' ? isDark : document.body.classList.contains('dark-mode');
        if (panel) panel.classList.toggle('is-dark', useDark);
        if (!picker) return;
        picker.style.colorScheme = useDark ? 'dark' : 'light';
        picker.setAttribute('data-theme', useDark ? 'dark' : 'light');
        var themeVars = useDark ? {
          '--background': '#1d2430',
          '--border-color': 'rgba(255,255,255,.12)',
          '--text-color': '#f5f8ff',
          '--input-font-color': '#f5f8ff',
          '--input-placeholder-color': '#9aa8bd',
          '--input-border-color': 'rgba(255,255,255,.16)',
          '--indicator-color': '#7c9cff',
          '--outline-color': 'rgba(120,145,255,.38)'
        } : {
          '--background': '#f7f9fd',
          '--border-color': 'rgba(110,125,150,.20)',
          '--text-color': 'var(--text)',
          '--input-font-color': 'var(--text)',
          '--input-placeholder-color': 'var(--muted)',
          '--input-border-color': 'rgba(110,125,150,.26)',
          '--indicator-color': 'var(--primary)',
          '--outline-color': 'rgba(79,114,255,.30)'
        };
        Object.keys(themeVars).forEach(function (name) {
          picker.style.setProperty(name, themeVars[name]);
        });
      }
  
      /* +----------------------------------+
       * + create                           +
       * +----------------------------------+ */
      function create(options) {
        options = options || {};
        var panel = null;
        var picker = null;
        var fallback = null;
        var targetInput = null;
        var selectHandler = null;
        var panelClass = options.panelClass || 'live-chat-emoji-popover';
        var inputAttribute = options.inputAttribute || '';
        var align = options.align || 'center';
        var verticalOffset = Number(options.verticalOffset || 10);
  
        /* +----------------------------------+
         * + syncTheme                        +
         * +----------------------------------+ */
        function syncTheme(isDark) {
          applyEmojiPickerTheme(panel, picker, isDark);
        }
  
        /* +----------------------------------+
         * + insert                           +
         * +----------------------------------+ */
        function insert(emoji) {
          if (!emoji) return;
          if (selectHandler) {
            selectHandler(emoji);
            close();
            return;
          }
          if (!targetInput) return;
          var input = targetInput;
          input.focus();
          var start = typeof input.selectionStart === 'number' ? input.selectionStart : input.value.length;
          var end = typeof input.selectionEnd === 'number' ? input.selectionEnd : input.value.length;
  
          if (typeof input.setRangeText === 'function') {
            input.setRangeText(emoji, start, end, 'end');
          } else {
            input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
            var caret = start + emoji.length;
            if (typeof input.setSelectionRange === 'function') input.setSelectionRange(caret, caret);
          }
  
          if (typeof options.afterInsert === 'function') options.afterInsert(input);
        }
  
        /* +----------------------------------+
         * + ensure                           +
         * +----------------------------------+ */
        function ensure() {
          if (panel) return panel;
          panel = document.createElement('div');
          panel.className = panelClass;
          panel.hidden = true;
  
          if (window.customElements && customElements.get && customElements.get('emoji-picker')) {
            picker = document.createElement('emoji-picker');
            picker.setAttribute('emoji-version', '15.0');
            panel.appendChild(picker);
            picker.addEventListener('emoji-click', function (event) {
              var detail = event.detail || {};
              var emoji = detail.unicode || (detail.emoji && detail.emoji.unicode) || '';
              insert(emoji);
            });
          }
          syncTheme();
  
          fallback = document.createElement('div');
          fallback.className = 'live-chat-emoji-fallback';
          fallbackEmojis.forEach(function (emoji) {
            var button = document.createElement('button');
            button.type = 'button';
            button.textContent = emoji;
            button.addEventListener('click', function () { insert(emoji); });
            fallback.appendChild(button);
          });
          panel.appendChild(fallback);
          document.body.appendChild(panel);
  
          if (!picker && fallback) {
            panel.classList.add('is-fallback');
            fallback.classList.add('is-visible');
          }
          return panel;
        }
  
        /* +----------------------------------+
         * + position                         +
         * +----------------------------------+ */
        function position(button) {
          if (!button || !panel) return;
          var rect = button.getBoundingClientRect();
          var viewportWidth = window.visualViewport && window.visualViewport.width ? window.visualViewport.width : window.innerWidth;
          var viewportHeight = window.visualViewport && window.visualViewport.height ? window.visualViewport.height : window.innerHeight;
          var panelWidth = Math.min(352, viewportWidth - 24);
          var panelHeight = Math.min(430, viewportHeight - 24);
          var left = rect.left;
          if (align === 'center') {
            var buttonCenter = rect.left + (rect.width / 2);
            left = buttonCenter - (panelWidth / 2);
          }
          left = Math.max(12, Math.min(left, viewportWidth - panelWidth - 12));
          var top = rect.top - panelHeight - verticalOffset;
          if (top < 12) top = Math.min(rect.bottom + verticalOffset, viewportHeight - panelHeight - 12);
          panel.style.left = left + 'px';
          panel.style.top = Math.max(12, top) + 'px';
        }
  
        /* +----------------------------------+
         * + open                             +
         * +----------------------------------+ */
        function open(button, openOptions) {
          ensure();
          openOptions = openOptions || {};
          selectHandler = typeof openOptions.onSelect === 'function' ? openOptions.onSelect : null;
          if (selectHandler) {
            targetInput = null;
          } else {
            var inputId = button && inputAttribute ? button.getAttribute(inputAttribute) : '';
            targetInput = inputId ? $(inputId) : (typeof options.getDefaultInput === 'function' ? options.getDefaultInput() : null);
          }
          panel.hidden = false;
          position(button);
        }
  
        /* +----------------------------------+
         * + close                            +
         * +----------------------------------+ */
        function close() {
          if (panel) panel.hidden = true;
          targetInput = null;
          selectHandler = null;
        }
  
        return {
          close: close,
          contains: function (target) { return !!(panel && panel.contains(target)); },
          getTargetInput: function () { return targetInput; },
          isOpen: function () { return !!(panel && !panel.hidden); },
          open: open,
          syncTheme: syncTheme
        };
      }
  
      return { create: create };
    })();
  
    /* +----------------------------------+
     * + CLIENT MODULE                    +
     * +----------------------------------+ */
    var Settings = (function () {
      var initialized = false;
      var nodes = {};
      var adminBusy = false;
      var lastAdminData = null;
      var adminLoading = false;
      var adminPollTimer = null;
      var adminPollMs = 60000;
  
      /* +----------------------------------+
       * + cacheDom                         +
       * +----------------------------------+ */
      function cacheDom() {
        nodes.standardPanel = $('settingsStandardPanel');
        nodes.adminPanel = $('settingsAdminPanel');
        nodes.status = $('adminControlStatus');
        nodes.resetForm = $('adminResetForm');
        nodes.resetUser = $('adminResetUser');
        nodes.resetPassword = $('adminResetPassword');
        nodes.addForm = $('adminAddUserForm');
        nodes.addUsername = $('adminAddUsername');
        nodes.addDisplayName = $('adminAddDisplayName');
        nodes.addRole = $('adminAddRole');
        nodes.addPassword = $('adminAddPassword');
        nodes.broadcastForm = $('adminBroadcastForm');
        nodes.broadcastMessage = $('adminBroadcastMessage');
        nodes.maintenanceForm = $('adminMaintenanceForm');
        nodes.maintenanceEnabled = $('adminMaintenanceEnabled');
        nodes.maintenanceMessage = $('adminMaintenanceMessage');
  	      nodes.userList = $('adminUserList');
  	      nodes.systemLog = $('adminSystemLog');
  	      nodes.systemLogRetentionLabel = $('adminSystemLogRetentionLabel');
  	      nodes.noticeToast = $('systemNoticeToast');
  	      nodes.noticeTitle = $('systemNoticeTitle');
  	      nodes.noticeText = $('systemNoticeText');
  	      if (nodes.systemLogRetentionLabel) {
  	        nodes.systemLogRetentionLabel.textContent = 'Detailed activity, device type, browser, and ' + config.systemLogRetentionLabel;
  	      }
  	    }
  
      /* +----------------------------------+
       * + isAdmin                          +
       * +----------------------------------+ */
      function isAdmin() {
        return cleanText(state.authRole).toUpperCase() === 'ADMIN';
      }
  
      /* +----------------------------------+
       * + setStatus                        +
       * +----------------------------------+ */
      function setStatus(message, type) {
        if (!nodes.status) return;
        nodes.status.textContent = message || '';
        nodes.status.classList.toggle('is-error', type === 'error');
        nodes.status.classList.toggle('is-ok', type === 'ok');
      }
  
      /* +----------------------------------+
       * + setAdminBusy                     +
       * +----------------------------------+ */
      function setAdminBusy(isBusy) {
        adminBusy = !!isBusy;
        forEachNode(document.querySelectorAll('#settings .admin-action-btn, #settings .admin-danger-btn, #settings .admin-muted-btn, #settings .admin-input, #settings .admin-select, #settings .admin-textarea, #settings .admin-toggle-row input'), function (node) {
          node.disabled = adminBusy;
        });
      }

      /* +----------------------------------+
       * + renderMode                       +
       * +----------------------------------+ */
      function renderMode() {
        var admin = isAdmin();
        if (nodes.standardPanel) nodes.standardPanel.hidden = admin;
        if (nodes.adminPanel) nodes.adminPanel.hidden = !admin;
        if (admin && !lastAdminData) loadAdminData(false);
      }
  
      /* +----------------------------------+
       * + setNotice                        +
       * +----------------------------------+ */
      function setNotice(envelope) {
        if (!nodes.noticeToast || !nodes.noticeTitle || !nodes.noticeText) return;
        var broadcast = envelope && envelope.broadcast ? envelope.broadcast : {};
        var maintenance = envelope && envelope.maintenance ? envelope.maintenance : {};
        var message = '';
        var title = '';
  
        if (maintenance.enabled) {
          title = 'Maintenance Mode';
          message = maintenance.message || 'System is temporarily under maintenance.';
        } else if (broadcast.enabled && broadcast.message) {
          title = 'Announcement';
          message = broadcast.message;
        }
  
        if (!message) {
          nodes.noticeToast.classList.add('is-hidden');
          nodes.noticeText.textContent = '';
          return;
        }
  
        nodes.noticeTitle.textContent = title;
        nodes.noticeText.textContent = message;
        nodes.noticeToast.classList.remove('is-hidden');
      }
  
      /* +----------------------------------+
       * + refreshNotice                    +
       * +----------------------------------+ */
      function refreshNotice() {
        if (!hasVercelBackend() || !Auth.getToken()) {
          setNotice(null);
          return;
        }
  
        hoagApi.run
          .withSuccessHandler(function (envelope) {
            if (envelope && envelope.ok !== false) setNotice(envelope);
          })
          .withFailureHandler(function () { setNotice(null); })
          .getSystemNotice(Auth.getToken());
      }
  
      /* +----------------------------------+
       * + formatDateTime                   +
       * +----------------------------------+ */
      function formatDateTime(value) {
        if (!value) return 'Never';
        var date = new Date(value);
        if (isNaN(date.getTime())) return value;
        return date.toLocaleString([], { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      }
  
      /* +----------------------------------+
       * + clearNode                        +
       * +----------------------------------+ */
      function clearNode(node) {
        if (!node) return;
        while (node.firstChild) node.removeChild(node.firstChild);
      }
  
      /* +----------------------------------+
       * + renderResetOptions               +
       * +----------------------------------+ */
      function renderResetOptions(users) {
        if (!nodes.resetUser) return;
        var previous = nodes.resetUser.value;
        clearNode(nodes.resetUser);
        (users || []).forEach(function (user) {
          var option = document.createElement('option');
          option.value = user.id;
          option.textContent = user.id + ' — ' + user.name;
          nodes.resetUser.appendChild(option);
        });
        if (previous) nodes.resetUser.value = previous;
      }
  
      /* +----------------------------------+
       * + renderUserList                   +
       * +----------------------------------+ */
      function renderUserList(users) {
        if (!nodes.userList) return;
        clearNode(nodes.userList);
  
        users = users || [];
  
        if (!users.length) {
          var empty = document.createElement('div');
          empty.className = 'admin-log-row';
          empty.innerHTML = '<strong>No users found.</strong>';
          nodes.userList.appendChild(empty);
          return;
        }
  
        users.forEach(function (user) {
          var row = document.createElement('div');
          row.className = 'admin-user-row';
          row.dataset.userId = user.id;
  
          var main = document.createElement('div');
          main.className = 'admin-user-main';
          var name = document.createElement('strong');
          name.textContent = user.name || user.id;
          var meta = document.createElement('span');
          meta.textContent = user.id + ' · Last login: ' + formatDateTime(user.lastLoginAt);
          main.appendChild(name);
          main.appendChild(meta);
  
          var role = document.createElement('div');
          role.className = 'admin-pill admin-user-role-pill';
          role.textContent = user.role || 'USER';
  
          var active = document.createElement('div');
          active.className = 'admin-pill admin-user-state-pill' + (user.active ? '' : ' is-off');
          active.textContent = user.active ? 'ACTIVE' : 'OFF';
  
          var actions = document.createElement('div');
          actions.className = 'admin-row-actions';
          var toggle = document.createElement('button');
          toggle.className = 'admin-muted-btn';
          toggle.type = 'button';
          toggle.dataset.adminAction = 'toggle-user';
          toggle.textContent = user.active ? 'Deactivate' : 'Activate';
          var del = document.createElement('button');
          del.className = 'admin-danger-btn';
          del.type = 'button';
          del.dataset.adminAction = 'delete-user';
          del.textContent = 'Delete';
          actions.appendChild(toggle);
          actions.appendChild(del);
  
          row.appendChild(main);
          row.appendChild(role);
          row.appendChild(active);
          row.appendChild(actions);
          nodes.userList.appendChild(row);
        });
      }
  
      /* +----------------------------------+
       * + appendLogPill                    +
       * +----------------------------------+ */
      function appendLogPill(host, label, value, title) {
        value = cleanText(value);
        if (!host || !value) return;
        var pill = document.createElement('span');
        pill.className = 'admin-log-pill';
        pill.textContent = label ? (label + ': ' + value) : value;
        if (title) pill.title = title;
        host.appendChild(pill);
      }

      /* +----------------------------------+
       * + appendLogExtraPills              +
       * +----------------------------------+ */
      function appendLogExtraPills(host, extra) {
        extra = extra && typeof extra === 'object' ? extra : {};
        Object.keys(extra).sort().forEach(function (key) {
          appendLogPill(host, key, extra[key]);
        });
      }
  
      /* +----------------------------------+
       * + renderLogs                       +
       * +----------------------------------+ */
      function renderLogs(logs) {
        if (!nodes.systemLog) return;
        clearNode(nodes.systemLog);
  
        if (!logs || !logs.length) {
          var empty = document.createElement('div');
          empty.className = 'admin-log-row';
  	        empty.innerHTML = '<strong>No activity log yet.</strong><span>Login, navigation, password, chat, roster, and admin actions will appear here. ' + config.systemLogAutoClearText + '</span>';
          nodes.systemLog.appendChild(empty);
          return;
        }
  
        logs.forEach(function (log) {
          var row = document.createElement('div');
          row.className = 'admin-log-row';
  
          var top = document.createElement('div');
          top.className = 'admin-log-top';
          var title = document.createElement('strong');
          title.textContent = (log.action || 'ACTIVITY') + ' · ' + (log.actor || 'SYSTEM');
          var time = document.createElement('span');
          time.className = 'admin-log-time';
          time.textContent = formatDateTime(log.at);
          top.appendChild(title);
          top.appendChild(time);
  
          var detail = document.createElement('span');
          detail.className = 'admin-log-detail';
          detail.textContent = log.details || 'No details.';
  
          var context = document.createElement('div');
          context.className = 'admin-log-context';
          appendLogPill(context, '', log.deviceLabel || log.deviceType || 'Unknown device');
          appendLogPill(context, 'Mode', log.appMode);
          appendLogPill(context, 'Browser', log.browser);
          appendLogPill(context, 'OS', log.os);
          appendLogPill(context, 'Platform', log.platform);
          appendLogPill(context, 'Screen', log.screen);
          appendLogPill(context, 'Online', log.online);
          appendLogPill(context, 'Visibility', log.visibility);
          appendLogPill(context, 'Runtime', log.runtimeMode);
          appendLogPill(context, 'Language', log.language);
          appendLogPill(context, 'Page', log.page);
          appendLogPill(context, 'Path', log.path);
          appendLogExtraPills(context, log.extra);
  
          row.appendChild(top);
          row.appendChild(detail);
          if (context.childNodes.length) row.appendChild(context);
  
          if (log.userAgent) {
            var agent = document.createElement('span');
            agent.className = 'admin-log-useragent';
            agent.textContent = 'UA: ' + log.userAgent;
            agent.title = log.userAgent;
            row.appendChild(agent);
          }
  
          nodes.systemLog.appendChild(row);
        });
      }
  
      /* +----------------------------------+
       * + renderAdminData                  +
       * +----------------------------------+ */
      function renderAdminData(envelope, okMessage, options) {
        options = options || {};
        if (!envelope || envelope.ok === false) {
          if (!options.silent) setStatus(envelope && envelope.error ? envelope.error : 'Unable to load admin control.', 'error');
          return;
        }
  
        lastAdminData = envelope;
        renderResetOptions(envelope.users || []);
        renderUserList(envelope.users || []);
        renderLogs(envelope.logs || []);
  
        if (nodes.broadcastMessage) nodes.broadcastMessage.value = envelope.broadcast && envelope.broadcast.message ? envelope.broadcast.message : '';
        if (nodes.maintenanceEnabled) nodes.maintenanceEnabled.checked = !!(envelope.maintenance && envelope.maintenance.enabled);
        if (nodes.maintenanceMessage) nodes.maintenanceMessage.value = envelope.maintenance && envelope.maintenance.message ? envelope.maintenance.message : '';
  
        setNotice(envelope);
        if (!options.silent || okMessage) setStatus(okMessage || 'Admin control ready.', 'ok');
      }
  
      /* +----------------------------------+
       * + isSettingsPageActive             +
       * +----------------------------------+ */
      function isSettingsPageActive() {
        var active = document.querySelector('.page.active');
        return !!(active && active.id === 'settings');
      }
  
      /* +----------------------------------+
       * + stopAdminPolling                 +
       * +----------------------------------+ */
      function stopAdminPolling() {
        if (!adminPollTimer) return;
        window.clearTimeout(adminPollTimer);
        adminPollTimer = null;
      }
  
      /* +----------------------------------+
       * + scheduleAdminPolling             +
       * +----------------------------------+ */
      function scheduleAdminPolling() {
        stopAdminPolling();
        if (document.hidden || !isSettingsPageActive() || !isAdmin() || !hasVercelBackend() || adminBusy) return;
        adminPollTimer = window.setTimeout(function () {
          adminPollTimer = null;
          loadAdminData(true);
        }, adminPollMs);
      }
  
      /* +----------------------------------+
       * + requestAdminRefresh              +
       * +----------------------------------+ */
      function requestAdminRefresh(delayMs) {
        stopAdminPolling();
        if (document.hidden || !isSettingsPageActive() || !isAdmin() || !hasVercelBackend()) return;
        adminPollTimer = window.setTimeout(function () {
          adminPollTimer = null;
          loadAdminData(true);
        }, Math.max(0, Number(delayMs) || 0));
      }
  
      /* +----------------------------------+
       * + loadAdminData                    +
       * +----------------------------------+ */
      function loadAdminData(silent) {
        if (!isAdmin()) {
          stopAdminPolling();
          renderMode();
          return;
        }
        if (!hasVercelBackend()) {
          stopAdminPolling();
          setStatus('Admin control service is unavailable. Please try again.', 'error');
          return;
        }
        if (adminLoading || adminBusy) {
          scheduleAdminPolling();
          return;
        }
  
        adminLoading = true;
        if (!silent) setStatus('Loading admin control...', '');
        hoagApi.run
          .withSuccessHandler(function (envelope) {
            adminLoading = false;
            renderAdminData(envelope, '', { silent: !!silent });
            scheduleAdminPolling();
          })
          .withFailureHandler(function (error) {
            adminLoading = false;
            if (!silent) setStatus(error && error.message ? error.message : 'Unable to load admin control.', 'error');
            scheduleAdminPolling();
          })
          .getAdminControlData(Auth.getToken());
      }
  
      /* +----------------------------------+
       * + handleAdminEnvelope              +
       * +----------------------------------+ */
      function handleAdminEnvelope(envelope, okMessage) {
        setAdminBusy(false);
        if (!envelope || envelope.ok === false) {
          setStatus(envelope && envelope.error ? envelope.error : 'Admin action failed.', 'error');
          return;
        }
        renderAdminData(envelope, okMessage);
        requestAdminRefresh(500);
      }
  
      /* +----------------------------------+
       * + resetPassword                    +
       * +----------------------------------+ */
      function resetPassword(event) {
        event.preventDefault();
        if (adminBusy) return;
        var userId = nodes.resetUser ? nodes.resetUser.value : '';
        var password = nodes.resetPassword ? nodes.resetPassword.value : '';
        if (!userId || !String(password || '').trim()) {
          setStatus('Select a user and enter a new password.', 'error');
          return;
        }
        setAdminBusy(true);
        setStatus('Resetting password...', '');
        hoagApi.run
          .withSuccessHandler(function (envelope) {
            if (nodes.resetPassword) nodes.resetPassword.value = '';
            handleAdminEnvelope(envelope, 'Password reset completed.');
          })
          .withFailureHandler(function (error) {
            setAdminBusy(false);
            setStatus(error && error.message ? error.message : 'Password reset failed.', 'error');
          })
          .adminResetAuthPassword(Auth.getToken(), userId, password, typeof ActivityTracker !== 'undefined' && ActivityTracker.getClientInfo ? ActivityTracker.getClientInfo({ page: 'settings' }) : {});
      }
  
      /* +----------------------------------+
       * + addUser                          +
       * +----------------------------------+ */
      function addUser(event) {
        event.preventDefault();
        if (adminBusy) return;
        var username = nodes.addUsername ? nodes.addUsername.value : '';
        var displayName = nodes.addDisplayName ? nodes.addDisplayName.value : '';
        var role = nodes.addRole ? nodes.addRole.value : 'USER';
        var password = nodes.addPassword ? nodes.addPassword.value : '';
        if (!String(username || '').trim() || !String(password || '').trim()) {
          setStatus('Username and password are required.', 'error');
          return;
        }
        setAdminBusy(true);
        setStatus('Adding user...', '');
        hoagApi.run
          .withSuccessHandler(function (envelope) {
            if (envelope && envelope.ok !== false) {
              [nodes.addUsername, nodes.addDisplayName, nodes.addPassword].forEach(function (node) { if (node) node.value = ''; });
              if (nodes.addRole) nodes.addRole.value = 'USER';
            }
            handleAdminEnvelope(envelope, 'User added successfully.');
          })
          .withFailureHandler(function (error) {
            setAdminBusy(false);
            setStatus(error && error.message ? error.message : 'Add user failed.', 'error');
          })
          .adminAddAuthUser(Auth.getToken(), username, displayName, role, password, typeof ActivityTracker !== 'undefined' && ActivityTracker.getClientInfo ? ActivityTracker.getClientInfo({ page: 'settings' }) : {});
      }
  
      /* +----------------------------------+
       * + saveBroadcast                    +
       * +----------------------------------+ */
      function saveBroadcast(event) {
        event.preventDefault();
        if (adminBusy) return;
        setAdminBusy(true);
        setStatus('Saving broadcast...', '');
        hoagApi.run
          .withSuccessHandler(function (envelope) { handleAdminEnvelope(envelope, 'Broadcast saved.'); })
          .withFailureHandler(function (error) {
            setAdminBusy(false);
            setStatus(error && error.message ? error.message : 'Broadcast save failed.', 'error');
          })
          .adminSaveBroadcast(Auth.getToken(), nodes.broadcastMessage ? nodes.broadcastMessage.value : '', typeof ActivityTracker !== 'undefined' && ActivityTracker.getClientInfo ? ActivityTracker.getClientInfo({ page: 'settings' }) : {});
      }
  
      /* +----------------------------------+
       * + saveMaintenance                  +
       * +----------------------------------+ */
      function saveMaintenance(event) {
        event.preventDefault();
        if (adminBusy) return;
        setAdminBusy(true);
        setStatus('Saving maintenance mode...', '');
        hoagApi.run
          .withSuccessHandler(function (envelope) { handleAdminEnvelope(envelope, 'Maintenance setting saved.'); })
          .withFailureHandler(function (error) {
            setAdminBusy(false);
            setStatus(error && error.message ? error.message : 'Maintenance save failed.', 'error');
          })
          .adminSetMaintenanceMode(Auth.getToken(), nodes.maintenanceEnabled ? nodes.maintenanceEnabled.checked : false, nodes.maintenanceMessage ? nodes.maintenanceMessage.value : '', typeof ActivityTracker !== 'undefined' && ActivityTracker.getClientInfo ? ActivityTracker.getClientInfo({ page: 'settings' }) : {});
      }  
      /* +----------------------------------+
       * + handleUserAction                 +
       * +----------------------------------+ */
      function handleUserAction(event) {
        var button = event.target && event.target.closest ? event.target.closest('[data-admin-action]') : null;
        if (!button || adminBusy) return;
        var row = button.closest('[data-user-id]');
        var userId = row ? row.dataset.userId : '';
        if (!userId) return;
  
        if (button.dataset.adminAction === 'delete-user') {
          requestAppConfirm('Delete User?', 'Delete user ' + userId + '? This cannot be undone.', function () {
            setAdminBusy(true);
            setStatus('Deleting user...', '');
            hoagApi.run
              .withSuccessHandler(function (envelope) { handleAdminEnvelope(envelope, 'User deleted.'); })
              .withFailureHandler(function (error) {
                setAdminBusy(false);
                setStatus(error && error.message ? error.message : 'Delete user failed.', 'error');
              })
              .adminDeleteAuthUser(Auth.getToken(), userId, typeof ActivityTracker !== 'undefined' && ActivityTracker.getClientInfo ? ActivityTracker.getClientInfo({ page: 'settings' }) : {});
          });
          return;
        }
  
        if (button.dataset.adminAction === 'toggle-user') {
          var current = (lastAdminData && lastAdminData.users || []).filter(function (user) { return user.id === userId; })[0];
          var nextActive = !(current && current.active);
          setAdminBusy(true);
          setStatus(nextActive ? 'Activating user...' : 'Deactivating user...', '');
          hoagApi.run
            .withSuccessHandler(function (envelope) { handleAdminEnvelope(envelope, nextActive ? 'User activated.' : 'User deactivated.'); })
            .withFailureHandler(function (error) {
              setAdminBusy(false);
              setStatus(error && error.message ? error.message : 'User update failed.', 'error');
            })
            .adminSetAuthUserActive(Auth.getToken(), userId, nextActive, typeof ActivityTracker !== 'undefined' && ActivityTracker.getClientInfo ? ActivityTracker.getClientInfo({ page: 'settings' }) : {});
        }
      }
  
      /* +----------------------------------+
       * + bindEvents                       +
       * +----------------------------------+ */
      function bindEvents() {
        if (nodes.resetForm) nodes.resetForm.addEventListener('submit', resetPassword);
        if (nodes.addForm) nodes.addForm.addEventListener('submit', addUser);
        if (nodes.broadcastForm) nodes.broadcastForm.addEventListener('submit', saveBroadcast);
        if (nodes.maintenanceForm) nodes.maintenanceForm.addEventListener('submit', saveMaintenance);
        if (nodes.userList) nodes.userList.addEventListener('click', handleUserAction);
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) stopAdminPolling();
          else if (isSettingsPageActive()) requestAdminRefresh(0);
        });
        window.addEventListener('focus', function () {
          if (isSettingsPageActive()) requestAdminRefresh(0);
        }, { passive: true });
      }
  
      /* +----------------------------------+
       * + handlePageChange                 +
       * +----------------------------------+ */
      function handlePageChange(pageId) {
        if (pageId !== 'settings') {
          stopAdminPolling();
          return;
        }
        renderMode();
        if (isAdmin()) requestAdminRefresh(0);
      }
  
      /* +----------------------------------+
       * + handleAuthChange                 +
       * +----------------------------------+ */
      function handleAuthChange() {
        stopAdminPolling();
        adminLoading = false;
        lastAdminData = null;
        renderMode();
        refreshNotice();
        if (isSettingsPageActive() && isAdmin()) requestAdminRefresh(0);
      }
  
      /* +----------------------------------+
       * + init                             +
       * +----------------------------------+ */
      function init() {
        if (initialized) return;
        initialized = true;
        cacheDom();
        bindEvents();
        renderMode();
        refreshNotice();
        var active = document.querySelector('.page.active');
        if (active && active.id === 'settings') handlePageChange('settings');
      }
  
      return {
        init: init,
        handlePageChange: handlePageChange,
        handleAuthChange: handleAuthChange,
        refreshNotice: refreshNotice
      };
    })();
  

    /* +----------------------------------+
     * + INVENTORY MODULE                 +
     * + Lot-level stock / movement       +
     * +----------------------------------+ */
    /* +----------------------------------+
     * + INDEPENDENT OUTSOURCE MODULE     +
     * + Own cache + own Firebase path    +
     * +----------------------------------+ */
    var OutSource = (function () {
      var STORAGE_KEY = 'labAppOutsourceV1';
      var rows = [];
      var revision = 0;
      var initialized = false;
      var loading = false;
      var catalogLoading = false;
      var lastUpdatedAt = '';
      function clone(v){ try{return JSON.parse(JSON.stringify(v));}catch(e){return null;} }
      function token(){ return (typeof Auth!=='undefined'&&Auth.getToken)?Auth.getToken():''; }
      function normalize(){ rows=Array.isArray(rows)?rows.filter(function(r){return r&&typeof r==='object'&&!r.deletedAt;}):[]; }
      function saveLocal(){ try{safeStorageSet(STORAGE_KEY,JSON.stringify({version:1,updatedAt:lastUpdatedAt,rows:rows}));}catch(e){} }
      function loadLocal(){
        var raw=safeStorageGet(STORAGE_KEY); if(!raw)return false;
        var parsed=safeParse(raw); if(!parsed)return false;
        rows=Array.isArray(parsed.rows)?parsed.rows:[]; lastUpdatedAt=String(parsed.updatedAt||''); normalize(); return true;
      }
      function merge(incoming){
        var map={}; rows.forEach(function(r){if(r&&r.id)map[String(r.id)]=r;});
        (Array.isArray(incoming)?incoming:[]).forEach(function(r){
          if(!r||!r.id)return;
          var id=String(r.id), old=map[id];
          var rt=Date.parse(String(r.updatedAt||r.createdAt||''))||0, ot=Date.parse(String(old&&old.updatedAt||old&&old.createdAt||''))||0;
          if(!old||rt>=ot)map[id]=r;
        });
        rows=Object.keys(map).map(function(k){return map[k];}); normalize(); revision+=1; saveLocal();
      }
      function refresh(silent){
        if(loading||!token())return Promise.resolve(false);
        loading=true;
        return hoagApiRequest('action',{method:'getOutsourceSamples',args:[token()]}).then(function(result){
          if(result&&result.ok!==false){
            /* The API response is the authoritative OUTSOURCE snapshot. Do not merge it
               with browser cache: merging would resurrect rows that the server has deleted. */
            rows=Array.isArray(result.outsourceSamples)?result.outsourceSamples.filter(function(r){return r&&typeof r==='object'&&!r.deletedAt;}):[];
            revision+=1;
            lastUpdatedAt=String(result.updatedAt||'');
            saveLocal();
            if(typeof Modules!=='undefined'&&Modules.refreshOutsourceLive)Modules.refreshOutsourceLive();
          }
          return true;
        }).catch(function(error){console.warn('Independent OUTSOURCE refresh failed:',error&&error.message?error.message:error);return false;}).finally(function(){loading=false;});
      }
      function initPage(){
        if(!initialized){
          initialized=true;
          /* OUTSOURCE now uses stale-while-revalidate: paint the last local snapshot
             immediately, then replace it with the server-authoritative snapshot.
             This keeps the page responsive without changing the server as source of truth. */
          loadLocal();
          normalize();
          revision+=1;
        }
        if(typeof Modules!=='undefined'&&Modules.refreshOutsourceLive)Modules.refreshOutsourceLive();
        /* Refresh in the background so the existing rows are visible immediately. */
        refresh(true);
        return true;
      }
      function ensureReady(){if(!initialized){initialized=true;loadLocal();normalize();}return true;}
      function getSamples(){ensureReady();return rows.slice();}
      function getRevision(){return revision;}
      function upsertSample(row){
        ensureReady(); if(!row||!row.id)return;
        var id=String(row.id), idx=rows.findIndex(function(r){return String(r.id)===id;});
        var previous=idx>=0?rows[idx]:null;
        var now=new Date().toISOString();
        var next=Object.assign({},previous||{},clone(row)||{}, {updatedAt:now});
        if(!previous){next.createdAt=next.createdAt||now;next.createdBy=next.createdBy||String(state.authUserDisplayName||'UNKNOWN');}
        if(idx>=0)rows[idx]=next;else rows.push(next);
        normalize(); revision+=1; saveLocal();
        var expected=previous?String(previous.updatedAt||''):'';
        hoagApiRequest('action',{method:'upsertOutsourceSample',args:[clone(next),token(),expected]}).then(function(result){
          if(result&&result.ok!==false&&result.record){
            var i=rows.findIndex(function(r){return String(r.id)===id;}); if(i>=0)rows[i]=result.record;
            lastUpdatedAt=String(result.updatedAt||lastUpdatedAt); revision+=1; saveLocal();
          }
        }).catch(function(error){console.warn('OUTSOURCE save failed:',error&&error.message?error.message:error);});
      }
      function deleteSample(id){
        ensureReady(); var rid=String(id||''); if(!rid)return Promise.resolve(false);
        var row=rows.find(function(r){return String(r.id)===rid;}); if(!row)return Promise.resolve(false);
        /* Delete locally only after the server confirms the record-level delete.
           This prevents a failed request from looking successful and then being
           silently restored by the next refresh. */
        return hoagApiRequest('action',{method:'deleteOutsourceSample',args:[rid,token(),String(row.updatedAt||'')]}).then(function(result){
          if(!result||result.ok===false||result.deleted!==true){
            throw new Error(result&&result.error?result.error:'Outsource delete was not committed.');
          }
          rows=rows.filter(function(r){return String(r.id)!==rid;}); revision+=1; saveLocal();
          lastUpdatedAt=String(result.updatedAt||lastUpdatedAt||'');
          if(typeof Modules!=='undefined'&&Modules.refreshOutsourceLive)Modules.refreshOutsourceLive();
          return true;
        });
      }
      function bulkUpsert(list){(Array.isArray(list)?list:[]).forEach(function(row){upsertSample(row);});return Array.isArray(list)?list.length:0;}
      function loadCatalog(){
        if(catalogLoading)return; catalogLoading=true;
        hoagApiRequest('action',{method:'getOutsourceCatalog',args:[token()]}).then(function(result){
          if(result&&result.ok!==false){window.__outsourceCatalog=result;}
        }).catch(function(error){console.warn('OUTSOURCE catalog load failed:',error&&error.message?error.message:error);}).finally(function(){catalogLoading=false;});
      }
      return {initPage:initPage,ensureReady:ensureReady,getSamples:getSamples,getRevision:getRevision,upsertSample:upsertSample,deleteSample:deleteSample,bulkUpsert:bulkUpsert,refresh:refresh,loadCatalog:loadCatalog};
    })();

    var Inventory = (function () {
      var STORAGE_KEY = 'labAppInventoryV2';
      var initialized = false;
      var dbPath = 'labapp/inventory';
      var data = { version: 4, items: [], transactions: [], deletedTransactionIds: {}, deletedItemIds: {}, monthlyPrices: {}, monthlySnapshots: {} };
      var sharedUpdatedAt = '';
      var sharedSyncBusy = false;
      var sharedPollTimer = null;
      var sharedRealtimeRef = null;
      var currentView = 'ITEMS';
      var selectedPriceMonth = new Date().toISOString().slice(0,7);
      var staffNames = ['SHOUNNA', 'LIZA', 'JAYANTHI', 'SURIANI', 'TOMMY', 'JAPIDI', 'NAZRAN'];
      /* Inventory has its own IIFE scope. Keep the outsource auth-token helper local here;
         the Modules-scoped helper is not visible from this module. */
      function outsourceAdminToken(){ return (typeof Auth!=='undefined' && Auth.getToken) ? Auth.getToken() : ''; }
      var seedItems = [
        ['REAGENT','BIOCHEMISTRY','Urea',1512.80,0,5],['REAGENT','BIOCHEMISTRY','Creatinine',950.40,0,5],['REAGENT','BIOCHEMISTRY','Uric Acid',3225,0,5],['REAGENT','BIOCHEMISTRY','Albumin',892.80,0,5],['REAGENT','BIOCHEMISTRY','Total Protein',990,0,5],['REAGENT','BIOCHEMISTRY','Alkaline Phosphatase',1410.40,0,5],['REAGENT','BIOCHEMISTRY','Alanine Transaminase',2038.40,0,5],['REAGENT','BIOCHEMISTRY','Aspartate Transferase',1803.20,0,5],['REAGENT','BIOCHEMISTRY','Total Bilirubin',2171.20,0,5],['REAGENT','BIOCHEMISTRY','Direct Bilirubin',4195.20,0,5],['REAGENT','BIOCHEMISTRY','Cholesterol',1783.60,0,5],['REAGENT','BIOCHEMISTRY','Triglyceride',3900,0,5],['REAGENT','BIOCHEMISTRY','HDL-Cholesterol',4950.60,0,5],['REAGENT','BIOCHEMISTRY','Glucose',2098.40,0,5],['REAGENT','BIOCHEMISTRY','Chloride, Na, K',800,0,5],['REAGENT','BIOCHEMISTRY','ISE Buffer',0,8,2],['REAGENT','BIOCHEMISTRY','ISE Mid Standard',0,7,2],['REAGENT','BIOCHEMISTRY','ISE Low Serum Standard',0,0,2],['REAGENT','BIOCHEMISTRY','ISE High Serum Standard',0,0,2],['REAGENT','BIOCHEMISTRY','ISE Na+/K+ Selectivity Check',0,0,2],['REAGENT','BIOCHEMISTRY','Cleaning Solution',0,4,2],['REAGENT','BIOCHEMISTRY','Wash Solution',0,9,2],['REAGENT','BIOCHEMISTRY','System Calibrator',0,0,2],['REAGENT','BIOCHEMISTRY','HDL Calibrator',0,0,2],['REAGENT','BIOCHEMISTRY','ISE Reference',0,7,2],['REAGENT','BIOCHEMISTRY','BIORAD Lypocheck Assay Chemistry QC1',1059,0,2],['REAGENT','BIOCHEMISTRY','BIORAD Lypocheck Assay Chemistry QC2',1059,0,2],['REAGENT','BIOCHEMISTRY','LIQUECHECK Paediatric Control LEVEL 1',1048,0,2],['REAGENT','BIOCHEMISTRY','LIQUECHECK Paediatric Control LEVEL 2',1048,0,2],['REAGENT','BIOCHEMISTRY','EQA RIQAS Monthly Clinical Chemistry',0,0,2],['REAGENT','BIOCHEMISTRY','EQA RIQAS Neonatal Bilirubin',0,0,2],
        ['REAGENT','HAEMATOLOGY','Haematology Full Blood Count EQA (RCPA)',0,0,2],['REAGENT','HAEMATOLOGY','ESR Control L1',1126,0,2],['REAGENT','HAEMATOLOGY','ESR Control L2',1126,0,2],['REAGENT','HAEMATOLOGY','Invitrocell Reverse A1-A2-B-O',435,0,2],['REAGENT','HAEMATOLOGY','Anti A,B,AB,D 10mL/Vial',0,0,2],['REAGENT','HAEMATOLOGY','ABO Grouping QC1',445,0,2],['REAGENT','HAEMATOLOGY','ABO Grouping QC2',445,0,2],['REAGENT','HAEMATOLOGY','Randox G6PD Screen Test',1650,0,2],['REAGENT','HAEMATOLOGY','DXH 560 Reagent Set',0,0,2],['REAGENT','HAEMATOLOGY','DXH 560 Quality Control',0,0,2],['REAGENT','HAEMATOLOGY','Novaclone Anti-A 10ml/vial',26,0,2],['REAGENT','HAEMATOLOGY','Novaclone Anti-B 10ml/vial',26,0,2],['REAGENT','HAEMATOLOGY','Novaclone Anti-A,B 10ml/vial',35,0,2],['REAGENT','HAEMATOLOGY','Novaclone Anti-D (Anti Rh) IgM+IgG 10ml/vial',40,0,2],
        ['REAGENT','MICROBIOLOGY','Ziehl Neelsen Stain Set M. Leprae',295,2,2],['REAGENT','MICROBIOLOGY','Giemsa Stain',450,2,2],['REAGENT','MICROBIOLOGY','Rapid TB Fluorescence Stain (Auramine O)',460,2,2],['REAGENT','MICROBIOLOGY','Leptospira IgM',250,0,2],['REAGENT','MICROBIOLOGY','Covid 19 Kit',5.50,0,2],['REAGENT','MICROBIOLOGY','Influenza Test Kit',0,0,2],['REAGENT','MICROBIOLOGY','Buffer Tablet pH 7.2',0,3,2],
        ['REAGENT','URINE/STOOL ANALYSIS','Mission 10U Urinalysis Strips',80,0,5],['REAGENT','URINE/STOOL ANALYSIS','Mission urine Glucose/Protein Strip',10,0,5],['REAGENT','URINE/STOOL ANALYSIS','Mission Cre/Alb Urine Reagent Strip',160,20,5],['REAGENT','URINE/STOOL ANALYSIS','Ecotest HCG UPT Strip',50,0,5],['REAGENT','URINE/STOOL ANALYSIS','RIQAS Urinalysis',0,0,5],['REAGENT','URINE/STOOL ANALYSIS','QC Urinalysis',1235,0,5],
        ['REAGENT','ETC','ABG Cartridge POCT ED',480,0,2],['REAGENT','ETC','Blood Glucose POCT',11.50,50,5],['REAGENT','ETC','Blood Glucose Solution',0,10,2],['REAGENT','ETC','Ketone Strip POCT',225,17,2],['REAGENT','ETC','Ketone Control Solution',0,12,2],['REAGENT','ETC','Glucose Powder 75g',4,0,2],['REAGENT','ETC','Sticker Barcode',0,0,10],
        ['REAGENT','OUTSOURCE INDENT','Blood C&S Aerobic',0,0,2],['REAGENT','OUTSOURCE INDENT','Blood C&S Anaerobic',0,0,2],['REAGENT','OUTSOURCE INDENT','Blood C&S Paediatric',0,5,2],['REAGENT','OUTSOURCE INDENT','Blood C&S Myco/F',0,4,2],['REAGENT','OUTSOURCE INDENT','Charcoal Swab',0,13,2],['REAGENT','OUTSOURCE INDENT','Sodium Citrate Tube (Coagulation)',0,0,2],['REAGENT','OUTSOURCE INDENT','Urine 24H (Plain)',0,16,2],['REAGENT','OUTSOURCE INDENT','Urine 24H (Thymol)',0,13,2],['REAGENT','OUTSOURCE INDENT','Urine 24H (VMA)',0,6,2],['REAGENT','OUTSOURCE INDENT','VTM Swab Sterile',0,0,2],['REAGENT','OUTSOURCE INDENT','MTB IGRA',0,0,2],['REAGENT','OUTSOURCE INDENT','Dengue Combo',0,6,2],['REAGENT','OUTSOURCE INDENT','Faecal Occult Blood',0,0,2],['REAGENT','OUTSOURCE INDENT','Falcon Tube',0,0,2],
        ['CONSUMABLE','CONSUMABLES','Thermal Printer Paper For Urine Analyzer',0,0,5],['CONSUMABLE','CONSUMABLES','K2EDTA Tube 2mL (Lavender)',0,13,10],['CONSUMABLE','CONSUMABLES','Gel Tube with Clot Activator 3.6mL (Yellow)',0,20,10],['CONSUMABLE','CONSUMABLES','KFNa2 Spray Dried 3.6mL (Grey Cap)',0,20,10],['CONSUMABLE','CONSUMABLES','K2EDTA Microtainer Peads',0,0,10],['CONSUMABLE','CONSUMABLES','Lithium Heparin + Gel 500µL Paeds',0,0,10],['CONSUMABLE','CONSUMABLES','Biohazard Specimen With Zip',0,0,10],['CONSUMABLE','CONSUMABLES','Alcohol Swabs',0,0,20],['CONSUMABLE','CONSUMABLES','Applicator Sticks',0,0,20],['CONSUMABLE','CONSUMABLES','Disposable Pasteur Pipette 3mL',0,5,20],['CONSUMABLE','CONSUMABLES','3M VFEX Particulate Respirator N95 9150',0,0,20],['CONSUMABLE','CONSUMABLES','Latex Glove size M (Non Powder)',0,0,20],['CONSUMABLE','CONSUMABLES','Borosilicate Rimless Test Tube',0,0,20],['CONSUMABLE','CONSUMABLES','Parafilm 4x125fts',0,0,20],['CONSUMABLE','CONSUMABLES','Lens Tissue Wipe',0,0,20],['CONSUMABLE','CONSUMABLES','Immersion Oil (100ml)',0,0,5],['CONSUMABLE','CONSUMABLES','Formaldehyde Solution 10%',0,0,5],['CONSUMABLE','CONSUMABLES','ESR Vacuum Tube Monosed With 3.2 Sodium Citrate',0,1,10],['CONSUMABLE','CONSUMABLES','Isolation Gown 42G /Pack Of 10pcs',0,0,20],['CONSUMABLE','CONSUMABLES','Chemical Spill Pack',0,0,5],['CONSUMABLE','CONSUMABLES','Glass Slide Storage Box for 100 slides',0,0,5],['CONSUMABLE','CONSUMABLES','Plastic Slide Mailer for 5 slide',0,0,10],['CONSUMABLE','CONSUMABLES','Filter Paper 125mm',0,0,10],['CONSUMABLE','CONSUMABLES','Stool Container With Spoon',0,1,20],['CONSUMABLE','CONSUMABLES','Universal Container Yellow Cap',0,0,20],['CONSUMABLE','CONSUMABLES','Styrofoam Box',0,0,10],['CONSUMABLE','CONSUMABLES','Plastic Spatula',0,0,20],['CONSUMABLE','CONSUMABLES','Cover Slip Glass',0,0,20],['CONSUMABLE','CONSUMABLES','LTS Fluorescence Assist Slide',0,40,20],['CONSUMABLE','CONSUMABLES','Frosted Slide (Frosted End)',0,10,20],['CONSUMABLE','CONSUMABLES','Hand Sanitizer Alcohol Based 500mL',0,0,10],['CONSUMABLE','CONSUMABLES','Sticker Label Size 2cm x3cm (1000pcs)',0,60,100],['CONSUMABLE','CONSUMABLES','3 Ply Disposable Mask',0,6,20],['CONSUMABLE','CONSUMABLES','Plastic Apron Putih',0,0,20],['CONSUMABLE','CONSUMABLES','Clear Glass Slide (Non Frosted End)',0,55,20]
      ];

      function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
      function money(v){return 'RM'+Number(v||0).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2});}
      function nowIso(){return new Date().toISOString();}
      function localDateKey(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
      function isoForMovementDate(dateKey){var p=String(dateKey||'').split('-');if(p.length!==3)return nowIso();var n=new Date();var d=new Date(Number(p[0]),Number(p[1])-1,Number(p[2]),n.getHours(),n.getMinutes(),n.getSeconds(),0);return isNaN(d.getTime())?nowIso():d.toISOString();}
      function id(){return 'inv-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
      function getUserName(){return cleanText(state.authUserDisplayName||'')||'UNKNOWN';}
      function normalize(){
        if(!data||typeof data!=='object') data={};
        data.items=Array.isArray(data.items)?data.items:[];
        data.transactions=Array.isArray(data.transactions)?data.transactions:[];
        /* Purge legacy cross-module fields so Inventory stays Inventory-only. */
        delete data.outsourceSamples;
        delete data.deletedOutsourceSampleIds;
        delete data.outsourceMigrationFlags;
        delete data.transfusionRecords;
        delete data.deletedTransfusionRecordIds;
        if(!data.deletedTransactionIds||typeof data.deletedTransactionIds!=='object'||Array.isArray(data.deletedTransactionIds)) data.deletedTransactionIds={};
        if(!data.deletedItemIds||typeof data.deletedItemIds!=='object'||Array.isArray(data.deletedItemIds)) data.deletedItemIds={};
        if(!data.monthlyPrices||typeof data.monthlyPrices!=='object'||Array.isArray(data.monthlyPrices)) data.monthlyPrices={};
        if(!data.monthlySnapshots||typeof data.monthlySnapshots!=='object'||Array.isArray(data.monthlySnapshots)) data.monthlySnapshots={};
      }
      function seed(){
        if(data.items.length) return;
        data.items=seedItems.map(function(x,i){return {id:'item-'+String(i+1).padStart(3,'0'),type:x[0],category:x[1],name:x[2],price:Number(x[3]),openingStock:Number(x[4]||0),minStock:Number(x[5]||1),active:true};});
      }
      function currentMonthKey(){
        /* Inventory accounting month is always based on Malaysia time (Asia/Kuala_Lumpur),
         * not the browser/device timezone. */
        var p=getAppNowParts();
        return Number(p.year)+'-'+String(p.month).padStart(2,'0');
      }
      var inventoryRolloverMonthKey=null;
      var inventoryRolloverTimer=null;
      var inventoryRolloverBusy=false;
      function ensureInventoryMonthRollover(force){
        normalize();
        var currentKey=currentMonthKey();
        var previousKey=inventoryRolloverMonthKey || data.inventoryAccountingMonthKey || currentKey;
        if(!force && currentKey===previousKey){
          data.inventoryAccountingMonthKey=currentKey;
          return false;
        }
        if(inventoryRolloverBusy) return false;
        inventoryRolloverBusy=true;
        try{
          normalize();
          inventoryRolloverMonthKey=currentKey;
          data.inventoryAccountingMonthKey=currentKey;
          if(currentView==='MONTHLY' && initialized) renderMonthlyMovement();
          return true;
        }finally{
          inventoryRolloverBusy=false;
        }
      }
      function startInventoryMonthRolloverWatcher(){
        clearInterval(inventoryRolloverTimer);
        inventoryRolloverMonthKey=data.inventoryAccountingMonthKey||null;
        ensureInventoryMonthRollover(false);
        inventoryRolloverTimer=setInterval(function(){
          if(!initialized)return;
          ensureInventoryMonthRollover(false);
        },30000);
      }
      function ensureCurrentMonthPrices(){
        ensureInventoryMonthRollover(false);
        normalize();
        var key=currentMonthKey();
        if(!data.monthlyPrices[key]) data.monthlyPrices[key]={};
        var changed=false;
        data.items.forEach(function(item){
          var price=Number(item.price||0);
          if(!Object.prototype.hasOwnProperty.call(data.monthlyPrices[key],item.id)){
            data.monthlyPrices[key][item.id]=price;
            changed=true;
          }
        });
        return changed;
      }
      function monthLabel(key){
        var parts=String(key||'').split('-');
        var d=new Date(Number(parts[0])||new Date().getFullYear(),(Number(parts[1])||1)-1,1);
        return d.toLocaleDateString('en-MY',{month:'long',year:'numeric'});
      }
      function saveLocal(){try{safeStorageSet(STORAGE_KEY,JSON.stringify(data));}catch(e){}}
      function loadLocal(){
        var raw=safeStorageGet(STORAGE_KEY); if(!raw) return false;
        var parsed=safeParse(raw); if(!parsed) return false; data=parsed; normalize(); saveLocal(); return true;
      }
      function db(){return null;}
      function cloneData(value){
        try { return JSON.parse(JSON.stringify(value)); } catch(e) { return null; }
      }
      function stopSharedInventoryRealtime(){
        try{ if(sharedRealtimeRef&&typeof sharedRealtimeRef.off==='function') sharedRealtimeRef.off('value',handleSharedInventoryRealtime); }catch(e){}
        sharedRealtimeRef=null;
      }
      function handleSharedInventoryRealtime(snapshot){
        if(!snapshot||!snapshot.exists()) return;
        var wrapper=snapshot.val()||{};
        var remote=wrapper.inventory||wrapper.data||wrapper;
        if(!remote||typeof remote!=='object'||!Array.isArray(remote.items)) return;
        sharedUpdatedAt=String(wrapper.updatedAt||sharedUpdatedAt||'');
        var before=JSON.stringify({items:data.items,transactions:data.transactions,deletedTransactionIds:data.deletedTransactionIds,monthlyPrices:data.monthlyPrices,monthlySnapshots:data.monthlySnapshots});
        mergeCloudAuthoritative(remote, false);
        var after=JSON.stringify({items:data.items,transactions:data.transactions,deletedTransactionIds:data.deletedTransactionIds,monthlyPrices:data.monthlyPrices,monthlySnapshots:data.monthlySnapshots});
        if(before!==after){ saveLocal(); render(); }
      }
      function startSharedInventoryRealtime(){
        stopSharedInventoryRealtime();
        if(!initialized) return false;
        scheduleSharedPoll();
        return false;
      }
      function scheduleSharedPoll(){
        clearTimeout(sharedPollTimer);
        sharedPollTimer=setTimeout(function(){
          sharedPollTimer=null;
          if(!initialized || sharedSyncBusy){ scheduleSharedPoll(); return; }
          checkSharedInventoryVersion();
        }, 5000);
      }
      function checkSharedInventoryVersion(){
        var token=(typeof Auth!=='undefined'&&Auth.getToken)?Auth.getToken():'';
        if(!token || !hasVercelBackend()){scheduleSharedPoll();return;}
        hoagApi.run.withSuccessHandler(function(result){
          var remoteStamp=String(result&&result.updatedAt||'');
          if(remoteStamp && remoteStamp!==String(sharedUpdatedAt||'')) loadRemote(true);
          else scheduleSharedPoll();
        }).withFailureHandler(function(){ scheduleSharedPoll(); }).getSharedInventoryMeta(token);
      }
      function saveRemote(options){
        options=options||{};
        if(sharedSyncBusy && !options.force) return;
        var token=(typeof Auth!=='undefined'&&Auth.getToken)?Auth.getToken():'';
        if(!token || !hasVercelBackend()) return;
        sharedSyncBusy=true;
        hoagApi.run.withSuccessHandler(function(result){
          sharedSyncBusy=false;
          if(result && result.ok===false && result.conflict){
            var cloud=result.inventory||{};
            mergeCloudAuthoritative(cloud);
            sharedUpdatedAt=String(result.updatedAt||sharedUpdatedAt||'');
            saveLocal();
            render();
            scheduleSharedPoll();
            window.alert('Inventory changed on another device. The latest data has been loaded; review it and retry your change.');
            return;
          }
          if(result && result.ok!==false){
            sharedUpdatedAt=String(result.updatedAt||sharedUpdatedAt||'');
            if(result.inventory && typeof result.inventory==='object' && Array.isArray(result.inventory.items)){
              mergeCloudAuthoritative(result.inventory);
              saveLocal();
              render();
            }
          }
          // The revision poll detects changes from other clients without a read/write loop.
          scheduleSharedPoll();
        }).withFailureHandler(function(error){
          sharedSyncBusy=false;
          console.warn('Shared Inventory save failed:',error&&error.message?error.message:error);
          scheduleSharedPoll();
        }).saveSharedInventory(cloneData(data), token, sharedUpdatedAt);
      }
      function mergeCloudAuthoritative(cloud){
        if(!cloud || typeof cloud!=='object' || !Array.isArray(cloud.items)) return false;
        var snapshot=cloneData(cloud);
        if(!snapshot) return false;
        // Preserve each stored record as received. Version repair, tombstone
        // filtering, status conversion, and local reconstruction belong in an
        // explicit reviewed operation, never on a normal read.
        data=snapshot;
        normalize();
        return true;
      }
      function loadRemote(silent){
        var token=(typeof Auth!=='undefined'&&Auth.getToken)?Auth.getToken():'';
        if(!token || !hasVercelBackend()) { render(); return Promise.resolve(false); }
        if(sharedSyncBusy) return Promise.resolve(false);
        sharedSyncBusy=true;
        return new Promise(function(resolve){
          hoagApi.run.withSuccessHandler(function(result){
            sharedSyncBusy=false;
            if(!result || result.ok===false){
              scheduleSharedPoll(); render(); resolve(false); return;
            }
            var remote=result.inventory||{};
            sharedUpdatedAt=String(result.updatedAt||'');
            var remoteHasData=(Array.isArray(remote.items)&&remote.items.length>0)||
              (Array.isArray(remote.transactions)&&remote.transactions.length>0)||
              (remote.monthlyPrices&&Object.keys(remote.monthlyPrices).length>0)||
              (remote.monthlySnapshots&&Object.keys(remote.monthlySnapshots).length>0);
            if(!remoteHasData){
              // A read must not seed or replace the shared production inventory.
              render(); scheduleSharedPoll(); resolve(false); return;
            }
            mergeCloudAuthoritative(remote);
            saveLocal();
            if(!silent) render(); else render();
            scheduleSharedPoll();
            resolve(true);
          }).withFailureHandler(function(error){
            sharedSyncBusy=false;
            console.warn('Shared Inventory load failed:',error&&error.message?error.message:error);
            scheduleSharedPoll(); render(); resolve(false);
          }).getSharedInventory(token);
        });
      }
      function handleAuthLogout(){
        stopSharedInventoryRealtime();
        clearTimeout(sharedPollTimer);
        sharedPollTimer=null;
      }
      function persist(){
        saveLocal();
        saveRemote();
      }
      function getItem(itemId){return data.items.find(function(x){return x.id===itemId;})||null;}
      function getTransactionsForItem(itemId){return data.transactions.filter(function(t){return t.itemId===itemId;});}
      function signedQty(t){return t.type==='OUT'?-Number(t.qty||0):Number(t.qty||0);}
      function itemBalance(itemId){
        var item=getItem(itemId);
        if(!item)return 0;
        var opening=Number(item.openingStock||0);
        return opening+getTransactionsForItem(itemId).reduce(function(sum,t){return sum+signedQty(t);},0);
      }
      function lotsForItem(itemId){
        var map={};
        getTransactionsForItem(itemId).forEach(function(t){
          var lot=(cleanText(t.lotNo)||'OPENING / NO LOT');
          if(!map[lot]) map[lot]={lotNo:lot,qty:0,expiry:'',lastMovement:t.at||'',hasIn:false};
          map[lot].qty+=signedQty(t);
          if(t.type==='IN') {map[lot].hasIn=true;if(t.expiry && (!map[lot].expiry||t.expiry<map[lot].expiry)) map[lot].expiry=t.expiry;}
          if(t.expiry && !map[lot].expiry) map[lot].expiry=t.expiry;
        });
        var item=getItem(itemId);
        if(item&&item.openingStock){
          if(!map['OPENING / NO LOT'])map['OPENING / NO LOT']={lotNo:'OPENING / NO LOT',qty:0,expiry:'',lastMovement:'',hasIn:false};
          map['OPENING / NO LOT'].qty+=Number(item.openingStock||0);
        }
        return Object.keys(map).map(function(k){return map[k];}).filter(function(x){return x.qty>0;});
      }
      function allLots(){var rows=[];data.items.forEach(function(item){lotsForItem(item.id).forEach(function(l){rows.push({item:item,lot:l});});});return rows;}
      function expiryStatus(expiry){
        if(!expiry)return '';
        var end=new Date(expiry+'T23:59:59');var days=Math.ceil((end.getTime()-Date.now())/86400000);
        if(days<0)return 'EXPIRED'; if(days<=60)return 'EXPIRING'; return '';
      }
      // Alert banner only: warn 2 calendar months before expiry. The status dropdown remains unchanged at <=30 days.
      // Accept YYYY-MM-DD plus common date-like values stored by older inventory records.
      function parseExpiryDate(expiry){
        if(!expiry)return null;
        if(expiry instanceof Date)return isNaN(expiry.getTime())?null:expiry;
        var raw=String(expiry).trim();
        if(!raw)return null;
        var end=new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw)?raw+'T23:59:59':raw);
        return isNaN(end.getTime())?null:end;
      }
      function expiryWarning(expiry){
        var end=parseExpiryDate(expiry);
        if(!end || end.getTime() < Date.now())return false;
        var cutoff=new Date();
        cutoff.setMonth(cutoff.getMonth()+2);
        cutoff.setHours(23,59,59,999);
        return end.getTime() <= cutoff.getTime();
      }
      function expiryFromRecord(record){
        if(!record)return '';
        return cleanText(record.expiry||record.expiryDate||record.expirationDate||record.expires||'');
      }
      function itemStatus(item){var b=itemBalance(item.id); if(b<=0)return 'OUT'; if(b<=Number(item.minStock||0))return 'LOW'; return 'OK';}
      function inventoryDisplayStatus(item){var stock=itemStatus(item);if(stock==='OUT')return 'OUT';var lots=lotsForItem(item.id);if(lots.some(function(l){return expiryStatus(l.expiry)==='EXPIRED';}))return 'EXPIRED';if(stock==='LOW')return 'LOW';if(lots.some(function(l){return expiryStatus(l.expiry)==='EXPIRING';}))return 'EXPIRING';return 'OK';}
      function kpis(){
        var active=data.items.filter(function(i){return i.active!==false;});var low=active.filter(function(i){return itemStatus(i)==='LOW'||itemStatus(i)==='OUT';}).length;var lots=allLots();var exp=lots.filter(function(x){return expiryStatus(x.lot.expiry)==='EXPIRING';}).length;var expired=lots.filter(function(x){return expiryStatus(x.lot.expiry)==='EXPIRED';}).length;var value=active.reduce(function(s,i){return s+itemBalance(i.id)*Number(i.price||0);},0);
        return '<div class="inventory-kpi"><span>TOTAL ITEMS</span><strong>'+active.length+'</strong><small>Master items</small></div><div class="inventory-kpi"><span>ACTIVE LOTS</span><strong>'+lots.length+'</strong><small>Lot balances &gt; 0</small></div><div class="inventory-kpi"><span>LOW / OUT</span><strong>'+low+'</strong><small>At or below minimum</small></div><div class="inventory-kpi"><span>EXPIRING ≤ 60D</span><strong>'+exp+'</strong><small>Lot-level expiry</small></div><div class="inventory-kpi"><span>STOCK VALUE</span><strong>'+money(value)+'</strong><small>Current balance × price</small></div>';
      }
      function transactionMonthKey(t){var d=t&&t.at?new Date(t.at):null;if(!d||isNaN(d.getTime()))return '';return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
      function totalInForItem(itemId,monthKey){
        var key=monthKey||currentMonthKey();
        return getTransactionsForItem(itemId).filter(function(t){return t.type==='IN'&&transactionMonthKey(t)===key;}).reduce(function(sum,t){return sum+Number(t.qty||0);},0);
      }
      function totalOutForItem(itemId,monthKey){
        var key=monthKey||currentMonthKey();
        return getTransactionsForItem(itemId).filter(function(t){return t.type==='OUT'&&transactionMonthKey(t)===key;}).reduce(function(sum,t){return sum+Number(t.qty||0);},0);
      }
      function renderItems(){
        var q=(cleanText(($('inventorySearch')||{}).value)||'').toLowerCase();var cat=($('inventoryCategoryFilter')||{}).value||'ALL';var status=($('inventoryStatusFilter')||{}).value||'ALL';
        var rows=data.items.filter(function(i){if(i.active===false)return false;if(cat!=='ALL'&&i.category!==cat)return false;var st=itemStatus(i);if(status==='LOW'&&st!=='LOW')return false;if(status==='OUT'&&st!=='OUT')return false;if(status==='EXPIRING'&&!allLots().filter(function(x){return x.item.id===i.id&&expiryStatus(x.lot.expiry)==='EXPIRING';}).length)return false;if(status==='EXPIRED'&&!allLots().filter(function(x){return x.item.id===i.id&&expiryStatus(x.lot.expiry)==='EXPIRED';}).length)return false;return !q||[i.name,i.category,i.type].join(' ').toLowerCase().indexOf(q)!==-1;}).sort(function(a,b){return String(a.name||'').localeCompare(String(b.name||''),'en',{sensitivity:'base',numeric:true});});
        var html='<table class="inventory-table"><thead><tr><th>ITEM</th><th>CATEGORY</th><th>PRICE / UNIT</th><th class="inventory-center-head">TOTAL IN</th><th class="inventory-center-head">TOTAL OUT</th><th class="inventory-center-head">BALANCE</th><th>VALUE</th><th>LOT(S)</th><th>STATUS</th></tr></thead><tbody>';
        var monthKey=currentMonthKey();
        rows.forEach(function(i){var lots=lotsForItem(i.id);var st=itemStatus(i);var displaySt=inventoryDisplayStatus(i);var totalIn=totalInForItem(i.id,monthKey);var totalOut=totalOutForItem(i.id,monthKey);var balance=itemBalance(i.id);var rowClass=st==='OUT'?'inventory-status-out':st==='LOW'?'inventory-status-low':displaySt==='EXPIRED'?'inventory-status-expired':displaySt==='EXPIRING'?'inventory-status-expiring':'';var badgeClass=displaySt==='OK'?'ok':displaySt==='LOW'?'low':displaySt==='OUT'||displaySt==='EXPIRED'?'expired':'expiring';html+='<tr class="inventory-item-row '+rowClass+'" data-inventory-item-id="'+esc(i.id)+'" tabindex="0" title="Click to view Stock In / Stock Out records"><td><div class="inventory-item-name">'+esc(i.name)+'</div></td><td>'+esc(i.category)+'</td><td class="inventory-money">'+money(i.price)+'</td><td class="inventory-num inventory-center-num">'+totalIn+'</td><td class="inventory-num inventory-center-num">'+totalOut+'</td><td class="inventory-num inventory-center-num">'+balance+'</td><td class="inventory-money">'+money(balance*Number(i.price||0))+'</td><td>'+ (lots.length?lots.map(function(l){return '<span class="inventory-badge legacy">'+esc(l.lotNo)+': '+l.qty+'</span>';}).join(' '):'<span class="inventory-muted">—</span>')+'</td><td><span class="inventory-badge '+badgeClass+'">'+esc(displaySt)+'</span></td></tr>';});
        html+='</tbody></table>';if(!rows.length)html='<div class="inventory-empty">No inventory items match the current filter.</div>';($('inventoryTableWrap')||{}).innerHTML=html;
      }
      function renderLots(){
        var q=(cleanText(($('inventorySearch')||{}).value)||'').toLowerCase();var cat=($('inventoryCategoryFilter')||{}).value||'ALL';var status=($('inventoryStatusFilter')||{}).value||'ALL';var rows=allLots().filter(function(x){var es=expiryStatus(x.lot.expiry);if(cat!=='ALL'&&x.item.category!==cat)return false;if(status==='EXPIRING'&&es!=='EXPIRING')return false;if(status==='EXPIRED'&&es!=='EXPIRED')return false;if(status==='LOW'&&itemStatus(x.item)!=='LOW')return false;if(status==='OUT'&&itemStatus(x.item)!=='OUT')return false;return !q||[x.item.name,x.item.category,x.lot.lotNo,x.lot.expiry].join(' ').toLowerCase().indexOf(q)!==-1;}).sort(function(a,b){var n=String(a.item.name||'').localeCompare(String(b.item.name||''),'en',{sensitivity:'base',numeric:true});return n||String(a.lot.expiry||'9999').localeCompare(String(b.lot.expiry||'9999'));});
        var html='<table class="inventory-table"><thead><tr><th>ITEM</th><th>LOT NO.</th><th>EXPIRY</th><th>STOCK</th><th>PRICE / UNIT</th><th>STOCK VALUE</th><th>STATUS</th></tr></thead><tbody>';
        rows.forEach(function(x){var es=expiryStatus(x.lot.expiry);var cls=es==='EXPIRED'?'expired':es==='EXPIRING'?'expiring':'ok';html+='<tr><td class="inventory-item-name">'+esc(x.item.name)+'</td><td><strong>'+esc(x.lot.lotNo)+'</strong></td><td>'+esc(x.lot.expiry||'—')+'</td><td class="inventory-num">'+x.lot.qty+'</td><td>'+money(x.item.price)+'</td><td>'+money(x.lot.qty*x.item.price)+'</td><td><span class="inventory-badge '+cls+'">'+(es||'ACTIVE')+'</span></td></tr>';});html+='</tbody></table>';if(!rows.length)html='<div class="inventory-empty">No active lots match the current filter.</div>';($('inventoryTableWrap')||{}).innerHTML=html;
      }
      function renderHistory(){
        var q=(cleanText(($('inventorySearch')||{}).value)||'').toLowerCase();var rows=data.transactions.slice().sort(function(a,b){return String(b.at).localeCompare(String(a.at));}).filter(function(t){var item=getItem(t.itemId);return item&&(!q||[item.name,t.lotNo,t.staff,t.type,t.notes].join(' ').toLowerCase().indexOf(q)!==-1);});
        var html='<table class="inventory-table"><thead><tr><th>DATE / TIME</th><th>ITEM</th><th>MOVEMENT</th><th>LOT NO.</th><th>QTY</th><th>EXPIRY</th><th>STAFF</th><th>NOTES</th><th class="inventory-history-edit-head">ACTIONS</th></tr></thead><tbody>';
        rows.slice(0,500).forEach(function(t){var item=getItem(t.itemId);var actions=inventoryAdminAllowed()?'<td class="inventory-history-edit-cell"><div class="inventory-history-actions"><button type="button" class="inventory-history-edit-btn" data-inventory-edit-id="'+esc(t.id)+'" title="Edit '+esc(t.type==='IN'?'Stock In':'Stock Out')+'">EDIT</button><button type="button" class="inventory-history-delete-btn" data-inventory-delete-id="'+esc(t.id)+'" title="Delete '+esc(t.type==='IN'?'Stock In':'Stock Out')+'">DELETE</button></div></td>':'<td class="inventory-history-edit-cell"><span class="inventory-muted">ADMIN ONLY</span></td>';html+='<tr><td>'+new Date(t.at).toLocaleString('en-MY',{dateStyle:'medium',timeStyle:'short'})+'</td><td class="inventory-item-name">'+esc(item?item.name:'Unknown')+'</td><td><span class="inventory-badge '+(t.type==='IN'?'ok':'low')+'">'+t.type+'</span></td><td>'+esc(t.lotNo||'OPENING / NO LOT')+'</td><td class="inventory-num">'+(t.type==='OUT'?'-':'')+Number(t.qty||0)+'</td><td>'+esc(t.expiry||'—')+'</td><td>'+esc(t.staff||'—')+'</td><td class="inventory-muted">'+esc(t.notes||'')+'</td>'+actions+'</tr>';});
        html+='</tbody></table>';if(!rows.length)html='<div class="inventory-empty">No stock movements recorded yet.</div>';($('inventoryTableWrap')||{}).innerHTML=html;
      }

      function priceForMonth(item, key){
        var bucket=data.monthlyPrices&&data.monthlyPrices[key];
        var v=bucket&&bucket[item.id];
        // The current master PRICE / UNIT is the authoritative price for the
        // active month. Legacy monthlyPrices entries must not freeze the
        // Monthly Stock In / Out calculation at an old or zero price.
        if(String(key||'')===currentMonthKey()) return Number(item.price||0);
        return v==null?Number(item.price||0):Number(v||0);
      }
      function monthKeyOffset(key, offset){
        var p=String(key||currentMonthKey()).split('-');
        var d=new Date(Number(p[0]),(Number(p[1]||1)-1)+offset,1);
        return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
      }
      function monthlyMovementStats(monthKey, category){
        var start=monthKey+'-01T00:00:00';
        var next=monthKeyOffset(monthKey,1)+'-01T00:00:00';
        var prevKey=monthKeyOffset(monthKey,-1);
        var items=data.items.filter(function(i){return i.active!==false&&(category==='ALL'||i.category===category);});
        var lastBalance=0, stockIn=0, stockOut=0;

        // The selected month's LAST MONTH BALANCE must be the immediately
        // previous month's CLOSING BALANCE. This is the carry-forward rule.
        var previousSnapshot=data.monthlySnapshots&&data.monthlySnapshots[prevKey];
        if(previousSnapshot&&previousSnapshot.categories&&previousSnapshot.categories[category]){
          lastBalance=Number(previousSnapshot.categories[category].closing||0);
        }else{
          // For the first month that has no saved predecessor, derive the
          // opening value from the inventory history using the previous
          // month's price. This is only the fallback; once a month exists,
          // its saved Closing Balance is the source of truth for the next month.
          items.forEach(function(item){
            var previousPrice=priceForMonth(item,prevKey);
            var before=data.transactions.filter(function(t){return t.itemId===item.id&&String(t.at||'')<start;}).reduce(function(sum,t){return sum+signedQty(t);},0);
            var openingQty=Number(item.openingStock||0)+before;
            lastBalance+=openingQty*previousPrice;
          });
        }

        items.forEach(function(item){
          var currentPrice=priceForMonth(item,monthKey);
          var ins=data.transactions.filter(function(t){return t.itemId===item.id&&t.type==='IN'&&String(t.at||'')>=start&&String(t.at||'')<next;}).reduce(function(sum,t){return sum+Number(t.qty||0);},0);
          var outs=data.transactions.filter(function(t){return t.itemId===item.id&&t.type==='OUT'&&String(t.at||'')>=start&&String(t.at||'')<next;}).reduce(function(sum,t){return sum+Number(t.qty||0);},0);
          stockIn+=ins*currentPrice;
          stockOut+=outs*currentPrice;
        });

        // Closing Balance always carries forward from Last Month Balance,
        // then applies this month's Stock In / Stock Out movement. Therefore,
        // with no movement, Closing Balance === Last Month Balance exactly.
        var closing=lastBalance+stockIn-stockOut;
        return {lastBalance:lastBalance,stockIn:stockIn,stockOut:stockOut,closing:closing};
      }
      function buildMonthlySnapshot(monthKey){
        normalize();
        var categories=['BIOCHEMISTRY','HAEMATOLOGY','MICROBIOLOGY','URINE/STOOL ANALYSIS','ETC','CONSUMABLES','OUTSOURCE INDENT'];
        var snap={categories:{},total:{lastBalance:0,stockIn:0,stockOut:0,closing:0},savedAt:nowIso()};
        categories.forEach(function(c){
          var st=monthlyMovementStats(monthKey,c);
          snap.categories[c]=st;
          snap.total.lastBalance+=st.lastBalance;
          snap.total.stockIn+=st.stockIn;
          snap.total.stockOut+=st.stockOut;
          snap.total.closing+=st.closing;
        });
        return snap;
      }
      function saveMonthlySnapshot(monthKey){
        normalize();
        if(data.monthlySnapshots[monthKey]) return data.monthlySnapshots[monthKey];
        var snapshot=buildMonthlySnapshot(monthKey);
        data.monthlySnapshots[monthKey]=snapshot;
        return snapshot;
      }
      function renderMonthlyMovement(){
        normalize();
        ensureInventoryMonthRollover(false);
        var q=(cleanText(($('inventorySearch')||{}).value)||'').toLowerCase();
        var cat=($('inventoryCategoryFilter')||{}).value||'ALL';
        var month=selectedPriceMonth||currentMonthKey();
        var categories=['BIOCHEMISTRY','HAEMATOLOGY','MICROBIOLOGY','URINE/STOOL ANALYSIS','ETC','CONSUMABLES','OUTSOURCE INDENT'];
        var visible=categories.filter(function(c){
          if(cat!=='ALL'&&cat!==c)return false;
          if(!q)return true;
          return data.items.some(function(i){return i.active!==false&&i.category===c&&[i.name,i.category].join(' ').toLowerCase().indexOf(q)!==-1;});
        });
        var snap=data.monthlySnapshots&&data.monthlySnapshots[month];
        if(!snap){snap=buildMonthlySnapshot(month);}
        var movementMonths=data.transactions.map(function(t){return String(t.at||'').slice(0,7);}).filter(Boolean);
        var keys=Object.keys(data.monthlySnapshots||{}).concat(movementMonths,[currentMonthKey()]).filter(function(v,i,a){return v&&a.indexOf(v)===i;}).sort().reverse();
        var html='<div class="inventory-price-toolbar"><div><strong style="font-size:11px">MONTHLY STOCK MOVEMENT</strong><span style="display:block;margin-top:2px">Stock In / Stock Out value by category. Monthly movement is calculated from the stored inventory history.</span></div><div class="inventory-month-select-wrap"><select id="inventoryPriceMonth" aria-label="Movement month" class="inventory-month-native">';
        keys.forEach(function(key){html+='<option value="'+key+'"'+(key===month?' selected':'')+'>'+esc(monthLabel(key))+'</option>';});
        html+='</select><button type="button" class="inventory-month-trigger" id="inventoryPriceMonthTrigger" aria-haspopup="listbox" aria-expanded="false"><span>'+esc(monthLabel(month))+'</span><span class="inventory-custom-chevron">⌄</span></button></div></div>';
        html+='<table class="inventory-table monthly-movement-table"><thead><tr><th>ACTIVITY</th><th>LAST MONTH BALANCE</th><th>STOCK IN (RM)</th><th>STOCK OUT (RM)</th><th>CLOSING BALANCE</th></tr></thead><tbody>';
        var total={lastBalance:0,stockIn:0,stockOut:0,closing:0};
        visible.forEach(function(c){var st=snap.categories[c]||{lastBalance:0,stockIn:0,stockOut:0,closing:0};total.lastBalance+=st.lastBalance;total.stockIn+=st.stockIn;total.stockOut+=st.stockOut;total.closing+=st.closing;html+='<tr><td class="inventory-item-name">'+esc(c)+'</td><td class="inventory-money">'+money(st.lastBalance)+'</td><td class="inventory-money movement-in">'+money(st.stockIn)+'</td><td class="inventory-money movement-out">'+money(st.stockOut)+'</td><td class="inventory-money">'+money(st.closing)+'</td></tr>';});
        html+='<tr class="inventory-total-row"><td>TOTAL</td><td class="inventory-money">'+money(total.lastBalance)+'</td><td class="inventory-money movement-in">'+money(total.stockIn)+'</td><td class="inventory-money movement-out">'+money(total.stockOut)+'</td><td class="inventory-money">'+money(total.closing)+'</td></tr></tbody></table>';
        if(!visible.length)html='<div class="inventory-empty">No monthly movement data matches the current filter.</div>';
        ($('inventoryTableWrap')||{}).innerHTML=html;
        saveLocal();
      }
      function closeRecordModal(){var modal=$('inventoryRecordModal');if(modal)modal.hidden=true;}
      function editMovement(txId){
        if(!inventoryAdminAllowed()){ requestAppConfirm('ADMIN ONLY','Inventory movement editing is restricted to administrators. Users can add a corrective movement instead.',function(){}); return; }
        normalize();
        var tx=data.transactions.find(function(t){return String(t.id)===String(txId);});
        if(!tx)return;
        var modal=$('inventoryModal');if(!modal)return;
        var form=$('inventoryMovementForm');if(form)form.reset();
        var editing=$('inventoryEditingId');if(editing)editing.value=String(tx.id||'');
        modal.classList.add('inventory-editing');
        modal.hidden=false;
        populateForm();
        setMode(tx.type);
        var itemSel=$('inventoryItemInput');if(itemSel){itemSel.value=String(tx.itemId||'');syncItemCustom();}
        var qty=$('inventoryQtyInput');if(qty)qty.value=Number(tx.qty||0);
        var lot=$('inventoryLotInput');if(lot)lot.value=tx.lotNo||'';
        var expiry=$('inventoryExpiryInput');if(expiry)expiry.value=tx.expiry||'';
        var staff=$('inventoryStaffInput');if(staff&&tx.staff){staff.value=tx.staff;}
        var notes=$('inventoryNotesInput');if(notes)notes.value=tx.notes||'';
        var dateKey=tx.at?String(tx.at).slice(0,10):localDateKey();
        var dateInput=$('inventoryMovementDateInput');if(dateInput)dateInput.value=dateKey;
        var dateVisible=$('inventoryMovementDateVisible');if(dateVisible&&dateVisible._syncDate)dateVisible._syncDate();
        var expiryVisible=$('inventoryExpiryVisible');if(expiryVisible&&expiryVisible._syncDate)expiryVisible._syncDate();
        updateLotSelect(String(tx.id||''));
        if(tx.type==='OUT'){
          var lotSelect=$('inventoryLotSelect');if(lotSelect){lotSelect.value=tx.lotNo||'';if(lotSelect.value!==String(tx.lotNo||'')){var opt=document.createElement('option');opt.value=tx.lotNo||'';opt.textContent=(tx.lotNo||'OPENING / NO LOT')+' · current record';lotSelect.appendChild(opt);lotSelect.value=tx.lotNo||'';}}
          var fefo=$('inventoryFefoInput');if(fefo)fefo.checked=false;
          var fefoWrap=$('inventoryFefoWrap');if(fefoWrap)fefoWrap.hidden=true;
        }
        var title=$('inventoryModalTitle');if(title)title.textContent='EDIT '+(tx.type==='IN'?'STOCK IN':'STOCK OUT');
        var submit=$('inventorySubmitBtn');if(submit)submit.textContent='UPDATE '+(tx.type==='IN'?'STOCK IN':'STOCK OUT');
        var itemTrigger=$('inventoryItemTrigger');if(itemTrigger)itemTrigger.focus();
      }
      function deleteMovement(txId){
        if(!inventoryAdminAllowed()){ requestAppConfirm('ADMIN ONLY','Inventory movement deletion is restricted to administrators. Users can add a corrective movement instead.',function(){}); return; }
        normalize();
        var tx=data.transactions.find(function(t){return String(t.id)===String(txId);});
        if(!tx)return;
        var item=getItem(tx.itemId);
        var movementLabel=tx.type==='IN'?'STOCK IN':'STOCK OUT';
        var itemLabel=item?item.name:'Unknown item';
        var qty=Number(tx.qty||0);
        var lot=tx.lotNo||'OPENING / NO LOT';
        requestAppConfirm('DELETE '+movementLabel+'?', 'Delete '+movementLabel+' for '+itemLabel+' · Qty '+qty+' · Lot '+lot+'? This will recalculate the stock balance and cannot be undone.', function(){
          normalize();
          var idx=data.transactions.findIndex(function(t){return String(t.id)===String(txId);});
          if(idx<0)return;
          var removed=data.transactions[idx];
          data.transactions.splice(idx,1);
          data.deletedTransactionIds=data.deletedTransactionIds||{};
          data.deletedTransactionIds[String(txId)]=nowIso();
          var oldMonth=removed&&removed.at?String(removed.at).slice(0,7):'';
          if(oldMonth)saveMonthlySnapshot(oldMonth);
          saveMonthlySnapshot(currentMonthKey());
          saveLocal();
          try { saveRemote(); } catch(remoteErr) { console.warn('Inventory remote delete error:',remoteErr); }
          closeRecordModal();
          render();
          // Keep the UI responsive locally, then confirm the committed cloud state
          // without requiring a manual page refresh.
          setTimeout(function(){ if(initialized && !sharedSyncBusy) loadRemote(true); }, 350);
        });
      }

      function showItemRecords(itemId){
        normalize();
        var item=getItem(itemId);
        var modal=$('inventoryRecordModal');
        if(!item||!modal)return;
        var rows=data.transactions.filter(function(t){return t.itemId===item.id;}).sort(function(a,b){return String(b.at||'').localeCompare(String(a.at||''));});
        var ins=rows.filter(function(t){return t.type==='IN';}).reduce(function(n,t){return n+Number(t.qty||0);},0);
        var outs=rows.filter(function(t){return t.type==='OUT';}).reduce(function(n,t){return n+Number(t.qty||0);},0);
        var balance=itemBalance(item.id);
        var title=$('inventoryRecordTitle');if(title)title.textContent=item.name;
        var sub=$('inventoryRecordSub');if(sub)sub.textContent=item.category+' · '+money(item.price)+' per unit · Current balance '+balance;
        var summary=$('inventoryRecordSummary');
        if(summary)summary.innerHTML='<div class="inventory-record-stat"><span>CURRENT BALANCE</span><strong>'+balance+'</strong></div><div class="inventory-record-stat"><span>TOTAL STOCK IN</span><strong>'+ins+'</strong></div><div class="inventory-record-stat"><span>TOTAL STOCK OUT</span><strong>'+outs+'</strong></div><div class="inventory-record-stat"><span>STOCK VALUE</span><strong>'+money(balance*Number(item.price||0))+'</strong></div>';
        var host=$('inventoryRecordTableWrap');
        if(host){
          if(!rows.length){host.innerHTML='<div class="inventory-record-empty">No Stock In / Stock Out records for this item yet.</div>';}
          else {
            var html='<table class="inventory-record-table"><thead><tr><th>DATE</th><th>MOVEMENT</th><th>QTY</th><th>LOT NO.</th><th>EXPIRY</th><th>STAFF</th><th>NOTES</th><th class="inventory-history-edit-head">ACTIONS</th></tr></thead><tbody>';
            rows.forEach(function(t){var d=t.at?new Date(t.at).toLocaleDateString('en-MY',{day:'2-digit',month:'2-digit',year:'numeric'}):'—';var actions=inventoryAdminAllowed()?'<td class="inventory-history-edit-cell"><div class="inventory-history-actions"><button type="button" class="inventory-history-edit-btn" data-inventory-edit-id="'+esc(t.id)+'">EDIT</button><button type="button" class="inventory-history-delete-btn" data-inventory-delete-id="'+esc(t.id)+'">DELETE</button></div></td>':'<td class="inventory-history-edit-cell"><span class="inventory-muted">ADMIN ONLY</span></td>';html+='<tr><td>'+esc(d)+'</td><td class="'+(t.type==='IN'?'movement-in':'movement-out')+'">'+esc(t.type==='IN'?'STOCK IN':'STOCK OUT')+'</td><td class="inventory-num">'+(t.type==='OUT'?'-':'')+Number(t.qty||0)+'</td><td>'+esc(t.lotNo||'OPENING / NO LOT')+'</td><td>'+esc(t.expiry||'—')+'</td><td>'+esc(t.staff||'—')+'</td><td>'+esc(t.notes||'')+'</td>'+actions+'</tr>';});
            html+='</tbody></table>';host.innerHTML=html;
          }
        }
        modal.hidden=false;
      }

      function resetInventoryPageViewport(){
        var page=$('inventory');
        if(!page)return;
        var scroller=page.querySelector('.page-scroll.inventory-scroll');
        if(scroller){
          scroller.scrollTop=0;
          scroller.scrollLeft=0;
        }
      }
      function render(){ensureInventoryMonthRollover(false);normalize();ensureCurrentMonthPrices();var k=$('inventoryKpis');if(k)k.innerHTML=kpis();if(currentView==='LOTS')renderLots();else if(currentView==='HISTORY')renderHistory();else if(currentView==='MONTHLY')renderMonthlyMovement();else renderItems();}
      function open(){
        var page=$('inventory');if(!page)return;
        if(!initialized) init();
        document.querySelectorAll('.page.active').forEach(function(x){x.classList.remove('active');});
        page.classList.add('active');resetInventoryPageViewport();Router.renderBackButton('inventory');
        var adminBtn=$('inventoryAdminItemsBtn');if(adminBtn)adminBtn.hidden=!inventoryAdminAllowed();
        startInventoryMonthRolloverWatcher();ensureInventoryMonthRollover(false);render();populateForm();
        requestAnimationFrame(function(){resetInventoryPageViewport();});setTimeout(resetInventoryPageViewport,60);
      }
      function populateForm(){
        var sel=$('inventoryItemInput');if(!sel)return;var items=data.items.filter(function(i){return i.active!==false;}).slice().sort(function(a,b){return String(a.name||'').localeCompare(String(b.name||''),'en',{sensitivity:'base',numeric:true});});
        sel.innerHTML=items.map(function(i){return '<option value="'+esc(i.id)+'">'+esc(i.name)+' · '+esc(i.category)+' · '+money(i.price)+'</option>';}).join('');
        var menu=$('inventoryItemMenu');if(menu){menu.innerHTML=items.map(function(i){return '<div class="inventory-custom-option" role="option" data-value="'+esc(i.id)+'">'+esc(i.name)+' · '+esc(i.category)+' · '+money(i.price)+'</div>';}).join('');}
        var staff=$('inventoryStaffInput');if(staff)staff.innerHTML=staffNames.map(function(n){return '<option>'+esc(n)+'</option>';}).join('');
        syncItemCustom();updateLotSelect();
      }
      function syncItemCustom(){var sel=$('inventoryItemInput'),txt=$('inventoryItemTriggerText'),menu=$('inventoryItemMenu');if(!sel||!txt)return;var opt=sel.options[sel.selectedIndex];txt.textContent=opt?opt.textContent:'Select item...';if(menu)menu.querySelectorAll('.inventory-custom-option').forEach(function(n){n.classList.toggle('is-selected',n.getAttribute('data-value')===sel.value);});}
      function closeItemCustom(){var menu=$('inventoryItemMenu'),trigger=$('inventoryItemTrigger');if(menu)menu.classList.remove('is-open');if(trigger){trigger.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');}}
      function toggleItemCustom(){var menu=$('inventoryItemMenu'),trigger=$('inventoryItemTrigger');if(!menu||!trigger)return;var open=!menu.classList.contains('is-open');if(open){menu.classList.add('is-open');trigger.classList.add('is-open');trigger.setAttribute('aria-expanded','true');}else closeItemCustom();}

      function updateLotSelect(excludeTxId){var item=getItem(($('inventoryItemInput')||{}).value);var wrap=$('inventoryLotSelectWrap');var sel=$('inventoryLotSelect');if(!item||!sel)return;var lots=lotsForItem(item.id);if(excludeTxId){var current=data.transactions.find(function(t){return String(t.id)===String(excludeTxId)&&t.type==='OUT'&&t.itemId===item.id;});if(current&&current.lotNo&&!lots.some(function(l){return l.lotNo===current.lotNo;})){lots.push({lotNo:current.lotNo,qty:0,expiry:current.expiry||'',lastMovement:current.at||'',hasIn:false});}}sel.innerHTML='<option value="">AUTO FEFO</option>'+lots.map(function(l){var available=Number(l.qty||0);if(excludeTxId){var current=data.transactions.find(function(t){return String(t.id)===String(excludeTxId)&&t.type==='OUT'&&t.itemId===item.id&&String(t.lotNo||'')===String(l.lotNo||'');});if(current)available+=Number(current.qty||0);}return '<option value="'+esc(l.lotNo)+'">'+esc(l.lotNo)+' · '+available+' available'+(l.expiry?' · exp '+esc(l.expiry):'')+'</option>';}).join('');if(wrap)wrap.hidden=(($('inventoryMovementType')||{}).value!=='OUT');}
      function setMode(type){var m=$('inventoryMovementType');if(m)m.value=type;var title=$('inventoryModalTitle');if(title)title.textContent=type==='IN'?'STOCK IN':'STOCK OUT';var submit=$('inventorySubmitBtn');if(submit)submit.textContent=type==='IN'?'SAVE STOCK IN':'SAVE STOCK OUT';var lotInput=$('inventoryLotInput');if(lotInput)lotInput.required=type==='IN';var lotWrap=$('inventoryLotSelectWrap');if(lotWrap)lotWrap.hidden=type!=='OUT';var fefo=$('inventoryFefoWrap');if(fefo)fefo.hidden=type!=='OUT';var msg=$('inventoryFormMessage');if(msg)msg.textContent='';updateLotSelect(($('inventoryEditingId')||{}).value||'');}
      function showModal(type){var modal=$('inventoryModal');if(!modal)return;modal.classList.remove('inventory-editing');var editing=$('inventoryEditingId');if(editing)editing.value='';modal.hidden=false;setMode(type);var dateInput=$('inventoryMovementDateInput');if(dateInput&&!dateInput.value)dateInput.value=localDateKey();syncItemCustom();var item=$('inventoryItemTrigger');if(item)item.focus();}
      function closeModal(){var modal=$('inventoryModal');if(modal){modal.hidden=true;modal.classList.remove('inventory-editing');}closeItemCustom();var form=$('inventoryMovementForm');if(form)form.reset();var editing=$('inventoryEditingId');if(editing)editing.value='';var dateInput=$('inventoryMovementDateInput');if(dateInput)dateInput.value=localDateKey();var dateVisible=$('inventoryMovementDateVisible');if(dateVisible&&dateVisible._syncDate)dateVisible._syncDate();var expiryVisible=$('inventoryExpiryVisible');if(expiryVisible&&expiryVisible._syncDate)expiryVisible._syncDate();syncItemCustom();setMode('IN');}
      function allocations(itemId,qty,preferredLot,fefo,excludeTxId){
        var lots=lotsForItem(itemId);if(excludeTxId){var current=data.transactions.find(function(t){return String(t.id)===String(excludeTxId)&&t.type==='OUT'&&t.itemId===itemId;});if(current&&current.lotNo){var existing=lots.find(function(l){return l.lotNo===current.lotNo;});if(existing)existing.qty+=Number(current.qty||0);else lots.push({lotNo:current.lotNo,qty:Number(current.qty||0),expiry:current.expiry||'',lastMovement:current.at||'',hasIn:false});}}
        if(preferredLot){var found=lots.find(function(l){return l.lotNo===preferredLot;});return found&&found.qty>=qty?[{lotNo:found.lotNo,qty:qty,expiry:found.expiry}]:null;}
        if(!fefo){return lots.length&&lots[0].qty>=qty?[{lotNo:lots[0].lotNo,qty:qty,expiry:lots[0].expiry}]:null;}
        lots.sort(function(a,b){return (a.expiry||'9999').localeCompare(b.expiry||'9999');});var need=qty,out=[];for(var i=0;i<lots.length&&need>0;i++){var take=Math.min(need,lots[i].qty);if(take>0)out.push({lotNo:lots[i].lotNo,qty:take,expiry:lots[i].expiry});need-=take;}return need>0?null:out;
      }
      function submitMovement(e){
        e.preventDefault();
        var msg=$('inventoryFormMessage');if(msg)msg.textContent='';
        try {
          var type=($('inventoryMovementType')||{}).value||'IN';
          var editingId=cleanText(($('inventoryEditingId')||{}).value);
          var existingTx=editingId?data.transactions.find(function(t){return String(t.id)===String(editingId);}):null;
          var itemId=($('inventoryItemInput')||{}).value;
          var qty=Math.floor(Number(($('inventoryQtyInput')||{}).value));
          var item=getItem(itemId);
          if(!item||!qty||qty<1){if(msg)msg.textContent='Please select an item and enter a valid quantity.';return;}
          var staff=(($('inventoryStaffInput')||{}).value)||getUserName();
          var notes=(($('inventoryNotesInput')||{}).value)||'';
          var lot=cleanText(($('inventoryLotInput')||{}).value);
          var expiry=(($('inventoryExpiryInput')||{}).value)||'';
          var movementDate=(($('inventoryMovementDateInput')||{}).value)||localDateKey();
          if(!movementDate){if(msg)msg.textContent='Please select the Stock In / Stock Out date.';return;}
          if(type==='IN'&&!lot){if(msg)msg.textContent='Lot No. is required for every Stock In.';return;}
          var movementAt=isoForMovementDate(movementDate);
          var tx=[];
          if(type==='IN'){
            tx=[{id:editingId||id(),itemId:itemId,type:'IN',qty:qty,lotNo:lot,expiry:expiry,staff:staff,notes:notes,at:movementAt}];
          } else {
            var preferred=(($('inventoryLotSelect')||{}).value)||'';
            if(editingId&&existingTx&&existingTx.type==='OUT'&&!preferred)preferred=existingTx.lotNo||'';
            var useFefo=editingId?false:(($('inventoryFefoInput')||{}).checked)!==false;
            var a=allocations(itemId,qty,preferred,useFefo,editingId||'');
            if(!a){if(msg)msg.textContent='Insufficient stock for the selected item/lot. Check the LOT STOCK view.';return;}
            if(editingId){
              if(a.length!==1){if(msg)msg.textContent='Edited Stock Out must use one lot.';return;}
              tx=[{id:editingId,itemId:itemId,type:'OUT',qty:a[0].qty,lotNo:a[0].lotNo==='OPENING / NO LOT'?'':a[0].lotNo,expiry:a[0].expiry||'',staff:staff,notes:notes,at:movementAt}];
            } else {
              tx=a.map(function(x){return {id:id(),itemId:itemId,type:'OUT',qty:x.qty,lotNo:x.lotNo==='OPENING / NO LOT'?'':x.lotNo,expiry:x.expiry||'',staff:staff,notes:notes+(a.length>1?' [FEFO allocation]':''),at:movementAt};});
            }
          }
          var oldAt=existingTx&&existingTx.at?String(existingTx.at):'';
          if(editingId&&existingTx){var idx=data.transactions.findIndex(function(t){return String(t.id)===String(editingId);});if(idx<0){if(msg)msg.textContent='This movement could not be found. Refresh and try again.';return;}data.transactions[idx]=tx[0];}
          else Array.prototype.push.apply(data.transactions,tx);
          normalize();
          if(oldAt)saveMonthlySnapshot(oldAt.slice(0,7));
          tx.forEach(function(t){saveMonthlySnapshot(String(t.at||'').slice(0,7));});
          saveMonthlySnapshot(currentMonthKey());
          saveLocal();
          try { saveRemote(); } catch(remoteErr) { console.warn('Inventory remote save error:',remoteErr); }
          closeModal();
          render();
        } catch(err) {
          console.error('Inventory movement save error:',err);
          if(msg)msg.textContent='Unable to save movement: '+(err&&err.message?err.message:'Please try again.');
        }
      }

      function inventoryAdminAllowed(){ return String(state.authRole||'').toUpperCase()==='ADMIN'; }
      function clearAdminItemForm(){
        var f=$('inventoryAdminItemForm');if(f)f.reset();
        var id=$('inventoryAdminEditingId');if(id)id.value='';
        var opening=$('inventoryAdminOpening');if(opening)opening.value='0';
        var min=$('inventoryAdminMin');if(min)min.value='1';
        var msg=$('inventoryAdminItemMessage');if(msg)msg.textContent='';
        var save=$('inventoryAdminItemSaveBtn');if(save)save.textContent='ADD ITEM';
      }
      function renderAdminItemList(){
        var host=$('inventoryAdminItemList');if(!host)return;
        if(!inventoryAdminAllowed()){host.innerHTML='';return;}
        var rows=data.items.slice().sort(function(a,b){return String(a.name||'').localeCompare(String(b.name||''),'en',{numeric:true,sensitivity:'base'});});
        var html='<div style="display:grid;gap:7px">';
        rows.forEach(function(item){
          var bal=itemBalance(item.id);
          html+='<div style="display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:7px;align-items:center;padding:9px 10px;border:1px solid rgba(120,135,160,.14);border-radius:12px;background:rgba(255,255,255,.3)">'+
            '<div><strong style="display:block;font-size:11px">'+esc(item.name)+'</strong><span style="font-size:9px;color:#718096">'+esc(item.category)+' · '+money(item.price)+' · Opening '+Number(item.openingStock||0)+' · Balance '+bal+'</span></div>'+
            '<button type="button" class="inventory-action-btn" data-admin-item-edit="'+esc(item.id)+'">EDIT</button>'+
            '<button type="button" class="inventory-action-btn danger" data-admin-item-delete="'+esc(item.id)+'">DELETE</button></div>';
        });
        html+='</div>';host.innerHTML=html;
      }
      function openAdminItems(){
        if(!inventoryAdminAllowed()){requestAppConfirm('ADMIN ONLY','Inventory Control is restricted to administrators.',function(){});return;}
        clearAdminItemForm();renderAdminItemList();var m=$('inventoryAdminItemsModal');if(m)m.hidden=false;
      }
      function editAdminItem(itemId){
        if(!inventoryAdminAllowed())return;var item=getItem(itemId);if(!item)return;
        $('inventoryAdminEditingId').value=item.id;$('inventoryAdminName').value=item.name||'';$('inventoryAdminCategory').value=item.category||'ETC';$('inventoryAdminType').value=item.type||'';$('inventoryAdminPrice').value=Number(item.price||0);$('inventoryAdminOpening').value=Number(item.openingStock||0);$('inventoryAdminMin').value=Number(item.minStock||1);$('inventoryAdminItemSaveBtn').textContent='SAVE ITEM';$('inventoryAdminItemMessage').textContent='Editing '+item.name;
      }
      function adminInventoryRequest(method,args,onSuccess,onFailure){
        var token=(typeof Auth!=='undefined'&&Auth.getToken)?Auth.getToken():'';
        if(!token||!hasVercelBackend()){if(onFailure)onFailure(new Error('Secure inventory backend is unavailable.'));return;}
        sharedSyncBusy=true;
        hoagApi.run.withSuccessHandler(function(result){
          sharedSyncBusy=false;
          if(result&&result.ok===false){
            if(result.inventory)mergeCloudAuthoritative(result.inventory,true);
            if(onFailure)onFailure(new Error(result.error||'Inventory update failed.'));
            return;
          }
          if(result&&result.inventory){data=result.inventory;normalize();sharedUpdatedAt=String(result.updatedAt||sharedUpdatedAt||'');saveLocal();}
          if(onSuccess)onSuccess(result);
          scheduleSharedPoll();
        }).withFailureHandler(function(error){
          sharedSyncBusy=false;
          if(onFailure)onFailure(error instanceof Error?error:new Error(error&&error.message?error.message:'Inventory update failed.'));
          scheduleSharedPoll();
        })[method].apply(null,args);
      }
      function saveAdminItem(e){
        e.preventDefault();if(!inventoryAdminAllowed())return;
        var msg=$('inventoryAdminItemMessage');if(msg)msg.textContent='';
        var name=cleanText(($('inventoryAdminName')||{}).value);var category=cleanText(($('inventoryAdminCategory')||{}).value)||'ETC';var type=cleanText(($('inventoryAdminType')||{}).value)||'REAGENT';var price=Number(($('inventoryAdminPrice')||{}).value);var opening=Math.floor(Number(($('inventoryAdminOpening')||{}).value));var min=Math.floor(Number(($('inventoryAdminMin')||{}).value));var editing=cleanText(($('inventoryAdminEditingId')||{}).value);
        if(!name){if(msg)msg.textContent='Item name is required.';return;}if(!isFinite(price)||price<0||!isFinite(opening)||opening<0||!isFinite(min)||min<0){if(msg)msg.textContent='Enter valid price, opening stock and minimum stock.';return;}
        var duplicate=data.items.some(function(i){return String(i.name||'').trim().toLowerCase()===name.toLowerCase()&&String(i.id)!==String(editing);});if(duplicate){if(msg)msg.textContent='An item with this name already exists.';return;}
        var item=editing?getItem(editing):null;var payload={id:editing||'',name:name,category:category,type:type,price:price,openingStock:opening,minStock:min,active:item?item.active!==false:true};
        if(msg)msg.textContent=editing?'Saving item...':'Adding item...';
        adminInventoryRequest('adminInventoryUpsertItem',[tokenForInventoryAdmin(),payload,sharedUpdatedAt],function(){
          populateForm();renderAdminItemList();render();clearAdminItemForm();
        },function(err){if(msg)msg.textContent=err&&err.message?err.message:'Unable to save item.';});
      }
      function tokenForInventoryAdmin(){return (typeof Auth!=='undefined'&&Auth.getToken)?Auth.getToken():'';}
      function deleteAdminItem(itemId){
        if(!inventoryAdminAllowed())return;var item=getItem(itemId);if(!item)return;
        requestAppConfirm('DELETE ITEM','Delete '+item.name+'? This permanently removes the item, its stock movements and monthly prices from the shared inventory.',function(){
          var msg=$('inventoryAdminItemMessage');if(msg)msg.textContent='Deleting '+item.name+'...';
          adminInventoryRequest('adminInventoryDeleteItem',[tokenForInventoryAdmin(),itemId,sharedUpdatedAt],function(){
            populateForm();renderAdminItemList();render();clearAdminItemForm();
          },function(err){if(msg)msg.textContent=err&&err.message?err.message:'Unable to delete item.';});
        });
      }
      function closeAdminItems(){var m=$('inventoryAdminItemsModal');if(m)m.hidden=true;clearAdminItemForm();}

      function bind(){
        if(initialized)return;initialized=true;
        document.addEventListener('click',function(e){var edit=e.target.closest('[data-inventory-edit-id]');if(edit){e.preventDefault();e.stopPropagation();closeRecordModal();editMovement(edit.getAttribute('data-inventory-edit-id'));return;}var del=e.target.closest('[data-inventory-delete-id]');if(del){e.preventDefault();e.stopPropagation();deleteMovement(del.getAttribute('data-inventory-delete-id'));}});
        var search=$('inventorySearch');if(search)search.addEventListener('input',render);
        ['inventoryCategoryFilter','inventoryStatusFilter','inventoryViewFilter'].forEach(function(id){var n=$(id);if(n)n.addEventListener('change',function(){if(id==='inventoryViewFilter')currentView=n.value;render();});});
        var adminBtn=$('inventoryAdminItemsBtn');if(adminBtn)adminBtn.addEventListener('click',openAdminItems);var adminForm=$('inventoryAdminItemForm');if(adminForm)adminForm.addEventListener('submit',saveAdminItem);var adminClear=$('inventoryAdminItemClearBtn');if(adminClear)adminClear.addEventListener('click',clearAdminItemForm);var adminList=$('inventoryAdminItemList');if(adminList)adminList.addEventListener('click',function(e){var edit=e.target.closest('[data-admin-item-edit]');if(edit){editAdminItem(edit.getAttribute('data-admin-item-edit'));return;}var del=e.target.closest('[data-admin-item-delete]');if(del){deleteAdminItem(del.getAttribute('data-admin-item-delete'));return;}});document.querySelectorAll('[data-inventory-admin-close]').forEach(function(n){n.addEventListener('click',closeAdminItems);});var inBtn=$('inventoryStockInBtn');if(inBtn)inBtn.addEventListener('click',function(){showModal('IN');});var outBtn=$('inventoryStockOutBtn');if(outBtn)outBtn.addEventListener('click',function(){showModal('OUT');});
        var form=$('inventoryMovementForm');if(form)form.addEventListener('submit',submitMovement);var itemSel=$('inventoryItemInput');if(itemSel)itemSel.addEventListener('change',function(){syncItemCustom();updateLotSelect();});
        var itemTrigger=$('inventoryItemTrigger');if(itemTrigger)itemTrigger.addEventListener('click',function(e){e.stopPropagation();toggleItemCustom();});
        var itemMenu=$('inventoryItemMenu');if(itemMenu)itemMenu.addEventListener('click',function(e){var opt=e.target.closest('.inventory-custom-option');if(!opt)return;var sel=$('inventoryItemInput');if(sel){sel.value=opt.getAttribute('data-value')||'';syncItemCustom();updateLotSelect();}closeItemCustom();});
        var tableWrap=$('inventoryTableWrap');if(tableWrap)tableWrap.addEventListener('change',function(e){if(e.target.id==='inventoryPriceMonth'){ensureInventoryMonthRollover(false);selectedPriceMonth=e.target.value;var target=selectedPriceMonth;renderMonthlyMovement();}});if(tableWrap)tableWrap.addEventListener('click',function(e){var edit=e.target.closest('[data-inventory-edit-id]');if(edit){e.preventDefault();e.stopPropagation();closeRecordModal();editMovement(edit.getAttribute('data-inventory-edit-id'));return;}var del=e.target.closest('[data-inventory-delete-id]');if(del){e.preventDefault();e.stopPropagation();deleteMovement(del.getAttribute('data-inventory-delete-id'));return;}var row=e.target.closest('.inventory-item-row');if(row)showItemRecords(row.getAttribute('data-inventory-item-id'));});if(tableWrap)tableWrap.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.closest('.inventory-item-row')){e.preventDefault();showItemRecords(e.target.closest('.inventory-item-row').getAttribute('data-inventory-item-id'));}});
        document.addEventListener('click',function(e){if(!e.target.closest('#inventoryItemCustomWrap'))closeItemCustom();});
        document.querySelectorAll('[data-inventory-close]').forEach(function(n){n.addEventListener('click',closeModal);});document.querySelectorAll('[data-inventory-record-close]').forEach(function(n){n.addEventListener('click',closeRecordModal);});
        document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('inventoryModal')&&!$('inventoryModal').hidden)closeModal();if(e.key==='Escape'&&$('inventoryRecordModal')&&!$('inventoryRecordModal').hidden)closeRecordModal();});
      }
      function load(force){
        bind();
        var had=loadLocal();
        if(!had) seed();
        ensureCurrentMonthPrices();
        render();
        var inventoryPage=$('inventory');
        if(inventoryPage && window.MutationObserver){
          var inventoryViewportObserver=new MutationObserver(function(){
            if(inventoryPage.classList.contains('active')) resetInventoryPageViewport();
          });
          inventoryViewportObserver.observe(inventoryPage,{attributes:true,attributeFilter:['class']});
        }
        loadRemote(false).then(function(){
          render();
        });
      }
      function init(){load(false);}
      return {init:init,open:open,load:load,render:render,handleAuthLogout:handleAuthLogout};
    })();

    /* +----------------------------------+
     * + TRANSFUSION REGISTRATION MODULE  +
     * + Internal live registration page  +
     * +----------------------------------+ */
    var Transfusion = (function () {
      var currentYear = new Date().getFullYear();
      var currentEditId = '';
      var selectedYear = currentYear;
      var transfusionRows = [];
      var transfusionCacheKey = 'labAppTransfusionV1';
      function saveTransfusionCache(){try{safeStorageSet(transfusionCacheKey,JSON.stringify({rows:transfusionRows,at:new Date().toISOString()}));}catch(e){}}
      function loadTransfusionCache(){var raw=safeStorageGet(transfusionCacheKey);if(!raw)return false;var parsed=safeParse(raw);if(!parsed||!Array.isArray(parsed.rows))return false;transfusionRows=parsed.rows;return true;}
      function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
      function id(){return 'transfusion-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
      function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
      function displayDate(v){var p=String(v||'').split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:String(v||'');}
      function calcIc(raw, ref){
        var s=String(raw||'').trim().toUpperCase();
        if(/^M\d{12}(?:-\d+)?$/.test(s)) return {sex:'TBC',age:'NB/NO IC'};
        var digits=s.replace(/[^0-9]/g,'');
        if(!/^\d{12}$/.test(digits)) return {sex:'',age:''};
        var yy=Number(digits.slice(0,2)), mm=Number(digits.slice(2,4)), dd=Number(digits.slice(4,6));
        var now=new Date(ref||today()), year=2000+yy; if(year>now.getFullYear())year-=100;
        if(!mm||mm>12||!dd||dd>31)return {sex:'',age:''};
        var sexDigit=Number(digits.slice(-1));
        var age=now.getFullYear()-year; var b=new Date(year,mm-1,dd);
        if(b>now) return {sex:'',age:''};
        if(new Date(now.getFullYear(),now.getMonth(),now.getDate())<new Date(now.getFullYear(),b.getMonth(),b.getDate()))age--;
        return {sex:sexDigit%2?'L':'P',age:String(age)};
      }
      function bindIc(){var el=document.getElementById('trIdIc');if(!el)return;var apply=function(){var d=calcIc(el.value,document.getElementById('trDate')&&document.getElementById('trDate').value);var sex=document.getElementById('trSex'),age=document.getElementById('trAge');if(sex)sex.value=d.sex; if(age)age.value=d.age;};el.addEventListener('input',apply);el.addEventListener('blur',apply);}
      async function requestTransfusion(method, values){
        var query='', body;
        if(method==='GET'||method==='DELETE'){
          var params=new URLSearchParams();
          Object.keys(values||{}).forEach(function(key){if(values[key]!=null&&values[key]!=='')params.set(key,String(values[key]));});
          query=params.toString()?('?'+params.toString()):'';
        }else body=JSON.stringify(values||{});
        var response=await fetch('/api/transfusion'+query,{method:method,credentials:'include',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body});
        var text=await response.text(), result;
        try{result=JSON.parse(text);}catch(error){throw new Error('Transfusion API returned an invalid response.');}
        if(!response.ok)throw new Error(result&&result.error?result.error:'Unable to process transfusion request.');
        return result;
      }
      async function loadTransfusionRecords(){
        /* Keep the first request small enough for fast first paint, then fetch
           additional pages concurrently. The old implementation requested every
           page strictly one-by-one, which made large Transfusion histories feel slow. */
        var rows=[],limit=500;
        var first=await requestTransfusion('GET',{year:'ALL',limit:limit,offset:0});
        rows=rows.concat(Array.isArray(first.records)?first.records:[]);
        var offset=limit, more=!!(first&&first.hasMore);
        while(more){
          var offsets=[offset,offset+limit,offset+(limit*2)];
          var batch=await Promise.all(offsets.map(function(pageOffset){
            return requestTransfusion('GET',{year:'ALL',limit:limit,offset:pageOffset});
          }));
          batch.forEach(function(result){
            rows=rows.concat(Array.isArray(result&&result.records)?result.records:[]);
          });
          offset+=limit*batch.length;
          /* The highest requested page tells us whether another page exists. */
          more=!!(batch[batch.length-1]&&batch[batch.length-1].hasMore);
        }
        transfusionRows=rows;
        saveTransfusionCache();
        renderYears(rows);
        renderRows();
        return rows;
      }
      function records(){return transfusionRows;}
      function transfusionRecordPayload(row, changes){
        var fields=['id','date','name','tt','idIc','sex','age','unit','bloodGroup','packNo','staff','googleDriveLink','remarks','notes'];
        var input=Object.assign({},row||{},changes||{}),record={};
        fields.forEach(function(field){record[field]=input[field]==null?'':input[field];});
        return record;
      }
      function renderYears(rows){var sel=document.getElementById('trYearFilter');if(!sel)return;var prev=sel.value||'ALL';var years={};rows.forEach(function(r){var y=String(r.date||'').slice(0,4);if(/^\d{4}$/.test(y))years[y]=true;});years[String(selectedYear)]=true;var opts=Object.keys(years).sort().reverse();sel.innerHTML='<option value="ALL">All years</option>'+opts.map(function(y){return '<option value="'+esc(y)+'">'+esc(y)+'</option>';}).join('');sel.value=opts.indexOf(prev)>=0?prev:'ALL';}
      function renderRows(){
        var body=document.getElementById('trTableBody'),empty=document.getElementById('trEmpty'),search=document.getElementById('trSearch'),yf=document.getElementById('trYearFilter'),mf=document.getElementById('trMonthFilter'),sf=document.getElementById('trStatusFilter');if(!body)return;
        var all=records();
        renderYears(all);
        var totalCount=all.length;
        var pendingCount=all.filter(function(r){var st=String(r.remarks||'PENDING').trim().toUpperCase();return !st||st==='PENDING';}).length;
        var doneCount=all.filter(function(r){return String(r.remarks||'').trim().toUpperCase()==='COMPLETED';}).length;
        var rejectCount=all.filter(function(r){return String(r.remarks||'').trim().toUpperCase()==='REJECT';}).length;
        var stTotal=document.getElementById('trStatTotal'),stPending=document.getElementById('trStatPending'),stDone=document.getElementById('trStatDone'),stReject=document.getElementById('trStatReject');
        if(stTotal)stTotal.textContent=String(totalCount);
        if(stPending)stPending.textContent=String(pendingCount);
        if(stDone)stDone.textContent=String(doneCount);
        if(stReject)stReject.textContent=String(rejectCount);
        var q=String(search&&search.value||'').trim().toLowerCase(), y=String(yf&&yf.value||'ALL'), m=String(mf&&mf.value||'ALL'), statusFilter=String(sf&&sf.value||'ALL').toUpperCase();
        var rows=all.filter(function(r){var date=String(r.date||'');var st=String(r.remarks||'PENDING').trim().toUpperCase()||'PENDING';return (!q||[r.name,r.idIc,r.packNo,r.staff,r.bloodGroup,r.remarks,r.notes].join(' ').toLowerCase().indexOf(q)>=0) && (y==='ALL'||date.slice(0,4)===y) && (m==='ALL'||date.slice(5,7)===m) && (statusFilter==='ALL'||st===statusFilter);}).sort(function(a,b){return String(b.date||'').localeCompare(String(a.date||''))||String(b.updatedAt||'').localeCompare(String(a.updatedAt||''));});
        body.innerHTML=rows.map(function(r,i){var drive=String(r.googleDriveLink||r.fileLink||'').trim();return '<tr class="outsource-data-row transfusion-data-row" data-transfusion-row-id="'+esc(r.id)+'" title="Click any part of this row to view status, remarks and notes"><td>'+String(i+1)+'</td><td>'+esc(displayDate(r.date))+'</td><td><strong>'+esc(r.name)+'</strong></td><td>'+esc(r.idIc)+'</td><td>'+esc(r.sex)+'</td><td>'+esc(r.age)+'</td><td>'+esc(r.unit)+'</td><td>'+esc(r.bloodGroup)+'</td><td>'+esc(r.packNo)+'</td><td>'+esc(r.staff)+'</td><td class="outsource-result transfusion-remarks-cell" data-transfusion-remarks-id="'+esc(r.id)+'" title="Click to view/edit remarks and notes">'+(function(){var st=String(r.remarks||'PENDING').trim().toUpperCase()||'PENDING';if(st==='COMPLETED')return '<span class="outsource-result-pill done transfusion-status-pill status-done">COMPLETED</span>';if(st==='REJECT')return '<span class="outsource-result-pill reject transfusion-status-pill status-reject">REJECT</span>';if(st==='PENDING')return '<span class="outsource-result-pill pending transfusion-status-pill status-pending">PENDING</span>';return '<span class="outsource-result-pill pending transfusion-status-pill">'+esc(st)+'</span>';})()+'</td><td>'+ (drive?'<a href="'+esc(drive)+'" target="_blank" rel="noopener noreferrer">DRIVE</a>':'') +'</td><td class="outsource-notes-cell transfusion-notes-cell" data-transfusion-notes-id="'+esc(r.id)+'" title="Click to view/edit notes">'+(esc(r.notes)||'<span class="transfusion-no-note">ADD NOTE</span>')+'</td><td><div class="outsource-actions"><button type="button" class="outsource-mini tr-edit" data-id="'+esc(r.id)+'">EDIT</button><button type="button" class="outsource-mini delete tr-delete" data-id="'+esc(r.id)+'">DELETE</button></div></td></tr>';}).join('');
        if(empty)empty.hidden=rows.length>0;
        var n=document.getElementById('trTotal');if(n)n.textContent=totalCount+' TOTAL';
        var pager=document.getElementById('trPager');if(pager)pager.textContent=rows.length?('Showing 1–'+rows.length+' of '+rows.length):'Showing 0–0 of 0';
        body.querySelectorAll('.tr-edit').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();edit(b.dataset.id);});});
        body.querySelectorAll('.tr-delete').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();if(!window.confirm('Delete this transfusion record?'))return;var row=records().find(function(item){return String(item.id)===String(b.dataset.id);});if(!row)return;requestTransfusion('DELETE',{recordId:row.id,expectedVersion:Number(row.version||1)}).then(function(){transfusionRows=transfusionRows.filter(function(item){return String(item.id)!==String(row.id);});saveTransfusionCache();renderRows();}).catch(function(error){window.alert(error&&error.message?error.message:'Unable to delete transfusion record.');});});});
        body.querySelectorAll('.transfusion-data-row').forEach(function(row){row.addEventListener('click',function(){openRemarksModal(row.dataset.transfusionRowId);});});
        body.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(e){e.stopPropagation();});});
      }
      function syncTransfusionSelect(id){var el=document.getElementById(id);if(el){el.dispatchEvent(new Event('change',{bubbles:true}));}}
      function clearForm(){currentEditId='';var ids=['trDate','trName','trIdIc','trSex','trAge','trUnit','trBloodGroup','trPackNo','trStaff','trGoogleDriveLink'];ids.forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});syncTransfusionSelect('trUnit');syncTransfusionSelect('trBloodGroup');syncTransfusionSelect('trStaff');var d=document.getElementById('trDate');if(d)d.value=today();var dv=document.getElementById('trDateVisible');if(dv&&dv._syncDate)dv._syncDate();var save=document.getElementById('trSave');if(save)save.textContent='REGISTER TRANSFUSION';bindIc();}
      function edit(rid){var r=records().find(function(x){return String(x.id)===String(rid);});if(!r)return;currentEditId=r.id;var values={trDate:r.date,trName:r.name,trIdIc:r.idIc,trSex:r.sex,trAge:r.age,trUnit:r.unit,trBloodGroup:r.bloodGroup,trPackNo:r.packNo,trStaff:r.staff,trGoogleDriveLink:r.googleDriveLink||r.fileLink||''};Object.keys(values).forEach(function(id){var el=document.getElementById(id);if(el)el.value=values[id]||'';});syncTransfusionSelect('trUnit');syncTransfusionSelect('trBloodGroup');syncTransfusionSelect('trStaff');var dv=document.getElementById('trDateVisible');if(dv&&dv._syncDate)dv._syncDate();var save=document.getElementById('trSave');if(save)save.textContent='SAVE CHANGES';document.getElementById('trName')?.focus();}
      function openRemarksModal(rid){
        var r=records().find(function(x){return String(x.id)===String(rid);});
        var modal=document.getElementById('transfusionRemarksModal');
        if(!r||!modal)return;
        modal.dataset.recordId=String(r.id);
        var title=document.getElementById('transfusionRemarksTitle');
        var sub=document.getElementById('transfusionRemarksSub');
        var remark=document.getElementById('transfusionRemarksText');
        var note=document.getElementById('transfusionNotesText');
        if(title)title.textContent='REMARKS & NOTES';
        if(sub)sub.textContent=(String(r.name||'')||'TRANSFUSION RECORD')+' • '+displayDate(r.date);
        if(remark)remark.value=String(r.remarks||'');
        if(note)note.value=String(r.notes||'');
        var status=String(r.remarks||'').trim().toUpperCase();
        var remarkSelect=document.getElementById('transfusionRemarksStatus');
        if(remarkSelect){remarkSelect.value=(status==='PENDING'||status==='COMPLETED'||status==='REJECT')?status:'';remarkSelect.dispatchEvent(new Event('change',{bubbles:true}));}
        modal.hidden=false;
      }
      function closeRemarksModal(){var modal=document.getElementById('transfusionRemarksModal');if(modal)modal.hidden=true;}
      async function saveRemarksModal(){
        var modal=document.getElementById('transfusionRemarksModal');if(!modal)return;
        var rid=String(modal.dataset.recordId||'');
        var r=records().find(function(x){return String(x.id)===rid;});
        if(!r)return;
        var remarkSelect=document.getElementById('transfusionRemarksStatus'), note=document.getElementById('transfusionNotesText');
        var updated=transfusionRecordPayload(r,{remarks:String(remarkSelect&&remarkSelect.value||'').trim(),notes:String(note&&note.value||'').trim()});
        try{
          var result=await requestTransfusion('PATCH',{record:updated,expectedVersion:Number(r.version||1)});
          var index=transfusionRows.findIndex(function(item){return String(item.id)===rid;});
          if(index>=0)transfusionRows[index]=result.record;
          closeRemarksModal();
          renderRows();
        }catch(error){window.alert(error&&error.message?error.message:'Unable to update transfusion record.');}
      }
      async function save(e){
        if(e)e.preventDefault();
        var name=String(document.getElementById('trName')?.value||'').trim();
        var date=String(document.getElementById('trDate')?.value||'').trim();
        var blood=String(document.getElementById('trBloodGroup')?.value||'').trim();
        if(!date||!name){window.alert('Please fill Date and Name.');return;}
        var existing=records().find(function(r){return String(r.id)===String(currentEditId);});
        var recordId=currentEditId||id();
        var saveBtn=document.getElementById('trSave');
        if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='SAVING...';}
        try{
          var drive=String(document.getElementById('trGoogleDriveLink')?.value||'').trim();
          var row=transfusionRecordPayload({id:recordId,date:date,name:name,tt:existing?String(existing.tt||''):'',idIc:String(document.getElementById('trIdIc')?.value||'').trim(),sex:String(document.getElementById('trSex')?.value||'').trim(),age:String(document.getElementById('trAge')?.value||'').trim(),unit:String(document.getElementById('trUnit')?.value||'').trim(),bloodGroup:blood,packNo:String(document.getElementById('trPackNo')?.value||'').trim(),staff:String(document.getElementById('trStaff')?.value||'').trim(),googleDriveLink:drive,remarks:existing?String(existing.remarks||'').trim():'',notes:existing?String(existing.notes||'').trim():''});
          var result=existing
            ?await requestTransfusion('PATCH',{record:row,expectedVersion:Number(existing.version||1)})
            :await requestTransfusion('POST',row);
          var saved=result.record;
          var index=transfusionRows.findIndex(function(item){return String(item.id)===recordId;});
          if(index>=0)transfusionRows[index]=saved;else transfusionRows.push(saved);
          saveTransfusionCache();
          clearForm();renderRows();
        }catch(err){window.alert(err&&err.message?err.message:'Unable to save transfusion record.');}
        finally{if(saveBtn){saveBtn.disabled=false;saveBtn.textContent=currentEditId?'SAVE CHANGES':'REGISTER TRANSFUSION';}}
      }
      function render(year){selectedYear=Number(year)||currentYear;var grid=document.getElementById('moduleYearGrid');if(!grid)return;grid.className='module-year-grid transfusion-active-grid';var title=document.getElementById('moduleYearsTitle'),desc=document.getElementById('moduleYearsDesc');if(title)title.textContent='TRANSFUSION';if(desc)desc.textContent='Register, track and maintain transfusion service records in one live workspace.';var rows=records();var total=rows.length,pending=rows.filter(function(r){var st=String(r.remarks||'PENDING').trim().toUpperCase();return !st||st==='PENDING';}).length,done=rows.filter(function(r){return String(r.remarks||'').trim().toUpperCase()==='COMPLETED';}).length,rejected=rows.filter(function(r){return String(r.remarks||'').trim().toUpperCase()==='REJECT';}).length;grid.innerHTML='<div class="outsource-register"><div class="outsource-grid"><section class="outsource-card transfusion-card"><div class="outsource-card-head"><h3>REGISTER TRANSFUSION</h3><span id="trEditHint">LIVE RECORD</span></div><form class="outsource-form" id="transfusionForm" autocomplete="off"><div class="outsource-field outsource-date-field"><label>Date *</label><input type="hidden" id="trDate" value="'+esc(today())+'"><input type="text" id="trDateVisible" class="outsource-neumorphic-date" required readonly placeholder="dd/mm/yyyy" autocomplete="off"></div><div class="outsource-field"><label>Name *</label><input id="trName" required placeholder="Patient name"></div><div class="outsource-field"><label>ID / IC</label><input id="trIdIc" placeholder="NRIC / Passport"></div><div class="outsource-field"><label>Sex <span class="os-auto-badge">AUTO FROM IC</span></label><input id="trSex" readonly placeholder="Auto from IC"></div><div class="outsource-field"><label>Age <span class="os-auto-badge">AUTO FROM IC</span></label><input id="trAge" readonly placeholder="Auto from IC"></div><div class="outsource-field"><label>Unit</label><select id="trUnit"><option value="">Select unit</option><option>WAD1</option><option>WAD2</option><option>WAD3</option><option>WAD4</option><option>ED</option><option>OPD</option><option>UKIA</option><option>PRIMER</option><option>VEKTOR</option><option>TB/KUSTA</option></select></div><div class="outsource-field"><label>Blood Group</label><select id="trBloodGroup"><option value="">Select blood group</option><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option></select></div><div class="outsource-field"><label>Pack No.</label><input id="trPackNo" placeholder="Pack number(s) — e.g. 114557133391/1, 114557133392/1" title="For multiple blood packs, enter the pack numbers separated by comma"></div><div class="outsource-field"><label>Staff</label><select id="trStaff"><option value="">Select staff</option><option>NUR LIZA</option><option>JAYANTHI</option><option>SURIANI</option><option>JAPIDI</option><option>SHOUNNA</option><option>NAZRAN</option></select></div><div class="outsource-field"><label>Google Drive Link</label><input id="trGoogleDriveLink" type="url" placeholder="Paste Google Drive link"></div><div class="outsource-form-actions"><button class="outsource-btn secondary" type="button" id="trClear">CLEAR</button><button class="outsource-btn primary" type="submit" id="trSave">REGISTER TRANSFUSION</button></div></form></section><section class="outsource-card transfusion-card"><div class="outsource-card-head"><h3>REGISTERED TRANSFUSIONS</h3><span id="trTotal">'+total+' TOTAL</span></div><div class="outsource-summary"><div class="outsource-stat"><div class="num" id="trStatTotal">'+total+'</div><div class="lbl">Total</div></div><div class="outsource-stat"><div class="num" id="trStatPending">'+pending+'</div><div class="lbl">Pending</div></div><div class="outsource-stat"><div class="num" id="trStatDone">'+done+'</div><div class="lbl">Completed</div></div><div class="outsource-stat"><div class="num" id="trStatReject">'+rejected+'</div><div class="lbl">Rejected</div></div></div><div class="outsource-search"><input id="trSearch" placeholder="Search name, ID/IC, pack no. or staff..." aria-label="Search transfusion records"><select id="trYearFilter"><option value="ALL">All years</option></select><select id="trMonthFilter"><option value="ALL">All months</option><option value="01">January</option><option value="02">February</option><option value="03">March</option><option value="04">April</option><option value="05">May</option><option value="06">June</option><option value="07">July</option><option value="08">August</option><option value="09">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select><select id="trStatusFilter"><option value="ALL">All status</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option><option value="REJECT">Rejected</option></select></div><div class="outsource-table-wrap"><table class="outsource-table"><thead><tr><th>#</th><th>Date</th><th>Name</th><th>ID/IC</th><th>Sex</th><th>Age</th><th>Unit</th><th>Blood Group</th><th>Pack No.</th><th>Staff</th><th>Remarks</th><th>Google Drive</th><th>Notes</th><th>Action</th></tr></thead><tbody id="trTableBody"></tbody></table><div class="outsource-empty" id="trEmpty" hidden>No transfusion record registered yet.</div></div><div class="outsource-pager" id="trPager">Showing 0–0 of 0</div></section></div></div><div class="outsource-result-modal transfusion-remarks-modal" id="transfusionRemarksModal" hidden><div class="outsource-result-dialog"><button type="button" class="outsource-result-close" id="transfusionRemarksClose">×</button><div class="outsource-modal-kicker">TRANSFUSION RECORD</div><h2 id="transfusionRemarksTitle">REMARKS &amp; NOTES</h2><div class="outsource-modal-sub" id="transfusionRemarksSub"></div><div class="outsource-modal-field"><label>REMARKS</label><select id="transfusionRemarksStatus"><option value="">Select status</option><option value="PENDING">PENDING</option><option value="COMPLETED">COMPLETED</option><option value="REJECT">REJECT</option></select></div><div class="outsource-modal-field"><label>NOTES</label><textarea id="transfusionNotesText" placeholder="Enter additional notes"></textarea></div><div class="outsource-modal-actions"><button type="button" class="outsource-btn secondary" id="transfusionRemarksCancel">CANCEL</button><button type="button" class="outsource-btn primary" id="transfusionRemarksSave">SAVE</button></div></div></div>';
        renderYears(rows);
        var yf=document.getElementById('trYearFilter');if(yf)yf.value='ALL';
        var form=document.getElementById('transfusionForm');if(form)form.addEventListener('submit',save);
        document.getElementById('trClear')?.addEventListener('click',clearForm);document.getElementById('transfusionRemarksClose')?.addEventListener('click',closeRemarksModal);document.getElementById('transfusionRemarksCancel')?.addEventListener('click',closeRemarksModal);document.getElementById('transfusionRemarksSave')?.addEventListener('click',saveRemarksModal);document.getElementById('transfusionRemarksModal')?.addEventListener('click',function(e){if(e.target===this)closeRemarksModal();});
        var trSearchTimer = null;
        var trSearchEl = document.getElementById('trSearch');
        if (trSearchEl) {
          trSearchEl.addEventListener('input', function() {
            clearTimeout(trSearchTimer);
            trSearchTimer = setTimeout(renderRows, 150);
          });
        }
        ['trYearFilter','trMonthFilter','trStatusFilter'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('change',renderRows);});
        bindIc();
        if(typeof initOutsourceNeumorphicDates==='function')initOutsourceNeumorphicDates();
        if(typeof window.outsourceInitNeumorphicDropdowns==='function')window.outsourceInitNeumorphicDropdowns();
        renderRows();
      }
      function open(year){
        var active=document.querySelector('.page.active');if(active)active.classList.remove('active');
        var nav=document.querySelector('.nav-btn.active');if(nav)nav.classList.remove('active');
        var page=document.getElementById('moduleYears');if(page){page.classList.add('active');if(typeof Router!=='undefined'&&Router.renderBackButton)Router.renderBackButton('moduleYears');}
        loadTransfusionCache();
        render(year);
        loadTransfusionRecords().catch(function(error){
          console.warn('Transfusion records failed to load:',error&&error.message?error.message:error);
          var empty=document.getElementById('trEmpty');
          if(empty){empty.textContent=error&&error.message?error.message:'Unable to load transfusion records.';empty.hidden=false;}
        });
        if(typeof ActivityTracker!=='undefined'&&ActivityTracker.track)ActivityTracker.track('OPEN_TRANSFUSION','Opened TRANSFUSION registration.',{page:'moduleYears',module:'TRANSFUSION'},{dedupeMs:2000});
      }
      return {open:open,render:render};
    })();

    var LabApp = {
      __initialized: false,
      __secondaryInitialized: false,
      __secondaryInitTimer: null,
      config: config,
      state: state,
      init: function (options) {
        options = options && typeof options === 'object' ? options : {};
        if (state.initialized) {
          if (options.deferSecondary) this.deferSecondaryInit(options.secondaryDelayMs);
          else this.initSecondaryModules();
          return;
        }
        state.initialized = true;
        this.__initialized = true;
        WebView.init();
        Theme.init();
        Router.bindNavButtons();
        Modules.renderLeavesCoursesYears();
        Calendar.init();
        RosterSync.init();
        Dashboard.init();
        // Inventory is intentionally NOT initialized during global app startup.
        // It owns the largest shared dataset and is loaded on-demand when the
        // Inventory page is opened. This keeps Dashboard/Roster startup light.
        if (options.deferSecondary) this.deferSecondaryInit(options.secondaryDelayMs);
        else this.initSecondaryModules();
      },
      initSecondaryModules: function () {
        if (this.__secondaryInitialized) return;
        if (this.__secondaryInitTimer) {
          window.clearTimeout(this.__secondaryInitTimer);
          this.__secondaryInitTimer = null;
        }
        this.__secondaryInitialized = true;
        Settings.init();
      },
      deferSecondaryInit: function (delayMs) {
        var app = this;
        if (app.__secondaryInitialized || app.__secondaryInitTimer) return;
        app.__secondaryInitTimer = window.setTimeout(function () {
          app.__secondaryInitTimer = null;
          app.initSecondaryModules();
        }, Math.max(0, Number(delayMs || 350)));
      },
      Router: Router,
      Dashboard: Dashboard,
      DailyQuote: DailyQuote,
      Theme: Theme,
      Modules: Modules,
      Calendar: Calendar,
      RosterSync: RosterSync,

      Settings: Settings,
      Auth: Auth,
      ActivityTracker: ActivityTracker,
      WebView: WebView,
      Inventory: Inventory
    };
  
    window.LabApp = LabApp;
  
    document.addEventListener('DOMContentLoaded', function () {
      try {
        Auth.init();
      } catch (error) {
        console.error('LabApp auth startup error:', error);
        var warning = document.createElement('div');
        warning.className = 'noscript-warning';
        warning.innerHTML = '<strong>LabApp startup error.</strong><br/>Please reload the app. If this repeats, check the browser console or redeploy Code.gs and Index.html.';
        document.body.insertBefore(warning, document.body.firstChild);
      }
    }, { once: true });
  })(window, document);


/* ===== ORIGINAL SCRIPT BLOCK: inline-script-07 ===== */
(function () {
  function setupMobileNavigation() {
    if (document.querySelector('.mobile-nav-toggle')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-nav-toggle';
    button.setAttribute('aria-label', 'Open navigation menu');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span aria-hidden="true">☰</span><span>MENU</span>';
    document.body.appendChild(button);
    function closeMenu() {
      document.body.classList.remove('mobile-nav-open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open navigation menu');
    }
    button.addEventListener('click', function () {
      var open = document.body.classList.toggle('mobile-nav-open');
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });
    document.addEventListener('click', function (event) {
      if (window.matchMedia('(max-width: 980px)').matches && event.target.closest('.nav-btn')) closeMenu();
      if (event.target === document.body && document.body.classList.contains('mobile-nav-open')) closeMenu();
    });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 980) closeMenu(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupMobileNavigation, { once: true });
  else setupMobileNavigation();
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .catch((error) => console.error("Service Worker error:", error));
  });
}


/* ===== ORIGINAL SCRIPT BLOCK: settings-system-check-runtime ===== */
(function(){
  function bindSystemCheck(){
    var btn=document.getElementById('settingsSystemCheckButton');
    if(!btn || btn.dataset.systemCheckBound==='1') return;
    btn.dataset.systemCheckBound='1';
    btn.addEventListener('click', function(event){
      event.preventDefault();
      event.stopPropagation();
      if(btn.dataset.checking==='1') return;
      btn.dataset.checking='1';
      btn.disabled=true;
      var copy=btn.querySelector('.settings-extra-copy span');
      var original=copy ? copy.textContent : 'Check app, storage & connection';
      if(copy) copy.textContent='Checking…';
      var checks = {
        app: !!window.LabApp,
        storage: (function(){ try { var k='__labapp_check__'; localStorage.setItem(k,'1'); localStorage.removeItem(k); return true; } catch(e){ return false; } })(),
        connection: navigator.onLine !== false,
        firebase: false
      };
      window.setTimeout(function(){
        var ok = checks.app && checks.storage && checks.connection;
        if(copy) copy.textContent = ok ? 'System OK ✓' : 'Check completed';
        btn.dataset.checking='0';
        window.setTimeout(function(){
          if(copy) copy.textContent=original;
          btn.disabled=false;
        }, 1800);
      }, 350);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bindSystemCheck, {once:true});
  else bindSystemCheck();
})();


/* ===== ORIGINAL SCRIPT BLOCK: inventory-scroll-runtime-fix ===== */
/* Inventory scrolling is handled natively by #inventory .inventory-table-wrap.
   Do not attach wheel/touch handlers to the page itself. */


/* ===== ORIGINAL SCRIPT BLOCK: inventory-neumorphic-date-picker ===== */
(function(){
  function pad(n){return String(n).padStart(2,'0');}
  function key(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function parse(v){if(!v)return null;var a=v.split('-').map(Number);if(a.length!==3||a.some(isNaN))return null;return new Date(a[0],a[1]-1,a[2]);}
  function fmt(v){var d=parse(v);return d?pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear():'';}
  function setup(hiddenId,visibleId){
    var h=document.getElementById(hiddenId), v=document.getElementById(visibleId); if(!h||!v)return;
    var pop=document.createElement('div'); pop.className='inventory-date-popover'; pop.hidden=true; pop.innerHTML=
      '<div class="inventory-date-head"><div class="inventory-date-month"></div><div class="inventory-date-nav"><button type="button" data-prev aria-label="Previous month">‹</button><button type="button" data-next aria-label="Next month">›</button></div></div>'+
      '<div class="inventory-date-week"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div>'+
      '<div class="inventory-date-grid"></div><div class="inventory-date-foot"><button type="button" data-clear>Clear</button><button type="button" data-today>Today</button></div>';
    document.body.appendChild(pop);
    var view=parse(h.value)||new Date();
    function position(){var r=v.getBoundingClientRect(), w=pop.offsetWidth, hgt=pop.offsetHeight; var left=Math.min(Math.max(12,r.left),window.innerWidth-w-12); var top=r.bottom+8; if(top+hgt>window.innerHeight-12)top=Math.max(12,r.top-hgt-8); pop.style.left=left+'px';pop.style.top=top+'px';}
    function render(){
      pop.querySelector('.inventory-date-month').textContent=view.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
      var grid=pop.querySelector('.inventory-date-grid'); grid.innerHTML='';
      var first=new Date(view.getFullYear(),view.getMonth(),1); var start=(first.getDay()+6)%7; var days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
      var prevDays=new Date(view.getFullYear(),view.getMonth(),0).getDate(); var today=key(new Date());
      for(var i=0;i<42;i++){var n=i-start+1, d=new Date(view.getFullYear(),view.getMonth(),n), muted=false; if(n<1){d=new Date(view.getFullYear(),view.getMonth()-1,prevDays+n);muted=true;} else if(n>days){d=new Date(view.getFullYear(),view.getMonth()+1,n-days);muted=true;} var b=document.createElement('button');b.type='button';b.className='inventory-date-day'+(muted?' muted':'')+(key(d)===today?' today':'')+(key(d)===h.value?' selected':'');b.textContent=d.getDate();b.dataset.date=key(d);grid.appendChild(b);}
    }
    function open(){view=parse(h.value)||new Date();render();pop.hidden=false;position();}
    function close(){pop.hidden=true;}
    function choose(k){h.value=k;v.value=fmt(k);h.dispatchEvent(new Event('input',{bubbles:true}));h.dispatchEvent(new Event('change',{bubbles:true}));close();}
    v.value=fmt(h.value); v.addEventListener('click',open); v.addEventListener('focus',open);
    pop.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-prev')){view=new Date(view.getFullYear(),view.getMonth()-1,1);render();position();}else if(b.hasAttribute('data-next')){view=new Date(view.getFullYear(),view.getMonth()+1,1);render();position();}else if(b.dataset.date){choose(b.dataset.date);}else if(b.hasAttribute('data-today')){choose(key(new Date()));}else if(b.hasAttribute('data-clear')){choose('');}});
    document.addEventListener('mousedown',function(e){if(!pop.contains(e.target)&&e.target!==v)close();});
    window.addEventListener('resize',function(){if(!pop.hidden)position();}); window.addEventListener('scroll',function(){if(!pop.hidden)position();},true);
    var form=v.closest('form'); if(form)form.addEventListener('reset',function(){setTimeout(function(){v.value=fmt(h.value);},0);});
    v._syncDate=function(){v.value=fmt(h.value);};
  }
  function init(){setup('inventoryMovementDateInput','inventoryMovementDateVisible');setup('inventoryExpiryInput','inventoryExpiryVisible');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();


/* ===== ORIGINAL SCRIPT BLOCK: outsource-neumorphic-date-picker-script ===== */
(function(){
 function pad(n){return String(n).padStart(2,'0');} function key(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
 function parse(v){if(!v)return null;var a=String(v).split('-').map(Number);if(a.length!==3||a.some(isNaN))return null;return new Date(a[0],a[1]-1,a[2]);}
 function fmt(v){var d=parse(v);return d?pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear():'';}
 function setup(hiddenId,visibleId){var h=document.getElementById(hiddenId),v=document.getElementById(visibleId);if(!h||!v||v._outsourceDateReady)return;v._outsourceDateReady=true;
  var pop=document.createElement('div');pop.className='outsource-date-popover';pop.hidden=true;pop.innerHTML='<div class="outsource-date-head"><div class="outsource-date-month"></div><div class="outsource-date-nav"><button type="button" data-prev>‹</button><button type="button" data-next>›</button></div></div><div class="outsource-date-week"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div><div class="outsource-date-grid"></div><div class="outsource-date-foot"><button type="button" data-clear>Clear</button><button type="button" data-today>Today</button></div>';document.body.appendChild(pop);
  var view=parse(h.value)||new Date();
  function position(){var r=v.getBoundingClientRect(),w=pop.offsetWidth,hh=pop.offsetHeight,left=Math.min(Math.max(12,r.left),window.innerWidth-w-12),top=r.bottom+8;if(top+hh>window.innerHeight-12)top=Math.max(12,r.top-hh-8);pop.style.left=left+'px';pop.style.top=top+'px';}
  function render(){pop.querySelector('.outsource-date-month').textContent=view.toLocaleDateString('en-GB',{month:'long',year:'numeric'});var g=pop.querySelector('.outsource-date-grid');g.innerHTML='';var first=new Date(view.getFullYear(),view.getMonth(),1),start=(first.getDay()+6)%7,days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate(),prevDays=new Date(view.getFullYear(),view.getMonth(),0).getDate(),today=key(new Date());for(var i=0;i<42;i++){var n=i-start+1,d=new Date(view.getFullYear(),view.getMonth(),n),muted=false;if(n<1){d=new Date(view.getFullYear(),view.getMonth()-1,prevDays+n);muted=true}else if(n>days){d=new Date(view.getFullYear(),view.getMonth()+1,n-days);muted=true}var b=document.createElement('button');b.type='button';b.className='outsource-date-day'+(muted?' muted':'')+(key(d)===today?' today':'')+(key(d)===h.value?' selected':'');b.textContent=d.getDate();b.dataset.date=key(d);g.appendChild(b);}}
  function open(){view=parse(h.value)||new Date();render();pop.hidden=false;position();}
  function close(){pop.hidden=true;}
  function choose(k){h.value=k;v.value=fmt(k);h.dispatchEvent(new Event('input',{bubbles:true}));h.dispatchEvent(new Event('change',{bubbles:true}));close();}
  v.value=fmt(h.value);v.addEventListener('click',open);v.addEventListener('focus',open);
  pop.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-prev')){view=new Date(view.getFullYear(),view.getMonth()-1,1);render();position()}else if(b.hasAttribute('data-next')){view=new Date(view.getFullYear(),view.getMonth()+1,1);render();position()}else if(b.dataset.date){choose(b.dataset.date)}else if(b.hasAttribute('data-today')){choose(key(new Date()))}else if(b.hasAttribute('data-clear')){choose('')}});
  document.addEventListener('mousedown',function(e){if(!pop.contains(e.target)&&e.target!==v)close()});window.addEventListener('resize',function(){if(!pop.hidden)position()});window.addEventListener('scroll',function(){if(!pop.hidden)position()},true);
  v._syncDate=function(){v.value=fmt(h.value);};
 }
 window.initOutsourceNeumorphicDates=function(){[['osSampleDate','osSampleDateVisible'],['osDispatchDate','osDispatchDateVisible'],['outsourceModalResultDate','outsourceModalResultDateVisible'],['trDate','trDateVisible']].forEach(function(x){setup(x[0],x[1]);});['osSampleDate','osDispatchDate','outsourceModalResultDate','trDate'].forEach(function(id){var h=document.getElementById(id),v=document.getElementById(id+'Visible');if(h&&v&&v._syncDate)v._syncDate();});};
})();


/* ===== ORIGINAL SCRIPT BLOCK: inventory-month-dropdown-final-v7 ===== */
(function(){
  var menu=null, trigger=null, select=null;
  function closeMenu(){
    if(menu){menu.remove();menu=null;}
    if(trigger){trigger.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');}
    trigger=null;select=null;
  }
  function positionMenu(){
    if(!menu||!trigger)return;
    var r=trigger.getBoundingClientRect();
    var w=Math.max(220,r.width);
    menu.style.minWidth=w+'px';
    var h=menu.offsetHeight;
    var left=Math.min(Math.max(8,r.left),window.innerWidth-w-8);
    var top=r.bottom+6;
    if(top+h>window.innerHeight-8)top=Math.max(8,r.top-h-6);
    menu.style.left=left+'px';menu.style.top=top+'px';
  }
  function openMenu(btn){
    closeMenu();
    trigger=btn;
    select=document.getElementById('inventoryPriceMonth');
    if(!select)return;
    menu=document.createElement('div');
    menu.className='inventory-month-menu is-open';
    menu.setAttribute('role','listbox');
    Array.prototype.forEach.call(select.options,function(opt){
      var b=document.createElement('button'); b.type='button'; b.textContent=opt.textContent;
      b.dataset.value=opt.value; b.setAttribute('role','option');
      if(opt.value===select.value)b.classList.add('is-selected');
      b.addEventListener('click',function(e){
        e.preventDefault(); e.stopPropagation();
        select.value=b.dataset.value;
        select.dispatchEvent(new Event('change',{bubbles:true}));
        closeMenu();
      });
      menu.appendChild(b);
    });
    document.body.appendChild(menu);
    trigger.classList.add('is-open');trigger.setAttribute('aria-expanded','true');
    positionMenu();
    var chosen=menu.querySelector('.is-selected');
    if(chosen)chosen.scrollIntoView({block:'nearest'});
  }
  document.addEventListener('click',function(e){
    var btn=e.target.closest('#inventoryPriceMonthTrigger');
    if(btn){e.preventDefault();e.stopPropagation(); if(menu)closeMenu();else openMenu(btn);return;}
    if(menu&&!e.target.closest('.inventory-month-menu'))closeMenu();
  },true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu)closeMenu();});
  window.addEventListener('resize',function(){if(menu)positionMenu();});
  window.addEventListener('scroll',function(){if(menu)positionMenu();},true);
})();



/* ===== ORIGINAL SCRIPT BLOCK: inventory-filter-dropdown-polish-v8-script ===== */
(function(){
  var ids=['inventoryCategoryFilter','inventoryStatusFilter','inventoryViewFilter'];
  var openMenu=null, openTrigger=null, openSelect=null;
  function close(){
    if(openMenu){openMenu.remove();openMenu=null;}
    if(openTrigger){openTrigger.classList.remove('is-open');openTrigger.setAttribute('aria-expanded','false');}
    openTrigger=null; openSelect=null;
  }
  function position(){
    if(!openMenu||!openTrigger)return;
    var r=openTrigger.getBoundingClientRect();
    var w=Math.max(r.width,220);
    var h=openMenu.offsetHeight;
    var left=Math.min(Math.max(8,r.left),window.innerWidth-w-8);
    var top=r.bottom+6;
    if(top+h>window.innerHeight-8) top=Math.max(8,r.top-h-6);
    openMenu.style.minWidth=w+'px';
    openMenu.style.left=left+'px';
    openMenu.style.top=top+'px';
  }
  function open(trigger,select){
    close(); openTrigger=trigger; openSelect=select;
    var menu=document.createElement('div');
    openMenu=menu; menu.className='inventory-filter-menu is-open'; menu.setAttribute('role','listbox');
    Array.prototype.forEach.call(select.options,function(opt){
      var b=document.createElement('button'); b.type='button'; b.textContent=opt.textContent;
      b.dataset.value=opt.value; b.setAttribute('role','option');
      if(opt.value===select.value)b.classList.add('is-selected');
      b.addEventListener('click',function(e){
        e.preventDefault(); e.stopPropagation();
        select.value=b.dataset.value;
        select.dispatchEvent(new Event('change',{bubbles:true}));
        sync(select); close();
      });
      menu.appendChild(b);
    });
    document.body.appendChild(menu);
    trigger.classList.add('is-open'); trigger.setAttribute('aria-expanded','true');
    position();
  }
  function sync(select){
    var wrap=select.parentElement, trigger=wrap && wrap.querySelector('.inventory-filter-trigger');
    if(!trigger)return;
    var text=trigger.querySelector('[data-filter-label]');
    var opt=select.options[select.selectedIndex];
    if(text)text.textContent=opt?opt.textContent:'Select...';
    if(openMenu){openMenu.querySelectorAll('button').forEach(function(b){b.classList.toggle('is-selected',b.dataset.value===select.value);});}
  }
  function setup(select){
    if(!select || select.dataset.customized==='1')return;
    select.dataset.customized='1';
    select.classList.add('inventory-filter-native');
    var wrap=document.createElement('div'); wrap.className='inventory-filter-custom-wrap';
    select.parentNode.insertBefore(wrap,select); wrap.appendChild(select);
    var trigger=document.createElement('button'); trigger.type='button'; trigger.className='inventory-filter-trigger';
    trigger.setAttribute('aria-haspopup','listbox'); trigger.setAttribute('aria-expanded','false');
    trigger.innerHTML='<span data-filter-label></span><span class="inventory-filter-chevron">⌄</span>';
    wrap.insertBefore(trigger,select);
    sync(select);
    trigger.addEventListener('click',function(e){e.preventDefault();e.stopPropagation(); if(openMenu && openTrigger===trigger)close(); else open(trigger,select);});
    select.addEventListener('change',function(){sync(select);});
  }
  function init(){ids.forEach(function(id){setup(document.getElementById(id));});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  document.addEventListener('click',function(e){if(openMenu && !e.target.closest('.inventory-filter-menu') && !e.target.closest('.inventory-filter-trigger'))close();},true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&openMenu)close();});
  window.addEventListener('resize',function(){if(openMenu)position();});
  window.addEventListener('scroll',function(){if(openMenu)position();},true);
})();


/* ===== ORIGINAL SCRIPT BLOCK: outsource-neumorphic-dropdown-v3-script ===== */
(function(){
  var openMenu=null,openTrigger=null,openSelect=null;
  function close(){
    if(openMenu){openMenu.remove();openMenu=null;}
    if(openTrigger){openTrigger.classList.remove('is-open');openTrigger.setAttribute('aria-expanded','false');}
    openTrigger=null;openSelect=null;
  }
  function position(){
    if(!openMenu||!openTrigger)return;
    var r=openTrigger.getBoundingClientRect(), w=Math.max(r.width,180), h=openMenu.offsetHeight;
    var left=Math.min(Math.max(8,r.left),window.innerWidth-w-8), top=r.bottom+6;
    if(top+h>window.innerHeight-8)top=Math.max(8,r.top-h-6);
    openMenu.style.width=w+'px';openMenu.style.left=left+'px';openMenu.style.top=top+'px';
  }
  function sync(select){
    var wrap=select&&select.parentElement,trigger=wrap&&wrap.querySelector('.outsource-select-trigger');
    if(!trigger)return;
    var label=trigger.querySelector('[data-outsource-select-label]'),opt=select.options[select.selectedIndex];
    if(label)label.textContent=opt?opt.textContent:'Select...';
    if(openMenu)openMenu.querySelectorAll('button').forEach(function(b){b.classList.toggle('is-selected',b.dataset.value===select.value);});
  }
  function open(trigger,select){
    close();openTrigger=trigger;openSelect=select;
    var menu=document.createElement('div');menu.className='outsource-select-menu';menu.setAttribute('role','listbox');
    Array.prototype.forEach.call(select.options,function(opt){
      var b=document.createElement('button');b.type='button';b.textContent=opt.textContent;b.dataset.value=opt.value;b.setAttribute('role','option');
      if(opt.value===select.value)b.classList.add('is-selected');
      b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();select.value=b.dataset.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync(select);close();});
      menu.appendChild(b);
    });
    document.body.appendChild(menu);openMenu=menu;trigger.classList.add('is-open');trigger.setAttribute('aria-expanded','true');position();
  }
  function setup(select){
    if(!select||select.dataset.outsourceCustom==='1')return;
    select.dataset.outsourceCustom='1';select.classList.add('outsource-native-select');
    var wrap=document.createElement('div');wrap.className='outsource-custom-select-wrap';select.parentNode.insertBefore(wrap,select);wrap.appendChild(select);
    var trigger=document.createElement('button');trigger.type='button';trigger.className='outsource-select-trigger';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
    if(select.disabled){trigger.setAttribute('aria-disabled','true');}
    trigger.innerHTML='<span data-outsource-select-label></span><span class="outsource-select-chevron">⌄</span>';wrap.insertBefore(trigger,select);sync(select);
    if(!select.disabled)trigger.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(openMenu&&openTrigger===trigger)close();else open(trigger,select);});
    select.addEventListener('change',function(){sync(select);});
  }
  function init(){
    if(!document.body||!document.getElementById('moduleYearGrid'))return;
    /* Registered Samples & Transfusion filters stay native; form & modal selects use the same neumorphic controls. */
    document.querySelectorAll('#moduleYearGrid.outsource-active-grid .outsource-field select, #moduleYearGrid.outsource-active-grid .outsource-modal-field select, #moduleYearGrid.transfusion-active-grid .outsource-field select, #moduleYearGrid.transfusion-active-grid .outsource-modal-field select').forEach(setup);
  }
  function delayed(){setTimeout(init,0);setTimeout(init,120);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',delayed);else delayed();
  document.addEventListener('click',function(e){if(openMenu&&!e.target.closest('.outsource-select-menu')&&!e.target.closest('.outsource-select-trigger'))close();},true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&openMenu)close();});
  window.addEventListener('resize',function(){if(openMenu)position();});
  window.addEventListener('scroll',function(){if(openMenu)position();},true);
  /* Observe structural changes only; do not poll every 500ms. Ignore outsource table rows. */
  if(window.MutationObserver){
    var pending=false;
    new MutationObserver(function(mutations){
      var relevant=false;
      for(var i=0;i<mutations.length;i++){
        var m=mutations[i];
        if(m.addedNodes && m.addedNodes.length){
          var t=m.target;
          if(t && (t.id==='outsourceTableBody' || t.id==='trTableBody' || (t.closest && t.closest('#outsourceTableBody, #trTableBody')))) continue;
          relevant=true;
          break;
        }
      }
      if(!relevant || pending)return;
      pending=true;
      setTimeout(function(){pending=false;init();},60);
    }).observe(document.body,{childList:true,subtree:true});
  }
  window.outsourceInitNeumorphicDropdowns=init;
})();


