import type { Buffet } from '../../types/Buffet'
import { groupBuffetsByState } from '../../utilities/groupBuffets'

interface BuffetListProps {
  buffets: Buffet[]
  selected: Buffet | null
  onSelect: (buffet: Buffet) => void
}

export function BuffetList({ buffets, selected, onSelect }: BuffetListProps) {
  const groups = groupBuffetsByState(buffets)

  return (
    <div className="list-stage">
      <div className="buffet-list" aria-label="Buffet locations by state">
        {groups.map((group) => (
          <section className="state-group" key={group.state} aria-labelledby={`state-${group.state}`}>
            <header className="state-heading">
              <h2 id={`state-${group.state}`}>{group.stateName}</h2>
              <span>{group.buffets.length} {group.buffets.length === 1 ? 'location' : 'locations'}</span>
            </header>
            <div className="state-locations">
              {group.buffets.map((buffet) => (
                <button
                  className={`buffet-list-item${selected?.id === buffet.id ? ' selected' : ''}`}
                  type="button"
                  key={buffet.id}
                  onClick={() => onSelect(buffet)}
                  aria-pressed={selected?.id === buffet.id}
                  aria-label={`${buffet.name}, ${buffet.city}, ${buffet.address}`}
                >
                  <span className="buffet-list-copy">
                    <strong>{buffet.name}</strong>
                    <span>{buffet.city}</span>
                    <small>{buffet.address}</small>
                  </span>
                  {buffet.isOpen === false && <span className="closed-label">Closed</span>}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
