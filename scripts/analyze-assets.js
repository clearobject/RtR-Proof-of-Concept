const fs = require('fs')
const path = require('path')

const csvPath = path.resolve(__dirname, '../data/RtR Assets.csv')
const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/)
const headers = lines[0].split(',')

const rows = lines.slice(1).map((line) => {
  const cols = line.split(',')
  const record = {}
  headers.forEach((header, idx) => {
    record[header] = cols[idx] || ''
  })
  return record
})

const groups = {}

rows.forEach((row) => {
  const asset = row.Asset
  let key = 'other'

  const dcMatch = asset.match(/^EWR\.IB\.DC\.([A-Z]+)\./)
  if (dcMatch) {
    key = `DC.${dcMatch[1]}`
  } else if (asset.startsWith('EWR.IB.DRY.REU')) {
    key = 'DRY.REU'
  } else if (asset.startsWith('EWR.IB.DRY.WETA')) {
    key = 'DRY.WETA'
  } else if (asset.startsWith('EWR.IB.DRY.WETB')) {
    key = 'DRY.WETB'
  } else if (asset.startsWith('EWR.IB.WC.CT.55')) {
    key = 'WC.55'
  } else if (asset.startsWith('EWR.IB.WC.CT.60')) {
    key = 'WC.60'
  } else if (asset.startsWith('EWR.IB.WC.CT.90')) {
    key = 'WC.90'
  }

  if (!groups[key]) groups[key] = []
  groups[key].push(asset)
})

Object.entries(groups)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([key, assets]) => {
    console.log(key, assets.length)
  })

