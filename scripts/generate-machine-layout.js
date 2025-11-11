const fs = require('fs')
const path = require('path')

const SVG_WIDTH = 2261
const SVG_HEIGHT = 1345

const svgPath = path.resolve(__dirname, '../web/public/images/RtR_Factory_Layout.svg')
const csvPath = path.resolve(__dirname, '../data/RtR Assets.csv')

const svgContent = fs.readFileSync(svgPath, 'utf8')
const csvContent = fs.readFileSync(csvPath, 'utf8')

const [headerLine, ...rows] = csvContent.trim().split(/\r?\n/)
const headers = headerLine.split(',')

const assets = rows.map((row) => {
  const cols = row.split(',')
  const record = {}
  headers.forEach((key, idx) => {
    record[key] = cols[idx] ?? ''
  })
  return record
})

const targetCategories = [
  { width: 85, height: 48 },
  { width: 61, height: 41 },
  { width: 48, height: 41 },
  { width: 48, height: 96 },
  { width: 36.4545, height: 44 },
  { width: 31.1212, height: 44 },
  { width: 24, height: 41 },
  { width: 35, height: 32 },
  { width: 35, height: 29.6585 },
  { width: 29, height: 32 },
  { width: 22.2857, height: 30 },
  { width: 42, height: 31.6203 },
]

const rectRegex = /<rect\b([^>]*)>/g
const attrRegex = /(\w[\w:-]*)="([^"]*)"/g

const approxEqual = (a, b, tolerance = 0.01) => Math.abs(a - b) <= tolerance

function matchesCategory(width, height) {
  return targetCategories.some((cat) => {
    return approxEqual(cat.width, width, 0.5) && approxEqual(cat.height, height, 0.5)
  })
}

const allRects = []
let match
while ((match = rectRegex.exec(svgContent))) {
  const attrs = {}
  let attrMatch
  while ((attrMatch = attrRegex.exec(match[1]))) {
    attrs[attrMatch[1]] = attrMatch[2]
  }

  if (attrs.stroke !== '#1E1E1E') continue

  const width = attrs.width ? parseFloat(attrs.width) : 0
  const height = attrs.height ? parseFloat(attrs.height) : 0
  const x = attrs.x ? parseFloat(attrs.x) : 0
  const y = attrs.y ? parseFloat(attrs.y) : 0

  if (width === 0 || height === 0) continue
  if (!matchesCategory(width, height)) continue

  allRects.push({ id: allRects.length, x, y, width, height })
}

allRects.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))

let availableRects = [...allRects]

const sortByPosition = (a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y)

function takeRects(predicate, count) {
  const matches = availableRects.filter(predicate).sort(sortByPosition)
  if (matches.length < count) {
    console.error('Not enough rectangles for rule. Needed:', count, 'found:', matches.length)
    process.exit(1)
  }
  const chosen = matches.slice(0, count)
  const chosenIds = new Set(chosen.map((r) => r.id))
  availableRects = availableRects.filter((r) => !chosenIds.has(r.id))
  return chosen
}

const consumers = []

const assetGroup = (pattern) =>
  assets.filter((asset) => pattern.test(asset.Asset)).sort((a, b) => a.Asset.localeCompare(b.Asset))

const groupAssignments = []

function assignGroup(groupKey, assetList, rectList) {
  if (assetList.length !== rectList.length) {
    console.error(`Group ${groupKey} mismatch: assets=${assetList.length}, rects=${rectList.length}`)
    process.exit(1)
  }
  const sortedRects = rectList.sort(sortByPosition)
  const entries = assetList.map((asset, idx) => ({ asset, rect: sortedRects[idx] }))
  groupAssignments.push({ groupKey, entries })
}

// Define asset groups
const assetsDC_CO = assetGroup(/^EWR\.IB\.DC\.CO\./)
const assetsDC_IP = assetGroup(/^EWR\.IB\.DC\.IP\./)
const assetsDC_UN = assetGroup(/^EWR\.IB\.DC\.UN\./)
const assetsDRY_REU = assetGroup(/^EWR\.IB\.DRY\.REU\./)
const assetsDRY_WETA = assetGroup(/^EWR\.IB\.DRY\.WETA\./)
const assetsDRY_WETB = assetGroup(/^EWR\.IB\.DRY\.WETB\./)
const assetsWC_55 = assetGroup(/^EWR\.IB\.WC\.CT\.55\./)
const assetsWC_60 = assetGroup(/^EWR\.IB\.WC\.CT\.60\./)
const assetsWC_90 = assetGroup(/^EWR\.IB\.WC\.CT\.90\./)

const totalAssignedAssets =
  assetsDC_CO.length +
  assetsDC_IP.length +
  assetsDC_UN.length +
  assetsDRY_REU.length +
  assetsDRY_WETA.length +
  assetsDRY_WETB.length +
  assetsWC_55.length +
  assetsWC_60.length +
  assetsWC_90.length

if (totalAssignedAssets !== assets.length) {
  console.error('Asset grouping mismatch', { totalAssignedAssets, totalAssets: assets.length })
  process.exit(1)
}

// Rectangle selection per group
const rectsDC_CO = [
  ...takeRects((r) => approxEqual(r.width, 36.4545) && approxEqual(r.height, 44), 30),
  ...takeRects((r) => approxEqual(r.width, 31.1212) && approxEqual(r.height, 44), 6),
  ...takeRects((r) => approxEqual(r.width, 24) && approxEqual(r.height, 41), 4),
]

