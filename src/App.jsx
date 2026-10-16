import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
  Clock3,
  DollarSign,
  Download,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tag,
  Utensils,
  X,
  Keyboard,
  UserRound,
} from 'lucide-react'

const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const chartPeriods = {
  Weekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    income: [1200, 1800, 950, 2400, 2100, 3700, 2900],
    savings: [350, 420, 250, 670, 480, 820, 650],
    maximum: 6000,
  },
  Monthly: {
    labels: chartMonths,
    income: [12800, 13100, 12600, 9805, 13200, 14500, 15400, 18000, 23100, 27000, 28200, 27000],
    savings: [6200, 6500, 6100, 5240, 6700, 7200, 7600, 8800, 11200, 13200, 13800, 12900],
    maximum: 30000,
  },
  Yearly: {
    labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
    income: [72000, 78000, 81000, 85000, 92000, 104000, 116000, 132000, 156000, 188000, 232000, 270000],
    savings: [18000, 19500, 20200, 21800, 23500, 27000, 31500, 36200, 42800, 54000, 64800, 77200],
    maximum: 300000,
  },
}

function makeChartPath(values, maximum) {
  const points = values.map((value, index) => [
    (752 / (values.length - 1)) * index,
    330 * (1 - value / maximum),
  ])
  return points.reduce((path, [x, y], index) => {
    if (index === 0) return `M${x} ${y}`
    const [previousX, previousY] = points[index - 1]
    const middleX = (previousX + x) / 2
    return `${path} C${middleX} ${previousY} ${middleX} ${y} ${x} ${y}`
  }, '')
}

function ActionMenu({ trigger, items, className = '', align = 'right', title }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const dismiss = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return
      if (event.type === 'pointerdown' && menuRef.current?.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', dismiss)
    }
  }, [open])

  return (
    <div className={`action-menu ${align === 'left' ? 'align-left' : ''} ${className}`} ref={menuRef}>
      {trigger(open, () => setOpen((value) => !value))}
      {open && (
        <div className="action-menu-panel" role="menu">
          {title && <strong className="action-menu-title">{title}</strong>}
          {items.map(({ label, icon: Icon, onSelect, checked, keepOpen, disabled, destructive }) => (
            <button
              type="button"
              role="menuitem"
              className={`action-menu-item ${destructive ? 'destructive' : ''}`}
              key={label}
              disabled={disabled}
              onClick={() => {
                onSelect?.()
                if (!keepOpen) setOpen(false)
              }}
            >
              {Icon && <Icon size={15} />}
              <span>{label}</span>
              {checked !== undefined && (checked ? <Check size={14} /> : <span className="menu-check-placeholder" />)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function InteractionDialog({ dialog, onClose }) {
  useEffect(() => {
    if (!dialog) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [dialog, onClose])

  if (!dialog) return null
  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="interaction-dialog" role="dialog" aria-modal="true" aria-labelledby="interaction-dialog-title">
        <div className="dialog-heading">
          <h2 id="interaction-dialog-title">{dialog.title}</h2>
          <button type="button" className="dialog-close" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="dialog-body">{dialog.body}</div>
      </section>
    </div>
  )
}

function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return undefined
    const timeout = window.setTimeout(onDismiss, 3200)
    return () => window.clearTimeout(timeout)
  }, [message, onDismiss])

  if (!message) return null
  return <div className="app-toast" role="status"><Check size={16} />{message}<button type="button" aria-label="Dismiss notification" onClick={onDismiss}><X size={14} /></button></div>
}

function downloadCsv(fileName, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function SettingsDialog({ settings, onSave, onClose }) {
  const [preferences, setPreferences] = useState(settings)
  const options = [
    ['emailAlerts', 'Email alerts', 'Get notified about important account activity.'],
    ['weeklySummary', 'Weekly summary', 'A quick recap of your spending and savings.'],
    ['privacyMode', 'Privacy mode', 'Hide balances and amounts on this device.'],
  ]

  return (
    <div className="settings-dialog-content">
      <p>Personalize how ArthoPulse keeps you up to date.</p>
      {options.map(([key, title, description]) => (
        <label className="settings-option" key={title}>
          <span><strong>{title}</strong><small>{description}</small></span>
          <input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} />
        </label>
      ))}
      <div className="dialog-actions"><button type="button" className="dialog-secondary" onClick={onClose}>Cancel</button><button type="button" className="dialog-primary" onClick={() => onSave(preferences)}>Save preferences</button></div>
    </div>
  )
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'assistant', label: 'AI Assistant' },
]

const defaultSettings = { emailAlerts: true, weeklySummary: true, privacyMode: false }

function loadSettings() {
  try {
    const storedSettings = window.localStorage.getItem('altura-preferences')
    if (!storedSettings) return { ...defaultSettings }
    const parsedSettings = JSON.parse(storedSettings)
    if (!parsedSettings || typeof parsedSettings !== 'object' || Array.isArray(parsedSettings)) {
      throw new TypeError('Saved preferences must be an object')
    }
    return {
      emailAlerts: typeof parsedSettings.emailAlerts === 'boolean' ? parsedSettings.emailAlerts : defaultSettings.emailAlerts,
      weeklySummary: typeof parsedSettings.weeklySummary === 'boolean' ? parsedSettings.weeklySummary : defaultSettings.weeklySummary,
      privacyMode: typeof parsedSettings.privacyMode === 'boolean' ? parsedSettings.privacyMode : defaultSettings.privacyMode,
    }
  } catch (error) {
    console.error('Unable to load ArthoPulse preferences', error)
    return { ...defaultSettings }
  }
}

function Header({ currentPage, settings, onOpenDialog, onToast, onSaveSettings }) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Savings goal reached 80%', detail: 'You are close to your April savings target.', time: '12 min ago', unread: true },
    { id: 2, title: 'Payment received', detail: 'Sarah Wilson sent you $120.00.', time: '2 hours ago', unread: true },
    { id: 3, title: 'Weekly summary is ready', detail: 'Your spending was down 4.2% this week.', time: 'Yesterday', unread: false },
  ])
  const unreadCount = notifications.filter((notification) => notification.unread).length

  return (
    <header className="header">
      <a className="brand" href="#dashboard" aria-label="ArthoPulse home">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 36 36" fill="none">
            <path d="M5 19h7l3.4-8 5.1 15 4.1-10 2 3H31" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 3.8a14.2 14.2 0 1 1-10.05 4.15" stroke="currentColor" strokeOpacity=".48" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <span>ArthoPulse</span>
      </a>

      <nav className="main-nav" aria-label="Main navigation">
        {navigationItems.map(({ id, label, icon: Icon }) => (
          <a key={id} className={`nav-item ${currentPage === id ? 'active' : ''}`} href={`#${id}`} aria-current={currentPage === id ? 'page' : undefined}>
            {Icon && <Icon size={15} strokeWidth={currentPage === id ? 2.8 : 2} />}{label}
          </a>
        ))}
      </nav>

      <div className="profile-actions">
        <ActionMenu
          className="notification-menu"
          trigger={(open, toggle) => (
            <button type="button" className="icon-button notification-button" aria-label="Notifications" aria-expanded={open} onClick={toggle}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-dot" />}
            </button>
          )}
          items={[
            ...notifications.map((notification) => ({
              label: `${notification.title} · ${notification.time}`,
              icon: notification.unread ? Bell : Check,
              onSelect: () => {
                setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, unread: false } : item))
                onOpenDialog(notification.title, <p className="dialog-description">{notification.detail}</p>)
              },
            })),
            { label: 'Mark all as read', icon: CheckCheck, onSelect: () => { setNotifications((items) => items.map((item) => ({ ...item, unread: false }))); onToast('All notifications marked as read') } },
          ]}
        />
        <ActionMenu
          className="profile-menu"
          trigger={(open, toggle) => (
            <button className="profile-pill" type="button" aria-expanded={open} onClick={toggle}>
              <img className="avatar profile-avatar" src="/images/takey-siddiky.jpg" alt="" />
              <span className="profile-copy"><strong>Takey Siddiky</strong><small>•••••@gmail</small></span>
              <ChevronDown size={13} />
            </button>
          )}
          items={[
            { label: 'View profile', icon: UserRound, onSelect: () => onOpenDialog('Your profile', <div className="profile-detail"><img className="avatar profile-avatar" src="/images/takey-siddiky.jpg" alt="" /><div><strong>Takey Siddiky</strong><small>•••••@gmail</small></div></div>) },
            { label: 'Account preferences', icon: Settings, onSelect: () => onOpenDialog('Account preferences', <SettingsDialog settings={settings} onSave={(nextSettings) => { onSaveSettings(nextSettings); onOpenDialog(null) }} onClose={() => onOpenDialog(null)} />) },
            { label: 'Sign out', icon: LogOut, destructive: true, onSelect: () => onToast('You are already signed in to this demo account') },
          ]}
        />
        <button type="button" className="icon-button settings-button" aria-label="Settings" onClick={() => onOpenDialog('Settings', <SettingsDialog settings={settings} onSave={(nextSettings) => { onSaveSettings(nextSettings); onOpenDialog(null) }} onClose={() => onOpenDialog(null)} />)}><Settings size={17} /></button>
      </div>
    </header>
  )
}

