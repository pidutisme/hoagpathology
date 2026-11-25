(function (global) {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isValidCalendarDate(year, month, day) {
    var y = Number(year);
    var m = Number(month);
    var d = Number(day);
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
    if (y < 1900 || y > 2199 || m < 1 || m > 12 || d < 1 || d > 31) return false;
    var check = new Date(Date.UTC(y, m - 1, d));
    return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
  }

  function resolveReferenceDateParts(referenceDate) {
    var refText = String(referenceDate == null ? '' : referenceDate).trim();
    var isoMatch = refText.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      var y = Number(isoMatch[1]);
      var m = Number(isoMatch[2]);
      var d = Number(isoMatch[3]);
      if (isValidCalendarDate(y, m, d)) {
        return { year: y, month: m, day: d };
      }
    }
    if (global.LabAppTime && typeof global.LabAppTime.nowParts === 'function') {
      var now = global.LabAppTime.nowParts();
      if (now && isValidCalendarDate(now.year, now.month, now.day)) {
        return { year: now.year, month: now.month, day: now.day };
      }
    }
    var local = new Date();
    return {
      year: local.getFullYear(),
      month: local.getMonth() + 1,
      day: local.getDate()
    };
  }

  function parseMalaysianIc(rawValue, referenceDate) {
    var trimmed = String(rawValue == null ? '' : rawValue).trim();
    if (!trimmed) {
      return { valid: false, isNewbornCode: false, sex: '', sexLabel: '', age: '' };
    }
    if (/^M\d{12}(?:-\d+)?$/i.test(trimmed.replace(/\s+/g, ''))) {
      return { valid: false, isNewbornCode: true, sex: 'TBC', sexLabel: '', age: 'NB/NO IC' };
    }
    var digits = trimmed.replace(/\D/g, '');
    if (digits.length !== 12) {
      return { valid: false, isNewbornCode: false, sex: '', sexLabel: '', age: '' };
    }

    var yy = Number(digits.slice(0, 2));
    var mm = Number(digits.slice(2, 4));
    var dd = Number(digits.slice(4, 6));
    var ref = resolveReferenceDateParts(referenceDate);
    var currentCentury = Math.floor(ref.year / 100) * 100;
    var birthYear = currentCentury + yy;

    if (
      birthYear > ref.year ||
      (birthYear === ref.year && (mm > ref.month || (mm === ref.month && dd > ref.day)))
    ) {
      birthYear -= 100;
    }

    if (!isValidCalendarDate(birthYear, mm, dd)) {
      return { valid: false, isNewbornCode: false, sex: '', sexLabel: '', age: '' };
    }

    var age = ref.year - birthYear;
    if (ref.month < mm || (ref.month === mm && ref.day < dd)) {
      age -= 1;
    }
    if (age < 0 || age > 130) {
      return { valid: false, isNewbornCode: false, sex: '', sexLabel: '', age: '' };
    }

    var lastDigit = Number(digits.charAt(11));
    var isMale = lastDigit % 2 === 1;
    return {
      valid: true,
      isNewbornCode: false,
      birthYear: birthYear,
      birthMonth: mm,
      birthDay: dd,
      sex: isMale ? 'L' : 'P',
      sexLabel: isMale ? 'Male' : 'Female',
      age: String(age)
    };
  }

  function safeHttpsUrl(value) {
    var text = String(value == null ? '' : value).trim();
    if (!text) return '';
    try {
      var parsed = new URL(text);
      if (parsed.protocol !== 'https:') return '';
      return parsed.href;
    } catch (_) {
      return '';
    }
  }

  global.LabAppUtils = Object.freeze({
    escapeHtml: escapeHtml,
    isValidCalendarDate: isValidCalendarDate,
    parseMalaysianIc: parseMalaysianIc,
    safeHttpsUrl: safeHttpsUrl
  });
})(typeof window !== 'undefined' ? window : globalThis);
