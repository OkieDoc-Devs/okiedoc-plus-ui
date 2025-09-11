import React from 'react';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [view, setView] = React.useState('login');

  // Determine initial view on mount only (avoid reading localStorage during SSR or constructor)
  React.useEffect(() => {
    const sessionActive = localStorage.getItem('sessionActive') === '1';
    const email = localStorage.getItem('currentUserEmail');
    if (sessionActive && email && localStorage.getItem(email)) {
      setView('dashboard');
    } else {
      if (!sessionActive) localStorage.removeItem('currentUserEmail');
      setView('login');
    }
  }, []);

  const navigateTo = React.useCallback((next) => {
    setView(next);
  }, []);

  React.useEffect(() => {
    const onStorage = () => {
      const sessionActive = localStorage.getItem('sessionActive') === '1';
      const email = localStorage.getItem('currentUserEmail');
      if (!sessionActive || !email) { setView('login'); return; }
      const userRaw = localStorage.getItem(email);
      if (!userRaw) {
        localStorage.removeItem('currentUserEmail');
        localStorage.removeItem('sessionActive');
        setView('login');
        return;
      }
      setView('dashboard');
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
