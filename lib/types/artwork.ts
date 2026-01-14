/**
 * Type definitions for Met Museum API responses
 */

/**
 * Response from /objects endpoint
 */
export interface ObjectsResponse {
  total: number
  objectIDs: number[] | null
}

/**
 * Response from /search endpoint
 */
export interface SearchResponse {
  total: number
  objectIDs: number[] | null
}

/**
 * Constituent (artist/creator) information
 */
export interface Constituent {
  constituentID: number
  role: string
  name: string
  constituentULAN_URL: string
  constituentWikidata_URL: string
  gender: string
}

/**
 * Measurement information
 */
export interface Measurement {
  elementName: string
  elementDescription: string | null
  elementMeasurements: {
    Height?: number
    Width?: number
    Depth?: number
    [key: string]: number | undefined
  } | null
}

/**
 * Complete artwork object from /objects/[id] endpoint
 */
export interface ArtworkObject {
  objectID: number
  isHighlight: boolean
  accessionNumber: string
  accessionYear: string
  isPublicDomain: boolean
  primaryImage: string
  primaryImageSmall: string
  additionalImages: string[]
  constituents: Constituent[] | null
  department: string
  objectName: string
  title: string
  culture: string
  period: string
  dynasty: string
  reign: string
  portfolio: string
  artistRole: string
  artistPrefix: string
  artistDisplayName: string
  artistDisplayBio: string
  artistSuffix: string
  artistAlphaSort: string
  artistNationality: string
  artistBeginDate: string
  artistEndDate: string
  artistGender: string
  artistWikidata_URL: string
  artistULAN_URL: string
  objectDate: string
  objectBeginDate: number
  objectEndDate: number
  medium: string
  dimensions: string
  measurements: Measurement[] | null
  creditLine: string
  geographyType: string
  city: string
  state: string
  county: string
  country: string
  region: string
  subregion: string
  locale: string
  locus: string
  excavation: string
  river: string
  classification: string
  rightsAndReproduction: string
  linkResource: string
  metadataDate: string
  repository: string
  objectURL: string
  tags: Tag[] | null
  objectWikidata_URL: string
  isTimelineWork: boolean
  GalleryNumber: string
}

/**
 * Tag information
 */
export interface Tag {
  term: string
  AAT_URL: string
  Wikidata_URL: string
}

/**
 * Department information from /departments endpoint
 */
export interface Department {
  departmentId: number
  displayName: string
}

/**
 * Departments response
 */
export interface DepartmentsResponse {
  departments: Department[]
}

/**
 * Simplified artwork card data for list/grid display
 */
export interface ArtworkCard {
  objectID: number
  title: string
  artistDisplayName: string
  objectDate: string
  primaryImageSmall: string
  isPublicDomain: boolean
  department: string
  culture: string
  medium: string
}

/**
 * Search filters
 */
export interface SearchFilters extends Record<string, unknown> {
  departmentId?: number
  isHighlight?: boolean
  isOnView?: boolean
  hasImages?: boolean
  medium?: string
  geoLocation?: string
  dateBegin?: number
  dateEnd?: number
}

/**
 * Error response type
 */
export interface ApiError {
  message: string
  status?: number
  details?: unknown
}
