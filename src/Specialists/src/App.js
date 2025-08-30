import React from 'react';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [view, setView] = React.useState(() => {
    return localStorage.getItem('currentUserEmail') ? 'dashboard' : 'login';
  });

  const navigateTo = React.useCallback((next) => {
    setView(next);
  }, []);

  React.useEffect(() => {
    const onStorage = () => {
      setView(localStorage.getItem('currentUserEmail') ? 'dashboard' : 'login');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="App">
      {view === 'login' ? (
        <Login navigateTo={navigateTo} />
      ) : (
        <Dashboard navigateTo={navigateTo} />
      )}
    </div>
  );
}

export default App;
