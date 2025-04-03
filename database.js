// database.js - Handles all data storage and retrieval operations

class BookDatabase {
    constructor() {
        this.books = [];
        this.loadFromStorage();
    }
    
    // Load books from localStorage
    loadFromStorage() {
        const storedBooks = localStorage.getItem('books');
        this.books = storedBooks ? JSON.parse(storedBooks) : [];
    }
    
    // Save books to localStorage
    saveToStorage() {
        localStorage.setItem('books', JSON.stringify(this.books));
    }
    
    // Add a new book
    addBook(book) {
        // Generate a unique ID for the book
        book.id = Date.now().toString();
        // Add the date the book was added
        book.dateAdded = new Date().toISOString();
        // Add the book to our collection
        this.books.push(book);
        // Save to localStorage
        this.saveToStorage();
        return book;
    }
    
    // Get all books
    getAllBooks() {
        return this.books;
    }
    
    // Get books by status
    getBooksByStatus(status) {
        if (status === 'all') {
            return this.books;
        }
        return this.books.filter(book => book.status === status);
    }
    
    // Get book by ID
    getBookById(id) {
        return this.books.find(book => book.id === id);
    }
    
    // Update a book
    updateBook(id, updatedBook) {
        const index = this.books.findIndex(book => book.id === id);
        if (index !== -1) {
            // Keep the original ID and dateAdded
            updatedBook.id = this.books[index].id;
            updatedBook.dateAdded = this.books[index].dateAdded;
            // Update the book
            this.books[index] = updatedBook;
            this.saveToStorage();
            return true;
        }
        return false;
    }
    
    // Delete a book
    deleteBook(id) {
        const index = this.books.findIndex(book => book.id === id);
        if (index !== -1) {
            this.books.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }
    
    // Get statistics about the books
    getStats() {
        const total = this.books.length;
        const read = this.books.filter(book => book.status === 'read').length;
        const reading = this.books.filter(book => book.status === 'reading').length;
        const wantToRead = this.books.filter(book => book.status === 'want-to-read').length;
        
        return {
            total,
            read,
            reading,
            wantToRead
        };
    }
}

// Create an instance of BookDatabase to use throughout the application
const db = new BookDatabase();