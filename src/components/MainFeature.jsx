import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  const [parentTaskId, setParentTaskId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState('list')

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
    setParentTaskId(null)
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
        parentId: parentTaskId,
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

  const addSubtask = (parentId) => {
    setParentTaskId(parentId)
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      category: 'personal'
    })
    setEditingTask(null)
    setShowForm(true)
  }

  const getSubtasks = (parentId) => {
    return tasks.filter(task => task.parentId === parentId)
  }

  const getMainTasks = () => {
    return tasks.filter(task => !task.parentId)
  }

  const deleteTaskWithSubtasks = (taskId) => {
    const confirmDelete = window.confirm(
      'This will delete the task and all its subtasks. Are you sure?'
    )
    if (confirmDelete) {
      const taskToDelete = tasks.find(t => t.id === taskId)
      const subtasks = getSubtasks(taskId)
      
      // Delete the task and all its subtasks
      const tasksToRemove = [taskId, ...subtasks.map(st => st.id)]
      setTasks(tasks.filter(task => !tasksToRemove.includes(task.id)))
      
      toast.success(`Task and ${subtasks.length} subtask(s) deleted successfully`)
    }
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

  const renderTaskWithSubtasks = (task, level = 0, index = 0) => {
    const subtasks = getSubtasks(task.id)
    const isFiltered = filteredTasks.includes(task)
    
    if (!isFiltered && level === 0) return null

    return (
      <div key={task.id}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-surface-200/20 dark:border-surface-700/30 shadow-soft hover:shadow-lg transition-all duration-300 ${
            task.completed ? 'opacity-70' : ''
          } ${level > 0 ? `ml-${Math.min(level * 8, 16)} border-l-4 border-primary/30` : ''}`}
          style={{ marginLeft: level > 2 ? `${level * 2}rem` : undefined }}
        >
          {level > 0 && (
            <div className="flex items-center gap-2 mb-2 text-xs text-surface-500 dark:text-surface-400">
              <div className="w-4 h-px bg-surface-300 dark:bg-surface-600"></div>
              <span>Subtask {level > 1 ? `(Level ${level})` : ''}</span>
            </div>
          )}
          
          {renderTaskContent(task, level)}
        </motion.div>
        
        {/* Render subtasks */}
        {subtasks.length > 0 && (
          <div className="mt-3 space-y-3">
            {subtasks.map((subtask, subIndex) => 
              renderTaskWithSubtasks(subtask, level + 1, subIndex)
            )}
          </div>
        )}
      </div>
    )
  }

  const renderTaskContent = (task, level = 0) => {
    const subtasks = getSubtasks(task.id)
    
  return (
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
              {subtasks.length > 0 && (
                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}
                </span>
              )}
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
          {level === 0 && (
            <button
              onClick={() => addSubtask(task.id)}
              className="flex-1 sm:flex-initial neu-button p-2 rounded-lg hover:scale-105 transition-all duration-300"
              title="Add Subtask"
            >
              <ApperIcon name="Plus" className="w-4 h-4 text-primary" />
            </button>
          )}
          <button
            onClick={() => startEdit(task)}
            className="flex-1 sm:flex-initial neu-button p-2 rounded-lg hover:scale-105 transition-all duration-300"
          >
            <ApperIcon name="Edit" className="w-4 h-4 text-surface-600 dark:text-surface-400" />
          </button>
          <button
            onClick={() => {
              const subtasks = getSubtasks(task.id)
              if (subtasks.length > 0) {
                deleteTaskWithSubtasks(task.id)
              } else {
                deleteTask(task.id)
              }
            }}
            className="flex-1 sm:flex-initial neu-button p-2 rounded-lg hover:scale-105 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <ApperIcon name="Trash2" className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    )
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
            {parentTaskId && (
              <p className="text-sm text-primary font-medium">
                Adding subtask to: {tasks.find(t => t.id === parentTaskId)?.title}
              </p>
            )}
            <p className="text-sm text-surface-600 dark:text-surface-400">
              Organize, prioritize, and track your daily tasks
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/calendar"
              className="neu-button px-4 sm:px-6 py-3 rounded-xl font-medium text-surface-700 dark:text-surface-300 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ApperIcon name="Calendar" className="w-5 h-5" />
              <span>Calendar View</span>
            </Link>
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="neu-button px-4 sm:px-6 py-3 rounded-xl font-medium text-surface-700 dark:text-surface-300 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ApperIcon name={viewMode === 'list' ? "Grid" : "List"} className="w-5 h-5" />
              <span>{viewMode === 'list' ? "Grid" : "List"}</span>
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="neu-button px-4 sm:px-6 py-3 rounded-xl font-medium text-surface-700 dark:text-surface-300 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ApperIcon name={showForm ? "X" : "Plus"} className="w-5 h-5" />
              <span>{showForm ? "Cancel" : parentTaskId ? "New Subtask" : "New Task"}</span>
            </button>
          </div>
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
                      {parentTaskId ? 'Subtask' : 'Task'} Title *
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
                    <span>{editingTask ? "Update Task" : parentTaskId ? "Create Subtask" : "Create Task"}</span>
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
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
        <AnimatePresence>
          {getMainTasks().filter(task => filteredTasks.includes(task)).length > 0 ? (
            getMainTasks()
              .filter(task => filteredTasks.includes(task))
              .map((task, index) => renderTaskWithSubtasks(task, 0, index))
          ) : filteredTasks.filter(task => task.parentId).length > 0 ? (
            // If no main tasks, check if there are subtasks that match the filter
            filteredTasks
              .filter(task => task.parentId)
              .map((task, index) => renderTaskWithSubtasks(task, 1, index))
          ) : (
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