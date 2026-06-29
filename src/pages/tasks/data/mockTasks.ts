export type TaskPriority = 'High' | 'Medium' | 'Low'

export type TaskStatus =
  | 'Pending'
  | 'Started'
  | 'Suspended'
  | 'Discarded'
  | 'Completed'
  | 'Unassigned'

export type TaskReferenceType = 'Quote' | 'Policy' | 'Claim'

export type TaskRecord = {
  id: string
  taskName: string
  assigner: string
  assignedTo: string
  priority: TaskPriority
  status: TaskStatus
  assignedDate: string
  dueDate: string
  assignedLabel: string
  dueLabel: string
  refNumber: string
  referenceType: TaskReferenceType
  agingDays: number
  isPastDue: boolean
}

export type TeamMemberRecord = {
  id: string
  name: string
  initials: string
  title: string
  totalTasks: number
  dueToday: number
  pastDue: number
  days0to2: number
  days3to5: number
  days6plus: number
  directReports: number
  managerId?: string
}

export const tasksMock: TaskRecord[] = [
  {
    id: 't-1',
    taskName: 'Finalize proposal',
    assigner: 'Pamela Hollingsworth',
    assignedTo: 'Assigned to me',
    priority: 'High',
    status: 'Pending',
    assignedDate: '2026-06-26',
    dueDate: '2026-06-26',
    assignedLabel: 'Today',
    dueLabel: 'Today',
    refNumber: '0123456789',
    referenceType: 'Quote',
    agingDays: 0,
    isPastDue: false,
  },
  {
    id: 't-2',
    taskName: 'Group underwriting',
    assigner: 'Assigned to me',
    assignedTo: 'Assigned to me',
    priority: 'Medium',
    status: 'Started',
    assignedDate: '2026-06-27',
    dueDate: '2026-06-27',
    assignedLabel: 'Tomorrow',
    dueLabel: 'Tomorrow',
    refNumber: '0234567890',
    referenceType: 'Policy',
    agingDays: 1,
    isPastDue: false,
  },
  {
    id: 't-3',
    taskName: 'Review loss runs',
    assigner: 'Brenda Holmes',
    assignedTo: 'Alex Carter',
    priority: 'Low',
    status: 'Pending',
    assignedDate: '2025-12-05',
    dueDate: '2025-12-05',
    assignedLabel: 'Dec 5, 2025',
    dueLabel: 'Past due',
    refNumber: '0345678901',
    referenceType: 'Policy',
    agingDays: 32,
    isPastDue: true,
  },
  {
    id: 't-4',
    taskName: 'Send renewal notice',
    assigner: 'Chris Reynolds',
    assignedTo: 'Leslie Neuman',
    priority: 'High',
    status: 'Started',
    assignedDate: '2026-06-26',
    dueDate: '2026-06-28',
    assignedLabel: 'Today',
    dueLabel: 'Jun 28, 2026',
    refNumber: '0456789012',
    referenceType: 'Policy',
    agingDays: 2,
    isPastDue: false,
  },
  {
    id: 't-5',
    taskName: 'Validate billing schedule',
    assigner: 'Dana Patel',
    assignedTo: 'Jasmine Nguyen',
    priority: 'Medium',
    status: 'Pending',
    assignedDate: '2026-06-24',
    dueDate: '2026-06-30',
    assignedLabel: 'Jun 24, 2026',
    dueLabel: 'Jun 30, 2026',
    refNumber: '0567890123',
    referenceType: 'Claim',
    agingDays: 5,
    isPastDue: false,
  },
  {
    id: 't-6',
    taskName: 'Prepare quote comparison',
    assigner: 'Pamela Hollingsworth',
    assignedTo: 'Kevin Ortiz',
    priority: 'High',
    status: 'Unassigned',
    assignedDate: '2026-06-25',
    dueDate: '2026-06-26',
    assignedLabel: 'Yesterday',
    dueLabel: 'Today',
    refNumber: '0678901234',
    referenceType: 'Quote',
    agingDays: 1,
    isPastDue: false,
  },
  {
    id: 't-7',
    taskName: 'Complete inspection follow-up',
    assigner: 'Landon Wilson',
    assignedTo: 'Brenda Holmes',
    priority: 'Low',
    status: 'Suspended',
    assignedDate: '2026-06-20',
    dueDate: '2026-06-25',
    assignedLabel: 'Jun 20, 2026',
    dueLabel: 'Past due',
    refNumber: '0789012345',
    referenceType: 'Policy',
    agingDays: 8,
    isPastDue: true,
  },
  {
    id: 't-8',
    taskName: 'Issue policy documents',
    assigner: 'Alex Carter',
    assignedTo: 'Assigned to me',
    priority: 'Medium',
    status: 'Completed',
    assignedDate: '2026-06-22',
    dueDate: '2026-06-26',
    assignedLabel: 'Jun 22, 2026',
    dueLabel: 'Today',
    refNumber: '0890123456',
    referenceType: 'Policy',
    agingDays: 4,
    isPastDue: false,
  },
  {
    id: 't-9',
    taskName: 'Escalate referred quote',
    assigner: 'Leslie Neuman',
    assignedTo: 'Chris Reynolds',
    priority: 'High',
    status: 'Started',
    assignedDate: '2026-06-26',
    dueDate: '2026-07-02',
    assignedLabel: 'Today',
    dueLabel: 'Jul 2, 2026',
    refNumber: '0901234567',
    referenceType: 'Quote',
    agingDays: 0,
    isPastDue: false,
  },
  {
    id: 't-10',
    taskName: 'Close duplicate claim task',
    assigner: 'Pamela Hollingsworth',
    assignedTo: 'Dana Patel',
    priority: 'Low',
    status: 'Discarded',
    assignedDate: '2026-06-18',
    dueDate: '2026-06-20',
    assignedLabel: 'Jun 18, 2026',
    dueLabel: 'Jun 20, 2026',
    refNumber: '1012345678',
    referenceType: 'Claim',
    agingDays: 10,
    isPastDue: false,
  },
]

