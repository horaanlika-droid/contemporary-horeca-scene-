'use strict';

/* Reads the authored lesson source (lessons.txt) and prints its structure.
   This is the inspection step used before tools/build-course-lessons.js writes
   the parsed lessons into course-data.js. */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'lessons.txt');

function splitLessons(raw) {
  const lines = raw.split(/\r?\n/);
  const starts = [];
  lines.forEach((line, index) => {
    if (/^#\s+/.test(line)) starts.push(index);
  });
  const blocks = [];
  starts.forEach((start, i) => {
    const end = i + 1 < starts.length ? starts[i + 1] : lines.length;
    const body = lines.slice(start, end).join('\n');
    if (/^#\s+PRACTICAL ASSIGNMENTS/m.test(lines[start])) return;
    blocks.push({ start: start + 1, body });
  });
  return blocks;
}

function headingOf(body) {
  return body.split('\n')[0].replace(/^#\s+/, '').trim();
}

const lessons = splitLessons(fs.readFileSync(SOURCE, 'utf8')).filter(({ body }) => {
  const head = headingOf(body);
  return !/^PRACTICAL ASSIGNMENTS$/i.test(head);
});

for (const block of lessons) {
  const lines = block.body.split('\n');
  const head = headingOf(block.body);
  const marker = block.body.match(/LESSON\s+(\d+)\s*[·\-—]?\s*(\d+)?\s*(?:MIN|min)/);
  const alt = block.body.match(/Editorial [Ll]esson\s*·\s*(\d+)\s*min/);
  const italic = lines.find(line => /^\*[^*].*\*$/.test(line.trim()));
  const bold = lines.filter(line => /^\*\*[^*].*\*\*$/.test(line.trim()));
  const sections = lines.filter(line => /^##\s+/.test(line)).map(line => line.replace(/^##\s+/, ''));
  console.log('\n===', head, '| line', block.start, '===');
  console.log('number:', marker?.[1] || (block.start < 100 ? '1 (implicit)' : '?'),
    '| duration:', marker?.[2] || alt?.[1] || '?', 'min');
  console.log('italic intro:', italic ? italic.slice(0, 200) : '—');
  console.log('sections:', sections.join(' / '));
  console.log('bold lines:', bold.length);
  bold.slice(0, 24).forEach(line => console.log('   ', line.replace(/\*\*/g, '').slice(0, 160)));
}
