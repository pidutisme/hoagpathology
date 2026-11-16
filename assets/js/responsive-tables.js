/*
 * UNIVERSAL RESPONSIVE DATA TABLES
 * Keeps every data table as a real table at all widths. When the actual
 * container is narrow, CSS makes cells wrap and rows grow vertically.
 * Column labels are copied from <th> into each <td> for compatibility, but
 * the responsive layout never switches to a label/value card.
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

  function applyLabelsToRows(table, rows) {
    if (!table || !rows || !rows.length) return;
    var headerRow = table.tHead && table.tHead.rows && table.tHead.rows[0];
    if (!headerRow) headerRow = table.querySelector('thead tr');
    if (!headerRow) return;
    var headers = Array.prototype.map.call(headerRow.cells || [], function (cell) {
      return cleanLabel(cell.textContent);
    });
    if (!headers.length) return;
    Array.prototype.forEach.call(rows, function (row) {
      if (!row || row.nodeType !== 1 || row.matches('.rt-spanning-row, .outsource-virtual-spacer, .tbis-virtual-spacer')) return;
      var cells = Array.prototype.slice.call(row.cells || []);
      if (cells.some(function (cell) { return cell.hasAttribute('colspan') || cell.hasAttribute('rowspan'); })) {
        row.classList.add('rt-spanning-row');
        return;
      }
      cells.forEach(function (cell, index) {
        cell.setAttribute('data-label', headers[index] || ('Column ' + (index + 1)));
      });
    });
  }

  function scan(root) {
    var scope = root && root.querySelectorAll ? root : document;
    if (scope.nodeType === 1 && scope.matches && scope.matches(TABLE_SELECTOR)) prepareTable(scope);
    var tables = scope.querySelectorAll ? scope.querySelectorAll(TABLE_SELECTOR) : [];
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

  function scanAddedNode(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.matches && node.matches('table:not([data-rt-ignore="1"])')) {
      prepareTable(node);
      return;
    }
    if (node.matches && node.matches('tr')) {
      var table = node.closest('table:not([data-rt-ignore="1"])');
      if (table) applyLabelsToRows(table, [node]);
      return;
    }
    scan(node);
  }

  function init() {
    scan(document);

    if (window.MutationObserver) {
      new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          Array.prototype.forEach.call(mutation.addedNodes || [], scanAddedNode);
        });
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
