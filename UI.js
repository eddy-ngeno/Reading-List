// ui.js - Handles all UI updates and interactions

class UI {
    constructor() {
        // Elements from the DOM
        this.bookForm = document.getElementById('book-form');
        this.bookContainer = document.getElementById('books-container');
        this.filterStatus = document.getElementById('filter-status');
        this.sortBy = document.getElementById('sort-by');
        this.statusSelect = document.getElementById('status');
        this.ratingGroup = document.querySelector('.rating-group');
        this.starRating = document.querySelector('.star-rating');
        this.ratingInput = document.getElementById('rating');
        
        // Stats elements
        this.totalCount = document.getElementById('total-count');
        this.readCount = document.getElementById('read-count');
        this.wantCount = document.getElementById('want-count');
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    // Set up event listeners
    initEventListeners() {
        // Form submission
        this.bookForm.addEventListener('submit', this.handleAddBook.bind(this));
        
        // Filter and sort changes
        this.filterStatus.addEventListener('change', this.renderBooks.bind(this));
        this.sortBy.addEventListener('change', this.renderBooks.bind(this));
        
        // Status selection changes (show/hide rating input)
        this.statusSelect.addEventListener('change', this.toggleRatingInput.bind(this));
        
        // Star rating interactions
        this.starRating.addEventListener('click', this.handleStarRating.bind(this));
        
        // Initial render of books
        this.renderBooks();
        this.updateStats();
    }
    
    // Toggle rating input based on read status
    toggleRatingInput() {
        if (this.statusSelect.value === 'read') {
            this.ratingGroup.style.display = 'block';
        } else {
            this.ratingGroup.style.display = 'none';
            this.ratingInput.value = '0';
            this.resetStars();
        }
    }
    
    // Handle star rating clicks
    handleStarRating(e) {
        if (e.target.tagName === 'I') {
            const rating = parseInt(e.target.dataset.rating);
            this.ratingInput.value = rating;
            this.resetStars();
            
            // Fill in stars up to the selected rating
            const stars = this.starRating.querySelectorAll('i');
            for (let i = 0; i < rating; i++) {
                stars[i].classList.remove('far');
                stars[i].classList.add('fas');
            }
        }
    }
    
    // Reset star display
    resetStars() {
        const stars = this.starRating.querySelectorAll('i');
        stars.forEach(star => {
            star.classList.remove('fas');
            star.classList.add('far');
        });
    }
    
    // Handle form submission to add a book
    handleAddBook(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const status = this.statusSelect.value;
        const rating = status === 'read' ? parseInt(this.ratingInput.value) : 0;
        
        if (title === '' || author === '') {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }
        
        // Create a new book object
        const book = {
            title,
            author,
            status,
            rating
        };
        
        // Add the book to the database
        const newBook = db.addBook(book);
        
        // Add the book to the UI
        this.addBookToList(newBook);
        
        // Clear the form
        this.clearForm();
        
        // Update stats
        this.updateStats();
        
        // Show success message
        this.showAlert('Book added successfully', 'success');
    }
    
    // Clear the form fields
    clearForm() {
        document.getElementById('title').value = '';
        document.getElementById('author').value = '';
        this.statusSelect.value = 'want-to-read';
        this.ratingInput.value = '0';
        this.resetStars();
        this.ratingGroup.style.display = 'none';
    }
    
    // Add a book to the UI
    addBookToList(book) {
        // Create a book card element
        const bookElement = this.createBookElement(book);
        
        // Add the element to the container
        this.bookContainer.prepend(bookElement);
    }
    
    // Create a book element
    createBookElement(book) {
        const div = document.createElement('div');
        div.className = 'book-card';
        div.dataset.id = book.id;
        
        // Determine status class and label
        let statusClass = '';
        let statusLabel = '';
        
        switch(book.status) {
            case 'want-to-read':
                statusClass = 'status-want-to-read';
                statusLabel = 'Want to Read';
                break;
            case 'reading':
                statusClass = 'status-reading';
                statusLabel = 'Currently Reading';
                break;
            case 'read':
                statusClass = 'status-read';
                statusLabel = 'Finished Reading';
                break;
        }
        
        // Create stars HTML for rating
        let starsHtml = '';
        if (book.status === 'read') {
            for (let i = 1; i <= 5; i++) {
                if (i <= book.rating) {
                    starsHtml += '<i class="fas fa-star"></i>';
                } else {
                    starsHtml += '<i class="far fa-star"></i>';
                }
            }
        }
        
        // Format date
        const date = new Date(book.dateAdded);
        const formattedDate = `${date.toLocaleDateString()}`;
        
        // Set the HTML content
        div.innerHTML = `
            <span class="book-status ${statusClass}">${statusLabel}</span>
            <h3>${book.title}</h3>
            <p>by ${book.author}</p>
            <p class="date-added">Added on ${formattedDate}</p>
            ${book.status === 'read' ? `<div class="book-rating">${starsHtml}</div>` : ''}
            <div class="book-actions">
                <button class="action-btn edit" data-id="${book.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" data-id="${book.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners for edit and delete buttons
        div.querySelector('.edit').addEventListener('click', this.handleEditBook.bind(this));
        div.querySelector('.delete').addEventListener('click', this.handleDeleteBook.bind(this));
        
        return div;
    }
    
    // Handle edit book button click
    handleEditBook(e) {
        const id = e.currentTarget.dataset.id;
        const book = db.getBookById(id);
        
        if (book) {
            // Populate the form with book details
            document.getElementById('title').value = book.title;
            document.getElementById('author').value = book.author;
            this.statusSelect.value = book.status;
            
            // Handle rating if the book is read
            if (book.status === 'read') {
                this.ratingGroup.style.display = 'block';
                this.ratingInput.value = book.rating;
                this.resetStars();
                
                // Fill in stars up to the book rating
                const stars = this.starRating.querySelectorAll('i');
                for (let i = 0; i < book.rating; i++) {
                    stars[i].classList.remove('far');
                    stars[i].classList.add('fas');
                }
            } else {
                this.ratingGroup.style.display = 'none';
            }
            
            // Change form button to "Update"
            const submitBtn = this.bookForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Book';
            submitBtn.dataset.id = id;
            
            // Scroll to the form
            this.bookForm.scrollIntoView({ behavior: 'smooth' });
            
            // Add a one-time event listener for the update
            this.bookForm.removeEventListener('submit', this.handleAddBook.bind(this));
            this.bookForm.addEventListener('submit', this.handleUpdateBook.bind(this), { once: true });
        }
    }
    
    // Handle update book form submission
    handleUpdateBook(e) {
        e.preventDefault();
        
        const id = e.currentTarget.querySelector('button[type="submit"]').dataset.id;
        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const status = this.statusSelect.value;
        const rating = status === 'read' ? parseInt(this.ratingInput.value) : 0;
        
        if (title === '' || author === '') {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }
        
        // Create updated book object
        const updatedBook = {
            title,
            author,
            status,
            rating
        };
        
        // Update book in database
        if (db.updateBook(id, updatedBook)) {
            // Reset form
            this.clearForm();
            
            // Reset submit button
            const submitBtn = this.bookForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Add Book';
            delete submitBtn.dataset.id;
            
            // Reattach original submit handler
            this.bookForm.addEventListener('submit', this.handleAddBook.bind(this));
            
            // Refresh book list
            this.renderBooks();
            this.updateStats();
            
            // Show success message
            this.showAlert('Book updated successfully', 'success');
        }
    }
    
    // Handle delete book button click
    handleDeleteBook(e) {
        const id = e.currentTarget.dataset.id;
        
        // Confirm deletion
        if (confirm('Are you sure you want to delete this book?')) {
            if (db.deleteBook(id)) {
                // Remove from UI
                const bookElement = this.bookContainer.querySelector(`.book-card[data-id="${id}"]`);
                if (bookElement) {
                    bookElement.remove();
                }
                
                // Update stats
                this.updateStats();
                
                // Show success message
                this.showAlert('Book removed successfully', 'success');
            }
        }
    }
    
    // Show an alert message
    showAlert(message, type = 'info') {
        // Create alert div
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        // Insert before the form
        const container = document.querySelector('.add-book');
        container.insertBefore(alertDiv, this.bookForm);
        
        // Remove after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
    
    // Update dashboard statistics
    updateStats() {
        const stats = db.getStats();
        this.totalCount.textContent = stats.total;
        this.readCount.textContent = stats.read;
        this.wantCount.textContent = stats.wantToRead;
    }
    
    // Render books based on current filter and sort
    renderBooks() {
        // Clear the container
        this.bookContainer.innerHTML = '';
        
        // Get books with current filter
        let books = db.getBooksByStatus(this.filterStatus.value);
        
        // Sort books
        books = this.sortBooks(books, this.sortBy.value);
        
        // Render each book
        if (books.length === 0) {
            this.bookContainer.innerHTML = '<p class="no-books">No books found. Add your first book!</p>';
        } else {
            books.forEach(book => {
                const bookElement = this.createBookElement(book);
                this.bookContainer.appendChild(bookElement);
            });
        }
    }
    
    // Sort books based on selected criteria
    sortBooks(books, sortBy) {
        switch(sortBy) {
            case 'title':
                return [...books].sort((a, b) => a.title.localeCompare(b.title));
            case 'author':
                return [...books].sort((a, b) => a.author.localeCompare(b.author));
            case 'rating':
                return [...books].sort((a, b) => b.rating - a.rating);
            case 'date-added':
            default:
                return [...books].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        }
    }
}