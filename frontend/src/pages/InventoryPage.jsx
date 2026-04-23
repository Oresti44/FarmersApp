import { useMemo, useRef, useState } from 'react'

import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import DrawerShell from '../components/common/DrawerShell.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SectionSidebar from '../components/common/SectionSidebar.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import ToastViewport from '../components/common/ToastViewport.jsx'
import inventoryApi from '../features/inventory/api/inventoryApi.js'
import useInventory from '../features/inventory/hooks/useInventory.js'
import { INVENTORY_TABS } from '../features/inventory/types/inventory.js'

function blankItemFilters(farmId = '') {
  return {
    farm: farmId,
    category: '',
    status: '',
    search: '',
    low_stock: false,
    show_archived: false,
  }
}

function blankMovementFilters(farmId = '') {
  return {
    farm: farmId,
    movement_type: '',
    search: '',
    date_from: '',
    date_to: '',
  }
}

function ActionButton({ children, onClick, tone = 'dark' }) {
  const className =
    tone === 'soft'
      ? 'rounded-md border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50'
      : 'rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:bg-stone-900 hover:text-stone-200'

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  )
}

function SectionHeading({ action, title }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#8ACBD0]/45 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#170C79]">{title}</h2>
      </div>
      {action}
    </div>
  )
}

function Field({ children, label }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</span>
      {children}
    </label>
  )
}

function inputClassName() {
  return 'w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-400'
}

