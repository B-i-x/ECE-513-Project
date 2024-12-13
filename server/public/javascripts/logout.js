export function logoutUser() {
    localStorage.removeItem('authToken'); // Remove the token
    window.location.href = 'index.html'; // Redirect to login page
}