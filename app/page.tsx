'use client';

import { useState, useEffect } from 'react';
import { Github, Volume2, VolumeX } from 'lucide-react';

interface Preset {
  work: number;
  break: number;
}

export default function PomodoroApp() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [progress, setProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const presets: Preset[] = [
    { work: 15, break: 5 },
    { work: 25, break: 5 },
    { work: 45, break: 15 }
  ];

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    const saved = localStorage.getItem('pomodoroState');
    if (saved) {
      const state = JSON.parse(saved);
      setCustomWorkTime(state.workTime);
      setCustomBreakTime(state.breakTime);
      setSessionsCompleted(state.sessions);
      setSoundEnabled(state.sound);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pomodoroState', JSON.stringify({
      workTime: customWorkTime,
      breakTime: customBreakTime,
      sessions: sessionsCompleted,
      sound: soundEnabled
    }));
  }, [customWorkTime, customBreakTime, sessionsCompleted, soundEnabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          setProgress(((customWorkTime * 60 - newTime) / (customWorkTime * 60)) * 100);
          if (newTime <= 0) handleComplete();
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, customWorkTime]);

  const toggleShake = () => {
    setIsShaking(!isShaking);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playNotification = () => {
    if (soundEnabled) {
      const audio = new Audio('/notif.webm');
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleComplete = () => {
    setIsRunning(false);
    if (isBreak) {
      setSessionsCompleted(prev => prev + 1);
    }
    setIsBreak(!isBreak);
    setTimeLeft(isBreak ? customBreakTime * 60 : customWorkTime * 60);
    playNotification();
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const updateCustomTime = (type: 'work' | 'break', value: number) => {
    if (type === 'work') {
      setCustomWorkTime(value);
      if (!isBreak && !isRunning) {
        setTimeLeft(value * 60);
      }
    } else {
      setCustomBreakTime(value);
      if (isBreak && !isRunning) {
        setTimeLeft(value * 60);
      }
    }
  };

  const setPreset = (preset: Preset) => {
    setCustomWorkTime(preset.work);
    setCustomBreakTime(preset.break);
    
    if (!isRunning) {
      setTimeLeft(isBreak ? preset.break * 60 : preset.work * 60);
      setProgress(0);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customWorkTime * 60);
    setProgress(0);
    setIsBreak(false);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <main className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 
                       dark:text-white transition-colors duration-300 px-4 py-8 
                       md:p-8 ${isShaking ? 'earthquake' : 'stop-earthquake'}`}>
         <a 
          href="https://github.com/01000001BDO" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed top-4 right-16 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:scale-110 
                   transition-transform duration-200 flex items-center justify-center"
        >
          <Github className="w-6 h-6 text-gray-900 dark:text-white" />
        </a>

        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-4 md:p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 opacity-80 hover:opacity-100 transition-opacity"
              >
                {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </button>
              <button 
                onClick={toggleTheme}
                className="text-2xl opacity-80 hover:opacity-100 transition-opacity p-2"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sessions Completed: {sessionsCompleted}
            </p>
          </div>

          <div className="text-center mb-8">
            <div className="font-mono text-5xl md:text-7xl mb-4" 
                 style={{ fontFamily: "'Space Mono', monospace" }}>
              {formatTime(timeLeft)}
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => setPreset(preset)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {preset.work}/{preset.break}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="text-center">
              <label className="block mb-2" htmlFor="workTime">
                Work (min)
              </label>
              <input
                id="workTime"
                type="number"
                value={customWorkTime}
                onChange={(e) => updateCustomTime('work', parseInt(e.target.value) || 1)}
                min="1"
                max="60"
                className="w-20 p-2 text-center border border-gray-300 dark:border-gray-600 rounded 
                         bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-center">
              <label className="block mb-2" htmlFor="breakTime">
                Break (min)
              </label>
              <input
                id="breakTime"
                type="number"
                value={customBreakTime}
                onChange={(e) => updateCustomTime('break', parseInt(e.target.value) || 1)}
                min="1"
                max="30"
                className="w-20 p-2 text-center border border-gray-300 dark:border-gray-600 rounded 
                         bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3 rounded font-semibold transition-colors ${
                isRunning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>

            <button
              onClick={resetTimer}
              className="px-8 py-3 bg-gray-500 text-white rounded font-semibold 
                      hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            
            {isBreak && (
              <button
                onClick={() => setIsBreak(false)}
                className="px-8 py-3 bg-yellow-500 text-black rounded font-semibold 
                         hover:bg-yellow-600 transition-colors"
              >
                Skip Break
              </button>
            )}
          </div>
        </div>

        <button
          onClick={toggleShake}
          className={`px-6 py-3 ${isShaking ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'}
                    text-white rounded-full transition-colors fixed bottom-4 right-4 
                    shadow-lg hover:scale-105 active:scale-95 transform duration-200 
                    font-semibold flex items-center gap-2 z-50`}
        >
          🌋 {isShaking ? ':v' : 'CLICK ME '}
        </button>
      </main>
    </div>
  );
}