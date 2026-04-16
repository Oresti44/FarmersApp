import { useState } from 'react'

function TaskCommentsPanel({ comments, onAddComment }) {
  const [draft, setDraft] = useState({ comment_type: 'note', message: '' })

  async function submit(event) {
    event.preventDefault()
    if (!draft.message.trim()) {
      return
    }

    await onAddComment(draft)
    setDraft({ comment_type: 'note', message: '' })
  }

  return (
    <section className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Comments timeline</h3>
      <div className="mt-3 space-y-3">
        {comments?.length ? (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-[18px] bg-white px-4 py-3 ring-1 ring-stone-200">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                <span>{comment.comment_type}</span>
                <span>{comment.author?.full_name || 'System'}</span>
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-700">{comment.message}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-stone-500">No comments yet.</p>
        )}
      </div>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <select
          value={draft.comment_type}
          onChange={(event) => setDraft({ ...draft, comment_type: event.target.value })}
          className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
        >
          <option value="note">Note</option>
          <option value="issue">Issue</option>
          <option value="delay">Delay</option>
          <option value="completion">Completion</option>
        </select>
        <textarea
          value={draft.message}
          onChange={(event) => setDraft({ ...draft, message: event.target.value })}
          rows={3}
          placeholder="Add a timeline comment"
          className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
        />
        <button type="submit" className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white">
          Add comment
        </button>
      </form>
    </section>
  )
}

export default TaskCommentsPanel
