const fs = require('fs')

const svg = fs.readFileSync('web/public/images/RtR_Factory_Layout.svg', 'utf8')

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

  const width = attrs.width ? parseFloat(attrs.width) : 0
  const height = attrs.height ? parseFloat(attrs.height) : 0
  const x = attrs.x ? parseFloat(attrs.x) : 0
  const y = attrs.y ? parseFloat(attrs.y) : 0

  if (width === 0 || height === 0) continue

  rects.push({ x, y, width, height, attrs })
}

const machineRectangles = rects.filter((rect) => {
  const { attrs } = rect
  if (attrs.stroke !== '#1E1E1E') return false
  if (rect.width > 150 || rect.height > 150) return false
  return true
})

const dims = {}
machineRectangles.forEach((rect) => {
  const key = `${rect.width}x${rect.height}`
  dims[key] = (dims[key] || 0) + 1
})

console.log('Total rects:', rects.length)
console.log('Machine-like rects:', machineRectangles.length)
console.log('Dimension counts:', dims)

