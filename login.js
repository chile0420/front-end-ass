// Login page specific JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Initialize test accounts if they don't exist
    initializeTestAccounts();

    // Check if user is already logged in (check both storage types)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' ||
        sessionStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        // User is logged in, redirect to homepage
        window.location.href = 'index.html';
    }

    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Login form validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember').checked;

            // Basic validation
            if (!username || !password) {
                showMessage('Please fill in all fields', 'error');
                return;
            }

            // Check credentials against stored users
            const users = JSON.parse(localStorage.getItem('jalanEatsUsers') || '[]');
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                // Store login state based on "Remember Me" selection
                if (rememberMe) {
                    // Use localStorage for persistent login
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('username', username);
                    localStorage.setItem('userFullname', user.fullname || username);
                    // Clear session storage to avoid conflicts
                    sessionStorage.removeItem('isLoggedIn');
                    sessionStorage.removeItem('username');
                    sessionStorage.removeItem('userFullname');
                } else {
                    // Use sessionStorage for temporary login (cleared when browser closes)
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('username', username);
                    sessionStorage.setItem('userFullname', user.fullname || username);
                    // Clear local storage to avoid conflicts
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('username');
                    localStorage.removeItem('userFullname');
                }

                showMessage('Login successful! Redirecting...', 'success');

                // Redirect to homepage after a brief delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showMessage('Invalid username or password. Please try again.', 'error');
            }
        });
    }
});

// Initialize test accounts if they don't exist
function initializeTestAccounts() {
    const testAccounts = [
        {
            fullname: 'Test User',
            username: 'testuser',
            email: 'test@jalaneats.com',
            password: 'testpass123',
            joined: new Date().toISOString()
        },
    ];

    // Get existing users or initialize empty array
    const existingUsers = JSON.parse(localStorage.getItem('jalanEatsUsers') || '[]');

    // Check if test accounts already exist
    const testUserExists = existingUsers.some(user => user.username === 'testuser');

    // Add test accounts if they don't exist
    if (!testUserExists) {
        const allUsers = [...existingUsers, ...testAccounts];
        localStorage.setItem('jalanEatsUsers', JSON.stringify(allUsers));
    }
}

// Check if username is available (for real-time validation)
function checkUsernameAvailability(username) {
    const existingUsers = JSON.parse(localStorage.getItem('jalanEatsUsers') || '[]');
    return !existingUsers.some(user => user.username === username);
}

// Check if email is available (for real-time validation)
function checkEmailAvailability(email) {
    const existingUsers = JSON.parse(localStorage.getItem('jalanEatsUsers') || '[]');
    return !existingUsers.some(user => user.email === email);
}

// Password strength indicator
function checkPasswordStrength(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    // At least 8 characters
    const mediumRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

    if (strongRegex.test(password)) {
        return 'strong';
    } else if (mediumRegex.test(password)) {
        return 'medium';
    } else {
        return 'weak';
    }
}


