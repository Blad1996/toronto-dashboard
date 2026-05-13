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

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');
  const submitBtn = document.getElementById('loginBtn');

  errorDiv.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in…';

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUser = data.user;
    showDashboard();
  } catch (err) {
    errorDiv.textContent = err.message || 'Login failed. Please check your credentials.';
    errorDiv.style.display = 'flex';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  currentUser = null;
  showLogin();
});