function IncomeChart({ onToast }) {
  const chartAreaRef = useRef(null)
  const plotRef = useRef(null)
  const [selectedMonth, setSelectedMonth] = useState(3)
  const [pointerActive, setPointerActive] = useState(false)
  const [tooltipStyle, setTooltipStyle] = useState({ left: '286px', top: '126px' })
  const [period, setPeriod] = useState('Monthly')
  const [visibleSeries, setVisibleSeries] = useState({ income: true, savings: true })
  const chart = chartPeriods[period]
  const chartPoints = useMemo(() => chart.income.map((income) => 330 * (1 - income / chart.maximum)), [chart])
  const chartX = chart.labels.map((_, index) => (752 / (chart.labels.length - 1)) * index)
  const incomePath = makeChartPath(chart.income, chart.maximum)
  const savingsPath = makeChartPath(chart.savings, chart.maximum)
  const incomeChange = chart.income.map((income, index) => {
    if (index === 0) return '—'
    const change = ((income - chart.income[index - 1]) / chart.income[index - 1]) * 100
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
  })

  useLayoutEffect(() => {
    const updateTooltipPosition = () => {
      const area = chartAreaRef.current
      const plot = plotRef.current
      if (!area || !plot) return
      const pointX = plot.offsetLeft + (selectedMonth / (chart.labels.length - 1)) * plot.clientWidth
      const top = 20 + (chartPoints[selectedMonth] / 330) * (plot.clientHeight - 20) - 100
      setTooltipStyle({
        left: `${Math.min(Math.max(0, pointX - 117), area.clientWidth - 235)}px`,
        top: `${Math.min(Math.max(0, top), area.clientHeight - 138)}px`,
      })
    }
    updateTooltipPosition()
    window.addEventListener('resize', updateTooltipPosition)
    return () => window.removeEventListener('resize', updateTooltipPosition)
  }, [chart.labels.length, chartPoints, selectedMonth, period])

  const selectFromPointer = (event) => {
    const bounds = plotRef.current?.getBoundingClientRect()
    if (!bounds || bounds.width === 0) return
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
    setSelectedMonth(Math.round(ratio * (chart.labels.length - 1)))
    setPointerActive(true)
  }

  const selectWithKeyboard = (event) => {
    let nextMonth
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') nextMonth = Math.min(chart.labels.length - 1, selectedMonth + 1)
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') nextMonth = Math.max(0, selectedMonth - 1)
    else if (event.key === 'Home') nextMonth = 0
    else if (event.key === 'End') nextMonth = chart.labels.length - 1
    else return
    event.preventDefault()
    setSelectedMonth(nextMonth)
    setPointerActive(true)
  }

  return (
    <section className="card income-card" aria-labelledby="income-title">
      <div className="income-card-header">
        <div className="income-heading">
          <span className="heading-icon"><ChartNoAxesColumnIncreasing size={21} /></span>
          <h1 id="income-title">Income Analysis</h1>
          <div className="chart-legend">
            <button type="button" className={`legend-toggle ${visibleSeries.income ? '' : 'muted'}`} aria-pressed={visibleSeries.income} onClick={() => setVisibleSeries((series) => ({ ...series, income: !series.income }))}><i className="legend-dot income-dot" />Income</button>
            <button type="button" className={`legend-toggle ${visibleSeries.savings ? '' : 'muted'}`} aria-pressed={visibleSeries.savings} onClick={() => setVisibleSeries((series) => ({ ...series, savings: !series.savings }))}><i className="legend-dot savings-dot" />Savings</button>
          </div>
        </div>
        <div className="chart-filters">
          <ActionMenu
            trigger={(open, toggle) => <button type="button" className="control-button" aria-expanded={open} onClick={toggle}><CalendarDays size={15} />{period}<ChevronDown size={14} /></button>}
            items={['Weekly', 'Monthly', 'Yearly'].map((value) => ({ label: value, checked: value === period, onSelect: () => { setPeriod(value); setSelectedMonth(0); onToast(`Showing ${value.toLowerCase()} income analysis`) } }))}
          />
          <ActionMenu
            title="Show on chart"
            trigger={(open, toggle) => <button type="button" className="control-button filter-button" aria-expanded={open} onClick={toggle}><SlidersHorizontal size={15} />Filter<ChevronDown size={14} /></button>}
            items={[
              { label: 'Income', icon: DollarSign, checked: visibleSeries.income, keepOpen: true, onSelect: () => setVisibleSeries((series) => ({ ...series, income: !series.income })) },
              { label: 'Savings', icon: Smartphone, checked: visibleSeries.savings, keepOpen: true, onSelect: () => setVisibleSeries((series) => ({ ...series, savings: !series.savings })) },
              { label: 'Reset chart', icon: Filter, onSelect: () => { setVisibleSeries({ income: true, savings: true }); onToast('Chart filters cleared') } },
            ]}
          />
        </div>
      </div>

      <div className="chart-area" ref={chartAreaRef}>
        <div className="y-axis">
          {[1, 2 / 3, 1 / 2, 1 / 3, 1 / 6, 0].map((fraction) => <span key={fraction}>{fraction === 0 ? '0' : `${Math.round(chart.maximum * fraction / 1000)}k`}</span>)}
        </div>
        <div
          className={`plot ${pointerActive ? 'is-interacting' : ''}`}
          ref={plotRef}
          role="slider"
          aria-label={`${period} income`}
          aria-valuemin={0}
          aria-valuemax={chart.labels.length - 1}
          aria-valuenow={selectedMonth}
          aria-valuetext={`${chart.labels[selectedMonth]} income $${chart.income[selectedMonth].toLocaleString('en-US')}`}
          tabIndex={0}
          onPointerMove={selectFromPointer}
          onPointerLeave={() => setPointerActive(false)}
          onFocus={() => setPointerActive(true)}
          onBlur={() => setPointerActive(false)}
          onKeyDown={selectWithKeyboard}
        >
          <div className="grid-lines"><i /><i /><i /><i /><i /><i /></div>
          <svg className="chart-svg" viewBox="0 0 752 330" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f20be9" stopOpacity=".24" />
                <stop offset="100%" stopColor="#f20be9" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="incomeStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e50be5" />
                <stop offset="100%" stopColor="#fb4df1" />
              </linearGradient>
              <linearGradient id="savingsStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0097e8" />
                <stop offset="100%" stopColor="#00c8ef" />
              </linearGradient>
            </defs>
            {visibleSeries.income && <path className="chart-area-fill" d={`${incomePath} L 752 330 L 0 330 Z`} fill="url(#incomeFill)" />}
            {visibleSeries.savings && <path className="chart-line savings-line" d={savingsPath} fill="none" stroke="url(#savingsStroke)" strokeWidth="3" strokeLinecap="round" />}
            {visibleSeries.income && <path className="chart-line income-line" d={incomePath} fill="none" stroke="url(#incomeStroke)" strokeWidth="3.2" strokeLinecap="round" />}
            <line className="chart-guide" x1={chartX[selectedMonth]} x2={chartX[selectedMonth]} y1="0" y2="330" stroke="#aaa6b5" strokeOpacity=".58" strokeDasharray="3 5" />
            <circle className="chart-marker" cx={chartX[selectedMonth]} cy={chartPoints[selectedMonth]} r={pointerActive ? 9 : 7} fill="#15131d" stroke="#f719ec" strokeWidth="3" />
          </svg>
          <div className="chart-x-axis">
            {chart.labels.map((label, index) => <span key={label} className={index === selectedMonth ? 'selected-month' : ''}>{label}</span>)}
          </div>
        </div>
        <div key={selectedMonth} className="chart-tooltip" style={tooltipStyle} aria-live="polite">
          <span className="tooltip-date">{chart.labels[selectedMonth]}{period === 'Monthly' ? ' 2026' : ''}</span>
          <div className="tooltip-detail"><i className="legend-dot income-dot" /><span>Income change</span><strong>{incomeChange[selectedMonth]}</strong></div>
          <strong className="tooltip-value">${chart.income[selectedMonth].toLocaleString('en-US')}</strong>
        </div>
      </div>
    </section>
  )
}

