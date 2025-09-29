// Penang page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and show appropriate comment section
    checkAuthStatus();
    
    // Load existing comments
    loadComments();
    
    // Handle comment form submission
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmission);
    }
});

function checkAuthStatus() {
    const isLoggedInLocal = localStorage.getItem('isLoggedIn') === 'true';
    const isLoggedInSession = sessionStorage.getItem('isLoggedIn') === 'true';
    const isLoggedIn = isLoggedInLocal || isLoggedInSession;
    
    if (isLoggedIn) {
        // User is logged in, show comment form
        document.getElementById('comment-form-container').style.display = 'block';
        document.getElementById('login-prompt').style.display = 'none';
    } else {
        // User is not logged in, show login prompt
        document.getElementById('comment-form-container').style.display = 'none';
        document.getElementById('login-prompt').style.display = 'block';
    }
}

function loadComments() {
    const comments = JSON.parse(localStorage.getItem('penang-comments') || '[]');
    const commentsContainer = document.getElementById('comments-container');
    
    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p>No comments yet. Be the first to share your experience!</p>';
        return;
    }
    
    // Sort comments by date (newest first)
    comments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(comment.author)}</span>
                <span class="comment-rating">${'★'.repeat(comment.rating)}${'☆'.repeat(5-comment.rating)}</span>
            </div>
            <h4 class="comment-title">${escapeHtml(comment.title)}</h4>
            <p>${escapeHtml(comment.text)}</p>
            <small style="color: var(--text-light);">Posted on ${formatDate(comment.date)}</small>
        </div>
    `).join('');
}

function handleCommentSubmission(e) {
    e.preventDefault();
    
    const title = document.getElementById('comment-title').value.trim();
    const text = document.getElementById('comment-text').value.trim();
    const rating = parseInt(document.getElementById('comment-rating').value);
    const username = localStorage.getItem('username');
    
    if (!title || !text || !rating || !username) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    const comment = {
        id: Date.now(), // Simple ID generation
        title: title,
        text: text,
        rating: rating,
        author: username,
        date: new Date().toISOString()
    };
    
    // Get existing comments
    const existingComments = JSON.parse(localStorage.getItem('penang-comments') || '[]');
    
    // Add new comment
    existingComments.push(comment);
    
    // Save to localStorage
    localStorage.setItem('penang-comments', JSON.stringify(existingComments));
    
    // Reset form
    document.getElementById('comment-form').reset();
    
    // Reload comments
    loadComments();
    
    // Show success message
    showMessage('Comment posted successfully!', 'success');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}