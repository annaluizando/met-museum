import { renderHook, act } from '@testing-library/react'
import { useCollectionsStore } from '@/lib/stores/collections-store'

describe('collectionsStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useCollectionsStore())
    act(() => {
      result.current.collections.forEach(collection => {
        result.current.deleteCollection(collection.id)
      })
    })
  })

  it('should add a new collection', () => {
    const { result } = renderHook(() => useCollectionsStore())

    act(() => {
      result.current.addCollection({
        name: 'Test Collection',
        description: 'A test collection',
        artworkIds: [],
      })
    })

    expect(result.current.collections).toHaveLength(1)
    expect(result.current.collections[0].name).toBe('Test Collection')
    expect(result.current.collections[0].description).toBe('A test collection')
  })

  it('should update a collection', () => {
    const { result } = renderHook(() => useCollectionsStore())

    let collectionId: string

    act(() => {
      collectionId = result.current.addCollection({
        name: 'Original Name',
        description: 'Original Description',
        artworkIds: [],
      })
    })

    act(() => {
      result.current.updateCollection(collectionId, {
        name: 'Updated Name',
      })
    })

    expect(result.current.collections[0].name).toBe('Updated Name')
    expect(result.current.collections[0].description).toBe('Original Description')
  })

  it('should delete a collection', () => {
    const { result } = renderHook(() => useCollectionsStore())

    let collectionId: string

    act(() => {
      collectionId = result.current.addCollection({
        name: 'Test Collection',
        description: 'Will be deleted',
        artworkIds: [],
      })
    })

    expect(result.current.collections).toHaveLength(1)

    act(() => {
      result.current.deleteCollection(collectionId)
    })

    expect(result.current.collections).toHaveLength(0)
  })

  it('should add artwork to collection', () => {
    const { result } = renderHook(() => useCollectionsStore())

    let collectionId: string

    act(() => {
      collectionId = result.current.addCollection({
        name: 'Test Collection',
        description: 'Test',
        artworkIds: [],
      })
    })

    act(() => {
      result.current.addArtworkToCollection(collectionId, 12345)
    })

    expect(result.current.collections[0].artworkIds).toContain(12345)
  })

  it('should remove artwork from collection', () => {
    const { result } = renderHook(() => useCollectionsStore())

    let collectionId: string

    act(() => {
      collectionId = result.current.addCollection({
        name: 'Test Collection',
        description: 'Test',
        artworkIds: [12345, 67890],
      })
    })

    act(() => {
      result.current.removeArtworkFromCollection(collectionId, 12345)
    })

    expect(result.current.collections[0].artworkIds).not.toContain(12345)
    expect(result.current.collections[0].artworkIds).toContain(67890)
  })
})
