'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Asset, Facility } from '@/lib/types'
import { formatDate, calculateAge } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Search, Upload, Download } from 'lucide-react'
import Link from 'next/link'

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showImportForm, setShowImportForm] = useState(false)
  const [filter, setFilter] = useState<{
    status?: string
    criticality?: string
    facility_id?: string
    search?: string
  }>({})

  const [newAsset, setNewAsset] = useState({
    name: '',
    type: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    facility_id: '',
    zone: '',
    in_service_date: '',
    expected_life_years: '',
    criticality: 'medium' as const,
    status: 'active' as const,
  })

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = async () => {
    try {
      const supabase = createClient()

      let assetsQuery = supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter.status) {
        assetsQuery = assetsQuery.eq('status', filter.status)
      }
      if (filter.criticality) {
        assetsQuery = assetsQuery.eq('criticality', filter.criticality)
      }
      if (filter.facility_id) {
        assetsQuery = assetsQuery.eq('facility_id', filter.facility_id)
      }
      if (filter.search) {
        assetsQuery = assetsQuery.or(
          `name.ilike.%${filter.search}%,type.ilike.%${filter.search}%,manufacturer.ilike.%${filter.search}%,model.ilike.%${filter.search}%`
        )
      }

      const [assetsResult, facilitiesResult] = await Promise.all([
        assetsQuery,
        supabase.from('facilities').select('*').order('name'),
      ])

      if (assetsResult.data) {
        setAssets(assetsResult.data as Asset[])
      }
      if (facilitiesResult.data) {
        setFacilities(facilitiesResult.data as Facility[])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()

      const assetData = {
        ...newAsset,
        expected_life_years: newAsset.expected_life_years
          ? parseInt(newAsset.expected_life_years)
          : null,
      }

      const { error } = await supabase.from('assets').insert(assetData)

      if (!error) {
        setShowCreateForm(false)
        setNewAsset({
          name: '',
          type: '',
          manufacturer: '',
          model: '',
          serial_number: '',
          facility_id: '',
          zone: '',
          in_service_date: '',
          expected_life_years: '',
          criticality: 'medium',
          status: 'active',
        })
        loadData()
      } else {
        console.error('Error creating asset:', error)
        alert('Error creating asset: ' + error.message)
      }
    } catch (error) {
      console.error('Error creating asset:', error)
      alert('Error creating asset')
    }
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split('\n').filter((line) => line.trim())
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())

      // Expected CSV format: name,type,manufacturer,model,serial_number,facility_id,zone,in_service_date,expected_life_years,criticality,status
      const requiredFields = ['name', 'type', 'facility_id', 'in_service_date']
      const missingFields = requiredFields.filter(
        (field) => !headers.includes(field)
      )

      if (missingFields.length > 0) {
        alert(
          `Missing required columns: ${missingFields.join(', ')}\nRequired columns: ${requiredFields.join(', ')}`
        )
        return
      }

      const supabase = createClient()
      const assetsToInsert = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim())
        const asset: any = {}

        headers.forEach((header, index) => {
          const value = values[index] || ''
          if (header === 'expected_life_years') {
            asset[header] = value ? parseInt(value) : null
          } else if (header === 'facility_id') {
            // Try to find facility by code if ID not provided
            const facility = facilities.find((f) => f.code === value || f.id === value)
            asset[header] = facility?.id || value
          } else {
            asset[header] = value || null
          }
        })

        // Set defaults
        if (!asset.criticality) asset.criticality = 'medium'
        if (!asset.status) asset.status = 'active'

        assetsToInsert.push(asset)
      }

      const { error } = await supabase.from('assets').insert(assetsToInsert)

      if (!error) {
        alert(`Successfully imported ${assetsToInsert.length} assets`)
        setShowImportForm(false)
        loadData()
      } else {
        console.error('Error importing assets:', error)
        alert('Error importing assets: ' + error.message)
      }
    } catch (error) {
      console.error('Error processing CSV:', error)
      alert('Error processing CSV file')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading assets...</div>
        </div>
      </div>
    )
  }

  const stats = {
    active: assets.filter((a) => a.status === 'active').length,
    maintenance: assets.filter((a) => a.status === 'maintenance').length,
    retired: assets.filter((a) => a.status === 'retired').length,
    total: assets.length,
    critical: assets.filter((a) => a.criticality === 'critical').length,
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Capital Assets</h1>
            <p className="text-gray-600 mt-2">
              Asset registry and lifecycle management
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowImportForm(!showImportForm)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="w-4 h-4 mr-2" />
              New Asset
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Assets</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Active</h3>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Maintenance</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.maintenance}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Retired</h3>
            <p className="text-2xl font-bold text-gray-600">{stats.retired}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Critical</h3>
            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
          </div>
        </div>

        {/* Import Form */}
        {showImportForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Import Assets from CSV
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file">CSV File</Label>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleCSVImport}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded text-sm text-gray-600">
                <p className="font-semibold mb-2">CSV Format:</p>
                <p>
                  Required columns: name, type, facility_id, in_service_date
                </p>
                <p>
                  Optional columns: manufacturer, model, serial_number, zone,
                  expected_life_years, criticality, status
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowImportForm(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Asset
            </h2>
            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newAsset.name}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, name: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Input
                    id="type"
                    value={newAsset.type}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, type: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={newAsset.manufacturer}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, manufacturer: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={newAsset.model}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, model: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input
                    id="serial_number"
                    value={newAsset.serial_number}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, serial_number: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="facility_id">Facility *</Label>
                  <select
                    id="facility_id"
                    value={newAsset.facility_id}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, facility_id: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Select facility</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name} ({facility.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="zone">Zone</Label>
                  <Input
                    id="zone"
                    value={newAsset.zone}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, zone: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="in_service_date">In Service Date *</Label>
                  <Input
                    id="in_service_date"
                    type="date"
                    value={newAsset.in_service_date}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, in_service_date: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="expected_life_years">Expected Life (Years)</Label>
                  <Input
                    id="expected_life_years"
                    type="number"
                    value={newAsset.expected_life_years}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        expected_life_years: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="criticality">Criticality</Label>
                  <select
                    id="criticality"
                    value={newAsset.criticality}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        criticality: e.target.value as any,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={newAsset.status}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        status: e.target.value as any,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Asset</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assets..."
                  value={filter.search || ''}
                  onChange={(e) =>
                    setFilter({ ...filter, search: e.target.value || undefined })
                  }
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={filter.status || ''}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value || undefined })
                }
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div>
              <Label>Criticality</Label>
              <select
                value={filter.criticality || ''}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    criticality: e.target.value || undefined,
                  })
                }
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Criticalities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <Label>Facility</Label>
              <select
                value={filter.facility_id || ''}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    facility_id: e.target.value || undefined,
                  })
                }
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Facilities</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
            {(filter.status || filter.criticality || filter.facility_id || filter.search) && (
              <Button
                variant="outline"
                onClick={() => setFilter({})}
                className="h-10"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Assets List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Asset Registry
            </h2>
            {assets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manufacturer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criticality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assets.map((asset) => {
                      const age = calculateAge(
                        asset.in_service_date,
                        asset.expected_life_years
                      )
                      return (
                        <tr key={asset.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {asset.name}
                            </div>
                            {asset.model && (
                              <div className="text-sm text-gray-500">
                                {asset.model}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {asset.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {asset.manufacturer || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {age.years} years
                            </div>
                            {asset.expected_life_years && (
                              <div className="text-xs text-gray-500">
                                {age.percentage.toFixed(1)}% of expected life
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                asset.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : asset.status === 'maintenance'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {asset.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                asset.criticality === 'critical'
                                  ? 'bg-red-100 text-red-800'
                                  : asset.criticality === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : asset.criticality === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {asset.criticality}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/assets/${asset.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No assets found. Create your first asset to get started.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
