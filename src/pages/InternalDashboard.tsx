import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Monitor, Server, Globe, Shield, Users, Database, Cpu, Zap, Lock, CheckCircle, AlertCircle, Activity, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedPage } from '@/components/animations/AnimatedPage';

const InternalDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [stats, setStats] = useState({
    uptime: '99.9%',
    totalUsers: '1,247',
    activeUsers: '342',
    totalServers: '48',
    activeServers: '45',
    databaseConnections: '127',
    apiRequests: '45,234',
    errorRate: '0.02%',
    serverLoad: '67%',
    memoryUsage: '8.2GB',
    diskUsage: '124.7GB',
    networkIn: '2.3GB/s',
    networkOut: '1.8GB/s'
  });

  useEffect(() => {
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-gray-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
    }
  }, [darkMode]);

  return (
    <AnimatedPage>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>KSFOUNDATION Internal</h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>System Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* System Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="h-5 w-5 mr-2 text-green-500" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Overall Status</span>
                      <span className="flex items-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Healthy
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Uptime</span>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.uptime}</p>
                      </div>
                      <div>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Last 24h</span>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>99.95%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* User Statistics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Users</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Now</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.activeUsers}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>New Today</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>+12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Server Statistics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2 text-purple-500" />
                    Server Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Servers</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalServers}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Running</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.activeServers}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Load Average</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.serverLoad}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Database Statistics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-green-500" />
                    Database Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Connections</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.databaseConnections}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Memory Usage</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.memoryUsage}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Disk Usage</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.diskUsage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Network Statistics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-cyan-500" />
                    Network Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Network In</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.networkIn}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Network Out</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.networkOut}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* API Statistics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    API Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Requests</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.apiRequests}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Error Rate</span>
                      <p className={`font-semibold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.errorRate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6"
          >
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-orange-500" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Cpu className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>CPU</p>
                    <div className={`w-full bg-gray-200 rounded-full h-2 ${darkMode ? 'bg-gray-700' : ''}`}>
                      <div className={`h-2 bg-blue-500 rounded-full`} style={{ width: '67%' }}></div>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>67% Usage</p>
                  </div>
                  
                  <div className="text-center">
                    <Shield className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Security</p>
                    <div className={`w-full bg-gray-200 rounded-full h-2 ${darkMode ? 'bg-gray-700' : ''}`}>
                      <div className={`h-2 bg-green-500 rounded-full`} style={{ width: '98%' }}></div>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>98% Protected</p>
                  </div>
                  
                  <div className="text-center">
                    <Database className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Database</p>
                    <div className={`w-full bg-gray-200 rounded-full h-2 ${darkMode ? 'bg-gray-700' : ''}`}>
                      <div className={`h-2 bg-purple-500 rounded-full`} style={{ width: '82%' }}></div>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>82% Efficient</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} mt-8`}>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                KSFOUNDATION Internal Dashboard v1.0.0
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AnimatedPage>
  );
};

export default InternalDashboard;