function QuantityPill({ item }) {
  const tone =
    item.quantity_state?.tone === 'empty'
      ? 'bg-rose-100 text-rose-700'
      : item.quantity_state?.tone === 'low'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-emerald-100 text-emerald-700'

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${tone}`}>
      {Number(item.current_quantity)} {item.unit}
    </span>
  )
}

function toneLabel(value) {
  return String(value || '').replaceAll('_', ' ')
}

function OverviewCard({ label, value }) {
  return (
    <div className="border-b border-[#8ACBD0]/45 pb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#170C79]/55">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#170C79]">{value}</p>
    </div>
  )
}

function FiltersCard({ action, children, title }) {
  return (
    <section className="rounded-lg border border-stone-200/80 bg-white/82 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Filters</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">{title}</h2>
        </div>
        {action}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  )
}

function ItemFormDrawer({ categories, farmId, item, onClose, onSubmit, open }) {
  const [draft, setDraft] = useState(() => ({
    farm_id: item?.farm?.id || farmId || '',
    category_id: item?.category?.id || '',
    name: item?.name || '',
    unit: item?.unit || '',
    current_quantity: item?.current_quantity ?? 0,
    low_stock_threshold: item?.low_stock_threshold ?? 0,
    storage_location: item?.storage_location || '',
    status: item?.status || 'active',
    notes: item?.notes || '',
  }))

  if (!open) {
    return null
  }

  return (
    <DrawerShell
      description="Capture the stock item, category, units, and threshold."
      onClose={onClose}
      open={open}
      title={item?.id ? 'Edit Inventory Item' : 'Add Inventory Item'}
      footer={
        <div className="flex justify-end gap-3">
          <ActionButton onClick={onClose} tone="soft">
            Cancel
          </ActionButton>
          <ActionButton onClick={() => onSubmit(draft)}>{item?.id ? 'Save changes' : 'Create item'}</ActionButton>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Category">
          <select className={inputClassName()} value={draft.category_id} onChange={(event) => setDraft((current) => ({ ...current, category_id: event.target.value }))}>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Item name">
          <input className={inputClassName()} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
        </Field>
        <Field label="Unit">
          <input className={inputClassName()} placeholder="kg, bags, bottles" value={draft.unit} onChange={(event) => setDraft((current) => ({ ...current, unit: event.target.value }))} />
        </Field>
        <Field label="Current quantity">
          <input className={inputClassName()} min="0" step="0.01" type="number" value={draft.current_quantity} onChange={(event) => setDraft((current) => ({ ...current, current_quantity: event.target.value }))} />
        </Field>
        <Field label="Low stock threshold">
          <input className={inputClassName()} min="0" step="0.01" type="number" value={draft.low_stock_threshold} onChange={(event) => setDraft((current) => ({ ...current, low_stock_threshold: event.target.value }))} />
        </Field>
        <Field label="Storage location">
          <input className={inputClassName()} value={draft.storage_location} onChange={(event) => setDraft((current) => ({ ...current, storage_location: event.target.value }))} />
        </Field>
        <Field label="Status">
          <select className={inputClassName()} value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Notes">
          <textarea className={inputClassName()} rows="5" value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} />
        </Field>
      </div>
    </DrawerShell>
  )
}

function MovementFormDrawer({ defaultItemId, itemOptions, movement, onClose, onSubmit, open, plants, tasks, users }) {
  const [draft, setDraft] = useState(() => ({
    inventory_item_id: movement?.inventory_item || movement?.inventory_item_summary?.id || defaultItemId || '',
    movement_type: movement?.movement_type || 'stock_in',
    quantity: movement?.quantity ?? '',
    movement_date: movement?.movement_date ? String(movement.movement_date).slice(0, 16) : '',
    task: movement?.task || '',
    plant: movement?.plant || '',
    created_by_id: movement?.created_by?.id || users[0]?.id || '',
    note: movement?.note || '',
  }))

  if (!open) {
    return null
  }

  return (
    <DrawerShell
      description="Record stock in, stock out, waste, or a quantity reset adjustment."
      onClose={onClose}
      open={open}
      title={movement?.id ? 'Edit Movement' : 'Record Movement'}
      footer={
        <div className="flex justify-end gap-3">
          <ActionButton onClick={onClose} tone="soft">
            Cancel
          </ActionButton>
          <ActionButton onClick={() => onSubmit(draft)}>{movement?.id ? 'Save movement' : 'Create movement'}</ActionButton>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Inventory item">
          <select className={inputClassName()} value={draft.inventory_item_id} onChange={(event) => setDraft((current) => ({ ...current, inventory_item_id: event.target.value }))}>
            <option value="">Select item</option>
            {itemOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Movement type">
          <select className={inputClassName()} value={draft.movement_type} onChange={(event) => setDraft((current) => ({ ...current, movement_type: event.target.value }))}>
            <option value="stock_in">Stock in</option>
            <option value="stock_out">Stock out</option>
            <option value="waste">Waste</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </Field>
        <Field label="Quantity">
          <input className={inputClassName()} min="0.01" step="0.01" type="number" value={draft.quantity} onChange={(event) => setDraft((current) => ({ ...current, quantity: event.target.value }))} />
        </Field>
        <Field label="Movement date">
          <input className={inputClassName()} type="datetime-local" value={draft.movement_date} onChange={(event) => setDraft((current) => ({ ...current, movement_date: event.target.value }))} />
        </Field>
        <Field label="Linked plant">
          <select className={inputClassName()} value={draft.plant} onChange={(event) => setDraft((current) => ({ ...current, plant: event.target.value }))}>
            <option value="">Optional plant</option>
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Linked task">
          <select className={inputClassName()} value={draft.task} onChange={(event) => setDraft((current) => ({ ...current, task: event.target.value }))}>
            <option value="">Optional task</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Recorded by">
          <select className={inputClassName()} value={draft.created_by_id} onChange={(event) => setDraft((current) => ({ ...current, created_by_id: event.target.value }))}>
            <option value="">Optional user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Note">
          <textarea className={inputClassName()} rows="5" value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} />
        </Field>
      </div>
    </DrawerShell>
  )
}

function InventoryItemDrawer({ item, onClose, onEdit, onNewMovement, open }) {
  return (
    <DrawerShell
      description={item ? `${item.category?.name || 'Inventory'} item at ${item.farm?.name || 'farm inventory'}.` : ''}
      onClose={onClose}
      open={open}
      title={item?.name || 'Inventory item'}
      footer={
        item ? (
          <div className="flex justify-end gap-3">
            <ActionButton onClick={() => onNewMovement(item)} tone="soft">
              Record movement
            </ActionButton>
            <ActionButton onClick={() => onEdit(item)}>Edit item</ActionButton>
          </div>
        ) : null
      }
    >
      {item ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Current stock</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                {Number(item.current_quantity)} {item.unit}
              </p>
              <p className="mt-2 text-sm text-stone-600">Threshold: {Number(item.low_stock_threshold)} {item.unit}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Status</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <StatusBadge value={item.status} />
                <QuantityPill item={item} />
              </div>
              <p className="mt-3 text-sm text-stone-600">Stored at {item.storage_location || 'no location set'}.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Farm</p>
              <p className="mt-2 text-lg font-semibold text-stone-950">{item.farm?.name}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Category</p>
              <p className="mt-2 text-lg font-semibold text-stone-950">{item.category?.name}</p>
            </div>
          </div>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Recent movements</p>
            <div className="mt-3 space-y-3">
              {(item.recent_movements || []).length ? (
                item.recent_movements.map((movement) => (
                  <article key={movement.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-stone-950">{toneLabel(movement.movement_type)}</p>
                        <p className="mt-1 text-sm text-stone-600">
                          {Number(movement.quantity)} {item.unit} on {new Date(movement.movement_date).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-stone-500">{movement.created_by?.full_name || 'No recorder'}</p>
                    </div>
                    {movement.note ? <p className="mt-3 text-sm leading-6 text-stone-600">{movement.note}</p> : null}
                  </article>
                ))
              ) : (
                <EmptyState title="No movement history yet" description="This item has not recorded any stock movement yet." />
              )}
            </div>
          </section>
        </div>
      ) : null}
    </DrawerShell>
  )
}

function InventoryPage({ session }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [sectionNavCollapsed, setSectionNavCollapsed] = useState(false)
  const [itemFilters, setItemFilters] = useState(() => blankItemFilters(session?.farm?.id || ''))
  const [movementFilters, setMovementFilters] = useState(() => blankMovementFilters(session?.farm?.id || ''))
  const [itemFormState, setItemFormState] = useState({ open: false, item: null })
  const [movementFormState, setMovementFormState] = useState({ open: false, movement: null, itemId: null })
  const [categoryDraft, setCategoryDraft] = useState({ id: null, name: '', description: '' })
  const [selectedItem, setSelectedItem] = useState(null)
  const [deleteState, setDeleteState] = useState({ open: false, item: null, impact: null })
  const [movementDeleteState, setMovementDeleteState] = useState({ open: false, movement: null })
  const [toasts, setToasts] = useState([])
  const toastIdRef = useRef(0)

  const { dashboard, error, items, loading, meta, movements, refresh } = useInventory(itemFilters, movementFilters)

  const categoryOptions = meta.inventory_categories || []
  const itemOptions = items

  const selectedItemOption = useMemo(
    () => itemOptions.find((item) => String(item.id) === String(movementFormState.itemId || '')),
    [itemOptions, movementFormState.itemId],
  )

  function patchItemFilters(next) {
    setItemFilters((current) => ({ ...current, ...next }))
  }

  function patchMovementFilters(next) {
    setMovementFilters((current) => ({ ...current, ...next }))
  }

  function pushToast(title, message, tone = 'success') {
    toastIdRef.current += 1
    const id = `inventory-toast-${toastIdRef.current}`
    setToasts((current) => [...current, { id, title, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4000)
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  async function openItem(itemId) {
    const detail = await inventoryApi.getItem(itemId)
    setSelectedItem(detail)
  }

  async function saveItem(payload) {
    try {
      if (itemFormState.item?.id) {
        await inventoryApi.updateItem(itemFormState.item.id, payload)
        pushToast('Inventory item updated')
      } else {
        await inventoryApi.createItem(payload)
        pushToast('Inventory item created')
      }
      setItemFormState({ open: false, item: null })
      await refresh()
    } catch (caughtError) {
      pushToast('Inventory request failed', caughtError.message, 'error')
    }
  }

  async function saveMovement(payload) {
    try {
      const normalized = {
        ...payload,
        created_by_id: payload.created_by_id || null,
        movement_date: payload.movement_date ? new Date(payload.movement_date).toISOString() : undefined,
        plant: payload.plant || null,
        task: payload.task || null,
      }

      if (movementFormState.movement?.id) {
        await inventoryApi.updateMovement(movementFormState.movement.id, normalized)
        pushToast('Movement updated')
      } else {
        await inventoryApi.createMovement(normalized)
        pushToast('Movement recorded')
      }

      setMovementFormState({ open: false, movement: null, itemId: null })
      await refresh()

      if (selectedItem?.id) {
        await openItem(selectedItem.id)
      }
    } catch (caughtError) {
      pushToast('Movement request failed', caughtError.message, 'error')
    }
  }

  async function saveCategory() {
    try {
      if (categoryDraft.id) {
        await inventoryApi.updateCategory(categoryDraft.id, {
          name: categoryDraft.name,
          description: categoryDraft.description,
        })
        pushToast('Category updated')
      } else {
        await inventoryApi.createCategory({
          name: categoryDraft.name,
          description: categoryDraft.description,
        })
        pushToast('Category created')
      }
      setCategoryDraft({ id: null, name: '', description: '' })
      await refresh()
    } catch (caughtError) {
      pushToast('Category request failed', caughtError.message, 'error')
    }
  }

  async function openDelete(item) {
    try {
      const impact = await inventoryApi.deleteImpact(item.id)
      setDeleteState({ open: true, item, impact })
    } catch (caughtError) {
      pushToast('Delete preview failed', caughtError.message, 'error')
    }
  }

  async function confirmDeleteItem() {
    try {
      await inventoryApi.deleteItem(deleteState.item.id)
      setDeleteState({ open: false, item: null, impact: null })
      setSelectedItem(null)
      pushToast('Inventory item deleted')
      await refresh()
    } catch (caughtError) {
      pushToast('Delete failed', caughtError.message, 'error')
    }
  }

  async function confirmDeleteMovement() {
    try {
      await inventoryApi.deleteMovement(movementDeleteState.movement.id)
      setMovementDeleteState({ open: false, movement: null })
      pushToast('Movement deleted')
      await refresh()
      if (selectedItem?.id) {
        await openItem(selectedItem.id)
      }
    } catch (caughtError) {
      pushToast('Delete failed', caughtError.message, 'error')
    }
  }

  async function deleteCategory(category) {
    try {
      await inventoryApi.deleteCategory(category.id)
      pushToast('Category deleted')
      if (categoryDraft.id === category.id) {
        setCategoryDraft({ id: null, name: '', description: '' })
      }
      await refresh()
    } catch (caughtError) {
      pushToast('Delete failed', caughtError.message, 'error')
    }
  }

  return (
    <div
      className={`grid min-h-[calc(100vh-4.75rem)] ${
        sectionNavCollapsed ? 'lg:grid-cols-[4.5rem_minmax(0,1fr)]' : 'lg:grid-cols-[16rem_minmax(0,1fr)]'
      }`}
    >
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      <SectionSidebar
        activeTab={activeTab}
        collapsed={sectionNavCollapsed}
        onChange={setActiveTab}
        onToggle={() => setSectionNavCollapsed((current) => !current)}
        tabs={INVENTORY_TABS}
        title="Inventory"
      />

      <div className="min-w-0 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {error ? <EmptyState title="Inventory API unavailable" description={error} /> : null}
        {loading ? <EmptyState title="Loading inventory" description="Pulling items, movements, and reference data from the API." /> : null}

        {!loading && !error ? (
          <>
            {activeTab === 'overview' ? (
              <>
                <SectionHeading
                  title="Overview"
                />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <OverviewCard label="Active items" value={dashboard?.summary?.active_items || 0} />
                  <OverviewCard label="Low stock" value={dashboard?.summary?.low_stock_items || 0} />
                  <OverviewCard label="Archived items" value={dashboard?.summary?.archived_items || 0} />
                  <OverviewCard label="Total movements" value={dashboard?.summary?.total_movements || 0} />
                </div>
                <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
                  <section className="rounded-[28px] border border-stone-200/80 bg-white/88 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Low stock watchlist</p>
                    <div className="mt-4 space-y-3">
                      {dashboard?.low_stock_items?.length ? (
                        dashboard.low_stock_items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => openItem(item.id)}
                            className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-left transition hover:border-stone-300 hover:bg-white"
                          >
                            <div>
                              <p className="font-semibold text-stone-950">{item.name}</p>
                              <p className="mt-1 text-sm text-stone-600">
                                {item.category_name} at {item.farm_name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-amber-700">
                                {Number(item.current_quantity)} / {Number(item.low_stock_threshold)} {item.unit}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">Current / threshold</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <EmptyState title="Low stock looks calm" description="No active items are currently at or below their threshold." />
                      )}
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-stone-200/80 bg-white/88 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Recent movements</p>
                    <div className="mt-4 space-y-3">
                      {dashboard?.recent_movements?.length ? (
                        dashboard.recent_movements.map((movement) => (
                          <article key={movement.id} className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-stone-950">{movement.item_name}</p>
                                <p className="mt-1 text-sm text-stone-600">{toneLabel(movement.movement_type)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-stone-950">
                                  {Number(movement.quantity)} {movement.unit}
                                </p>
                                <p className="mt-1 text-sm text-stone-500">{new Date(movement.movement_date).toLocaleString()}</p>
                              </div>
                            </div>
                          </article>
                        ))
                      ) : (
                        <EmptyState title="No movement history yet" description="Record the first inventory movement to start a stock timeline." />
                      )}
                    </div>
                  </section>
                </div>
              </>
            ) : null}

            {activeTab === 'items' ? (
              <>
                <FiltersCard
                  action={<ActionButton onClick={() => setItemFormState({ open: true, item: null })}>Add item</ActionButton>}
                  title="Inventory filters"
                >
                  <Field label="Search">
                    <input className={inputClassName()} type="search" placeholder="Search item, category, location, or note" value={itemFilters.search} onChange={(event) => patchItemFilters({ search: event.target.value })} />
                  </Field>
                  <Field label="Category">
                    <select className={inputClassName()} value={itemFilters.category} onChange={(event) => patchItemFilters({ category: event.target.value })}>
                      <option value="">All categories</option>
                      {categoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select className={inputClassName()} value={itemFilters.status} onChange={(event) => patchItemFilters({ status: event.target.value })}>
                      <option value="">All statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </Field>
                  <label className="flex items-center gap-3 rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-700">
                    <input checked={itemFilters.low_stock} type="checkbox" onChange={(event) => patchItemFilters({ low_stock: event.target.checked })} />
                    Show only low stock
                  </label>
                  <label className="flex items-center gap-3 rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-700">
                    <input checked={itemFilters.show_archived} type="checkbox" onChange={(event) => patchItemFilters({ show_archived: event.target.checked })} />
                    Include archived
                  </label>
                </FiltersCard>

                <section className="overflow-hidden rounded-[28px] border border-stone-200/80 bg-white/90 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                      <thead className="bg-stone-50/90">
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3">Farm</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Stock</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Last movement</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {items.map((item) => (
                          <tr key={item.id} className="align-top">
                            <td className="px-4 py-4">
                              <button type="button" onClick={() => openItem(item.id)} className="text-left">
                                <p className="font-semibold text-stone-950">{item.name}</p>
                                <p className="mt-1 text-sm text-stone-600">{item.storage_location || 'No storage location'}</p>
                              </button>
                            </td>
                            <td className="px-4 py-4 text-sm text-stone-700">{item.farm?.name}</td>
                            <td className="px-4 py-4 text-sm text-stone-700">{item.category?.name}</td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                <QuantityPill item={item} />
                                {item.quantity_state?.is_low_stock ? (
                                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                                    Refill
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge value={item.status} />
                            </td>
                            <td className="px-4 py-4 text-sm text-stone-600">
                              {item.latest_movement ? `${toneLabel(item.latest_movement.movement_type)} on ${new Date(item.latest_movement.movement_date).toLocaleDateString()}` : 'No movement yet'}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                <ActionButton onClick={() => openItem(item.id)} tone="soft">
                                  View
                                </ActionButton>
                                <ActionButton onClick={() => setItemFormState({ open: true, item })} tone="soft">
                                  Edit
                                </ActionButton>
                                <ActionButton
                                  onClick={() => setMovementFormState({ open: true, movement: null, itemId: item.id })}
                                  tone="soft"
                                >
                                  Move
                                </ActionButton>
                                <ActionButton onClick={() => openDelete(item)} tone="soft">
                                  Delete
                                </ActionButton>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!items.length ? <div className="p-5"><EmptyState title="No inventory items found" description="Adjust your filters or add the first inventory item for this workspace." /></div> : null}
                </section>
              </>
            ) : null}

            {activeTab === 'movements' ? (
              <>
                <FiltersCard
                  action={<ActionButton onClick={() => setMovementFormState({ open: true, movement: null, itemId: '' })}>Record movement</ActionButton>}
                  title="Movement filters"
                >
                  <Field label="Search">
                    <input className={inputClassName()} type="search" placeholder="Search item, category, plant, task, or note" value={movementFilters.search} onChange={(event) => patchMovementFilters({ search: event.target.value })} />
                  </Field>
                  <Field label="Type">
                    <select className={inputClassName()} value={movementFilters.movement_type} onChange={(event) => patchMovementFilters({ movement_type: event.target.value })}>
                      <option value="">All movement types</option>
                      <option value="stock_in">Stock in</option>
                      <option value="stock_out">Stock out</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="waste">Waste</option>
                    </select>
                  </Field>
                  <Field label="Date from">
                    <input className={inputClassName()} type="date" value={movementFilters.date_from} onChange={(event) => patchMovementFilters({ date_from: event.target.value })} />
                  </Field>
                  <Field label="Date to">
                    <input className={inputClassName()} type="date" value={movementFilters.date_to} onChange={(event) => patchMovementFilters({ date_to: event.target.value })} />
                  </Field>
                </FiltersCard>

                <div className="space-y-3">
                  {movements.length ? (
                    movements.map((movement) => (
                      <article key={movement.id} className="rounded-[24px] border border-stone-200/80 bg-white/88 p-5 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <button type="button" onClick={() => openItem(movement.inventory_item_summary.id)} className="text-left">
                              <p className="text-lg font-semibold text-stone-950">{movement.inventory_item_summary.name}</p>
                            </button>
                            <p className="mt-1 text-sm text-stone-600">
                              {movement.inventory_item_summary.category_name} at {movement.inventory_item_summary.farm_name}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                                {toneLabel(movement.movement_type)}
                              </span>
                              <span className="text-sm font-semibold text-stone-900">
                                {Number(movement.quantity)} {movement.inventory_item_summary.unit}
                              </span>
                              <span className="text-sm text-stone-500">{new Date(movement.movement_date).toLocaleString()}</span>
                            </div>
                            {movement.note ? <p className="mt-3 text-sm leading-6 text-stone-600">{movement.note}</p> : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <ActionButton onClick={() => setMovementFormState({ open: true, movement, itemId: movement.inventory_item_summary.id })} tone="soft">
                              Edit
                            </ActionButton>
                            <ActionButton onClick={() => setMovementDeleteState({ open: true, movement })} tone="soft">
                              Delete
                            </ActionButton>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-600">
                            Plant: {movement.plant_summary?.name || 'Not linked'}
                          </div>
                          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-600">
                            Task: {movement.task_summary?.title || 'Not linked'}
                          </div>
                          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-600">
                            Recorded by: {movement.created_by?.full_name || 'No recorder'}
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <EmptyState title="No movements found" description="Try broader filters or record the first stock movement." />
                  )}
                </div>
              </>
            ) : null}

            {activeTab === 'categories' ? (
              <>
                <SectionHeading
                  action={<ActionButton onClick={() => setCategoryDraft({ id: null, name: '', description: '' })} tone="soft">New category</ActionButton>}
                  title="Categories"
                />
                <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
                  <section className="rounded-[28px] border border-stone-200/80 bg-white/88 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Category editor</p>
                    <div className="mt-4 space-y-4">
                      <Field label="Name">
                        <input className={inputClassName()} value={categoryDraft.name} onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value }))} />
                      </Field>
                      <Field label="Description">
                        <textarea className={inputClassName()} rows="5" value={categoryDraft.description} onChange={(event) => setCategoryDraft((current) => ({ ...current, description: event.target.value }))} />
                      </Field>
                      <div className="flex flex-wrap justify-end gap-3">
                        <ActionButton onClick={() => setCategoryDraft({ id: null, name: '', description: '' })} tone="soft">
                          Clear
                        </ActionButton>
                        <ActionButton onClick={saveCategory}>{categoryDraft.id ? 'Save changes' : 'Create category'}</ActionButton>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    {categoryOptions.length ? (
                      categoryOptions.map((category) => (
                        <article key={category.id} className="rounded-[24px] border border-stone-200/80 bg-white/88 p-5 shadow-sm">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-lg font-semibold text-stone-950">{category.name}</p>
                              <p className="mt-2 text-sm leading-6 text-stone-600">{category.description || 'No description yet.'}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <ActionButton onClick={() => setCategoryDraft(category)} tone="soft">
                                Edit
                              </ActionButton>
                              <ActionButton onClick={() => deleteCategory(category)} tone="soft">
                                Delete
                              </ActionButton>
                            </div>
                          </div>
                        </article>
                      ))
                    ) : (
                      <EmptyState title="No categories yet" description="Create a first category like seeds, fertilizer, tools, or packaging." />
                    )}
                  </section>
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </div>

      <InventoryItemDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={(item) => setItemFormState({ open: true, item })}
        onNewMovement={(item) => setMovementFormState({ open: true, movement: null, itemId: item.id })}
        open={Boolean(selectedItem)}
      />
      <ItemFormDrawer
        categories={categoryOptions}
        farmId={session?.farm?.id || ''}
        item={itemFormState.item}
        key={itemFormState.item?.id || 'new-item'}
        onClose={() => setItemFormState({ open: false, item: null })}
        onSubmit={saveItem}
        open={itemFormState.open}
      />
      <MovementFormDrawer
        defaultItemId={movementFormState.itemId}
        itemOptions={selectedItemOption ? [selectedItemOption, ...itemOptions.filter((item) => item.id !== selectedItemOption.id)] : itemOptions}
        key={movementFormState.movement?.id || movementFormState.itemId || 'new-movement'}
        movement={movementFormState.movement}
        onClose={() => setMovementFormState({ open: false, movement: null, itemId: null })}
        onSubmit={saveMovement}
        open={movementFormState.open}
        plants={meta.plants}
        tasks={meta.tasks}
        users={meta.users}
      />
      <ConfirmDialog
        description="This will remove the item and its related movement history."
        open={deleteState.open}
        onCancel={() => setDeleteState({ open: false, item: null, impact: null })}
        onConfirm={confirmDeleteItem}
        title={deleteState.item ? `Delete ${deleteState.item.name}?` : 'Delete item?'}
      >
        {deleteState.impact ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(deleteState.impact).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                <span className="font-semibold text-stone-950">{value}</span> {toneLabel(key)}
              </div>
            ))}
          </div>
        ) : null}
      </ConfirmDialog>
      <ConfirmDialog
        description="This will reverse the movement effect on current stock unless the backend blocks it."
        open={movementDeleteState.open}
        onCancel={() => setMovementDeleteState({ open: false, movement: null })}
        onConfirm={confirmDeleteMovement}
        title="Delete this movement?"
      />
    </div>
  )
}

export default InventoryPage