const rectsDC_IP = [
  ...takeRects((r) => approxEqual(r.width, 29) && approxEqual(r.height, 32), 4),
  ...takeRects((r) => approxEqual(r.width, 22.2857) && approxEqual(r.height, 30), 5),
  ...takeRects((r) => approxEqual(r.width, 42) && approxEqual(r.height, 31.6203), 1),
]

const rectsDC_UN = takeRects(
  (r) => approxEqual(r.width, 35) && approxEqual(r.height, 32) && approxEqual(r.y, 608),
  assetsDC_UN.length
)

const rectsDRY_WETA = takeRects(
  (r) => approxEqual(r.width, 61) && approxEqual(r.height, 41) && approxEqual(r.y, 843),
  assetsDRY_WETA.length
)

const rectsDRY_REU = [
  ...takeRects((r) => approxEqual(r.width, 48) && approxEqual(r.height, 41) && approxEqual(r.y, 838), 9),
  ...takeRects((r) => approxEqual(r.width, 48) && approxEqual(r.height, 41) && approxEqual(r.y, 912), 1),
]

const rectsDRY_WETB = [
  ...takeRects((r) => approxEqual(r.width, 48) && approxEqual(r.height, 41), assetsDRY_WETB.length - 3),
  ...takeRects((r) => approxEqual(r.width, 61) && approxEqual(r.height, 41) && approxEqual(r.y, 912), 3),
]

const rectsWC_90 = [
  ...takeRects((r) => approxEqual(r.width, 85) && approxEqual(r.height, 48) && approxEqual(r.y, 528), 7),
  ...takeRects((r) => approxEqual(r.width, 85) && approxEqual(r.height, 48) && approxEqual(r.y, 775), 6),
  ...takeRects((r) => approxEqual(r.width, 85) && approxEqual(r.height, 48) && approxEqual(r.y, 767), assetsWC_90.length - 13),
]

const rectsWC_55 = takeRects(
  (r) => approxEqual(r.width, 35) && approxEqual(r.height, 29.6585),
  assetsWC_55.length
)

const rectsWC_60 = takeRects(
  (r) => approxEqual(r.width, 48) && approxEqual(r.height, 96),
  assetsWC_60.length
)

assignGroup('DC.CO', assetsDC_CO, rectsDC_CO)
assignGroup('DC.IP', assetsDC_IP, rectsDC_IP)
assignGroup('DC.UN', assetsDC_UN, rectsDC_UN)
assignGroup('DRY.REU', assetsDRY_REU, rectsDRY_REU)
assignGroup('DRY.WETA', assetsDRY_WETA, rectsDRY_WETA)
assignGroup('DRY.WETB', assetsDRY_WETB, rectsDRY_WETB)
assignGroup('WC.90', assetsWC_90, rectsWC_90)
assignGroup('WC.55', assetsWC_55, rectsWC_55)
assignGroup('WC.60', assetsWC_60, rectsWC_60)

const assignedRectCount = groupAssignments.reduce((sum, group) => sum + group.entries.length, 0)
if (assignedRectCount !== assets.length) {
  console.error('Assigned rect count mismatch', { assignedRectCount, assets: assets.length })
  process.exit(1)
}

const items = groupAssignments
  .flatMap((group) => group.entries)
  .map(({ asset, rect }) => ({
    assetAlias: asset.Asset,
    description: asset.Description || null,
    model: asset.Model || null,
    x: parseFloat(rect.x.toFixed(3)),
    y: parseFloat(rect.y.toFixed(3)),
    width: parseFloat(rect.width.toFixed(3)),
    height: parseFloat(rect.height.toFixed(3)),
    xPct: parseFloat(((rect.x / SVG_WIDTH) * 100).toFixed(6)),
    yPct: parseFloat(((rect.y / SVG_HEIGHT) * 100).toFixed(6)),
    widthPct: parseFloat(((rect.width / SVG_WIDTH) * 100).toFixed(6)),
    heightPct: parseFloat(((rect.height / SVG_HEIGHT) * 100).toFixed(6)),
  }))
  .sort((a, b) => a.assetAlias.localeCompare(b.assetAlias))

const outputPath = path.resolve(__dirname, '../web/app/dashboard/machineLayout.ts')

const escapeString = (value) => value.replace(/'/g, "\\'")

const layoutBody = items
  .map((item) => {
    const description = item.description ? `'${escapeString(item.description)}'` : 'null'
    const model = item.model ? `'${escapeString(item.model)}'` : 'null'
    return `  { assetAlias: '${escapeString(item.assetAlias)}', description: ${description}, model: ${model}, x: ${item.x}, y: ${item.y}, width: ${item.width}, height: ${item.height}, xPct: ${item.xPct}, yPct: ${item.yPct}, widthPct: ${item.widthPct}, heightPct: ${item.heightPct} },`
  })
  .join('\n')

const output = `export type MachineLayoutItem = {\n  assetAlias: string;\n  description: string | null;\n  model: string | null;\n  x: number;\n  y: number;\n  width: number;\n  height: number;\n  xPct: number;\n  yPct: number;\n  widthPct: number;\n  heightPct: number;\n};\n\nexport const MACHINE_LAYOUT: MachineLayoutItem[] = [\n${layoutBody}\n];\n`

fs.writeFileSync(outputPath, output)

console.log('machineLayout.ts updated successfully.')

