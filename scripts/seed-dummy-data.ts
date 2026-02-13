/**
 * Seed script: inserts dummy data for all tables except products.
 * Run: pnpm exec tsx scripts/seed-dummy-data.ts
 *
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for RLS bypass)
 */

import 'dotenv/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in .env'
  )
  process.exit(1)
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

// --- Dummy data (excluding products) ---

const regions = [
  { iso_code: 'MH', name: 'Maharashtra', country: 'IN' },
  { iso_code: 'GJ', name: 'Gujarat', country: 'IN' },
  { iso_code: 'KA', name: 'Karnataka', country: 'IN' },
  { iso_code: 'TN', name: 'Tamil Nadu', country: 'IN' },
  { iso_code: 'TS', name: 'Telangana', country: 'IN' },
  { iso_code: 'UP', name: 'Uttar Pradesh', country: 'IN' },
  { iso_code: 'DL', name: 'Delhi', country: 'IN' },
  { iso_code: 'HR', name: 'Haryana', country: 'IN' },
  { iso_code: 'MP', name: 'Madhya Pradesh', country: 'IN' },
  { iso_code: 'WB', name: 'West Bengal', country: 'IN' },
]

const accreditations = [
  { code: 'FDA', label: 'FDA Approved' },
  { code: 'CDSCO', label: 'CDSCO Approved' },
  { code: 'DMF', label: 'Drug Master File' },
  { code: 'CEP', label: 'Certificate of Suitability' },
  { code: 'WHO-GMP', label: 'WHO-GMP Certified' },
  { code: 'EU-GMP', label: 'EU-GMP Certified' },
  { code: 'ISO9001', label: 'ISO 9001:2015' },
  { code: 'ICHQ7', label: 'ICH Q7 Compliant' },
  { code: 'ISO14001', label: 'ISO 14001:2015' },
  { code: 'ISO45001', label: 'ISO 45001:2018' },
]

const chemistries = [
  { slug: 'asymmetric-synthesis', label: 'Asymmetric Synthesis' },
  { slug: 'peptide-synthesis', label: 'Peptide Synthesis' },
  { slug: 'heterocyclic-chemistry', label: 'Heterocyclic Chemistry' },
  { slug: 'flow-chemistry', label: 'Flow Chemistry' },
  { slug: 'green-chemistry', label: 'Green Chemistry' },
  { slug: 'microbial-fermentation', label: 'Microbial Fermentation' },
  { slug: 'enzymatic-processes', label: 'Enzymatic Processes' },
  { slug: 'solvent-extraction', label: 'Solvent Extraction' },
  { slug: 'chromatographic-purification', label: 'Chromatographic Purification' },
  { slug: 'crystallization', label: 'Crystallization' },
]

const companies = [
  {
    name: 'PharmaSynth Labs',
    website: 'https://pharmasynth.example.com',
    contact_email: 'contact@pharmasynth.example.com',
  },
  {
    name: 'BioChem Industries',
    website: 'https://biochem.example.com',
    contact_email: 'info@biochem.example.com',
  },
  {
    name: 'MediChem Solutions',
    website: null,
    contact_email: 'hello@medichem.example.com',
  },
  {
    name: 'GreenPharma Ltd',
    website: 'https://greenpharma.example.com',
    contact_email: null,
  },
]

