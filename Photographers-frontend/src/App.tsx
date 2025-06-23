import axios from 'axios';
import { useEffect } from 'react';
import './App.css'
import AppRouter from './router';
import WebSocketService from './service/WebSocketService';

axios.interceptors.request.use(function (config) {
    config.headers.Authorization = `Bearer ${localStorage.getItem("authtoken")}`; 
    return config;
});

function App() {
  useEffect(() => {
    // Initialize WebSocket connection when app starts
    const wsService = WebSocketService.getInstance();
    wsService.connect();

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

  return (
    <>
      <AppRouter />
    </>
  )
}

export default App