export const teamMembersMock: TeamMemberRecord[] = [
  {
    id: 'tm-1',
    name: 'Pamela Hollingsworth',
    initials: 'PH',
    title: 'SVP, Client Partner',
    totalTasks: 6,
    dueToday: 2,
    pastDue: 1,
    days0to2: 3,
    days3to5: 2,
    days6plus: 1,
    directReports: 11,
  },
  {
    id: 'tm-2',
    name: 'Leslie Neuman',
    initials: 'LN',
    title: 'VP, Client Relations',
    totalTasks: 8,
    dueToday: 1,
    pastDue: 0,
    days0to2: 4,
    days3to5: 3,
    days6plus: 1,
    directReports: 4,
    managerId: 'tm-1',
  },
  {
    id: 'tm-3',
    name: 'Chris Reynolds',
    initials: 'CR',
    title: 'VP, Underwriting',
    totalTasks: 5,
    dueToday: 0,
    pastDue: 1,
    days0to2: 2,
    days3to5: 1,
    days6plus: 2,
    directReports: 3,
    managerId: 'tm-1',
  },
  {
    id: 'tm-4',
    name: 'Dana Patel',
    initials: 'DP',
    title: 'VP, Operations',
    totalTasks: 7,
    dueToday: 1,
    pastDue: 0,
    days0to2: 3,
    days3to5: 2,
    days6plus: 2,
    directReports: 5,
    managerId: 'tm-1',
  },
  {
    id: 'tm-5',
    name: 'Alex Carter',
    initials: 'AC',
    title: 'Account Manager',
    totalTasks: 12,
    dueToday: 2,
    pastDue: 1,
    days0to2: 5,
    days3to5: 4,
    days6plus: 3,
    directReports: 2,
    managerId: 'tm-2',
  },
  {
    id: 'tm-6',
    name: 'Jasmine Nguyen',
    initials: 'JN',
    title: 'Account Manager',
    totalTasks: 9,
    dueToday: 1,
    pastDue: 0,
    days0to2: 4,
    days3to5: 3,
    days6plus: 2,
    directReports: 0,
    managerId: 'tm-2',
  },
  {
    id: 'tm-7',
    name: 'Brenda Holmes',
    initials: 'BH',
    title: 'Account Manager',
    totalTasks: 10,
    dueToday: 0,
    pastDue: 2,
    days0to2: 3,
    days3to5: 3,
    days6plus: 4,
    directReports: 1,
    managerId: 'tm-3',
  },
  {
    id: 'tm-8',
    name: 'Landon Wilson',
    initials: 'LW',
    title: 'Account Manager',
    totalTasks: 6,
    dueToday: 1,
    pastDue: 0,
    days0to2: 2,
    days3to5: 2,
    days6plus: 2,
    directReports: 0,
    managerId: 'tm-3',
  },
  {
    id: 'tm-9',
    name: 'Kevin Ortiz',
    initials: 'KO',
    title: 'Account Manager',
    totalTasks: 8,
    dueToday: 1,
    pastDue: 1,
    days0to2: 3,
    days3to5: 2,
    days6plus: 3,
    directReports: 0,
    managerId: 'tm-4',
  },
  {
    id: 'tm-10',
    name: 'Brianna Lopez',
    initials: 'BL',
    title: 'Associate Account Manager',
    totalTasks: 4,
    dueToday: 0,
    pastDue: 0,
    days0to2: 2,
    days3to5: 1,
    days6plus: 1,
    directReports: 0,
    managerId: 'tm-5',
  },
  {
    id: 'tm-11',
    name: 'Ethan Brooks',
    initials: 'EB',
    title: 'Account Manager',
    totalTasks: 11,
    dueToday: 2,
    pastDue: 0,
    days0to2: 5,
    days3to5: 3,
    days6plus: 3,
    directReports: 0,
    managerId: 'tm-2',
  },
]

export const TASKS_TOTAL_ROWS = 75
