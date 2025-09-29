// Johor page specific JavaScript

// Global map initialization function for Google Maps callback
function initJohorMap() {
    const mapOptions = {
        center: new google.maps.LatLng(1.4927, 103.7414), // Johor coordinates
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                "featureType": "administrative",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#444444" }]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [{ "color": "#f2f2f2" }]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [{ "visibility": "off" }]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [{ "visibility": "simplified" }]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [{ "visibility": "off" }]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [{ "visibility": "off" }]
            },
            {
                "featureType": "water",
                "elementType": "all",
                // Changed from red to blue for water elements
                "stylers": [{ "color": "#4285F4" }, { "visibility": "on" }]
            }
        ]
    };

    const map = new google.maps.Map(document.getElementById('johor-map'), mapOptions);

    // Add markers for food hotspots
    const locations = [
        {
            title: 'Jalan Dhoby Night Market',
            position: { lat: 1.4574, lng: 103.7639 },
            info: 'Fridays to Sundays, 6pm - 12am<br>Famous for: Laksa Johor, satay, local desserts'
        },
        {
            title: 'Pasar Malam Taman Universiti',
            position: { lat: 1.5382, lng: 103.6365 },
            info: 'Wednesdays, 5pm - 10pm<br>Famous for: Mee bandung, otak-otak, fresh juices'
        },
        {
            title: 'Medan Selera Johor Bahru',
            position: { lat: 1.4779, lng: 103.7619 },
            info: 'Daily, 5pm - 11pm<br>Famous for: Various Malay dishes, grilled seafood'
        }
    ];

    const infoWindow = new google.maps.InfoWindow();

    locations.forEach(location => {
        const marker = new google.maps.Marker({
            position: location.position,
            map: map,
            title: location.title,
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }
        });

        marker.addListener('click', () => {
            infoWindow.setContent(`
                <div class="map-info-window">
                    <h3>${location.title}</h3>
                    <p>${location.info}</p>
                </div>
            `);
            infoWindow.open(map, marker);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Check login status and update UI
    updateLoginUI();

    // Load comments
    loadComments();

    // Setup comment form
    setupCommentForm();

    // Load food fact from API
    fetchFoodFact();
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
    const johorComments = JSON.parse(localStorage.getItem('johorComments')) || [];

    if (johorComments.length === 0) {
        commentsContainer.innerHTML = '<p>No comments yet. Be the first to share your experience!</p>';
        return;
    }

    let commentsHTML = '';
    johorComments.forEach(comment => {
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
            const johorComments = JSON.parse(localStorage.getItem('johorComments')) || [];

            // Add new comment
            johorComments.unshift(newComment);

            // Save back to local storage
            localStorage.setItem('johorComments', JSON.stringify(johorComments));

            // Reset form
            commentForm.reset();

            // Reload comments
            loadComments();

            // Show success message
            showMessage('Comment submitted successfully!', 'success');

            // Also save to session storage for tracking
            const sessionComments = JSON.parse(sessionStorage.getItem('userComments')) || [];
            sessionComments.push({
                page: 'johor',
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