function AddTransactionForm({ onCancel, onSave }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState('Expense')

  return (
    <form className="add-transaction-form" onSubmit={(event) => {
      event.preventDefault()
      const numericAmount = Number(amount)
      if (!name.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return
      onSave({
        name: name.trim(),
        detail: 'Manual transaction · ArthoPulse',
        category: 'Other',
        date: 'Just now',
        dateKey: '2026-04-23',
        amount: `${kind === 'Income' ? '+' : '-'}$${numericAmount.toFixed(2)}`,
        tone: kind === 'Income' ? 'blue' : 'neutral',
        initials: name.trim().slice(0, 2).toUpperCase(),
        outgoing: kind === 'Expense',
      })
    }}>
      <label>Transaction name<input required autoFocus placeholder="e.g. Coffee shop" value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Amount<input required type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
      <label>Type<select value={kind} onChange={(event) => setKind(event.target.value)}><option>Expense</option><option>Income</option></select></label>
      <div className="dialog-actions"><button type="button" className="dialog-secondary" onClick={onCancel}>Cancel</button><button type="submit" className="dialog-primary">Add transaction</button></div>
    </form>
  )
}

function TransactionsCard({ transactions, onOpenDialog, onToast, onAddTransaction }) {
  return (
    <section className="card transactions-card" aria-labelledby="transactions-title">
      <div className="section-title-row">
        <h2 id="transactions-title">Recent Transactions</h2>
        <a className="see-all" href="#transactions">See All</a>
        <button type="button" className="icon-button add-button" aria-label="Add transaction" onClick={onAddTransaction}><Plus size={20} /></button>
      </div>
      <div className="transaction-list">
        {transactions.map((transaction) => (
          <article className="transaction-row" key={transaction.name}>
            <span className={`transaction-avatar ${transaction.tone}`}>{transaction.initials}</span>
            <span className="transaction-copy"><strong>{transaction.name}</strong><small>{transaction.date}</small></span>
            <strong className={`transaction-amount ${transaction.outgoing ? 'negative' : ''}`}>{transaction.amount}</strong>
            {transaction.outgoing && <button type="button" className="icon-button transaction-detail-button" aria-label={`View ${transaction.name}`} onClick={() => onOpenDialog(transaction.name, <div className="transaction-detail"><span>Amount<strong className="negative">{transaction.amount}</strong></span><span>Date<strong>{transaction.date}</strong></span><span>Type<strong>Card purchase</strong></span><button type="button" className="dialog-primary" onClick={() => onToast(`${transaction.name} details opened`)}>Done</button></div>)}><ArrowUpRight size={14} /></button>}
          </article>
        ))}
      </div>
    </section>
  )
}

function BudgetCard({ onOpenDialog }) {
  return (
    <section className="card budget-card" aria-labelledby="budget-title">
      <div className="section-title-row budget-title-row">
        <span className="heading-icon small"><Clock3 size={18} /></span>
        <h2 id="budget-title">Budget Usage</h2>
        <button type="button" className="icon-button expand-budget" aria-label="Budget details" onClick={() => onOpenDialog('April budget', <div className="budget-detail"><div><span>Monthly budget</span><strong>$4,350</strong></div><div><span>Spent so far</span><strong>$3,790 <small>87%</small></strong></div><div><span>Remaining</span><strong className="text-positive">$560</strong></div><p>You are $135 over your planned spending pace. Your budget resets May 1.</p></div>)}><ArrowUpRight size={15} /></button>
      </div>
      <div className="budget-content">
        <ul className="budget-legend">
          <li><i className="budget-key used" />Used</li>
          <li><i className="budget-key remaining" />Remaining</li>
          <li><i className="budget-key planned" />Planned</li>
          <li><i className="budget-key overflow" />Overflow</li>
        </ul>
        <div className="donut-chart" role="img" aria-label="87 percent of budget used">
          <div className="donut-center"><strong>87%</strong><small>used</small></div>
        </div>
      </div>
      <div className="budget-tooltip"><small>April 2026</small><strong>87% <span>+3.1%</span></strong></div>
    </section>
  )
}

function MetricCard({ kind, title, value, change, positive, fill, onOpenDialog }) {
  const Icon = kind === 'savings' ? DollarSign : Smartphone
  return (
    <section className={`card metric-card ${kind}-card`}>
      <div className="metric-heading">
        <span className="heading-icon metric-icon"><Icon size={21} /></span>
        <h2>{title}</h2>
        <button type="button" className="icon-button metric-expand" aria-label={`${title} details`} onClick={() => onOpenDialog(title, <div className="metric-detail"><strong>{value}</strong><p>{positive ? 'You are making steady progress toward your monthly savings goal.' : 'Your spending is lower than last month. Keep an eye on upcoming bills.'}</p><span className={positive ? 'text-positive' : 'text-positive'}>{change} compared with last month</span></div>)}><ArrowUpRight size={16} /></button>
      </div>
      <div className="metric-value-row">
        <strong className="metric-value">{value}</strong>
        <span className={`metric-change ${positive ? 'positive' : 'negative'}`}>{change}<small> vs last month</small></span>
      </div>
      <div className="progress-track"><span style={{ '--progress-width': `${fill}%` }} /></div>
    </section>
  )
}

function AssistantCard() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) {
    return <section className="card assistant-card assistant-closed"><Sparkles size={21} /><strong>AI Assistant is paused</strong><button type="button" className="assistant-reopen" onClick={() => setIsOpen(true)}>Reopen assistant</button></section>
  }

  return (
    <section className="card assistant-card" aria-labelledby="assistant-title">
      <div className="assistant-heading">
        <span className="assistant-icon"><Sparkles size={18} /></span>
        <h2 id="assistant-title">AI Assistant</h2>
        <button type="button" className="icon-button assistant-expand" aria-label="Open AI Assistant" onClick={() => { window.location.hash = 'assistant' }}><ArrowUpRight size={16} /></button>
      </div>
      <p className="assistant-question">
        <>How can I save<br />more money <span>thi ...</span></>
      </p>
      <div className="assistant-controls">
        <button type="button" className="icon-button assistant-control keyboard-button" aria-label="Type a message" onClick={() => { window.location.hash = 'assistant' }}><Keyboard size={20} /></button>
        <button type="button" className="assistant-control mic-button" aria-label="Open assistant for voice input" onClick={() => { window.location.hash = 'assistant' }}><Mic size={25} /></button>
        <button type="button" className="icon-button assistant-control close-button" aria-label="Close assistant" onClick={() => setIsOpen(false)}><X size={21} /></button>
      </div>
    </section>
  )
}

