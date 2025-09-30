const firebaseConfig = {
  apiKey: "AIzaSyAYUvff2tZLBQUV71dEmcBqBkO-MaqgJkE",
  authDomain: "login-app-9ef40.firebaseapp.com",
  projectId: "login-app-9ef40",
  storageBucket: "login-app-9ef40.firebasestorage.app",
  messagingSenderId: "304059710801",
  appId: "1:304059710801:web:b58e17bcbd6b51c203e770",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');
const formContainer = document.getElementById('form-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const userForm = document.getElementById('user-form');
const logoutBtn = document.getElementById('logout-btn');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');
const formMessage = document.getElementById('form-message');

showSignupBtn.addEventListener('click', () => {
  loginContainer.classList.add('hidden');
  signupContainer.classList.remove('hidden');
  signupError.classList.add('hidden');
});

showLoginBtn.addEventListener('click', () => {
  signupContainer.classList.add('hidden');
  loginContainer.classList.remove('hidden');
  loginError.classList.add('hidden');
});

auth.onAuthStateChanged(user => {
  if (user) {
    showFormPage();
  } else {
    showLoginPage();
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    loginError.textContent = getAuthMessage(error.code);
    loginError.classList.remove('hidden');
  }
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('confirm-password').value;
  
  if (password.length < 6) {
    signupError.textContent = 'Password must be at least 6 characters';
    signupError.classList.remove('hidden');
    return;
  }
  if (password !== confirm) {
    signupError.textContent = 'Passwords do not match';
    signupError.classList.remove('hidden');
    return;
  }
  
  try {
    await auth.createUserWithEmailAndPassword(email, password);
  } catch (error) {
    signupError.textContent = getAuthMessage(error.code);
    signupError.classList.remove('hidden');
  }
});

userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    message: document.getElementById('message').value.trim(),
    userId: auth.currentUser.uid,
    submittedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection('submissions').add(formData);
    showMessage('✅ Form saved successfully!', 'success');
    userForm.reset();
  } catch (error) {
    console.error('Firestore save error:', error);
    showMessage('❌ Failed to save: ' + error.message, 'error');
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
});

function showLoginPage() {
  loginContainer.classList.remove('hidden');
  signupContainer.classList.add('hidden');
  formContainer.classList.add('hidden');
  loginForm.reset();
  loginError.classList.add('hidden');
}

function showFormPage() {
  loginContainer.classList.add('hidden');
  signupContainer.classList.add('hidden');
  formContainer.classList.remove('hidden');
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = type + (type === 'success' ? ' success' : ' error');
  formMessage.classList.remove('hidden');
  setTimeout(() => formMessage.classList.add('hidden'), 4000);
}

function getAuthMessage(code) {
  const messages = {
    'auth/invalid-email': 'Invalid email format',
    'auth/user-disabled': 'Account disabled',
    'auth/user-not-found': 'No account with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already registered',
    'auth/weak-password': 'Password too weak (min 6 chars)',
    'auth/too-many-requests': 'Too many attempts. Try later'
  };
  return messages[code] || 'Authentication failed. Please try again.';
}