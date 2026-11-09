/*
 * Shared application timezone utilities.
 * All user-facing date/time values are interpreted/displayed in Malaysia time.
 * Storage may continue using UTC ISO timestamps; conversion happens here.
 */
(function (window) {
  'use strict';

  if (window.LabAppTime) return;

  var TIME_ZONE = 'Asia/Kuala_Lumpur';
  var MALAYSIA_OFFSET = '+08:00';

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function formatter(options) {
    var opts = Object.assign({ timeZone: TIME_ZONE }, options || {});
    return new Intl.DateTimeFormat('en-GB', opts);
  }

  function parts(value) {
    var date = value instanceof Date ? value : new Date(value == null || value === '' ? Date.now() : value);
    if (isNaN(date.getTime())) return null;

    try {
      var out = {};
      formatter({
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hourCycle: 'h23'
      }).formatToParts(date).forEach(function (part) {
        if (part.type !== 'literal') out[part.type] = part.value;
      });
      return {
        year: Number(out.year),
        month: Number(out.month),
        day: Number(out.day),
        hour: Number(out.hour),
        minute: Number(out.minute),
        second: Number(out.second)
      };
    } catch (error) {
      var shifted = new Date(date.getTime() + (8 * 60 * 60 * 1000));
      return {
        year: shifted.getUTCFullYear(),
        month: shifted.getUTCMonth() + 1,
        day: shifted.getUTCDate(),
        hour: shifted.getUTCHours(),
        minute: shifted.getUTCMinutes(),
        second: shifted.getUTCSeconds()
      };
    }
  }

  function nowParts() {
    return parts(new Date());
  }

  function todayKey() {
    var p = nowParts();
    return p ? p.year + '-' + pad2(p.month) + '-' + pad2(p.day) : '';
  }

  function localInputNow() {
    var p = nowParts();
    return p ? p.year + '-' + pad2(p.month) + '-' + pad2(p.day) + 'T' + pad2(p.hour) + ':' + pad2(p.minute) : '';
  }

  function timeNow() {
    var p = nowParts();
    if (!p) return '';
    var hour = p.hour % 12 || 12;
    return pad2(hour) + ':' + pad2(p.minute) + ' ' + (p.hour >= 12 ? 'PM' : 'AM');
  }

  function formatDateTime(value) {
    if (!value) return 'Never';
    var p = parts(value);
    if (!p) return String(value);
    var month = formatter({ month: 'short' }).format(new Date(Date.UTC(p.year, p.month - 1, p.day)));
    return pad2(p.day) + ' ' + month + ' ' + p.year + ', ' + pad2(p.hour) + ':' + pad2(p.minute);
  }

  function formatDate(value) {
    if (!value) return '—';
    var p = parts(value);
    if (!p) return String(value);
    return pad2(p.day) + '/' + pad2(p.month) + '/' + p.year;
  }

  function formatDateTimeInput(value) {
    var p = parts(value);
    if (!p) return null;
    return {
      year: p.year,
      month: p.month - 1,
      day: p.day,
      hour: p.hour,
      minute: p.minute
    };
  }

  function localWallClockToUtc(value) {
    var raw = String(value || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return raw;
    var date = new Date(raw + ':00' + MALAYSIA_OFFSET);
    return isNaN(date.getTime()) ? raw : date.toISOString();
  }

  function localWallClockParts(value) {
    var raw = String(value || '').trim();
    var match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!match) return parts(raw);
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
      hour: Number(match[4]),
      minute: Number(match[5]),
      second: 0
    };
  }

  window.LabAppTime = Object.freeze({
    timeZone: TIME_ZONE,
    pad2: pad2,
    parts: parts,
    nowParts: nowParts,
    todayKey: todayKey,
    localInputNow: localInputNow,
    timeNow: timeNow,
    formatDateTime: formatDateTime,
    formatDate: formatDate,
    formatDateTimeInput: formatDateTimeInput,
    localWallClockToUtc: localWallClockToUtc,
    localWallClockParts: localWallClockParts
  });
})(window);
