import { Machine } from '@/lib/types'

const RAW_ASSET_CSV = `
Asset,Alias,Description,Model,Model Name,Serial Number,Organization,Status,Department,Class,Commission Date,Out of Service,Assigned To,OEM
EWR.IB.DC.CO.01.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16936,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.01.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16937,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.02.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16939,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.02.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16940,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.03.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16930,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.03.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16931,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.04.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16933,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.04.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16934,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.05.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32O14960,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.05.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32O14961,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.07.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32N14582,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.07.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32N14583,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.08.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16918,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.08.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16919,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.09.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16921,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.09.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16922,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.10.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32P16078,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.10.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32P16079,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.11.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32P16072,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.11.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32P16073,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.12.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32P16075,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.12.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32P16076,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.13.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16909,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.13.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16910,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.14.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16906,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.14.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16907,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.15.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16903,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.15.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16904,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.16.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16915,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.16.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16916,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.17.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16912,EWR,Active,INBOUND,WHEEL,9/27/2021,YES,,ILSA
EWR.IB.DC.CO.17.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16913,EWR,Active,INBOUND,WHEEL,9/27/2021,YES,,ILSA
EWR.IB.DC.CO.18.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16927,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.18.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16928,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.19.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16924,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.19.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32Q16925,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.20.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32O15879,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.20.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32O15880,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.21.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32O15876,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.21.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32O15877,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.22.WH.01,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32O15746,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.CO.22.WH.02,,Dry Cleaning,TL HCS 800 N2,Columbia,BW32O15747,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.IP.01,,Dry Cleaning,IPURA 440N,Ipura,JN22M13384,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.IP.02,,Dry Cleaning,IPURA 440N,Ipura,JN22N14052,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.IP.03,,Dry Cleaning,IPURA 440N,Ipura,JN22N14053,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.IP.04,,Dry Cleaning,IPURA 440N,Ipura,JN22P16084,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.IP.05,,Dry Cleaning,IPURA 440N,Ipura,JN22P16083,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.IP.06,,Dry Cleaning,IPURA 440N,Ipura,JN22P16082,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.IP.07,,Dry Cleaning,IPURA 440N,Ipura,JN22P16081,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.IP.09,,Dry Cleaning,IPURA 440N,Ipura,JN22P16087,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.IP.10,,Dry Cleaning,IPURA 440N,Ipura,JN22P16086,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.IP.11,,Dry Cleaning,TL HCS 800 N2,Ipura,BW32N14585,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,ILSA
EWR.IB.DC.UN.01.WH.01,,Dry Cleaning,HL880,Union,609 G7 0750,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,UNION
EWR.IB.DC.UN.01.WH.02,,Dry Cleaning,HP880,Union,784 G7 0321,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,UNION
EWR.IB.DC.UN.02.WH.01,,Dry Cleaning,HL890-K,Union,610 F1 0800,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,UNION
EWR.IB.DC.UN.02.WH.02,,Dry Cleaning,HP890K,Union,704 F1 0367,EWR,Active,INBOUND,WHEEL,9/27/2021,NO,,UNION
EWR.IB.DRY.REU.01,MIELE REUSE.01,Miele Dryer R-01,PT 8807 D,Miele,91585057,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.REU.02,MIELE REUSE.02,Miele Dryer R-02,PT 8807 D,Miele,91584998,EWR,Active,INBOUND,DRYER,12/6/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.REU.03,MIELE REUSE.03,Miele Dryer R-03,PT 8807 D,Miele,91585035,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.REU.04,MIELE REUSE.04,Miele Dryer R-04,PT 8807 D,Miele,91584995,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.REU.05,MIELE REUSE.05,Miele Dryer R-05,PT 8807 D,Miele,91585036,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.REU.06,MIELE REUSE.06,Miele Dryer R-06,PT 8807 D,Miele,91584996,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.REU.07,MIELE REUSE.07,Miele Dryer R-07,PT 8807 D,Miele,91585056,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.REU.08,MIELE REUSE.08,Miele Dryer R-08,PT 8807 D,Miele,91585037,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.REU.09,MIELE REUSE.09,Miele Dryer R-09,PT 8807 D,Miele,91584997,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.REU.10,MIELE REUSE.10,Miele Dryer R-10,PT 8807 D,Miele,91585055,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETA.01,MIELE WETA.01,Miele Dryer A-01,PT 8807 D,Miele,91572803,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETA.02,MIELE WETA.02,Miele Dryer A-02,PDR 944 SI,Miele,161242472,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETA.03,MIELE WETA.03,Miele Dryer A-03,PDR 944 SI,Miele,161242557,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETA.04,MIELE WETA.04,Miele Dryer A-04,PDR 944 SI,Miele,161242468,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETA.05,CONT.DRYER.A05,Continental Dryer A05,CG115-125,Continental,1506013295,EWR,Active,INBOUND,DRYER,12/1/2022,NO,,CONTINENTAL
EWR.IB.DRY.WETA.06,CONT.DRYER.A06,Continental Dryer A06,CG115-125,Continental,1506013294,EWR,Active,INBOUND,DRYER,12/1/2022,NO,,CONTINENTAL
EWR.IB.DRY.WETA.07,MIELE WETA.07,Miele Dryer A-07,PDR 944 SI,Miele,161243050,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETA.08,MIELE WETA.08,Miele Dryer A-08,PDR 944 SI,Miele,91583367,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETA.09,MIELE WETA.09,Miele Dryer A-09,PDR 944 SI,Miele,91583368,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETB.01,MIELE WETB.01,Miele Dryer B-01,PDR 944 SI,Miele,161242473,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETB.02,MIELE WETB.02,Miele Dryer B-02,PDR 944 SI,Miele,161243048,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETB.03,MIELE WETB.03,Miele Dryer B-03,PDR 944 SI,Miele,161243051,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETB.04,MIELE WETB.04,Miele Dryer B-04,PDR 944 SI,Miele,161242554,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETB.05,PSD.DRYER.B05,Poseidon Dryer B05,ED 660,Poseidon,2294499,EWR,Active,INBOUND,DRYER,12/1/2022,NO,,POSEIDON
EWR.IB.DRY.WETB.06,MIELE WETB.06,Miele Dryer B-06,PDR 944 SI,Miele,161243049,EWR,Active,INBOUND,DRYER,12/1/2022,NO,KSPEARS,MIELE
EWR.IB.DRY.WETB.07,CONT.DRYER.B07,Continental Dryer B07,CG115-125,Continental,1809058902,EWR,Active,INBOUND,DRYER,12/1/2022,NO,,CONTINENTAL
EWR.IB.DRY.WETB.08,CONT.DRYER.B08,Continental Dryer B08,CG115-125,Continental,1809058903,EWR,Active,INBOUND,DRYER,12/1/2022,NO,,CONTINENTAL
EWR.IB.DRY.WETB.09,CONT.DRYER.B09,Continental Dryer B09,CG115-125,Continental,1601011904,EWR,Active,INBOUND,DRYER,12/1/2022,NO,,CONTINENTAL
EWR.IB.DRY.WETB.10,CONT.DRYER.B10,Continental Dryer B10,CG115-125,Continental,1601011902,EWR,Active,INBOUND,DRYER,12/1/2022,NO,,CONTINENTAL
EWR.IB.DRY.WETB.11,CONT.DRYER.B11,Continental Dryer B11,CG115-125,Continental,1601011907,EWR,Active,INBOUND,DRYER,12/1/2022,NO,,CONTINENTAL
EWR.IB.DRY.WETB.12,CONT.DRYER.B12,Continental Dryer B12,CG115-125,Continental,1809055700,EWR,Active,INBOUND,DRYER,12/1/2022,NO,,CONTINENTAL
EWR.IB.WC.CT.55.01,,Wet Cleaning,EH055I2102111500,Continental,1.49E+20,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.55.02,,Wet Cleaning,EH055I2102111500,Continental,1.49E+20,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.55.03,,Wet Cleaning,EH055I2102111500,Continental,1.49E+20,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.55.04,,Wet Cleaning,EH055I31021115001,Continental,1492497N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.55.05,,Wet Cleaning,EH055I31021115001,Continental,1492499N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.55.06,,Wet Cleaning,EH055I31021115001,Continental,1492496N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.55.07,,Wet Cleaning,EH055I31021115001,Continental,1492498N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.60.01,,Wet Cleaning,EH060I21021115001,Continental,2401663K18,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.60.02,,Wet Cleaning,EH060I11021115001,Continental,2401238B18,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.01,,Wet Cleaning,EH090I3102111000,Continental,1500250A15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.02,,Wet Cleaning,EH090I3102111000,Continental,1500129M12,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.03,,Wet Cleaning,EH090I2102111000,Continental,1500270D15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.04,,Wet Cleaning,EH090I2102111000,Continental,1500271D15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.05,,Wet Cleaning,EH090I31021110001,Continental,1500324N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.06,,Wet Cleaning,EH090I31021110001,Continental,1500322N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.07,,Wet Cleaning,EH090I31021110001,Continental,1500321N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.08,,Wet Cleaning,EH090I31021110001,Continental,1500320N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.09,,Wet Cleaning,EH090I31021110001,Continental,1500318N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.10,,Wet Cleaning,EH090I31021110001,Continental,1500326N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.11,,Wet Cleaning,EH090I31021110001,Continental,1500330N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.12,,Wet Cleaning,EH090I31021110001,Continental,1500329N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.13,,Wet Cleaning,EH090I31021110001,Continental,1500328N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.14,,Wet Cleaning,EH090I31021110001,Continental,1500319N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.15,,Wet Cleaning,EH090I31021110001,Continental,1500327N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.16,,Wet Cleaning,EH090I31021110001,Continental,1500323N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
EWR.IB.WC.CT.90.17,,Wet Cleaning,EH090I31021110001,Continental,1500325N15,EWR,Active,INBOUND,WASHMACH,9/27/2021,NO,,CONTENINTAL
`

