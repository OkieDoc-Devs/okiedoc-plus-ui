import React from 'react';

function Login({ navigateTo }) {
  const [isSignup, setIsSignup] = React.useState(false);

  React.useEffect(() => {
    // Preload dummy account on first visit
    if (!localStorage.getItem('pogi@gmail.com')) {
      localStorage.setItem(
        'pogi@gmail.com',
        JSON.stringify({ fName: 'Pogi', lName: 'User', password: '123' })
      );
      // console.log('Dummy credential added:', { email: 'pogi@gmail.com', password: '123' });
    }
    // If already logged in, go straight to dashboard
    const current = localStorage.getItem('currentUserEmail');
    if (current) {
      navigateTo('dashboard');
    }
  }, [navigateTo]);

  const loginRef = React.useRef({});
  const signupRef = React.useRef({});

  function handleLogin() {
    const email = (loginRef.current.email?.value || '').trim();
    const password = loginRef.current.password?.value || '';
    let user = localStorage.getItem(email);
    if (!user) {
      alert('No account found with this email.');
      return;
    }
    user = JSON.parse(user);
    if (user.password !== password) {
      alert('Invalid password.');
      return;
    }
    localStorage.setItem('currentUserEmail', email);
    alert('Welcome, Dr. ' + (user.fName || '') + ' ' + (user.lName || '') + ' 👋');
    navigateTo('dashboard');
  }

  function handleSignup() {
    const fName = (signupRef.current.fName?.value || '').trim();
    const lName = (signupRef.current.lName?.value || '').trim();
    const email = (signupRef.current.email?.value || '').trim().toLowerCase();
    const password = signupRef.current.password?.value || '';
    const confirm = signupRef.current.confirm?.value || '';

    if (!fName || !lName || !email || !password || !confirm) {
      alert('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email.');
      return;
    }
    if (password.length < 3) {
      alert('Password must be at least 3 characters.');
      return;
    }
    if (password !== confirm) {
      alert('Passwords do not match.');
      return;
    }
    if (localStorage.getItem(email)) {
      alert('An account with this email already exists.');
      return;
    }

    const user = { fName, lName, password };
    localStorage.setItem(email, JSON.stringify(user));
    localStorage.setItem('currentUserEmail', email);
    alert('Account created successfully! Redirecting to your dashboard...');
    navigateTo('dashboard');
  }

  return (
    <div>
      <style>{`
        :root {
          --primary: #4AA7ED;
          --secondary: #BFESF9;
          --navy: #0B5388;
          --accent: #0AADEF;
          --light-bg: #F5F0F0;
          --dark: #000000;
          --white: #FFFFFF;
          --offwhite: #FFFFFB;
          --gray: #7A7A7A;
          --light-gray: #E5E5E5;
          --success: #4CAF50;
          --warning: #FF9800;
          --danger: #F44336;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
        body { background: #BFE5F9; }
        .login-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-root .container { max-width:1200px !important; margin:0 auto; padding-left:16px; padding-right:16px; width:100%; display:flex; align-items:center; justify-content:center; }
        .login-container { background: var(--white); width: 420px; padding: 2rem; border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.12); animation: fadeIn 0.6s ease-in-out; }
        .form-title { font-size: 1.9rem; font-weight: 700; text-align: center; margin-bottom: 1.6rem; color: var(--navy); }
        .login-input-group { position: relative; margin: 1.5rem 0; }
        .login-input-group i { position: absolute; left: 12px; top: 13px; color: var(--accent); font-size: 1.1rem; }
        .login-input-group input { width: 100%; padding: 12px 12px 12px 42px; border: 1.5px solid #d0dce5; border-radius: 10px; font-size: 15px; background-color: var(--offwhite); }
        .btn { width: 100%; padding: 13px; font-size: 1rem; font-weight: 600; border-radius: 12px; border: none; background: linear-gradient(135deg, var(--primary), var(--navy)); color: var(--white); cursor: pointer; margin-bottom: 10px; }
        .btn:hover { transform: translateY(-2px); background: linear-gradient(135deg, var(--navy), var(--primary)); }
        .social-btn { width: 100%; padding: 12px; font-size: 0.95rem; font-weight: 600; border-radius: 10px; border: none; margin: 6px 0; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .google-btn { background: #fff; color: #444; border: 1.5px solid #ddd; }
        .fb-btn { background: #1877f2; color: #fff; }
        .links { text-align: center; margin-top: 1rem; font-size: 0.95rem; }
        .links button { border: none; background: transparent; font-weight: 600; color: var(--navy); cursor: pointer; }
        .links button:hover { text-decoration: underline; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
      `}</style>
      <div className="login-root">
        <div className="container">
          <div className="login-container">
          {!isSignup ? (
            <div>
              <h1 className="form-title">Okiedoc+ Sign In</h1>
              <div className="login-input-group">
                <i className="fas fa-envelope"></i>
                <input type="email" placeholder="Email" ref={el => (loginRef.current.email = el)} />
              </div>
              <div className="login-input-group">
                <i className="fas fa-lock"></i>
                <input type="password" placeholder="Password" ref={el => (loginRef.current.password = el)} />
              </div>
              <button className="btn" onClick={handleLogin}>Sign In</button>
              <button className="social-btn google-btn"><i className="fab fa-google"></i> Sign in with Google</button>
              <button className="social-btn fb-btn"><i className="fab fa-facebook-f"></i> Sign in with Facebook</button>
              <div className="links">
                <p>Don't have an account?</p>
                <button onClick={() => setIsSignup(true)}>Sign Up</button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="form-title">Create your account</h1>
              <div className="login-input-group">
                <i className="fas fa-user"></i>
                <input type="text" placeholder="First name" ref={el => (signupRef.current.fName = el)} />
              </div>
              <div className="login-input-group">
                <i className="fas fa-user"></i>
                <input type="text" placeholder="Last name" ref={el => (signupRef.current.lName = el)} />
              </div>
              <div className="login-input-group">
                <i className="fas fa-envelope"></i>
                <input type="email" placeholder="Email" ref={el => (signupRef.current.email = el)} />
              </div>
              <div className="login-input-group">
                <i className="fas fa-lock"></i>
                <input type="password" placeholder="Password (min 3 chars)" ref={el => (signupRef.current.password = el)} />
              </div>
              <div className="login-input-group">
                <i className="fas fa-lock"></i>
                <input type="password" placeholder="Confirm password" ref={el => (signupRef.current.confirm = el)} />
              </div>
              <button className="btn" onClick={handleSignup}>Create Account</button>
              <div className="links">
                <p>Already have an account?</p>
                <button onClick={() => setIsSignup(false)}>Back to Sign In</button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;


