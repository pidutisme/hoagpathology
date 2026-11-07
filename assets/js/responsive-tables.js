/*
 * UNIVERSAL RESPONSIVE DATA TABLES
 * Converts every data table into a stacked record/card layout when the
 * table's ACTUAL container is too narrow. Column labels are copied from
 * <th> into each <td>, so dynamically-rendered tables are covered too.
 */
(function () {
  'use strict';

  var TABLE_SELECTOR = 'table:not([data-rt-ignore="1"])';
  var pending = false;

  function cleanLabel(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function prepareTable(table) {
    if (!table || table.nodeType !== 1) return;

    var headerRow = table.tHead && table.tHead.rows && table.tHead.rows[0];
    if (!headerRow) {
      headerRow = table.querySelector('thead tr');
    }
    if (!headerRow) return;

    var headers = Array.prototype.map.call(headerRow.cells || [], function (cell) {
      return cleanLabel(cell.textContent);
    });

    if (!headers.length) return;

    /* Let container queries measure the real table area, not the viewport. */
    var parent = table.parentElement;
    if (parent && !parent.hasAttribute('data-rt-container')) {
      parent.setAttribute('data-rt-container', '1');
      parent.style.containerType = 'inline-size';
    }

    table.classList.add('rt-responsive-table');
    table.setAttribute('data-rt-ready', '1');

    Array.prototype.forEach.call(table.tBodies || [], function (tbody) {
      Array.prototype.forEach.call(tbody.rows || [], function (row) {
        var cells = Array.prototype.slice.call(row.cells || []);
        var hasSpan = cells.some(function (cell) {
          return cell.hasAttribute('colspan') || cell.hasAttribute('rowspan');
        });

        if (hasSpan) {
          row.classList.add('rt-spanning-row');
          return;
        }

        cells.forEach(function (cell, index) {
          var label = headers[index] || ('Column ' + (index + 1));
          cell.setAttribute('data-label', label);
        });
      });
    });
  }

  function scan(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var tables = scope.querySelectorAll(TABLE_SELECTOR);
    Array.prototype.forEach.call(tables, prepareTable);
  }

  function scheduleScan() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      scan(document);
    });
  }

  function init() {
    scan(document);

    if (window.MutationObserver) {
      new MutationObserver(function (mutations) {
        var relevant = mutations.some(function (mutation) {
          return mutation.addedNodes && mutation.addedNodes.length;
        });
        if (relevant) scheduleScan();
      }).observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener('resize', scheduleScan, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
