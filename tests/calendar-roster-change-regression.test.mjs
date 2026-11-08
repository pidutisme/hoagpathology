import assert from 'node:assert/strict';
import fs from 'node:fs';
const app = fs.readFileSync(new URL('../assets/js/app.js', import.meta.url), 'utf8');
const asset = fs.readFileSync('assets/js/app.js', 'utf8');
const styles = fs.readFileSync('assets/css/app.css', 'utf8');
assert.match(app, /cloudHasAssignment/);
assert.match(app, /if \(cloudRows\.length && cloudHasAssignment\) return cloudRows/);
assert.doesNotMatch(fs.readFileSync('api/bridge.js', 'utf8'), /firebase_migration_backup/);
assert.match(asset, /cloudHasAssignment/);
assert.match(styles, /calendar-mini-day-staff-original[\s\S]*text-decoration:\s*line-through/);

// A roster edit must update only the affected date cells. Other dates must
// remain mounted and their staff labels must not be cleared/rebuilt.
for (const source of [app, asset]) {
  assert.match(source, /function refreshCalendarRosterCells\(dateKeys\)/);
  assert.match(source, /if \(onlyKeys && !onlyKeys\[key\]\) continue;/);
  assert.match(source, /scheduleMonthCalendarBuild\(Object\.keys\(grouped\)\.length \? Object\.keys\(grouped\) : \[selectedKey\]\)/);
}
console.log('calendar roster-change regression: PASS');
