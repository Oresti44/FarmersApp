import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx'

function DeletePlantDialog({ entityLabel, impact, open, onCancel, onConfirm, title }) {
  return (
    <ConfirmDialog
      open={open}
      title={title}
      description={`Deleting this ${entityLabel} may cascade into plants, tasks, harvest history, and resource usage.`}
      confirmLabel={`Delete ${entityLabel}`}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(impact || {}).map(([key, value]) => (
          <div key={key} className="rounded-[18px] bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{key}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
          </div>
        ))}
      </div>
    </ConfirmDialog>
  )
}

export default DeletePlantDialog
