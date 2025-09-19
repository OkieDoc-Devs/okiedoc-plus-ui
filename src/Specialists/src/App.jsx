import React from 'react';
import './App.css';
import SpecialistAuth from '../pages/SpecialistAuth.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const [view, setView] = React.useState('registration');

  // Check if user is already logged in
  React.useEffect(() => {
    const sessionActive = localStorage.getItem('sessionActive') === '1';
    const email = localStorage.getItem('currentUserEmail');
    if (sessionActive && email && localStorage.getItem(email)) {
      setView('dashboard');
    } else {
      if (!sessionActive) localStorage.removeItem('currentUserEmail');
      setView('registration');
    }
  }, []);

  const navigateTo = React.useCallback((next) => {
    setView(next);
  }, []);

  React.useEffect(() => {
    const onStorage = () => {
      const sessionActive = localStorage.getItem('sessionActive') === '1';
      const email = localStorage.getItem('currentUserEmail');
      if (!sessionActive || !email) { setView('registration'); return; }
      const userRaw = localStorage.getItem(email);
      if (!userRaw) {
        localStorage.removeItem('currentUserEmail');
        localStorage.removeItem('sessionActive');
        setView('registration');
        return;
      }
      setView('dashboard');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="App">
      {view === 'registration' ? (
        <SpecialistAuth />
      ) : (
        <Dashboard navigateTo={navigateTo} />
      )}
    </div>
  );
}

export default App;
