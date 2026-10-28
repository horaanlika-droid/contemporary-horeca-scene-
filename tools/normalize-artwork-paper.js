#!/usr/bin/env node
/**
 * Normalise the paper of the drawn course graphics to true white.
 *
 * The `illo-*` files are ink-and-gouache illustrations exported on a paper that
 * is *almost* white — between #E9E5DC and #FFFFFF depending on the generation.
 * On a white page that difference reads as a pale rectangle around every
 * drawing: an edge where the picture should simply be part of the layout. The
 * stylesheet multiplies the artwork into the surface it sits on, which makes the
 * paper disappear — but only if the paper is genuinely white first.
 *
 * This tool measures each file's paper (the brightest cluster of pixels, sampled
 * per channel) and scales the image so that cluster becomes #FFFFFF, anchoring
 * black at 0 so the ink keeps its weight. It only ever lifts the paper: a file
 * whose paper is already white is left byte-for-byte untouched.
 *
 *   node tools/normalize-artwork-paper.js --dry   # report, change nothing
 *   node tools/normalize-artwork-paper.js         # rewrite the JPEGs in place
 *
 * Requires `sharp` (a build-time dependency only; the course app itself has no
 * npm packages and never loads this file).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ASSET_DIR = path.join(ROOT, 'presentation', 'assets');
const DRY = process.argv.includes('--dry');

/** Pixels at or above this luminance percentile count as paper. */
const PAPER_PERCENTILE = 0.985;
/** Never brighten a channel by more than this factor. */
const MAX_GAIN = 1.16;
/** Below this much lift the file is already white enough; leave it alone. */
const MIN_GAIN = 1.004;

function luminanceHistogram(data, channels) {
  const hist = new Uint32Array(256);
  for (let i = 0; i < data.length; i += channels) {
    const y = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
    hist[y < 0 ? 0 : y > 255 ? 255 : y] += 1;
  }
  return hist;
}

function percentileLevel(hist, total, p) {
  const target = total * p;
  let seen = 0;
  for (let level = 0; level < hist.length; level += 1) {
    seen += hist[level];
    if (seen >= target) return level;
  }
  return 255;
}

/** Mean colour of the paper: all pixels at or above the paper luminance level. */
function paperColour(data, channels, floor) {
  const sum = [0, 0, 0];
  let count = 0;
  for (let i = 0; i < data.length; i += channels) {
    const y = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (y + 0.5 < floor) continue;
    sum[0] += data[i];
    sum[1] += data[i + 1];
    sum[2] += data[i + 2];
    count += 1;
  }
  if (!count) return [255, 255, 255];
  return sum.map(v => v / count);
}

async function normaliseFile(sharp, file) {
  const full = path.join(ASSET_DIR, file);
  const image = sharp(full);
  const meta = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const pixels = info.width * info.height;

  const hist = luminanceHistogram(data, channels);
  const floor = percentileLevel(hist, pixels, PAPER_PERCENTILE);
  const paper = paperColour(data, channels, floor);

  const gains = paper.map(value => Math.min(MAX_GAIN, 255 / Math.max(value, 1)));
  const worst = Math.max(...gains);
  if (worst < MIN_GAIN) return { file, changed: false, paper, gains };

  const out = Buffer.from(data);
  const lut = gains.map(gain => {
    const table = new Uint8Array(256);
    for (let v = 0; v < 256; v += 1) table[v] = Math.min(255, Math.round(v * gain));
    return table;
  });
  for (let i = 0; i < out.length; i += channels) {
    for (let c = 0; c < 3; c += 1) out[i + c] = lut[c][out[i + c]];
  }

  if (!DRY) {
    const target = path.join(ASSET_DIR, file);
    const encoded = await sharp(out, { raw: { width: info.width, height: info.height, channels } })
      .jpeg({ quality: meta.jpeg?.quality ?? 90, chromaSubsampling: '4:4:4', mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(target, encoded);
  }
  return { file, changed: true, paper, gains };
}

(async () => {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('normalize-artwork-paper: `sharp` is required for this build tool (npm i sharp).');
    process.exit(1);
  }
  const files = fs.readdirSync(ASSET_DIR).filter(name => /^illo-.*\.(jpg|jpeg)$/i.test(name)).sort();
  let touched = 0;
  for (const file of files) {
    const result = await normaliseFile(sharp, file);
    const paper = result.paper.map(v => Math.round(v)).join('/');
    const gain = Math.max(...result.gains).toFixed(3);
    if (result.changed) {
      touched += 1;
      console.log(`${DRY ? 'would lift' : 'lifted'}  ${file.padEnd(34)} paper ${paper.padStart(11)}  gain ${gain}`);
    } else {
      console.log(`white    ${file.padEnd(34)} paper ${paper.padStart(11)}`);
    }
  }
  console.log(`\n${files.length} files · ${touched} ${DRY ? 'would change' : 'changed'}${DRY ? ' (dry run)' : ''}`);
})();
