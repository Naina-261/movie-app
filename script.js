// API Module
const API = {
    key: '2089789e',
    baseURL: 'https://www.omdbapi.com/',

    async searchMovies(query) {
        const response = await fetch(`${this.baseURL}?s=${query}&apikey=${this.key}`);
        const data = await response.json();
        if (data.Response === 'False') throw new Error(data.Error);
        return data.Search || [];
    },

    async getMovieDetails(id) {
        const response = await fetch(`${this.baseURL}?i=${id}&apikey=${this.key}`);
        const data = await response.json();
        if (data.Response === 'False') throw new Error(data.Error);
        return data;
    }
};

// UI Module
const UI = {
    renderMovies(movies) {
        const results = document.getElementById('results');
        results.innerHTML = movies.map(movie => `
            <div class="movie-card" data-id="${movie.imdbID}">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}" alt="${movie.Title}">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                <button class="favorite-btn" data-id="${movie.imdbID}">Add to Favorites</button>
            </div>
        `).join('');
    },

    displayMovies(movies) {
        const container = document.getElementById('results');
        const favorites = Favorites.get();
        const html = movies.map((movie, index) => {
            const isFav = favorites.find(fav => fav.imdbID === movie.imdbID);
            const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 'NR';
            const genre = movie.Genre && movie.Genre !== 'N/A' ? movie.Genre.split(',')[0] : movie.Type;
            return `
                <div class="movie-card fade-in ${isFav ? 'favorited' : ''}" style="animation-delay: ${index * 0.05}s">
                    <div class="card-image-wrapper">
                        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/111111/FFFFFF?text=No+Poster'}" alt="${movie.Title}" loading="lazy">
                        <div class="card-badge"><span class="material-symbols-outlined">star</span> ${rating}</div>
                    </div>
                    <div class="card-content">
                        <span class="card-genre">${genre}</span>
                        <h3 title="${movie.Title}">${movie.Title}</h3>
                        <p class="card-year">${movie.Year}</p>
                        <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${movie.imdbID}">
                            <span class="material-symbols-outlined" style="pointer-events: none;">${isFav ? 'favorite' : 'favorite_border'}</span>
                            ${isFav ? 'Remove' : 'Favorite'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        container.innerHTML = html;
    },

    renderFavorites(favorites) {
        const favoritesList = document.getElementById('favorites-list');
        favoritesList.innerHTML = favorites.map(movie => {
            const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : 'NR';
            const genre = movie.Genre && movie.Genre !== 'N/A' ? movie.Genre.split(',')[0] : movie.Type;
            return `
            <div class="movie-card favorited" data-id="${movie.imdbID}">
                <div class="card-image-wrapper">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/111111/FFFFFF?text=No+Poster'}" alt="${movie.Title}" loading="lazy">
                    <div class="card-badge"><span class="material-symbols-outlined">star</span> ${rating}</div>
                </div>
                <div class="card-content">
                    <span class="card-genre">${genre}</span>
                    <h3 title="${movie.Title}">${movie.Title}</h3>
                    <button class="remove-favorite" data-id="${movie.imdbID}">
                        <span class="material-symbols-outlined" style="pointer-events: none;">delete</span>
                        Remove
                    </button>
                </div>
            </div>
        `}).join('');
    },

    populateGenres(genres) {
        const filterGenre = document.getElementById('filter-genre');
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            filterGenre.appendChild(option);
        });
    },

    renderPagination(totalPages, currentPage) {
        const paginationDiv = document.getElementById('pagination');
        if (totalPages === 0) {
            paginationDiv.innerHTML = '';
            return;
        }
        paginationDiv.innerHTML = `
            <button id="prev-page" ${currentPage === 0 ? 'disabled' : ''}>Previous</button>
            <span>Page ${currentPage + 1} of ${totalPages}</span>
            <button id="next-page" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>Next</button>
        `;
    },

    showLoader() {
        document.getElementById('loading').classList.remove('hidden');
    },

    hideLoader() {
        document.getElementById('loading').classList.add('hidden');
    },

    showError(message) {
        const error = document.getElementById('error');
        // Netflix style error wrapper
        error.innerHTML = `<span class="material-symbols-outlined">sentiment_dissatisfied</span><p>${message}</p>`;
        error.classList.remove('hidden');
    },

    hideError() {
        document.getElementById('error').classList.add('hidden');
    },
    
    showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="material-symbols-outlined">check_circle</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Favorites Module
const Favorites = {
    get() {
        return JSON.parse(localStorage.getItem('favorites')) || [];
    },

    add(movie) {
        const favorites = this.get();
        if (!favorites.find(fav => fav.imdbID === movie.imdbID)) {
            favorites.push(movie);
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
    },

    remove(id) {
        const favorites = this.get().filter(fav => fav.imdbID !== id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
};

// Theme Module (Removed for strict Netflix Dark Theme Layout)

// Utils Module
const Utils = {
    debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    },

    sortMovies(movies, sortBy) {
        const sorted = [...movies];
        switch (sortBy) {
            case 'title-asc':
                return sorted.sort((a, b) => a.Title.localeCompare(b.Title));
            case 'title-desc':
                return sorted.sort((a, b) => b.Title.localeCompare(a.Title));
            case 'year-desc':
                return sorted.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
            case 'rating-desc':
                return sorted.sort((a, b) => parseFloat(b.imdbRating || 0) - parseFloat(a.imdbRating || 0));
            default:
                return sorted;
        }
    },

    filterMovies(movies, genre) {
        if (!genre) return movies;
        return movies.filter(movie => movie.Genre && movie.Genre.includes(genre));
    }
};

// Events Module
const Events = {
    currentMovies: [],
    currentPage: 0,
    init() {
        const searchInput = document.getElementById('search-input');
        const filterType = document.getElementById('filter-type');
        const minYearInput = document.getElementById('min-year');
        const maxYearInput = document.getElementById('max-year');
        const filterGenre = document.getElementById('filter-genre');
        const sortBy = document.getElementById('sort-by');
        const clearSearch = document.getElementById('clear-search');
        
        const applyFilters = () => {
            if (this.currentMovies.length === 0) {
                UI.displayMovies([]);
                UI.renderPagination(0, this.currentPage);
                return;
            }
            let filtered = this.currentMovies.filter(movie => movie.Title.toLowerCase().includes(searchInput.value.trim().toLowerCase()));
            filtered = filtered.filter(movie => {
                const type = filterType.value;
                return !type || movie.Type === type;
            });
            filtered = filtered.filter(movie => {
                const minYear = parseInt(minYearInput.value) || 0;
                const maxYear = parseInt(maxYearInput.value) || Infinity;
                const year = parseInt(movie.Year);
                return year >= minYear && year <= maxYear;
            });
            filtered = Utils.filterMovies(filtered, filterGenre.value);
            filtered = Utils.sortMovies(filtered, sortBy.value);
            if (filtered.length === 0) {
                UI.displayMovies([]);
                UI.renderPagination(0, this.currentPage);
                return;
            }
            const moviesPerPage = 10;
            const totalPages = Math.ceil(filtered.length / moviesPerPage);
            if (this.currentPage >= totalPages) this.currentPage = totalPages - 1;
            const start = this.currentPage * moviesPerPage;
            const end = start + moviesPerPage;
            const paginated = filtered.slice(start, end);
            UI.displayMovies(paginated);
            UI.renderPagination(totalPages, this.currentPage);
        };

        searchInput.addEventListener('input', Utils.debounce(async (e) => {
            const query = e.target.value.trim();
            if (query) {
                clearSearch.classList.remove('hidden');
                try {
                    UI.hideError();
                    UI.showLoader();
                    let movies = await API.searchMovies(query);
                    // Fetch details for sorting/rating
                    movies = await Promise.all(movies.map(async movie => await API.getMovieDetails(movie.imdbID)));
                    this.currentMovies = movies;
                    localStorage.setItem('currentMovies', JSON.stringify(this.currentMovies));
                    this.currentPage = 0; // Reset pagination for a new search
                    applyFilters();
                } catch (error) {
                    this.currentMovies = [];
                    UI.displayMovies([]);
                    UI.renderPagination(0, 0);
                    UI.showError(error.message);
                } finally {
                    UI.hideLoader();
                }
            } else {
                document.getElementById('results').innerHTML = '';
                clearSearch.classList.add('hidden');
                this.currentMovies = [];
                UI.renderPagination(0, 0);
            }
        }, 600));

        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            clearSearch.classList.add('hidden');
            document.getElementById('results').innerHTML = '';
            this.currentMovies = [];
            UI.renderPagination(0, 0);
        });

        filterType.addEventListener('change', applyFilters);
        minYearInput.addEventListener('input', applyFilters);
        maxYearInput.addEventListener('input', applyFilters);
        filterGenre.addEventListener('change', applyFilters);
        sortBy.addEventListener('change', applyFilters);

        document.addEventListener('click', (e) => {
            if (e.target.id === 'prev-page' && !e.target.disabled) {
                this.currentPage--;
                applyFilters();
            }
            if (e.target.id === 'next-page' && !e.target.disabled) {
                this.currentPage++;
                applyFilters();
            }
            
            const favBtn = e.target.closest('.favorite-btn');
            if (favBtn) {
                const id = favBtn.dataset.id;
                const movie = this.currentMovies.find(m => m.imdbID === id);
                if (movie) {
                    const isFav = Favorites.get().find(fav => fav.imdbID === id);
                    if (isFav) {
                        Favorites.remove(id);
                        UI.showToast('Removed from My List');
                    } else {
                        Favorites.add(movie);
                        UI.showToast('Added to My List');
                    }
                    UI.renderFavorites(Favorites.get());
                    applyFilters(); // Re-render movies to update button states
                }
            }
            
            const removeBtn = e.target.closest('.remove-favorite');
            if (removeBtn) {
                const id = removeBtn.dataset.id;
                Favorites.remove(id);
                UI.showToast('Removed from My List');
                UI.renderFavorites(Favorites.get());
                applyFilters();
            }
        });
    }
};

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    UI.renderFavorites(Favorites.get());
    Events.init();
    // Populate genres (you can hardcode or fetch)
    UI.populateGenres(['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller']);
    
    // Default load constraints
    const searchInput = document.getElementById('search-input');
    searchInput.value = "Interstellar";
    searchInput.dispatchEvent(new Event('input'));
});