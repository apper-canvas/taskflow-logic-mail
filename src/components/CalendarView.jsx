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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 dark:bg-surface-800/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 dark:border-surface-700/30 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="bg-gradient-to-r from-surface-100 to-surface-200 dark:from-surface-700 dark:to-surface-600 p-3 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ApperIcon name="ArrowLeft" className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              </Link>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Calendar View
                </h1>
                <p className="text-surface-600 dark:text-surface-400 text-lg">
                  Visualize and manage your tasks on a calendar
                </p>
              </div>
            </div>
            
            {/* Calendar Integration */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={connectGoogleCalendar}
                className={`px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl ${
                  calendarIntegration.google 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700' 
                    : 'bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:scale-105 border border-surface-200 dark:border-surface-600'
                }`}
              >
                <ApperIcon name="Calendar" className="w-4 h-4" />
                <span>Google {calendarIntegration.google ? '✓' : ''}</span>
              </button>
              <button
                onClick={connectOutlookCalendar}
                className={`px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl ${
                  calendarIntegration.outlook 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700' 
                    : 'bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:scale-105 border border-surface-200 dark:border-surface-600'
                }`}
              >
                <ApperIcon name="Mail" className="w-4 h-4" />
                <span>Outlook {calendarIntegration.outlook ? '✓' : ''}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white/80 dark:bg-surface-800/90 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-surface-700/30 shadow-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20 p-4 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-primary/20"
            >
              <ApperIcon name="ChevronLeft" className="w-6 h-6 text-primary dark:text-primary-light" />
            </button>
            
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-surface-800 to-surface-600 dark:from-surface-100 dark:to-surface-300 bg-clip-text text-transparent">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20 p-4 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-primary/20"
            >
              <ApperIcon name="ChevronRight" className="w-6 h-6 text-primary dark:text-primary-light" />
            </button>
          </div>
        </div>

        {/* Color Legend */}
        <div className="bg-white/80 dark:bg-surface-800/90 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-surface-700/30 shadow-xl">
          <h3 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-4">Color Legend</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-surface-700 dark:text-surface-300 mb-3">Priority</h4>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-red-500 shadow-sm"></div>
                <span className="text-surface-600 dark:text-surface-400">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-yellow-500 shadow-sm"></div>
                <span className="text-surface-600 dark:text-surface-400">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-blue-500 shadow-sm"></div>
                <span className="text-surface-600 dark:text-surface-400">Low</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-surface-700 dark:text-surface-300 mb-3">Status</h4>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-green-500 shadow-sm"></div>
                <span className="text-surface-600 dark:text-surface-400">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-orange-500 shadow-sm"></div>
                <span className="text-surface-600 dark:text-surface-400">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-gray-500 shadow-sm"></div>
                <span className="text-surface-600 dark:text-surface-400">Pending</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-surface-700 dark:text-surface-300 mb-3">Category</h4>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-purple-500 shadow-sm"></div>
                <span className="text-surface-600 dark:text-surface-400">Work</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-pink-500 shadow-sm"></div>
                <span className="text-surface-600 dark:text-surface-400">Personal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-emerald-500 shadow-sm"></div>
                <span className="text-surface-600 dark:text-surface-400">Health</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-surface-700 dark:text-surface-300 mb-3">External Events</h4>
              <div className="flex items-center gap-2">
                <ApperIcon name="Calendar" className="w-4 h-4 text-blue-500" />
                <span className="text-surface-600 dark:text-surface-400">Google</span>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon name="Mail" className="w-4 h-4 text-indigo-600" />
                <span className="text-surface-600 dark:text-surface-400">Outlook</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white/80 dark:bg-surface-800/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 dark:border-surface-700/30 shadow-xl">
          {/* Days of Week Header */}
          <div className="calendar-grid grid grid-cols-7 gap-2 sm:gap-3 mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-surface-700 dark:text-surface-300 text-sm bg-surface-50 dark:bg-surface-700 rounded-xl">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="calendar-grid grid grid-cols-7 gap-2 sm:gap-3">
            {dateRange.map(date => {
              const dayTasks = getTasksForDate(date)
              const dayEvents = getEventsForDate(date)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isCurrentDay = isToday(date)

              return (
                <motion.div
                  key={date.toISOString()}
                  className={`calendar-day min-h-28 sm:min-h-36 p-2 sm:p-3 border-2 rounded-2xl transition-all duration-300 cursor-pointer ${
                    isCurrentMonth 
                      ? 'bg-gradient-to-br from-white to-surface-50 dark:from-surface-800 dark:to-surface-750 border-surface-200 dark:border-surface-600' 
                      : 'bg-surface-50 dark:bg-surface-900 border-surface-100 dark:border-surface-800 opacity-60'
                  } ${isCurrentDay ? 'ring-2 ring-primary shadow-lg border-primary/30' : ''} hover:shadow-lg hover:scale-[1.02] dark:hover:bg-surface-750`}
                  onClick={() => setSelectedDate(date)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`text-sm sm:text-base font-bold mb-2 ${
                    isCurrentDay 
                      ? 'text-primary' 
                      : isCurrentMonth 
                        ? 'text-surface-800 dark:text-surface-200' 
                        : 'text-surface-400 dark:text-surface-600'
                  }`}>
                    {format(date, 'd')}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1.5">
                    {dayTasks.slice(0, 2).map(task => (
                      <motion.div
                        key={task.id}
                        className={`task-item text-xs p-2 rounded-lg border-l-4 cursor-move ${getPriorityColor(task.priority)} text-white shadow-md hover:shadow-lg`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTaskClick(task)
                        }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileDrag={{ scale: 1.1, rotate: 5 }}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleTaskComplete(task.id)
                            }}
                            className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                              task.completed 
                                ? 'bg-white text-green-600 shadow-sm' 
                                : 'border-white/60 hover:border-white hover:bg-white/10'
                            }`}
                          >
                            {task.completed && <ApperIcon name="Check" className="w-3 h-3" />}
                          </button>
                          <span className={`truncate font-medium ${task.completed ? 'line-through opacity-75' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* External Calendar Events */}
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-2 rounded-lg border-l-4 shadow-sm ${
                          event.type === 'google' 
                            ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-400 text-blue-700 dark:text-blue-200' 
                            : 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-700 dark:text-indigo-200'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <ApperIcon 
                            name={event.type === 'google' ? "Calendar" : "Mail"} 
                            className="w-2 h-2" 
                          />
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                        {event.time && (
                          <div className="text-xs opacity-80 font-medium">{event.time}</div>
                        )}
                      </div>
                    ))}
                    
                    {/* Show more indicator */}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-surface-600 dark:text-surface-400 font-semibold bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-lg text-center">
                        +{dayTasks.length - 2} more
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
                className="bg-white/95 dark:bg-surface-800/95 backdrop-blur-xl rounded-3xl p-8 border border-white/30 dark:border-surface-700/30 shadow-2xl max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-surface-800 dark:text-surface-200">
                    Task Details
                  </h3>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 p-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-md"
                  >
                    <ApperIcon name="X" className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-lg text-surface-800 dark:text-surface-200 mb-2">
                      {selectedTask.title}
                    </h4>
                    {selectedTask.description && (
                      <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
                        {selectedTask.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <span className={`px-3 py-2 rounded-xl font-semibold ${getPriorityColor(selectedTask.priority)} text-white shadow-md`}>
                      {selectedTask.priority} priority
                    </span>
                    <span className={`px-3 py-2 rounded-xl font-semibold ${getCategoryColor(selectedTask.category)} text-white shadow-md`}>
                      {selectedTask.category}
                    </span>
                  </div>
                  
                  {selectedTask.dueDate && (
                    <div className="flex items-center gap-3 text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-700 p-3 rounded-xl">
                      <ApperIcon name="Calendar" className="w-5 h-5 text-primary" />
                      <span className="font-medium">Due: {format(parseISO(selectedTask.dueDate), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        toggleTaskComplete(selectedTask.id)
                        setShowEventModal(false)
                      }}
                      className={`flex-1 px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                        selectedTask.completed
                          ? 'bg-gradient-to-r from-surface-200 to-surface-300 dark:from-surface-700 dark:to-surface-600 text-surface-700 dark:text-surface-300 hover:scale-105'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 hover:from-green-600 hover:to-emerald-700'
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