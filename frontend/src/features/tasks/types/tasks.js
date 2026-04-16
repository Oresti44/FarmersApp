const TASK_STATUS_OPTIONS = [
  'scheduled',
  'in_progress',
  'completed_pending_confirmation',
  'completed',
  'postponed',
  'cancelled',
]

const TASK_PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']

const TASK_CATEGORY_OPTIONS = [
  'general',
  'irrigation',
  'fertilizing',
  'spraying',
  'harvesting',
  'inspection',
  'maintenance',
]

const TASK_TABS = ['overview', 'calendar', 'list', 'activity']

export { TASK_CATEGORY_OPTIONS, TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS, TASK_TABS }
