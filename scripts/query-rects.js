const fs = require('fs')
const path = require('path')

const [widthArg, heightArg] = process.argv.slice(2)
if (!widthArg || !heightArg) {
  console.error('Usage: node scripts/query-rects.js <width> <height>')
  process.exit(1)
}

const widthFilter = parseFloat(widthArg)
const heightFilter = parseFloat(heightArg)

const svgPath = path.resolve(__dirname, '../web/public/images/RtR_Factory_Layout.svg')
const svg = fs.readFileSync(svgPath, 'utf8')

const rectRegex = /<rect\b([^>]*)>/g
const attrRegex = /(\w[\w:-]*)="([^"]*)"/g

const rects = []
let match
while ((match = rectRegex.exec(svg))) {
  const attrs = {}
  let attrMatch
  while ((attrMatch = attrRegex.exec(match[1]))) {
    attrs[attrMatch[1]] = attrMatch[2]
  }
  if (attrs.stroke !== '#1E1E1E') continue

  const width = parseFloat(attrs.width || '0')
  const height = parseFloat(attrs.height || '0')
  const x = parseFloat(attrs.x || '0')
  const y = parseFloat(attrs.y || '0')
  if (width === 0 || height === 0) continue
  if (width === widthFilter && height === heightFilter) {
    rects.push({ x, y, width, height })
  }
}

rects.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))

console.log(`Found ${rects.length} rectangles @ ${widthFilter}x${heightFilter}`)
const yLevels = Array.from(new Set(rects.map((r) => r.y))).sort((a, b) => a - b)
console.log('y-levels:', yLevels)

rects.forEach((r, idx) => console.log(idx, r))