async function main() {
  console.log('Seeding dummy data (excluding products)...\n')

  // 1. Regions (insert; re-run may create duplicates - truncate first if needed)
  const { data: regionRows, error: errRegions } = await supabase
    .from('regions')
    .insert(regions)
    .select('id, name')

  if (errRegions) {
    console.error('Regions:', errRegions.message)
    process.exit(1)
  }
  const regionIds = (regionRows ?? []).map((r) => r.id)
  const regionByName = new Map((regionRows ?? []).map((r) => [r.name, r.id]))
  console.log(`✓ Regions: ${regionIds.length} rows`)

  // 2. Accreditations
  const { data: accRows, error: errAcc } = await supabase
    .from('accreditations')
    .upsert(accreditations, { onConflict: 'code', ignoreDuplicates: true })
    .select('id, code')

  if (errAcc) {
    console.error('Accreditations:', errAcc.message)
    process.exit(1)
  }
  const accIds = (accRows ?? []).map((a) => a.id)
  const accByCode = new Map((accRows ?? []).map((a) => [a.code, a.id]))
  console.log(`✓ Accreditations: ${accIds.length} rows`)

  // 3. Chemistries
  const { data: chemRows, error: errChem } = await supabase
    .from('chemistries')
    .upsert(chemistries, { onConflict: 'slug', ignoreDuplicates: true })
    .select('id, slug')

  if (errChem) {
    console.error('Chemistries:', errChem.message)
    process.exit(1)
  }
  const chemIds = (chemRows ?? []).map((c) => c.id)
  const chemBySlug = new Map((chemRows ?? []).map((c) => [c.slug, c.id]))
  console.log(`✓ Chemistries: ${chemIds.length} rows`)

  // 4. Companies
  const { data: companyRows, error: errCompanies } = await supabase
    .from('companies')
    .insert(companies)
    .select('id')

  if (errCompanies) {
    console.error('Companies:', errCompanies.message)
    process.exit(1)
  }
  const companyIds = companyRows ?? []
  console.log(`✓ Companies: ${companyIds.length} rows`)

  // 5. Facilities (need company_id, optional region_id)
  const facilities = companyIds.flatMap((c, i) => {
    const regionName =
      regions[i % regions.length]?.name ?? regions[0]!.name
    const regionId = regionByName.get(regionName) ?? regionIds[0]
    return [
      {
        company_id: c.id,
        name: `Facility ${i + 1} - ${companies[i]?.name ?? 'Unknown'}`,
        address: `${100 + i * 10} Industrial Area, ${regionName}`,
        region_id: regionId,
        latitude: 19.0 + i * 0.5,
        longitude: 72.8 + i * 0.3,
        is_active: true,
      },
      ...(i < 2
        ? [
            {
              company_id: c.id,
              name: `Secondary Site ${i + 1}`,
              address: null,
              region_id: regionIds[(i + 2) % regionIds.length],
              latitude: null,
              longitude: null,
              is_active: true,
            },
          ]
        : []),
    ]
  })

  const { data: facilityRows, error: errFacilities } = await supabase
    .from('facilities')
    .insert(facilities)
    .select('id, company_id')

  if (errFacilities) {
    console.error('Facilities:', errFacilities.message)
    process.exit(1)
  }
  const facilityIds = (facilityRows ?? []).map((f) => f.id)
  console.log(`✓ Facilities: ${facilityIds.length} rows`)

  // 6. Facility accreditations (sample: assign 2–4 accreditations per facility)
  const facilityAccreditations = facilityIds.flatMap((fid, idx) =>
    accIds
      .slice(idx % accIds.length, (idx % accIds.length) + 3)
      .map((aid, j) => ({
        facility_id: fid,
        accreditation_id: aid,
        awarding_body: j === 0 ? 'CDSCO' : null,
        certificate_number: j === 0 ? `CERT-${idx}-${j}` : null,
        awarded_at: '2023-01-15',
        expires_at: '2026-01-15',
      }))
  )

  const { error: errFacAcc } = await supabase
    .from('facility_accreditations')
    .upsert(facilityAccreditations, {
      onConflict: 'facility_id,accreditation_id',
      ignoreDuplicates: true,
    })

  if (errFacAcc) {
    console.error('Facility accreditations:', errFacAcc.message)
    process.exit(1)
  }
  console.log(`✓ Facility accreditations: ${facilityAccreditations.length} rows`)

  // 7. Facility chemistries
  const facilityChemistries = facilityIds.flatMap((fid, idx) =>
    chemIds
      .slice(idx % chemIds.length, (idx % chemIds.length) + 2)
      .map((cid) => ({
        facility_id: fid,
        chemistry_id: cid,
      }))
  )

  const { error: errFacChem } = await supabase
    .from('facility_chemistries')
    .upsert(facilityChemistries, {
      onConflict: 'facility_id,chemistry_id',
      ignoreDuplicates: true,
    })

  if (errFacChem) {
    console.error('Facility chemistries:', errFacChem.message)
    process.exit(1)
  }
  console.log(`✓ Facility chemistries: ${facilityChemistries.length} rows`)

  // 8. Facility meta
  const facilityMeta = facilityIds.map((fid, idx) => ({
    facility_id: fid,
    tags: idx % 2 === 0 ? ['api', 'export'] : ['domestic'],
    notes: idx === 0 ? 'Primary manufacturing site' : null,
    extra: { capacity: 'medium', verified: true },
  }))

  const { error: errFacMeta } = await supabase
    .from('facility_meta')
    .upsert(facilityMeta, { onConflict: 'facility_id', ignoreDuplicates: true })

  if (errFacMeta) {
    console.error('Facility meta:', errFacMeta.message)
    process.exit(1)
  }
  console.log(`✓ Facility meta: ${facilityMeta.length} rows`)

  console.log('\nDone. Products and facility_products were skipped as requested.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
