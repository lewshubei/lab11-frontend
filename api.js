// api.js
// Local development API
// const API_BASE_URL = 'http://localhost/mycampus-cafe-slim-api/public/api';
// Live backend API after deployment to cPanel/shared hosting
// Inside your api.js file
const API_BASE_URL = "https://mycampus10.atwebpages.com/api"; // Change http → https
function getToken() {
  return localStorage.getItem("mcafe_token");
}
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + getToken(),
  };
}
function publicHeaders() {
  return { "Content-Type": "application/json" };
}
