import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'personal'
  })
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
  }, [tasks])

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      category: 'personal'
    })
    setEditingTask(null)
    setShowForm(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!newTask.title.trim()) {
      toast.error('Task title is required!')
      return
    }

    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask ? { ...newTask, id: editingTask } : task
      ))
      toast.success('Task updated successfully!')
    } else {
      // Create new task
      const task = {
        ...newTask,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        completed: false
      }
      setTasks([task, ...tasks])
      toast.success('Task created successfully!')
    }
    
    resetForm()
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

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
    toast.success('Task deleted successfully')
  }

  const startEdit = (task) => {
    setNewTask(task)
    setEditingTask(task.id)
    setShowForm(true)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600'
      case 'medium': return 'from-yellow-500 to-orange-500'
      case 'low': return 'from-blue-500 to-cyan-500'
      default: return 'from-surface-500 to-surface-600'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return 'Briefcase'
      case 'personal': return 'User'
      case 'health': return 'Heart'
      case 'learning': return 'BookOpen'
      default: return 'Tag'
    }
  }

  const getDateDisplay = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM dd')
  }

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending': return !task.completed
      case 'completed': return task.completed
      case 'overdue': return !task.completed && task.dueDate && isPast(new Date(task.dueDate))
      default: return true
    }
  })

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.dueDate && isPast(new Date(t.dueDate))).length
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-surface-200/20 dark:border-surface-700/30 shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-surface-800 dark:text-surface-200 mb-1">
              Task Management Hub
            </h2>
            <p className="text-sm text-surface-600 dark:text-surface-400">
              Organize, prioritize, and track your daily tasks
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto neu-button px-4 sm:px-6 py-3 rounded-xl font-medium text-surface-700 dark:text-surface-300 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ApperIcon name={showForm ? "X" : "Plus"} className="w-5 h-5" />
            <span>{showForm ? "Cancel" : "New Task"}</span>
          </button>
        </div>
      </div>

      {/* Task Creation/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-surface-200/20 dark:border-surface-700/30 shadow-soft">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title..."
                      className="neu-input w-full px-4 py-3 rounded-xl text-surface-800 dark:text-surface-200 placeholder-surface-500 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Add task description..."
                      rows="3"
                      className="neu-input w-full px-4 py-3 rounded-xl text-surface-800 dark:text-surface-200 placeholder-surface-500 focus:outline-none transition-all duration-300 resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="neu-input w-full px-4 py-3 rounded-xl text-surface-800 dark:text-surface-200 focus:outline-none transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="neu-input w-full px-4 py-3 rounded-xl text-surface-800 dark:text-surface-200 focus:outline-none transition-all duration-300"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      className="neu-input w-full px-4 py-3 rounded-xl text-surface-800 dark:text-surface-200 focus:outline-none transition-all duration-300"
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="health">Health</option>
                      <option value="learning">Learning</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-medium shadow-soft hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ApperIcon name={editingTask ? "Save" : "Plus"} className="w-5 h-5" />
                    <span>{editingTask ? "Update Task" : "Create Task"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 sm:flex-initial neu-button px-6 py-3 rounded-xl font-medium text-surface-700 dark:text-surface-300 hover:scale-105 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-2 border border-surface-200/20 dark:border-surface-700/30 shadow-soft">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { key: 'all', label: 'All Tasks', icon: 'List' },
            { key: 'pending', label: 'Pending', icon: 'Clock' },
            { key: 'completed', label: 'Completed', icon: 'CheckCircle' },
            { key: 'overdue', label: 'Overdue', icon: 'AlertTriangle' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`p-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-soft'
                  : 'neu-button text-surface-700 dark:text-surface-300 hover:scale-105'
              }`}
            >
              <ApperIcon name={tab.icon} className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                {taskCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-surface-200/20 dark:border-surface-700/30 shadow-soft hover:shadow-lg transition-all duration-300 ${
                  task.completed ? 'opacity-70' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                      task.completed
                        ? 'bg-gradient-to-r from-accent to-green-600 border-accent'
                        : 'border-surface-300 dark:border-surface-600 hover:border-accent'
                    }`}
                  >
                    {task.completed && (
                      <ApperIcon name="Check" className="w-4 h-4 text-white" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className={`font-semibold text-surface-800 dark:text-surface-200 ${
                        task.completed ? 'line-through' : ''
                      }`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${getPriorityColor(task.priority)} text-white`}>
                          <ApperIcon name="Flag" className="w-3 h-3" />
                          {task.priority}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                          <ApperIcon name={getCategoryIcon(task.category)} className="w-3 h-3" />
                          {task.category}
                        </span>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">
                        {task.description}
                      </p>
                    )}
                    
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-500">
                        <ApperIcon name="Calendar" className="w-3 h-3" />
                        <span>{getDateDisplay(task.dueDate)}</span>
                        {!task.completed && isPast(new Date(task.dueDate)) && (
                          <span className="text-red-500 font-medium">(Overdue)</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => startEdit(task)}
                      className="flex-1 sm:flex-initial neu-button p-2 rounded-lg hover:scale-105 transition-all duration-300"
                    >
                      <ApperIcon name="Edit" className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-1 sm:flex-initial neu-button p-2 rounded-lg hover:scale-105 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-surface-200/20 dark:border-surface-700/30 shadow-soft text-center"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 bg-gradient-to-br from-surface-200 to-surface-300 dark:from-surface-700 dark:to-surface-600 rounded-2xl flex items-center justify-center">
                <ApperIcon name="CheckSquare" className="w-8 h-8 sm:w-12 sm:h-12 text-surface-500 dark:text-surface-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-surface-800 dark:text-surface-200 mb-2">
                No tasks found
              </h3>
              <p className="text-surface-600 dark:text-surface-400 text-sm sm:text-base">
                {filter === 'all' 
                  ? "Create your first task to get started!"
                  : `No ${filter} tasks at the moment.`
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MainFeature