import axios from 'axios';
import './App.css'
import AppRouter from './router';

axios.interceptors.request.use(function (config) {
    config.headers.Authorization = `Bearer ${localStorage.getItem("authtoken")}`; 
    return config;
});

function App() {
  return (
    <>
      <AppRouter />
    </>
  )
}

export default App
