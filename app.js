// app.js - Main application entry point

// Initialize the UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    
    // Check if this is the first visit
    if (!localStorage.getItem('hasVisited')) {
        // Add sample books for first-time visitors
        addSampleBooks();
        localStorage.setItem('hasVisited', 'true');
    }
    
    // Function to add sample books
    function addSampleBooks() {
        const sampleBooks = [
            {
                title: 'To Kill a Mockingbird',
                author: 'Harper Lee',
                status: 'read',
                rating: 5
            },
            {
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                status: 'want-to-read',
                rating: 0
            },
            {
                title: '1984',
                author: 'George Orwell',
                status: 'reading',
                rating: 0
            }
        ];
        
        sampleBooks.forEach(book => db.addBook(book));
        
        //Refresh UI
        ui.renderBooks();
        ui.updateStats();
    }
});