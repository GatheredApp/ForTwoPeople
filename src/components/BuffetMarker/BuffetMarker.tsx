import L from 'leaflet'
import { Marker, Tooltip } from 'react-leaflet'
import goonImage from '../../assets/goon.png'
import type { MapLocation } from '../../types/MapLocation'

const icon = (kind:MapLocation['kind'], selected:boolean) => L.divIcon({ className:`buffet-pin-wrap ${kind}${selected?' selected':''}`, html:`<span class="buffet-pin"><img src="${goonImage}" alt="" aria-hidden="true" /></span>`, iconSize:selected?[50,56]:[42,48], iconAnchor:selected?[25,52]:[21,44] })
export function BuffetMarker({ location, selected, onSelect }:{location:MapLocation;selected:boolean;onSelect:(location:MapLocation)=>void}) {
 return <Marker position={[location.latitude,location.longitude]} icon={icon(location.kind,selected)} eventHandlers={{click:()=>onSelect(location)}} keyboard title={`View ${location.name}`} zIndexOffset={selected?1000:0}><Tooltip direction="top" offset={[0,-38]}>{location.name} · {location.kind==='mullet'?'Mullet Review':location.kind==='community'?'Community Reviewed':'Facebook Group Review'}</Tooltip></Marker>
}
