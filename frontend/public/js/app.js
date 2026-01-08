/* frontend/public/js/app.js */

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme') || 'light';

    // Set initial theme
    document.documentElement.setAttribute('data-theme', storedTheme);
    themeToggle.textContent = storedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';

    // Event listener for theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
    
    // Placeholder for global app initialization or shared functions
    console.log("Bus Booking App initialized.");
});

// Function to fetch data from the backend (placeholder)
function fetchData(endpoint, data) {
    console.log(`[API] Calling ${endpoint} with data:`, data);
    // In a real app, this would use fetch() or axios to call the backend API
    return new Promise(resolve => setTimeout(() => resolve({ success: true, mockData: [] }), 500));
}