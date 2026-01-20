const API_URL = "http://localhost:3000/users";

const form = document.getElementById("userForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const userList = document.getElementById("userList");

// FETCH USERS (GET)
async function fetchUsers() {
  const response = await fetch(API_URL);
  const users = await response.json();

  userList.innerHTML = "";

  users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = `${user.name} - ${user.email}`;
    userList.appendChild(li);
  });
}

// ADD USER (POST)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value;
  const email = emailInput.value;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email })
  });

  if (response.ok) {
    nameInput.value = "";
    emailInput.value = "";
    fetchUsers(); // refresh list
  } else {
    alert("Failed to add user");
  }
});

// Load users on page load
fetchUsers();
