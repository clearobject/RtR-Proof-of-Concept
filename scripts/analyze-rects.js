const fs = require('fs')
const path = require('path')

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
  rects.push({ x, y, width, height })
}

rects.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))

console.log('total rects:', rects.length)

const summaryBySize = {}
const bySize = {}
rects.forEach((r) => {
  const key = `${r.width}x${r.height}`
  summaryBySize[key] = (summaryBySize[key] || 0) + 1
  if (!bySize[key]) bySize[key] = []
  bySize[key].push(r)
})

console.log('size distribution:')
Object.entries(summaryBySize)
  .sort((a, b) => b[1] - a[1])
  .forEach(([key, count]) => console.log(key, count))

console.log('\nfirst 60 rects:')
rects.slice(0, 60).forEach((r, i) => console.log(i, r))

console.log('\ncoordinates by size (first 5 entries each):')
Object.entries(bySize).forEach(([key, list]) => {
  console.log(key)
  const uniqueY = Array.from(new Set(list.map((r) => r.y))).sort((a, b) => a - b)
  console.log('  y-levels:', uniqueY.slice(0, 10), uniqueY.length > 10 ? `(+${uniqueY.length - 10} more)` : '')
  list.slice(0, 5).forEach((r, idx) => console.log(`  ${idx}:`, r))
})