function parseCsv(csv: string) {
  const lines = csv
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  const headerLine = lines.shift()
  if (!headerLine) return []

  const headers = headerLine.split(',').map((header) => header.trim())

  return lines.map((line) => {
    const values = line.split(',').map((value) => value.trim())
    const entry: Record<string, string> = {}
    headers.forEach((header, index) => {
      entry[header] = values[index] ?? ''
    })
    return entry
  })
}

const FACILITY_CODE_MAP: Record<string, string> = {
  EWR: '550e8400-e29b-41d4-a716-446655440000',
  DFW: '550e8400-e29b-41d4-a716-446655440001',
}

const normalizeValue = (value: string) => value?.trim() ?? ''

const normalizeZone = (value: string) => {
  const clean = normalizeValue(value)
  if (!clean) return 'Unassigned'
  return clean
    .toLowerCase()
    .split(/[\s_/.-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const TYPE_LOOKUP: Record<string, string> = {
  wheel: 'dry_cleaner',
  dryer: 'dryer',
  washmach: 'washer',
  washer: 'washer',
  sorter: 'sorter',
  press: 'press',
  tunnel: 'steam_tunnel',
  qc: 'quality_scanner',
  rfid: 'rfid_reader',
}

const normalizeType = (rawClass: string, description: string) => {
  const classSlug = normalizeValue(rawClass).toLowerCase().replace(/[^a-z0-9]+/g, '')
  if (classSlug && TYPE_LOOKUP[classSlug]) return TYPE_LOOKUP[classSlug]

  const desc = normalizeValue(description).toLowerCase()
  if (desc.includes('dry clean')) return 'dry_cleaner'
  if (desc.includes('dryer')) return 'dryer'
  if (desc.includes('wet')) return 'washer'
  if (desc.includes('press')) return 'press'
  if (desc.includes('steam')) return 'steam_tunnel'
  if (desc.includes('sort')) return 'sorter'
  if (desc.includes('scan')) return 'quality_scanner'

  return classSlug || 'equipment'
}

const mapStatus = (status: string, outOfService: string): Machine['status'] => {
  const base = normalizeValue(status).toLowerCase()
  const oos = normalizeValue(outOfService).toLowerCase()

  if (oos === 'yes') return 'Offline'
  if (base === 'active') return 'Active'
  if (base === 'inactive') return 'Maintenance'
  return 'Maintenance'
}

const toIsoDate = (value: string) => {
  const clean = normalizeValue(value)
  if (!clean) return new Date(0).toISOString()
  const date = new Date(clean)
  return isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString()
}

const rows = parseCsv(RAW_ASSET_CSV)

export const machines: Machine[] = rows.map((row) => {
  const asset = normalizeValue(row['Asset'])
  const alias = normalizeValue(row['Alias'])
  const description = normalizeValue(row['Description'])
  const className = normalizeValue(row['Class'])
  const department = normalizeValue(row['Department'])
  const organization = normalizeValue(row['Organization']) || 'EWR'

  const name =
    alias ||
    description ||
    normalizeValue(row['Model Name']) ||
    normalizeValue(row['Model']) ||
    asset

  return {
    id: asset || name,
    asset_alias: asset || name,
    name,
    type: normalizeType(className, description),
    zone: normalizeZone(department),
    facility_id: FACILITY_CODE_MAP[organization] || organization.toLowerCase(),
    status: mapStatus(row['Status'], row['Out of Service']),
    manufacturer: normalizeValue(row['OEM']) || normalizeValue(row['Model']),
    model: normalizeValue(row['Model Name']) || normalizeValue(row['Model']),
    serial_number: normalizeValue(row['Serial Number']),
    created_at: toIsoDate(row['Commission Date']),
    updated_at: toIsoDate(row['Commission Date']),
  }
})

