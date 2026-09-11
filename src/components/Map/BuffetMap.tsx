import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import type { Buffet } from '../../types/Buffet'
import { BuffetMarker } from '../BuffetMarker/BuffetMarker'

interface BuffetMapProps {
  buffets: Buffet[]
  selected: Buffet | null
  onSelect: (buffet: Buffet) => void
}

function MapViewport({ buffets, selected }: Pick<BuffetMapProps, 'buffets' | 'selected'>) {
  const map = useMap()
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 12), { duration: 0.7 })
      return
    }
    const points = buffets
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
      .map((item) => L.latLng(item.latitude, item.longitude))
    if (points.length === 1) map.flyTo(points[0], 13, { duration: 0.6 })
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [55, 55], maxZoom: 11 })
  }, [buffets, selected, map])
  return null
}

export function BuffetMap({ buffets, selected, onSelect }: BuffetMapProps) {
  const validBuffets = buffets.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
  return (
    <MapContainer center={[39.005, -85.62]} zoom={7} className="map" zoomControl={false} aria-label="Map of buffet locations">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewport buffets={validBuffets} selected={selected} />
      {validBuffets.map((buffet) => (
        <BuffetMarker key={buffet.id} buffet={buffet} selected={buffet.id === selected?.id} onSelect={onSelect} />
      ))}
    </MapContainer>
  )
}