const reportCategories = [
  { label: 'Shopping', amount: '$1,240', share: 33, color: 'pink' },
  { label: 'Food & dining', amount: '$980', share: 26, color: 'blue' },
  { label: 'Transport', amount: '$720', share: 19, color: 'purple' },
  { label: 'Bills & utilities', amount: '$540', share: 14, color: 'cyan' },
  { label: 'Other', amount: '$310', share: 8, color: 'neutral' },
]

const reportSnapshots = {
  'April 2026': {
    income: '$9,805', savings: '$5,240', expenses: '$3,790', balance: '$6,015',
    incomeChange: '6.4%', savingsChange: '8.4%', expenseChange: '12.6%', balanceChange: '4.2%',
    expensesLower: true, averageSavings: '$4,860', insight: 'You spent 12.6% less than last month.', categories: reportCategories,
  },
  'March 2026': {
    income: '$9,280', savings: '$4,835', expenses: '$4,010', balance: '$5,270',
    incomeChange: '3.1%', savingsChange: '5.2%', expenseChange: '2.8%', balanceChange: '2.6%',
    expensesLower: false, averageSavings: '$4,710', insight: 'Dining was your biggest opportunity to save.', categories: [
      { label: 'Shopping', amount: '$1,350', share: 34, color: 'pink' },
      { label: 'Food & dining', amount: '$1,110', share: 28, color: 'blue' },
      { label: 'Transport', amount: '$680', share: 17, color: 'purple' },
      { label: 'Bills & utilities', amount: '$620', share: 15, color: 'cyan' },
      { label: 'Other', amount: '$250', share: 6, color: 'neutral' },
    ],
  },
  'February 2026': {
    income: '$8,850', savings: '$4,490', expenses: '$3,980', balance: '$4,870',
    incomeChange: '2.4%', savingsChange: '4.8%', expenseChange: '0.8%', balanceChange: '3.3%',
    expensesLower: true, averageSavings: '$4,520', insight: 'You spent 0.8% less than the month before.', categories: [
      { label: 'Shopping', amount: '$1,250', share: 31, color: 'pink' },
      { label: 'Food & dining', amount: '$1,080', share: 27, color: 'blue' },
      { label: 'Transport', amount: '$730', share: 18, color: 'purple' },
      { label: 'Bills & utilities', amount: '$640', share: 16, color: 'cyan' },
      { label: 'Other', amount: '$280', share: 8, color: 'neutral' },
    ],
  },
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <span className="page-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

function ReportsPage({ onToast, onOpenDialog }) {
  const [period, setPeriod] = useState('Monthly')
  const [reportMonth, setReportMonth] = useState('April 2026')
  const [showExpenses, setShowExpenses] = useState(true)
  const report = reportSnapshots[reportMonth]
  const reportChart = chartPeriods[period]
  const expenseValues = reportChart.income.map((income, index) => Math.max(income - reportChart.savings[index], 0))
  const incomePath = makeChartPath(reportChart.income, reportChart.maximum)
  const savingsPath = makeChartPath(reportChart.savings, reportChart.maximum)
  const expensesPath = makeChartPath(expenseValues, reportChart.maximum)

  return (
    <div className="page-content reports-page">
      <PageHeading
        eyebrow="Your money, at a glance"
        title="Financial Reports"
        description="A clearer picture of how your money moves."
        action={<ActionMenu trigger={(open, toggle) => <button type="button" className="control-button" aria-expanded={open} onClick={toggle}><CalendarDays size={15} />{reportMonth}<ChevronDown size={14} /></button>} items={['April 2026', 'March 2026', 'February 2026'].map((month) => ({ label: month, checked: month === reportMonth, onSelect: () => { setReportMonth(month); onToast(`Report period changed to ${month}`) } }))} />}
      />
      <div className="report-metrics">
        <article className="card report-metric income-report">
          <span className="report-metric-label"><i className="legend-dot income-dot" />Total income</span>
          <strong>{report.income}</strong>
          <span className="report-metric-change"><ArrowUpRight size={14} /> {report.incomeChange} <small>vs last month</small></span>
        </article>
        <article className="card report-metric savings-report">
          <span className="report-metric-label"><i className="legend-dot savings-dot" />Total savings</span>
          <strong>{report.savings}</strong>
          <span className="report-metric-change"><ArrowUpRight size={14} /> {report.savingsChange} <small>vs last month</small></span>
        </article>
        <article className="card report-metric expense-report">
          <span className="report-metric-label"><i className="legend-dot expense-dot" />Total expenses</span>
          <strong>{report.expenses}</strong>
          <span className={`report-metric-change ${report.expensesLower ? 'down' : ''}`}>{report.expensesLower ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />} {report.expenseChange} <small>vs last month</small></span>
        </article>
        <article className="card report-metric balance-report">
          <span className="report-metric-label"><i className="legend-dot balance-dot" />Net balance</span>
          <strong>{report.balance}</strong>
          <span className="report-metric-change"><ArrowUpRight size={14} /> {report.balanceChange} <small>vs last month</small></span>
        </article>
      </div>
      <div className="report-panels">
        <section className="card report-chart-card" aria-labelledby="cashflow-title">
          <div className="page-card-heading">
            <div><h2 id="cashflow-title">Cash flow</h2><p>{period === 'Weekly' ? 'Daily income and expenses' : period === 'Yearly' ? 'Annual income and expenses' : 'Income and expenses over time'}</p></div>
            <ActionMenu trigger={(open, toggle) => <button type="button" className="control-button" aria-expanded={open} onClick={toggle}>{period}<ChevronDown size={14} /></button>} items={['Weekly', 'Monthly', 'Yearly'].map((value) => ({ label: value, checked: value === period, onSelect: () => { setPeriod(value); onToast(`Cash flow set to ${value.toLowerCase()}`) } }))} />
          </div>
          <div className="report-chart-legend"><span><i className="legend-dot income-dot" />Income</span><span><i className="legend-dot savings-dot" />Savings</span><button type="button" className={`legend-toggle ${showExpenses ? '' : 'muted'}`} aria-pressed={showExpenses} onClick={() => setShowExpenses((value) => !value)}><i className="legend-dot expense-dot" />Expenses</button></div>
          <div className="report-chart">
            <div className="report-y-axis">{[1, 2 / 3, 1 / 3, 0].map((fraction) => <span key={fraction}>{fraction === 0 ? '$0' : `$${Math.round(reportChart.maximum * fraction / 1000)}k`}</span>)}</div>
            <div className="report-plot">
              <div className="report-grid-lines"><i /><i /><i /><i /></div>
              <svg viewBox="0 0 752 330" preserveAspectRatio="none" role="img" aria-label={`${period} income, savings, and expenses chart`}>
                <defs><linearGradient id="reportArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ed20ed" stopOpacity=".25" /><stop offset="100%" stopColor="#ed20ed" stopOpacity="0" /></linearGradient></defs>
                <path d={`${incomePath} L 752 330 L 0 330 Z`} fill="url(#reportArea)" />
                <path d={incomePath} fill="none" stroke="#e820f0" strokeWidth="3" strokeLinecap="round" />
                <path d={savingsPath} fill="none" stroke="#06c9ed" strokeWidth="3" strokeLinecap="round" />
                {showExpenses && <path d={expensesPath} fill="none" stroke="#a56bff" strokeWidth="3" strokeLinecap="round" />}
              </svg>
              <div className="report-x-axis">{reportChart.labels.map((label) => <span key={label}>{label}</span>)}</div>
            </div>
          </div>
          <div className="report-chart-footer"><span><small>Income this month</small><strong>{report.income}</strong></span><span><small>Average monthly savings</small><strong>{report.averageSavings}</strong></span><span><small>Saved this month</small><strong className="text-positive">{report.savings}</strong></span></div>
        </section>
        <section className="card spending-card" aria-labelledby="spending-title">
          <div className="page-card-heading">
            <div><h2 id="spending-title">Spending breakdown</h2><p>By category this month</p></div>
            <ActionMenu
              trigger={(open, toggle) => <button type="button" className="icon-button" aria-label="More spending options" aria-expanded={open} onClick={toggle}><MoreHorizontal size={19} /></button>}
              items={[
                { label: 'View transactions', icon: FileText, onSelect: () => { window.location.hash = 'transactions' } },
                { label: 'Category details', icon: Tag, onSelect: () => onOpenDialog('Spending categories', <div className="budget-detail">{report.categories.map(({ label, amount, share }) => <div key={label}><span>{label}</span><strong>{amount} <small>{share}%</small></strong></div>)}</div>) },
                { label: 'Download report', icon: Download, onSelect: () => {
                  downloadCsv(`altura-${reportMonth.toLowerCase().replace(' ', '-')}-spending.csv`, [['Category', 'Amount', 'Share'], ...report.categories.map(({ label, amount, share }) => [label, amount, `${share}%`])])
                  onToast(`${reportMonth} spending report downloaded`)
                } },
              ]}
            />
          </div>
          <div className="spending-total"><strong>{report.expenses}</strong><span>total spent</span></div>
          <div className="spending-bar" aria-label="Spending by category">
            {report.categories.map((category) => <span key={category.label} className={category.color} style={{ width: `${category.share}%` }} title={`${category.label}: ${category.amount}`} />)}
          </div>
          <div className="spending-category-list">
            {report.categories.map((category) => (
              <div className="spending-category" key={category.label}>
                <span className={`category-mark ${category.color}`}><Tag size={14} /></span>
                <span className="category-copy"><strong>{category.label}</strong><small>{category.share}% of spending</small></span>
                <strong className="category-amount">{category.amount}</strong>
              </div>
            ))}
          </div>
          <div className="report-insight"><span className="assistant-icon"><Sparkles size={16} /></span><p><strong>Monthly insight</strong> {report.insight}</p></div>
        </section>
      </div>
    </div>
  )
}

const initialTransactions = [
  { name: 'Whole Foods Market', detail: 'Groceries · Visa ending 4821', category: 'Shopping', date: 'Today, 10:42 AM', dateKey: '2026-04-23', amount: '-$86.42', tone: 'green', initials: 'WF', icon: ShoppingBag },
  { name: 'Sarah Wilson', detail: 'Money received · Bank transfer', category: 'Transfer', date: 'Today, 9:15 AM', dateKey: '2026-04-23', amount: '+$120.00', tone: 'pink', initials: 'SW' },
  { name: 'Blue Bottle Coffee', detail: 'Food & dining · Visa ending 4821', category: 'Food & dining', date: 'Yesterday, 4:32 PM', dateKey: '2026-04-22', amount: '-$14.80', tone: 'brown', initials: 'BB', icon: Utensils },
  { name: 'Metro Transit', detail: 'Transport · Apple Pay', category: 'Transport', date: 'Yesterday, 8:04 AM', dateKey: '2026-04-22', amount: '-$3.25', tone: 'blue', initials: 'MT', icon: Smartphone },
  { name: 'Netflix', detail: 'Subscriptions · Visa ending 4821', category: 'Bills', date: 'Apr 22, 2026', dateKey: '2026-04-22', amount: '-$15.99', tone: 'red', initials: 'N' },
  { name: 'John Smith', detail: 'Money received · Bank transfer', category: 'Transfer', date: 'Apr 21, 2026', dateKey: '2026-04-21', amount: '+$250.00', tone: 'blue', initials: 'JS' },
  { name: 'City Electric', detail: 'Utilities · Checking account', category: 'Bills', date: 'Apr 20, 2026', dateKey: '2026-04-20', amount: '-$74.16', tone: 'yellow', initials: 'CE', icon: DollarSign },
  { name: 'Corner Market', detail: 'Groceries · Visa ending 4821', category: 'Shopping', date: 'Mar 28, 2026', dateKey: '2026-03-28', amount: '-$42.18', tone: 'green', initials: 'CM' },
  { name: 'Taylor Morgan', detail: 'Money received · Bank transfer', category: 'Transfer', date: 'Mar 18, 2026', dateKey: '2026-03-18', amount: '+$95.00', tone: 'pink', initials: 'TM' },
  { name: 'Ride Share', detail: 'Transport · Visa ending 4821', category: 'Transport', date: 'Mar 04, 2026', dateKey: '2026-03-04', amount: '-$18.50', tone: 'blue', initials: 'RS' },
  { name: 'Bookshop', detail: 'Shopping · Visa ending 4821', category: 'Shopping', date: 'Feb 22, 2026', dateKey: '2026-02-22', amount: '-$32.75', tone: 'brown', initials: 'B' },
  { name: 'Electricity', detail: 'Utilities · Checking account', category: 'Bills', date: 'Feb 12, 2026', dateKey: '2026-02-12', amount: '-$68.20', tone: 'yellow', initials: 'E' },
  { name: 'Alex Rivera', detail: 'Money received · Bank transfer', category: 'Transfer', date: 'Feb 02, 2026', dateKey: '2026-02-02', amount: '+$180.00', tone: 'blue', initials: 'AR' },
]

function loadTransactions() {
  try {
    const storedTransactions = window.localStorage.getItem('arthopulse-transactions')
    if (!storedTransactions) return initialTransactions
    const parsedTransactions = JSON.parse(storedTransactions)
    if (!Array.isArray(parsedTransactions) || parsedTransactions.some((transaction) => (
      !transaction || typeof transaction.name !== 'string' || typeof transaction.amount !== 'string' ||
      typeof transaction.dateKey !== 'string' || typeof transaction.category !== 'string'
    ))) {
      throw new TypeError('Saved transactions must be a list of valid transactions')
    }
    return parsedTransactions
  } catch (error) {
    console.error('Unable to load ArthoPulse transactions', error)
    return initialTransactions
  }
}

function TransactionsPage({ transactions, onOpenDialog, onToast }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('All categories')
  const [dateRange, setDateRange] = useState('This month')
  const [currentPage, setCurrentPage] = useState(1)
  const categories = ['All categories', 'Shopping', 'Food & dining', 'Transport', 'Bills', 'Transfer', 'Other']
  const datePrefixes = dateRange === 'This month' ? ['2026-04'] : dateRange === 'Last month' ? ['2026-03'] : ['2026-02', '2026-03', '2026-04']
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesDate = datePrefixes.some((prefix) => transaction.dateKey?.startsWith(prefix))
    const matchesCategory = category === 'All categories' || transaction.category === category
    const query = searchTerm.trim().toLowerCase()
    const matchesSearch = !query || `${transaction.name} ${transaction.detail} ${transaction.category}`.toLowerCase().includes(query)
    return matchesDate && matchesCategory && matchesSearch
  })
  const pageSize = 7
  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / pageSize))
  const visibleTransactions = filteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const currentMonthTransactions = transactions.filter((transaction) => transaction.dateKey?.startsWith('2026-04'))
  const moneyIn = currentMonthTransactions.reduce((total, transaction) => total + (transaction.amount.startsWith('+') ? Number(transaction.amount.replace(/[+$,]/g, '')) : 0), 0)
  const moneyOut = currentMonthTransactions.reduce((total, transaction) => total + (transaction.amount.startsWith('-') ? Number(transaction.amount.replace(/[-$,]/g, '')) : 0), 0)
  const formatCurrency = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="page-content transactions-page">
      <PageHeading
        eyebrow="Your account activity"
        title="Transactions"
        description="Track every payment, transfer, and purchase."
        action={<button type="button" className="control-button export-button" onClick={() => {
          downloadCsv('arthopulse-transactions.csv', [['Transaction', 'Category', 'Date', 'Amount'], ...filteredTransactions.map(({ name, category, date, amount }) => [name, category, date, amount])])
          onToast(`Exported ${filteredTransactions.length} filtered transactions`)
        }}><Download size={15} />Export</button>}
      />
      <div className="transaction-summary">
        <article className="card summary-card"><span><i className="legend-dot savings-dot" />Money in</span><strong>+{formatCurrency(moneyIn)}</strong><small>This month</small></article>
        <article className="card summary-card"><span><i className="legend-dot income-dot" />Money out</span><strong>-{formatCurrency(moneyOut)}</strong><small>This month</small></article>
        <article className="card summary-card"><span><i className="legend-dot balance-dot" />Transactions</span><strong>{currentMonthTransactions.length}</strong><small>This month</small></article>
        <article className="card summary-card balance-summary"><span><i className="legend-dot expense-dot" />Net cash flow</span><strong>{moneyIn >= moneyOut ? '+' : '-'}{formatCurrency(Math.abs(moneyIn - moneyOut))}</strong><small>This month</small></article>
      </div>
      <section className="card all-transactions-card" aria-labelledby="all-transactions-title">
        <div className="transactions-toolbar">
          <div><h2 id="all-transactions-title">All transactions</h2><p>Your recent account activity</p></div>
          <div className="transaction-tools">
            <label className="transaction-search"><Search size={16} /><input aria-label="Search transactions" placeholder="Search transactions..." value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1) }} />{searchTerm && <button type="button" aria-label="Clear search" onClick={() => { setSearchTerm(''); setCurrentPage(1) }}><X size={14} /></button>}</label>
            <label className="category-select-wrap"><Filter size={15} /><select aria-label="Filter by category" value={category} onChange={(event) => { setCategory(event.target.value); setCurrentPage(1) }}>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
            <ActionMenu trigger={(open, toggle) => <button type="button" className="control-button date-filter" aria-expanded={open} onClick={toggle}><CalendarDays size={15} />{dateRange}<ChevronDown size={14} /></button>} items={['This month', 'Last month', 'Last 90 days'].map((range) => ({ label: range, checked: range === dateRange, onSelect: () => { setDateRange(range); setCurrentPage(1); onToast(`Showing transactions from ${range.toLowerCase()}`) } }))} />
          </div>
        </div>
        <div className="transaction-table-wrap">
          <div className="transaction-table-head"><span>TRANSACTION</span><span>CATEGORY</span><span>DATE</span><span>AMOUNT</span><span /></div>
          <div className="all-transaction-list">
            {visibleTransactions.map((transaction) => {
              const Icon = transaction.icon
              const incoming = transaction.amount.startsWith('+')
              return (
                <article className="all-transaction-row" key={`${transaction.name}-${transaction.date}`}>
                  <span className={`transaction-avatar ${transaction.tone}`}>{transaction.initials || <Icon size={18} />}</span>
                  <span className="all-transaction-copy"><strong>{transaction.name}</strong><small>{transaction.detail}</small></span>
                  <span className="transaction-category">{transaction.category}</span>
                  <span className="transaction-date">{transaction.date}</span>
                  <strong className={`all-transaction-amount ${incoming ? 'incoming' : ''}`}>{transaction.amount}</strong>
                  <ActionMenu
                    trigger={(open, toggle) => <button type="button" className="row-more" aria-label={`More options for ${transaction.name}`} aria-expanded={open} onClick={toggle}><MoreHorizontal size={18} /></button>}
                    items={[
                      { label: 'View details', icon: FileText, onSelect: () => onOpenDialog(transaction.name, <div className="transaction-detail"><span>Category<strong>{transaction.category}</strong></span><span>Date<strong>{transaction.date}</strong></span><span>Amount<strong className={incoming ? 'text-positive' : 'negative'}>{transaction.amount}</strong></span><p>{transaction.detail}</p></div>) },
                      { label: 'Copy amount', icon: Copy, onSelect: () => {
                        if (!navigator.clipboard) {
                          onToast(`Amount: ${transaction.amount}`)
                          return
                        }
                        navigator.clipboard.writeText(transaction.amount).then(() => onToast('Amount copied to clipboard')).catch(() => onToast(`Amount: ${transaction.amount}`))
                      } },
                    ]}
                  />
                </article>
              )
            })}
            {filteredTransactions.length === 0 && <div className="empty-transactions"><Search size={21} /><strong>No transactions found</strong><span>Try a different search or category.</span></div>}
          </div>
        </div>
        <div className="transaction-list-footer"><span>Showing <strong>{filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredTransactions.length)}</strong> of {filteredTransactions.length} transactions</span><div><button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => <button type="button" key={page} className={page === currentPage ? 'current-page' : ''} aria-current={page === currentPage ? 'page' : undefined} onClick={() => setCurrentPage(page)}>{page}</button>)}<button type="button" disabled={currentPage === pageCount} onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}>Next <ChevronRight size={13} /></button></div></div>
      </section>
    </div>
  )
}

