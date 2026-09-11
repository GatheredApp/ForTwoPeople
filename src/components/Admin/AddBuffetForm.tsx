import { useEffect, useMemo, useRef, useState } from 'react'
import { buffets } from '../../data/buffets'
import { createIssueUrl, createPublicIssueUrl, emptyDraft, extractYouTubeId, findDuplicates, generateBuffetId, normalizeDraft, US_STATES, validateDraft, type BuffetDraft } from '../../utilities/admin'
import { GitHubAccountNotice } from '../Contributions/GitHubAccountNotice'

function loadDraft(key: string): BuffetDraft {
  try { return { ...emptyDraft, ...JSON.parse(localStorage.getItem(key) ?? '{}') } }
  catch { return emptyDraft }
}

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  validationMessage?: string
  showValidation: boolean
  required?: boolean
  type?: string
  placeholder?: string
  help?: string
}

function Field({ label, value, onChange, validationMessage, showValidation, required, type = 'text', placeholder, help }: FieldProps) {
  return <label className="admin-field"><span>{label}{required && <b aria-hidden="true"> *</b>}</span>
    <input type={type} value={value} placeholder={placeholder} required={required} onChange={(event) => onChange(event.target.value)} aria-invalid={showValidation && Boolean(validationMessage)} />
    {help && <small>{help}</small>}{showValidation && validationMessage && <em role="alert">{validationMessage}</em>}
  </label>
}

