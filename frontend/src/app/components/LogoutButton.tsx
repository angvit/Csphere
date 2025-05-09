"use client";

function LogoutButton() {
  const onLogout = () => {
    document.cookie = `token=; path=/; max-age=0`; // Clear the cookie by setting its max-age to 0
    localStorage.removeItem("cshere_token"); // Clear the local storage item;
    window.location.href = "/login"; // Redirect to the login page
  };
  return <span onClick={onLogout}>Logout</span>;
}

export default LogoutButton;
