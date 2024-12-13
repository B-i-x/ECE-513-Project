export function logoutUser() {
    localStorage.removeItem('authToken'); // Remove the token
    window.location.href = 'login.html'; // Redirect to login page
}