export function AddBuffetForm({ mode = 'admin' }: { mode?: 'admin' | 'public' }) {
  const isPublic = mode === 'public'
  const draftKey = isPublic ? 'fortwopeople-public-buffet-draft-v1' : 'fortwopeople-buffet-draft-v1'
  const [draft, setDraft] = useState(() => loadDraft(draftKey))
  const [idOverridden, setIdOverridden] = useState(() => Boolean(loadDraft(draftKey).id))
  const [showErrors, setShowErrors] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)
  const errors = useMemo(() => validateDraft(draft), [draft])
  const record = useMemo(() => normalizeDraft(draft, !isPublic), [draft, isPublic])
  const duplicates = useMemo(() => record ? findDuplicates(record, buffets) : [], [record])
  const dirty = Object.values(draft).some((value) => value.trim())

  useEffect(() => { localStorage.setItem(draftKey, JSON.stringify(draft)) }, [draft, draftKey])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const update = (field: keyof BuffetDraft, value: string) => {
    setDraft((current) => {
      const next = { ...current, [field]: value }
      if (!idOverridden && ['name', 'city', 'state'].includes(field)) next.id = generateBuffetId(next.name, next.city, next.state)
      return next
    })
  }
  const fieldProps = (field: keyof BuffetDraft) => ({
    value: draft[field],
    onChange: (value: string) => update(field, value),
    validationMessage: errors[field],
    showValidation: showErrors,
  })
  const clear = () => {
    if (dirty && !window.confirm('Clear this buffet draft?')) return
    setDraft(emptyDraft); setIdOverridden(false); setShowErrors(false); localStorage.removeItem(draftKey)
  }
  const submit = () => {
    setShowErrors(true)
    if (!record || duplicates.length) return
    window.open(isPublic ? createPublicIssueUrl(record) : createIssueUrl(record), '_blank', 'noopener,noreferrer')
  }
  const copy = async () => {
    if (!record) { setShowErrors(true); return }
    await navigator.clipboard.writeText(JSON.stringify(record, null, 2))
    setCopied(true); window.clearTimeout(copyTimer.current); copyTimer.current = window.setTimeout(() => setCopied(false), 1800)
  }

  return <main className="admin-page">
    <header className="admin-header"><div><p>{isPublic ? 'For Two People Presents' : 'Buffet dataset administration'}</p><h1>{isPublic ? 'Suggest a Buffet' : 'Add Buffet'}</h1></div><a href={`${window.location.pathname}${window.location.hash}`}>← Back to Map</a></header>
    <div className="admin-layout"><form className="admin-form" onSubmit={(event) => { event.preventDefault(); submit() }} noValidate>
      {isPublic && <p className="form-intro">Know a Mullet Review buffet we're missing? Send it to us for review.<br />Submissions are reviewed before they are added to the map.</p>}
      {isPublic && <GitHubAccountNotice />}
      <p className="required-note"><b>*</b> Required field. Your draft is saved in this browser.</p>
      <fieldset><legend>Restaurant</legend>
        <Field {...fieldProps('name')} label="Buffet name" required placeholder="Great Wall Buffet" />
        <label className="admin-field admin-wide"><span>Generated ID <b aria-hidden="true">*</b></span><input value={draft.id} required onChange={(event) => { setIdOverridden(true); update('id', event.target.value) }} aria-invalid={showErrors && Boolean(errors.id)} /><small>You may edit this lowercase URL-safe identifier; automatic updates will then stop.</small>{showErrors && errors.id && <em role="alert">{errors.id}</em>}</label>
        <Field {...fieldProps('buffetType')} label="Buffet type" placeholder="Chinese" /><Field {...fieldProps('price')} label="Price" placeholder="$$ or $14.99" />
      </fieldset>
      <fieldset><legend>Location</legend>
        <Field {...fieldProps('address')} label="Street address" required placeholder="123 Main St" /><Field {...fieldProps('city')} label="City" required />
        <label className="admin-field"><span>State <b aria-hidden="true">*</b></span><select value={draft.state} required onChange={(event) => update('state', event.target.value)} aria-invalid={showErrors && Boolean(errors.state)}><option value="">Select state</option>{US_STATES.map((state) => <option key={state}>{state}</option>)}</select>{showErrors && errors.state && <em role="alert">{errors.state}</em>}</label>
        <Field {...fieldProps('postalCode')} label="Postal code" />
        <Field {...fieldProps('latitude')} label="Latitude" required type="number" placeholder="39.005" help="Decimal coordinate from -90 to 90." />
        <Field {...fieldProps('longitude')} label="Longitude" required type="number" placeholder="-85.62" help="Decimal coordinate from -180 to 180." />
      </fieldset>
      <fieldset><legend>Review</legend>
        <Field {...fieldProps('youtubeUrl')} label="YouTube URL" required type="url" placeholder="https://youtu.be/…" />
        <div className="detected-id"><span>Detected video ID</span><code>{extractYouTubeId(draft.youtubeUrl) ?? 'Waiting for a valid URL'}</code></div>
        <Field {...fieldProps('yelpUrl')} label="Yelp URL" type="url" placeholder="https://www.yelp.com/biz/…" /><Field {...fieldProps('reviewDate')} label="Review date" type="date" />
      </fieldset>
      <fieldset><legend>Ratings</legend>
        {!isPublic && <label className="admin-field"><span>Rangoon Rating</span><select value={draft.rangoonRating} onChange={(event) => update('rangoonRating', event.target.value)}><option value="">None</option>{[1,2,3,4,5].map((rating) => <option key={rating}>{rating}</option>)}</select>{showErrors && errors.rangoonRating && <em>{errors.rangoonRating}</em>}</label>}
        <Field {...fieldProps('reviewerRating')} label="Reviewer rating" type="number" />
        <label className="admin-field"><span>Open status</span><select value={draft.isOpen} onChange={(event) => update('isOpen', event.target.value)}><option value="">Unknown</option><option value="open">Open</option><option value="closed">Closed</option></select></label>
      </fieldset>
      <fieldset><legend>Additional information</legend><label className="admin-field admin-wide"><span>Notes</span><textarea value={draft.notes} rows={4} onChange={(event) => update('notes', event.target.value)} placeholder="Optional editorial notes" /></label></fieldset>
      {showErrors && Object.keys(errors).length > 0 && <div className="form-alert" role="alert">Please correct the highlighted fields before submitting.</div>}
      {duplicates.length > 0 && <div className="form-alert" role="alert"><strong>Possible duplicate — submission is blocked.</strong><ul>{duplicates.map((problem) => <li key={problem}>{problem}</li>)}</ul></div>}
      {isPublic && <p className="moderation-note"><strong>Submitting opens GitHub.</strong> Sign in and click “Submit new issue” to finish your suggestion. Suggestions are reviewed before they appear on the map.</p>}
      <div className="form-actions"><button type="button" className="secondary" onClick={clear}>Clear Form</button><button type="submit" className="primary" disabled={!record || duplicates.length > 0}>{isPublic ? 'Submit Buffet' : 'Submit to GitHub'}</button></div>
      <small className="submission-help">Opens GitHub's pre-filled issue form in a new tab. This site never receives or stores GitHub credentials. Your draft remains saved until you clear it.</small>
    </form>
    <aside className="record-preview"><h2>Record Preview</h2>{record ? <><dl><dt>ID</dt><dd>{record.id}</dd><dt>Name</dt><dd>{record.name}</dd><dt>Full address</dt><dd>{[record.address, record.city, record.state, record.postalCode].filter(Boolean).join(', ')}</dd><dt>Coordinates</dt><dd>{record.latitude}, {record.longitude}</dd><dt>YouTube URL</dt><dd>{record.youtubeUrl}</dd><dt>YouTube video ID</dt><dd>{record.youtubeVideoId}</dd><dt>Yelp URL</dt><dd>{record.yelpUrl ?? 'Not provided'}</dd><dt>Review date</dt><dd>{record.reviewDate ?? 'Not provided'}</dd><dt>Buffet type</dt><dd>{record.buffetType ?? 'Not provided'}</dd><dt>Price</dt><dd>{record.price ?? 'Not provided'}</dd><dt>Status</dt><dd>{record.isOpen === undefined ? 'Unknown' : record.isOpen ? 'Open' : 'Closed'}</dd><dt>Reviewer rating</dt><dd>{record.reviewerRating ?? 'Not provided'}</dd>{!isPublic && <><dt>Rangoon rating</dt><dd>{record.rangoonRating ?? 'None'}</dd></>}<dt>Notes</dt><dd>{record.notes ?? 'None'}</dd></dl><div className="json-heading"><h3>Exact JSON</h3><button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy JSON'}</button></div><pre>{JSON.stringify(record, null, 2)}</pre></> : <p>Complete the required fields to see the normalized record and exact JSON payload.</p>}</aside>
    </div>
  </main>
}
