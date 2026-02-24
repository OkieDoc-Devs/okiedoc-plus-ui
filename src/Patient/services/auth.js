// Log out Patient for Audit
export const logoutPatient = async () => {
  try {
    await fetch("http://localhost:1337/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    localStorage.removeItem("currentUser");
  }
};
