// Common JavaScript functions for all pages

document.addEventListener('DOMContentLoaded', function () {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('nav');

    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', function () {
            nav.classList.toggle('active');
        });
    }

    // Check login status and update UI
    updateLoginStatus();

    // Track user session and last visit date
    checkLastVisit();

    // Set up newsletter subscription
    setupNewsletterSubscription();
});

// Subscribe to newsletter with JSONPlaceholder
function setupNewsletterSubscription() {
    const newsletterForm = document.querySelector('.newsletter-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;

            if (!email) {
                showMessage('Please enter your email address', 'error');
                return;
            }

            // Show loading state
            const submitButton = this.querySelector('button');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Subscribing...';
            submitButton.disabled = true;

            // Using JSONPlaceholder
            $.ajax({
                url: 'https://jsonplaceholder.typicode.com/posts',
                method: 'POST',
                data: JSON.stringify({
                    title: 'Newsletter Subscription',
                    body: email,
                    userId: 1
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                success: function (response) {
                    showMessage('Successfully subscribed to our newsletter!', 'success');
                    emailInput.value = '';
                },
                error: function (xhr, status, error) {
                    showMessage('Subscription failed. Please try again later.', 'error');
                },
                complete: function () {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }
            });
        });
    }
}

// Update navigation based on login status
function updateLoginStatus() {
    // Check both storage locations
    const isLoggedInLocal = localStorage.getItem('isLoggedIn') === 'true';
    const isLoggedInSession = sessionStorage.getItem('isLoggedIn') === 'true';
    const isLoggedIn = isLoggedInLocal || isLoggedInSession;

    // Get username from appropriate storage
    const username = isLoggedInLocal ?
        localStorage.getItem('username') :
        sessionStorage.getItem('username');

    const loginButton = document.getElementById('login-button');
    const userWelcome = document.getElementById('user-welcome');
    const usernameDisplay = document.getElementById('username-display');
    const logoutButton = document.getElementById('logout-button');

    if (isLoggedIn && username) {
        // User is logged in
        if (loginButton) loginButton.style.display = 'none';
        if (userWelcome) userWelcome.style.display = 'flex';
        if (usernameDisplay) usernameDisplay.textContent = username;

        // Add logout functionality
        if (logoutButton) {
            logoutButton.onclick = function (e) {
                e.preventDefault();
                // Clear both storage types on logout
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                localStorage.removeItem('userFullname');
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('username');
                sessionStorage.removeItem('userFullname');
                window.location.reload();
            };
        }
    } else {
        // User is not logged in
        if (loginButton) loginButton.style.display = 'flex';
        if (userWelcome) userWelcome.style.display = 'none';
    }
}

// Function to get current user data
function getCurrentUser() {
    // Check both storage locations
    const isLoggedInLocal = localStorage.getItem('isLoggedIn') === 'true';
    const username = isLoggedInLocal ?
        localStorage.getItem('username') :
        sessionStorage.getItem('username');

    if (!username) return null;

    const users = JSON.parse(localStorage.getItem('jalanEatsUsers') || '[]');
    return users.find(user => user.username === username);
}

// Function to update user data
function updateUserData(updatedData) {
    // Check both storage locations
    const isLoggedInLocal = localStorage.getItem('isLoggedIn') === 'true';
    const username = isLoggedInLocal ?
        localStorage.getItem('username') :
        sessionStorage.getItem('username');

    if (!username) return false;

    let users = JSON.parse(localStorage.getItem('jalanEatsUsers') || '[]');
    const userIndex = users.findIndex(user => user.username === username);

    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedData };
        localStorage.setItem('jalanEatsUsers', JSON.stringify(users));
        return true;
    }

    return false;
}

// Show message function
function showMessage(message, type) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `
        <p>${message}</p>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        max-width: 350px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        color: white;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;

    if (type === 'success') {
        messageEl.style.backgroundColor = '#2a9d8f';
    } else {
        messageEl.style.backgroundColor = '#e63946';
    }

    messageEl.querySelector('button').style.cssText = `
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
    `;

    if (!document.querySelector('#message-styles')) {
        const style = document.createElement('style');
        style.id = 'message-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(messageEl);

    setTimeout(() => {
        if (messageEl.parentElement) {
            messageEl.remove();
        }
    }, 5000);
}

// function to handle cookie setting
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

// function to get cookie value
function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
}

// Check for last visit date and show a message
function checkLastVisit() {
    const lastVisit = getCookie('lastVisit');
    const currentDate = new Date().toLocaleDateString();

    // Check if user has already been greeted this session
    const greeted = sessionStorage.getItem('greeted');

    if (!greeted) {
        if (lastVisit) {
            showMessage(`Welcome back! Your last visit was on ${lastVisit}`, 'success');
        } else {
            showMessage("Welcome to JalanEats 🎉", 'success');
        }
        sessionStorage.setItem('greeted', 'true'); // mark as greeted
    }

    // Update cookie for next visit
    setCookie('lastVisit', currentDate, 30);
}