const loadUsersBtn = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusPara = document.getElementById("status");
const usersList = document.getElementById("users-list");

let allUsers = [];

function renderUsers(list) {
  usersList.textContent = "";

  if (list.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.textContent = "No users match your filter.";
    usersList.appendChild(emptyLi);
    return;
  }

  list.forEach(user => {
    const li = document.createElement("li");

    const nameStrong = document.createElement("strong");
    nameStrong.textContent = user.name;

    const detailsText = document.createTextNode(
      ` | Email: ${user.email} | City: ${user.address.city} | Company: ${user.company.name}`
    );

    li.appendChild(nameStrong);
    li.appendChild(detailsText);
    usersList.appendChild(li);
  });
}

async function loadUsers() {
  loadUsersBtn.disabled = true;
  statusPara.textContent = "Loading users...";
  usersList.textContent = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error(`Failed to fetch users (Status: ${response.status})`);
    }

    allUsers = await response.json();
    statusPara.textContent = `Successfully loaded ${allUsers.length} users.`;
    renderUsers(allUsers);
  } catch (error) {
    statusPara.textContent = `Error: ${error.message}`;
  } finally {
    loadUsersBtn.disabled = false;
  }
}

loadUsersBtn.addEventListener("click", loadUsers);

filterInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filtered = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm)
  );
  renderUsers(filtered);
});