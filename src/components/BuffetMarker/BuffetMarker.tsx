import L from 'leaflet'
import { Marker, Tooltip } from 'react-leaflet'
import goonImage from '../../assets/goon.png'
import type { Buffet } from '../../types/Buffet'

interface BuffetMarkerProps {
  buffet: Buffet
  selected: boolean
  onSelect: (buffet: Buffet) => void
}

const icons = {
  normal: L.divIcon({ className: 'buffet-pin-wrap', html: `<span class="buffet-pin"><img src="${goonImage}" alt="" aria-hidden="true" /></span>`, iconSize: [42, 48], iconAnchor: [21, 44] }),
  selected: L.divIcon({ className: 'buffet-pin-wrap selected', html: `<span class="buffet-pin"><img src="${goonImage}" alt="" aria-hidden="true" /></span>`, iconSize: [50, 56], iconAnchor: [25, 52] }),
}

export function BuffetMarker({ buffet, selected, onSelect }: BuffetMarkerProps) {
  return (
    <Marker
      position={[buffet.latitude, buffet.longitude]}
      icon={selected ? icons.selected : icons.normal}
      eventHandlers={{ click: () => onSelect(buffet) }}
      keyboard
      title={`View ${buffet.name}`}
      zIndexOffset={selected ? 1000 : 0}
    >
      <Tooltip direction="top" offset={[0, -38]}>{buffet.name}</Tooltip>
    </Marker>
  )
}