const assistantSuggestions = [
  { icon: DollarSign, label: 'How can I save more?' },
  { icon: ChartNoAxesColumnIncreasing, label: 'Summarize my spending' },
  { icon: CircleHelp, label: 'Can I afford a vacation?' },
]

function AssistantPage({ onOpenDialog, onToast }) {
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState([])
  const messageInput = useRef(null)
  const appendTranscript = useCallback((transcript) => {
    setMessage((current) => current ? `${current} ${transcript}` : transcript)
  }, [])
  const reportVoiceError = useCallback((error) => onToast(error), [onToast])
  const [listening, toggleListening] = useVoiceInput(appendTranscript, reportVoiceError)

  useEffect(() => {
    messageInput.current?.focus({ preventScroll: true })
  }, [])

  const sendMessage = (value = message) => {
    const question = value.trim()
    if (!question) return
    setConversation((items) => [...items, { question, answer: 'Based on your April activity, you have saved $5,240 so far — 8.4% more than last month. Your biggest opportunity is dining and shopping, where a small weekly adjustment could add to your savings without changing your routine.' }])
    setMessage('')
  }

  return (
    <div className="page-content assistant-page">
      <PageHeading
        eyebrow="Your personal money coach"
        title="AI Assistant"
        description="Ask anything about your finances. Your data stays private."
        action={<span className="assistant-online"><i />Here to help</span>}
      />
      <div className="assistant-workspace">
        <section className="card conversation-card" aria-label="Conversation with your AI financial assistant">
          <div className="conversation-topbar">
            <div className="conversation-agent"><span className="assistant-icon"><Sparkles size={18} /></span><div><strong>ArthoPulse Assistant</strong><small><i /> Your financial co-pilot</small></div></div>
            <button type="button" className="control-button new-chat-button" onClick={() => { setConversation([]); setMessage(''); messageInput.current?.focus({ preventScroll: true }) }}><Plus size={15} />New conversation</button>
          </div>
          <div className="conversation-body">
            <div className="assistant-welcome">
              <span className="welcome-orb"><Sparkles size={24} /></span>
              <h2>Let’s make your money work <span>smarter.</span></h2>
              <p>I’ve reviewed your finances for April. What would you like to know?</p>
            </div>
            {conversation.length === 0 ? (
              <div className="suggestion-list">
                {assistantSuggestions.map(({ icon: Icon, label }) => <button type="button" className="suggestion-chip" key={label} onClick={() => sendMessage(label)}><Icon size={16} />{label}<ArrowUpRight size={15} /></button>)}
              </div>
            ) : (
              <div className="conversation-messages" aria-live="polite">
                {conversation.map((item, index) => (
                  <div className="message-pair" key={`${item.question}-${index}`}>
                    <div className="user-message">{item.question}</div>
                    <div className="assistant-message"><span className="assistant-icon"><Sparkles size={14} /></span><p>{item.answer}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); sendMessage() }}>
            <input ref={messageInput} aria-label="Ask ArthoPulse Assistant" placeholder="Ask about your spending, savings, or goals..." value={message} onChange={(event) => setMessage(event.target.value)} />
            <button type="button" className={`composer-mic ${listening ? 'listening' : ''}`} aria-label={listening ? 'Stop voice input' : 'Start voice input'} aria-pressed={listening} onClick={toggleListening}><Mic size={18} /></button>
            <button type="submit" className="send-message" aria-label="Send message" disabled={!message.trim()}><ArrowUpRight size={18} /></button>
          </form>
          <p className="assistant-disclaimer"><Check size={13} /> ArthoPulse AI can make mistakes. Double-check important financial decisions.</p>
        </section>
        <aside className="card assistant-context">
          <div className="context-heading"><span className="heading-icon"><ChartNoAxesColumnIncreasing size={18} /></span><div><h2>Your April snapshot</h2><p>Context for your conversations</p></div></div>
          <div className="context-balance"><small>Available balance</small><strong>$12,480.50</strong><span><ArrowUpRight size={13} /> 4.2% this month</span></div>
          <div className="context-divider" />
          <div className="context-stat"><span>Monthly income</span><strong>$9,805</strong></div>
          <div className="context-stat"><span>Monthly expenses</span><strong>$3,790</strong></div>
          <div className="context-stat"><span>Amount saved</span><strong className="text-positive">$5,240</strong></div>
          <div className="context-divider" />
          <div className="context-note"><span className="assistant-icon"><Sparkles size={15} /></span><p><strong>Your savings are up!</strong><br />You saved 8.4% more than last month.</p></div>
          <button type="button" className="context-help" onClick={() => onOpenDialog('How ArthoPulse AI works', <p className="dialog-description">ArthoPulse Assistant uses the financial snapshot shown here to provide helpful general insights. It is a demo and does not connect to an external AI service. Always verify important financial decisions.</p>)}><MessageCircle size={15} />How does ArthoPulse AI work?<ArrowUpRight size={14} /></button>
        </aside>
      </div>
    </div>
  )
}

function useVoiceInput(onTranscript, onError) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => () => recognitionRef.current?.abort(), [])

  const toggleListening = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      onError('Voice input is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = navigator.language || 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript
      if (transcript) onTranscript(transcript)
    }
    recognition.onerror = (event) => {
      setListening(false)
      if (event.error !== 'aborted') {
        onError(event.error === 'not-allowed' ? 'Allow microphone access to use voice input.' : `Voice input failed: ${event.error}`)
      }
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition

    try {
      recognition.start()
      setListening(true)
    } catch (error) {
      setListening(false)
      onError(`Unable to start voice input: ${error.message}`)
    }
  }, [listening, onError, onTranscript])

  return [listening, toggleListening]
}

