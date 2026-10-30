/* One-time Outsource CSV importer. Admin-only UI; no live spreadsheet sync. */
(function(){
  'use strict';
  var mounted=false, selectedRows=[], selectedFiles=[];
  var HEADER_ALIASES={
    bil:'bil',
    'sample date':'sampleDate','bar code':'barCode','name':'name','id/ic':'idIc',sex:'sex',age:'age',unit:'unit',
    'dispatch date':'dispatchDate',referral:'referral',lab:'lab',test:'test',result:'result','result date':'resultDate',
    'no. rujukan':'referenceNo','reject reason (if rejected)':'rejectReason','catatan/nota':'notes'
  };
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function normHeader(v){return String(v||'').replace(/^\uFEFF/,'').replace(/\s+/g,' ').trim().toLowerCase();}
  function normDate(v){
    var s=String(v||'').trim(); if(!s)return '';
    var m=/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/.exec(s);
    if(m){return m[3]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0');}
    m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
    return m?m[1]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[3]).padStart(2,'0'):null;
  }
  function parseCsv(text){
    var rows=[],row=[],cell='',quoted=false;
    text=String(text||'').replace(/^\uFEFF/,'');
    for(var i=0;i<text.length;i++){
      var c=text[i];
      if(quoted){
        if(c==='"'){ if(text[i+1]==='"'){cell+='"';i++;}else quoted=false; }
        else cell+=c;
      }else if(c==='"'){quoted=true;}
      else if(c===','){row.push(cell);cell='';}
      else if(c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}
      else cell+=c;
    }
    if(cell!==''||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}
    return rows;
  }
  function rowKey(r){return [r.sampleDate,r.barCode,r.idIc,String(r.name).toUpperCase(),String(r.test).toUpperCase(),r.dispatchDate].join('|');}
  function stableId(r){
    var str=rowKey(r),h=2166136261;
    for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}
    return 'outsource-import-'+(h>>>0).toString(36);
  }
  function parseFile(name,text){
    var raw=parseCsv(text), errors=[], out=[];
    if(!raw.length)return {name:name,rows:[],errors:['Empty CSV.']};

    // Google Sheets exports used by the historical Outsource files have a
    // title row before the real column header. Detect the header row instead
    // of assuming row 1 is the header. This keeps the importer compatible
    // with both the exported files and a normal header-first CSV.
    var headerIndex=-1;
    for(var hi=0;hi<Math.min(raw.length,10);hi++){
      var candidate=raw[hi].map(normHeader);
      if(candidate.indexOf('sample date')!==-1 && candidate.indexOf('bar code')!==-1 && candidate.indexOf('name')!==-1 && candidate.indexOf('test')!==-1){
        headerIndex=hi;
        break;
      }
    }
    if(headerIndex<0)return {name:name,rows:[],errors:['Could not find the Outsource column header row.']};

    var header=raw[headerIndex].map(normHeader), map={};
    header.forEach(function(h,i){if(HEADER_ALIASES[h] && map[HEADER_ALIASES[h]]==null)map[HEADER_ALIASES[h]]=i;});
    ['sampleDate','barCode','name','idIc','sex','age','unit','dispatchDate','referral','lab','test','result','resultDate','referenceNo','notes'].forEach(function(k){if(map[k]==null&&k!=='idIc'&&k!=='sex'&&k!=='age'&&k!=='unit'&&k!=='dispatchDate'&&k!=='referral'&&k!=='result'&&k!=='resultDate'&&k!=='referenceNo'&&k!=='notes')errors.push('Missing column: '+k);});
    if(errors.length)return {name:name,rows:[],errors:errors};
    for(var i=headerIndex+1;i<raw.length;i++){
      var rr=raw[i]; if(!rr.some(function(x){return String(x||'').trim();}))continue;
      var r={}; Object.keys(map).forEach(function(k){r[k]=String(rr[map[k]]==null?'':rr[map[k]]).trim();});
      // Ignore spreadsheet filler rows that only contain a month label, #REF!,
      // or other trailing cells. A real record must have at least one core
      // Outsource field before validation is applied.
      if(!String(r.sampleDate||'').trim() && !String(r.barCode||'').trim() && !String(r.name||'').trim() && !String(r.test||'').trim()) continue;
      r.sampleDate=normDate(r.sampleDate); r.dispatchDate=normDate(r.dispatchDate); r.resultDate=normDate(r.resultDate);
      // Historical Google Sheet uses ADA for a completed/available result.
      // Normalize only imported historical rows so the existing Outsource UI
      // consistently shows COMPLETED without changing existing records.
      if(String(r.result||'').trim().toUpperCase()==='ADA')r.result='COMPLETED';
      var rowValid=true;
      if(!r.sampleDate){errors.push('Row '+(i+1)+': invalid/missing Sample Date.');rowValid=false;}
      if(!r.name){errors.push('Row '+(i+1)+': missing Name.');rowValid=false;}
      // Preserve historical rows exactly as supplied. Some source rows have
      // an empty Test field; do not invent a value just to make validation pass.
      // The row can still be imported because the historical data itself is valid.
      if(!r.test)errors.push('Row '+(i+1)+': Test is blank in source (kept blank).');
      if(r.result==='')r.result='PENDING';
      if(!r.resultDate)r.resultDate='';
      if(rowValid){
        r.id=stableId(r); r.createdAt=r.sampleDate+'T12:00:00.000Z'; r.updatedAt=r.createdAt; r.createdBy='CSV MIGRATION';
        out.push(r);
      }
    }
    return {name:name,rows:out,errors:errors};
  }
  function getExisting(){return (window.Inventory&&Inventory.getOutsourceSamples)?Inventory.getOutsourceSamples():[];}
  function buildPreview(){
    var existing=getExisting(), existingKeys={}; existing.forEach(function(r){existingKeys[rowKey(r)]=true;});
    var seen={}, valid=[], dupExisting=0, dupSelected=0, invalid=0, errors=[];
    selectedRows.forEach(function(item){
      item.rows.forEach(function(r){
        var k=rowKey(r); if(existingKeys[k]){dupExisting++;return;} if(seen[k]){dupSelected++;return;} seen[k]=true; valid.push(r);
      });
      errors=errors.concat(item.errors.map(function(e){return item.name+' — '+e;}));
    });
    invalid=errors.filter(function(e){return !/Test is blank in source \(kept blank\)\.$/.test(e);}).length;
    var total=selectedRows.reduce(function(n,x){return n+x.rows.length;},0);
    var html='<div class="outsource-import-stats"><div><strong>'+selectedFiles.length+'</strong><span>CSV files</span></div><div><strong>'+total+'</strong><span>Rows read</span></div><div><strong>'+valid.length+'</strong><span>Ready to import</span></div><div><strong>'+dupExisting+'</strong><span>Already in system</span></div><div><strong>'+dupSelected+'</strong><span>Duplicate in files</span></div><div><strong>'+invalid+'</strong><span>Validation issues</span></div></div>';
    html+='<div class="outsource-import-note">Existing Outsource records are never overwritten or deleted. Import adds only new valid records.</div>';
    if(errors.length)html+='<details class="outsource-import-errors"><summary>Validation issues ('+errors.length+')</summary><div>'+errors.slice(0,80).map(function(e){return '<div>'+esc(e)+'</div>';}).join('')+(errors.length>80?'<div>… '+(errors.length-80)+' more</div>':'')+'</div></details>';
    return {html:html,valid:valid};
  }
  function openModal(){var m=document.getElementById('outsourceImportModal');if(m)m.hidden=false;}
  function closeModal(){var m=document.getElementById('outsourceImportModal');if(m)m.hidden=true;selectedRows=[];selectedFiles=[];var input=document.getElementById('outsourceImportFiles');if(input)input.value='';var preview=document.getElementById('outsourceImportPreview');if(preview)preview.innerHTML='<div class="outsource-import-empty">Select the January–October CSV files to preview.</div>';var go=document.getElementById('outsourceImportRun');if(go)go.disabled=true;}
  async function handleFiles(files){
    selectedRows=[];selectedFiles=Array.from(files||[]);var preview=document.getElementById('outsourceImportPreview');
    if(!selectedFiles.length){if(preview)preview.innerHTML='<div class="outsource-import-empty">No CSV selected.</div>';return;}
    preview.innerHTML='<div class="outsource-import-loading">Reading '+selectedFiles.length+' CSV file(s)…</div>';
    for(var i=0;i<selectedFiles.length;i++){
      var f=selectedFiles[i], text=await f.text(); selectedRows.push(parseFile(f.name,text));
    }
    var result=buildPreview(); if(preview)preview.innerHTML=result.html;
    var go=document.getElementById('outsourceImportRun');if(go)go.disabled=!result.valid.length;
  }
  function runImport(){
    var result=buildPreview(), rows=result.valid;
    if(!rows.length){alert('No new valid records to import.');return;}
    var inventoryApi=window.LabApp&&window.LabApp.Inventory;
    if(!inventoryApi||typeof inventoryApi.bulkUpsertOutsourceSamples!=='function'){alert('Import function is unavailable. Please reload the app and try again.');return;}
    var added=inventoryApi.bulkUpsertOutsourceSamples(rows);
    alert(added+' historical Outsource record(s) imported. Existing records were kept unchanged.');
    closeModal();
  }
  function ensureModal(){
    if(document.getElementById('outsourceImportModal'))return;
    document.body.insertAdjacentHTML('beforeend','<div class="outsource-import-modal" id="outsourceImportModal" hidden><div class="outsource-import-backdrop" data-outsource-import-close></div><div class="outsource-import-dialog" role="dialog" aria-modal="true" aria-labelledby="outsourceImportTitle"><div class="outsource-import-head"><div><div class="outsource-import-kicker">ONE-TIME MIGRATION</div><h2 id="outsourceImportTitle">IMPORT OUTSOURCE CSV</h2><p>Pull historical CSV records into the existing Outsource database. No live Google Sheet sync.</p></div><button type="button" class="outsource-import-close" data-outsource-import-close>×</button></div><div class="outsource-import-body"><label class="outsource-import-file"><span>Select January–October CSV files</span><input id="outsourceImportFiles" type="file" accept=".csv,text/csv" multiple></label><div id="outsourceImportPreview" class="outsource-import-preview"><div class="outsource-import-empty">Select the January–October CSV files to preview.</div></div></div><div class="outsource-import-actions"><button type="button" class="outsource-btn secondary" data-outsource-import-close>CANCEL</button><button type="button" class="outsource-btn primary" id="outsourceImportRun" disabled>IMPORT NEW RECORDS</button></div></div></div>');
    document.querySelectorAll('[data-outsource-import-close]').forEach(function(el){el.addEventListener('click',closeModal);});
    var input=document.getElementById('outsourceImportFiles');if(input)input.addEventListener('change',function(){handleFiles(input.files);});
    var run=document.getElementById('outsourceImportRun');if(run)run.addEventListener('click',runImport);
  }
  function mount(){ ensureModal(); }
  document.addEventListener('click',function(e){
    var btn=e.target&&e.target.closest?e.target.closest('#outsourceImportLaunchBtn'):null;
    if(btn){ensureModal();openModal();}
  });
  window.OutsourceCsvImporter={mount:mount,open:function(){ensureModal();openModal();}};
  document.addEventListener('DOMContentLoaded',function(){setTimeout(mount,200);});
})();
