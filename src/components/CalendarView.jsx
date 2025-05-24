import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  addMonths, 
  subMonths,
  isToday,
  parseISO
} from 'date-fns'
import ApperIcon from './ApperIcon'

const CalendarView = () => {
  const [tasks, setTasks] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [calendarIntegration, setCalendarIntegration] = useState({
    google: false,
    outlook: false
  })

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
  }, [tasks])

  // Simulate external calendar events
  useEffect(() => {
    const mockEvents = [
      {
        id: 'event-1',
        title: 'Team Meeting',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:00',
        type: 'google',
        description: 'Weekly team sync meeting'
      },
      {
        id: 'event-2',
        title: 'Client Call',
        date: format(addMonths(new Date(), 0), 'yyyy-MM-dd'),
        time: '14:30',
        type: 'outlook',
        description: 'Project discussion with client'
      }
    ]
    setCalendarEvents(mockEvents)
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500 border-red-600'
      case 'medium': return 'bg-yellow-500 border-yellow-600'
      case 'low': return 'bg-blue-500 border-blue-600'
      default: return 'bg-surface-500 border-surface-600'
    }
  }

  const getStatusColor = (status, completed) => {
    if (completed) return 'bg-green-500 border-green-600'
    switch (status) {
      case 'in-progress': return 'bg-orange-500 border-orange-600'
      case 'pending': return 'bg-gray-500 border-gray-600'
      default: return 'bg-surface-500 border-surface-600'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'work': return 'bg-purple-500 border-purple-600'
      case 'personal': return 'bg-pink-500 border-pink-600'
      case 'health': return 'bg-emerald-500 border-emerald-600'
      case 'learning': return 'bg-indigo-500 border-indigo-600'
      default: return 'bg-surface-500 border-surface-600'
    }
  }

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      return isSameDay(parseISO(task.dueDate), date)
    })
  }

  const getEventsForDate = (date) => {
    return calendarEvents.filter(event => {
      return isSameDay(parseISO(event.date), date)
    })
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, date) => {
    e.preventDefault()
    if (draggedTask) {
      const newDueDate = format(date, 'yyyy-MM-dd')
      setTasks(tasks.map(task => 
        task.id === draggedTask.id 
          ? { ...task, dueDate: newDueDate }
          : task
      ))
      toast.success(`Task "${draggedTask.title}" rescheduled to ${format(date, 'MMM dd')}`)
      setDraggedTask(null)
    }
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setShowEventModal(true)
  }

  const toggleTaskComplete = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updated = { ...task, completed: !task.completed, status: !task.completed ? 'completed' : 'pending' }
        toast.success(updated.completed ? 'Task completed! 🎉' : 'Task marked as pending')
        return updated
      }
      return task
    }))
  }

  const connectGoogleCalendar = () => {
    // Simulate Google Calendar integration
    setCalendarIntegration(prev => ({ ...prev, google: !prev.google }))
    toast.success(calendarIntegration.google ? 'Google Calendar disconnected' : 'Google Calendar connected!')
  }

  const connectOutlookCalendar = () => {
    // Simulate Outlook Calendar integration
    setCalendarIntegration(prev => ({ ...prev, outlook: !prev.outlook }))
    toast.success(calendarIntegration.outlook ? 'Outlook Calendar disconnected' : 'Outlook Calendar connected!')
  }

  const navigateMonth = (direction) => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-surface-200/20 dark:border-surface-700/30 shadow-soft">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="neu-button p-3 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <ApperIcon name="ArrowLeft" className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-surface-800 dark:text-surface-200">
                  Calendar View
                </h1>
                <p className="text-surface-600 dark:text-surface-400">
                  Visualize and manage your tasks on a calendar
                </p>
              </div>
            </div>
            
            {/* Calendar Integration */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={connectGoogleCalendar}
                className={`neu-button px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  calendarIntegration.google 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                    : 'text-surface-700 dark:text-surface-300 hover:scale-105'
                }`}
              >
                <ApperIcon name="Calendar" className="w-4 h-4" />
                <span>Google {calendarIntegration.google ? '✓' : ''}</span>
              </button>
              <button
                onClick={connectOutlookCalendar}
                className={`neu-button px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  calendarIntegration.outlook 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                    : 'text-surface-700 dark:text-surface-300 hover:scale-105'
                }`}
              >
                <ApperIcon name="Mail" className="w-4 h-4" />
                <span>Outlook {calendarIntegration.outlook ? '✓' : ''}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-4 border border-surface-200/20 dark:border-surface-700/30 shadow-soft">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="neu-button p-3 rounded-xl hover:scale-105 transition-all duration-300"
            >
              <ApperIcon name="ChevronLeft" className="w-5 h-5 text-surface-600 dark:text-surface-400" />
            </button>
            
            <h2 className="text-xl sm:text-2xl font-bold text-surface-800 dark:text-surface-200">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="neu-button p-3 rounded-xl hover:scale-105 transition-all duration-300"
            >
              <ApperIcon name="ChevronRight" className="w-5 h-5 text-surface-600 dark:text-surface-400" />
            </button>
          </div>
        </div>

        {/* Color Legend */}
        <div className="glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-4 border border-surface-200/20 dark:border-surface-700/30 shadow-soft">
          <h3 className="text-sm font-medium text-surface-800 dark:text-surface-200 mb-3">Color Legend</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-2">
              <h4 className="font-medium text-surface-700 dark:text-surface-300">Priority</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-surface-600 dark:text-surface-400">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span className="text-surface-600 dark:text-surface-400">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-surface-600 dark:text-surface-400">Low</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-surface-700 dark:text-surface-300">Status</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-surface-600 dark:text-surface-400">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-surface-600 dark:text-surface-400">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-500"></div>
                <span className="text-surface-600 dark:text-surface-400">Pending</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-surface-700 dark:text-surface-300">Category</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-surface-600 dark:text-surface-400">Work</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-pink-500"></div>
                <span className="text-surface-600 dark:text-surface-400">Personal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500"></div>
                <span className="text-surface-600 dark:text-surface-400">Health</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-surface-700 dark:text-surface-300">External Events</h4>
              <div className="flex items-center gap-2">
                <ApperIcon name="Calendar" className="w-3 h-3 text-blue-500" />
                <span className="text-surface-600 dark:text-surface-400">Google</span>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon name="Mail" className="w-3 h-3 text-blue-600" />
                <span className="text-surface-600 dark:text-surface-400">Outlook</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-surface-200/20 dark:border-surface-700/30 shadow-soft">
          {/* Days of Week Header */}
          <div className="calendar-grid grid grid-cols-7 gap-1 sm:gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-surface-600 dark:text-surface-400 text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="calendar-grid grid grid-cols-7 gap-1 sm:gap-2">
            {dateRange.map(date => {
              const dayTasks = getTasksForDate(date)
              const dayEvents = getEventsForDate(date)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isCurrentDay = isToday(date)

              return (
                <motion.div
                  key={date.toISOString()}
                  className={`calendar-day min-h-24 sm:min-h-32 p-1 sm:p-2 border rounded-lg transition-all duration-300 cursor-pointer ${
                    isCurrentMonth 
                      ? 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700' 
                      : 'bg-surface-50 dark:bg-surface-900 border-surface-100 dark:border-surface-800 opacity-50'
                  } ${isCurrentDay ? 'ring-2 ring-primary' : ''} hover:bg-surface-50 dark:hover:bg-surface-750`}
                  onClick={() => setSelectedDate(date)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`text-xs sm:text-sm font-medium mb-1 ${
                    isCurrentDay 
                      ? 'text-primary font-bold' 
                      : isCurrentMonth 
                        ? 'text-surface-800 dark:text-surface-200' 
                        : 'text-surface-400 dark:text-surface-600'
                  }`}>
                    {format(date, 'd')}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <motion.div
                        key={task.id}
                        className={`task-item text-xs p-1 rounded border-l-2 cursor-move ${getPriorityColor(task.priority)} text-white`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTaskClick(task)
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileDrag={{ scale: 1.1, rotate: 5 }}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleTaskComplete(task.id)
                            }}
                            className={`w-3 h-3 rounded border ${
                              task.completed 
                                ? 'bg-white text-green-600' 
                                : 'border-white/50 hover:border-white'
                            }`}
                          >
                            {task.completed && <ApperIcon name="Check" className="w-2 h-2" />}
                          </button>
                          <span className={`truncate ${task.completed ? 'line-through opacity-70' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* External Calendar Events */}
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded border-l-2 ${
                          event.type === 'google' 
                            ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-200' 
                            : 'bg-blue-200 dark:bg-blue-800 border-blue-600 text-blue-900 dark:text-blue-100'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <ApperIcon 
                            name={event.type === 'google' ? "Calendar" : "Mail"} 
                            className="w-2 h-2" 
                          />
                          <span className="truncate">{event.title}</span>
                        </div>
                        {event.time && (
                          <div className="text-xs opacity-70">{event.time}</div>
                        )}
                      </div>
                    ))}
                    
                    {/* Show more indicator */}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-surface-500 dark:text-surface-400 font-medium">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Task Detail Modal */}
        <AnimatePresence>
          {showEventModal && selectedTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowEventModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-morphism dark:bg-surface-800 backdrop-blur-xl rounded-2xl p-6 border border-surface-200/20 dark:border-surface-700/30 shadow-soft max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-surface-800 dark:text-surface-200">
                    Task Details
                  </h3>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="neu-button p-2 rounded-lg hover:scale-105 transition-all duration-300"
                  >
                    <ApperIcon name="X" className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-surface-800 dark:text-surface-200 mb-1">
                      {selectedTask.title}
                    </h4>
                    {selectedTask.description && (
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        {selectedTask.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded ${getPriorityColor(selectedTask.priority)} text-white`}>
                      {selectedTask.priority} priority
                    </span>
                    <span className={`px-2 py-1 rounded ${getCategoryColor(selectedTask.category)} text-white`}>
                      {selectedTask.category}
                    </span>
                  </div>
                  
                  {selectedTask.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <ApperIcon name="Calendar" className="w-4 h-4" />
                      <span>Due: {format(parseISO(selectedTask.dueDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-4">
                    <button
                      onClick={() => {
                        toggleTaskComplete(selectedTask.id)
                        setShowEventModal(false)
                      }}
                      className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        selectedTask.completed
                          ? 'bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300'
                          : 'bg-gradient-to-r from-accent to-green-600 text-white hover:scale-105'
                      }`}
                    >
                      {selectedTask.completed ? 'Mark Pending' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CalendarView