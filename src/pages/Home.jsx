import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

const Home = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-surface-100 dark:from-surface-900 dark:via-surface-800 dark:to-surface-700 transition-colors duration-500">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-morphism dark:bg-surface-800/30 backdrop-blur-xl border-b border-surface-200/20 dark:border-surface-700/30 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-soft">
                <ApperIcon name="CheckSquare" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  TaskFlow
                </h1>
                <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400">
                  Efficient Task Management
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-center">
                <div className="text-lg font-semibold text-surface-800 dark:text-surface-200">
                  {formatTime(currentTime)}
                </div>
                <div className="text-xs text-surface-600 dark:text-surface-400">
                  {formatDate(currentTime)}
                </div>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className="neu-button p-3 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <ApperIcon 
                  name={darkMode ? "Sun" : "Moon"} 
                  className="w-5 h-5 text-surface-700 dark:text-surface-300" 
                />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar - Welcome Section */}
          <motion.aside 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-6 border border-surface-200/20 dark:border-surface-700/30 shadow-soft">
              <div className="text-center lg:text-left">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto lg:mx-0 mb-4 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center shadow-soft">
                  <ApperIcon name="Target" className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-surface-800 dark:text-surface-200 mb-2">
                  Welcome Back!
                </h2>
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
                  Stay organized and boost your productivity with TaskFlow's intuitive task management system.
                </p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/50 dark:bg-surface-700/50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-primary">12</div>
                    <div className="text-xs text-surface-600 dark:text-surface-400">Active</div>
                  </div>
                  <div className="bg-white/50 dark:bg-surface-700/50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-accent">8</div>
                    <div className="text-xs text-surface-600 dark:text-surface-400">Complete</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Time Display */}
            <div className="md:hidden mt-4 glass-morphism dark:bg-surface-800/30 backdrop-blur-xl rounded-2xl p-4 border border-surface-200/20 dark:border-surface-700/30 text-center">
              <div className="text-lg font-semibold text-surface-800 dark:text-surface-200">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-surface-600 dark:text-surface-400">
                {formatDate(currentTime)}
              </div>
            </div>
          </motion.aside>

          {/* Main Task Management Area */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            <MainFeature />
          </motion.section>
        </div>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-24 h-24 sm:w-48 sm:h-48 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}

export default Home