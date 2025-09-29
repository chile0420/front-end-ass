// Kuala Lumpur page specific JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Check login status and update UI
    updateLoginUI();

    // Load comments
    loadComments();

    // Setup comment form
    setupCommentForm();

    // Load food fact from API
    fetchFoodFact();

    // Setup map button
    document.getElementById('load-map').addEventListener('click', function () {
        alert('Map functionality would be implemented here with a proper mapping API like Google Maps');
        // In a real implementation, this would load an interactive map
        this.textContent = 'Map Loaded';
        this.disabled = true;
    });
});

// Update UI based on login status
function updateLoginUI() {
    const isLoggedInLocal = localStorage.getItem('isLoggedIn') === 'true';
    const isLoggedInSession = sessionStorage.getItem('isLoggedIn') === 'true';
    const isLoggedIn = isLoggedInLocal || isLoggedInSession;
    const commentForm = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-prompt');
    if (isLoggedIn) {
        commentForm.style.display = 'block';
        loginPrompt.style.display = 'none';
    } else {
        commentForm.style.display = 'none';
        loginPrompt.style.display = 'block';
    }
}

// Load comments from local storage
function loadComments() {
    const commentsContainer = document.getElementById('comments-container');
    const kualaLumpurComments = JSON.parse(localStorage.getItem('kualaLumpurComments')) || [];

    if (kualaLumpurComments.length === 0) {
        commentsContainer.innerHTML = '<p>No comments yet. Be the first to share your experience!</p>';
        return;
    }

    let commentsHTML = '';
    kualaLumpurComments.forEach(comment => {
        commentsHTML += `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.username}</span>
                    <span class="comment-date">${new Date(comment.date).toLocaleDateString()}</span>
                </div>
                <h4 class="comment-title">${comment.title}</h4>
                <div class="comment-rating">${generateStarRating(comment.rating)}</div>
                <p class="comment-text">${comment.text}</p>
            </div>
        `;
    });

    commentsContainer.innerHTML = commentsHTML;
}

// Generate star rating HTML
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Setup comment form submission
function setupCommentForm() {
    const commentForm = document.getElementById('comment-form');

    if (commentForm) {
        commentForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                showMessage('Please log in to submit a comment', 'error');
                return;
            }

            const title = document.getElementById('comment-title').value;
            const text = document.getElementById('comment-text').value;
            const rating = document.getElementById('comment-rating').value;
            const username = localStorage.getItem('username') || 'Anonymous';

            if (!title || !text || !rating) {
                showMessage('Please fill in all fields', 'error');
                return;
            }

            // Create new comment object
            const newComment = {
                title,
                text,
                rating: parseInt(rating),
                username,
                date: new Date().toISOString()
            };

            // Get existing comments
            const kualaLumpurComments = JSON.parse(localStorage.getItem('kualaLumpurComments')) || [];

            // Add new comment
            kualaLumpurComments.unshift(newComment);

            // Save back to local storage
            localStorage.setItem('kualaLumpurComments', JSON.stringify(kualaLumpurComments));

            // Reset form
            commentForm.reset();

            // Reload comments
            loadComments();

            // Show success message
            showMessage('Comment submitted successfully!', 'success');

            // Also save to session storage for tracking
            const sessionComments = JSON.parse(sessionStorage.getItem('userComments')) || [];
            sessionComments.push({
                page: 'kuala-lumpur',
                title: title,
                date: new Date().toISOString()
            });
            sessionStorage.setItem('userComments', JSON.stringify(sessionComments));
        });
    }
}

// Fetch food fact from API
function fetchFoodFact() {
    $.ajax({
        url: 'https://www.themealdb.com/api/json/v1/1/filter.php?a=Malaysian',
        method: 'GET',
        success: function (data) {
            if (data.meals && data.meals.length > 0) {
                // Get a random Malaysian meal
                const randomMeal = data.meals[Math.floor(Math.random() * data.meals.length)];

                // Get details for this meal
                $.ajax({
                    url: `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${randomMeal.idMeal}`,
                    method: 'GET',
                    success: function (mealData) {
                        if (mealData.meals && mealData.meals.length > 0) {
                            const meal = mealData.meals[0];
                            const fact = `${meal.strMeal} is a popular Malaysian dish. ${meal.strInstructions ? meal.strInstructions.substring(0, 150) + '...' : 'It\'s delicious!'}`;
                            document.getElementById('food-fact').textContent = fact;

                            // Store API response in local storage for offline use
                            localStorage.setItem('lastFoodFact', JSON.stringify({
                                meal: meal.strMeal,
                                fact: fact,
                                timestamp: new Date().toISOString()
                            }));
                        }
                    },
                    error: function () {
                        useCachedFoodFact();
                    }
                });
            } else {
                useCachedFoodFact();
            }
        },
        error: function () {
            useCachedFoodFact();
        }
    });
}

// Use cached food fact if API fails
function useCachedFoodFact() {
    const cachedFact = localStorage.getItem('lastFoodFact');
    if (cachedFact) {
        const factData = JSON.parse(cachedFact);
        document.getElementById('food-fact').textContent = factData.fact;
    }
}