function App() {
  const [scale, setScale] = useState(1)
  const [currentPage, setCurrentPage] = useState(() => window.location.hash.slice(1) || 'dashboard')
  const [dialog, setDialog] = useState(null)
  const [toast, setToast] = useState('')
  const [settings, setSettings] = useState(loadSettings)
  const [transactions, setTransactions] = useState(loadTransactions)
  const privacyMode = settings.privacyMode
  const openDialog = useCallback((title, body) => setDialog(title ? { title, body } : null), [])
  const showToast = useCallback((message) => setToast(message), [])
  const dismissToast = useCallback(() => setToast(''), [])

  useEffect(() => {
    try {
      window.localStorage.setItem('altura-preferences', JSON.stringify(settings))
    } catch (error) {
      console.error('Unable to save ArthoPulse preferences', error)
    }
  }, [settings])

  useEffect(() => {
    try {
      window.localStorage.setItem('arthopulse-transactions', JSON.stringify(transactions))
    } catch (error) {
      console.error('Unable to save ArthoPulse transactions', error)
    }
  }, [transactions])

  const saveSettings = (nextSettings) => {
    setSettings(nextSettings)
    showToast(nextSettings.privacyMode ? 'Privacy mode enabled' : 'Preferences saved')
    setDialog(null)
  }

  const openAddTransaction = () => openDialog('Add transaction', <AddTransactionForm onCancel={() => openDialog(null)} onSave={(transaction) => {
    setTransactions((items) => [transaction, ...items])
    openDialog(null)
    showToast('Transaction added')
  }} />)

  useEffect(() => {
    const updateScale = () => setScale(Math.min(1, window.innerWidth / 1460, window.innerHeight / 962))
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  useEffect(() => {
    const updatePage = () => {
      const hashPage = window.location.hash.slice(1)
      setCurrentPage(navigationItems.some(({ id }) => id === hashPage) ? hashPage : 'dashboard')
    }
    window.addEventListener('hashchange', updatePage)
    return () => window.removeEventListener('hashchange', updatePage)
  }, [])

  return (
    <main className="viewport">
      <div className="scaled-stage" style={{ width: 1460 * scale, height: 962 * scale }}>
        <div className={`dashboard ${privacyMode ? 'privacy-mode' : ''}`} style={{ transform: `scale(${scale})` }}>
          <Header currentPage={currentPage} settings={settings} onOpenDialog={openDialog} onToast={showToast} onSaveSettings={saveSettings} />
          {currentPage === 'reports' ? <ReportsPage onOpenDialog={openDialog} onToast={showToast} /> : currentPage === 'transactions' ? <TransactionsPage transactions={transactions} onOpenDialog={openDialog} onToast={showToast} /> : currentPage === 'assistant' ? <AssistantPage onOpenDialog={openDialog} onToast={showToast} /> : (
            <div className="dashboard-grid" id="dashboard">
              <div className="left-column">
                <IncomeChart onToast={showToast} />
                <div className="lower-grid">
                  <TransactionsCard transactions={transactions.slice(0, 3)} onOpenDialog={openDialog} onToast={showToast} onAddTransaction={openAddTransaction} />
                  <BudgetCard onOpenDialog={openDialog} />
                </div>
              </div>
              <aside className="right-column" aria-label="Financial overview">
                <MetricCard kind="savings" title="Monthly Savings" value="$5,240" change="+8.4%" positive fill={60} onOpenDialog={openDialog} />
                <MetricCard kind="expenses" title="Monthly Expenses" value="$3,790" change="-12.6%" fill={40} onOpenDialog={openDialog} />
                <AssistantCard />
              </aside>
            </div>
          )}
          <InteractionDialog dialog={dialog} onClose={() => setDialog(null)} />
          <Toast message={toast} onDismiss={dismissToast} />
        </div>
      </div>
    </main>
  )
}

export default App
