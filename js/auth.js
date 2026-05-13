// ============================================
// AUTHENTICATION
// ============================================

let currentUser = null;

async function checkAuth() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      currentUser = session.user;
      showDashboard();
    } else {
      showLogin();
    }
  } catch (err) {
    console.error('Auth check failed:', err);
    showLogin();
  }
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboardScreen').style.display = 'none';
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboardScreen').style.display = 'block';
  loadDashboard();
}

// ---- Login form submit ----
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email     = document.getElementById('loginEmail').value.trim();
  const password  = document.getElementById('loginPassword').value;
  const errorDiv  = document.getElementById('loginError');
  const submitBtn = document.getElementById('loginBtn');
  const btnText   = document.querySelector('.btn-login__text');
  const btnSpinner = document.querySelector('.btn-login__spinner');

  errorDiv.style.display = 'none';
  submitBtn.disabled    = true;
  btnText.textContent   = 'Signing in…';
  btnSpinner.style.display = 'block';

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUser = data.user;
    showDashboard();
  } catch (err) {
    const messages = {
      'Invalid login credentials': 'Incorrect email or password. Please try again.',
      'Email not confirmed': 'Please verify your email before signing in.',
    };
    errorDiv.textContent     = messages[err.message] || err.message || 'Login failed.';
    errorDiv.style.display   = 'flex';
    document.getElementById('loginPassword').focus();
  } finally {
    submitBtn.disabled       = false;
    btnText.textContent      = 'Sign In';
    btnSpinner.style.display = 'none';
  }
});

// ---- Logout ----
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  currentUser = null;
  showLogin();
});

// ---- Show / hide password ----
document.getElementById('passwordToggle').addEventListener('click', () => {
  const input = document.getElementById('loginPassword');
  const icon  = document.getElementById('eyeIcon');
  const isHidden = input.type === 'password';

  input.type = isHidden ? 'text' : 'password';

  // Switch between open-eye and closed-eye SVG paths
  icon.innerHTML = isHidden
    ? '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
});

// ---- Caps Lock detection ----
document.getElementById('loginPassword').addEventListener('keyup', (e) => {
  const capsOn = e.getModifierState && e.getModifierState('CapsLock');
  document.getElementById('capsWarning').style.display = capsOn ? 'inline' : 'none';
});

// Auto-focus email on load
window.addEventListener('load', () => {
  document.getElementById('loginEmail')?.focus();
});
