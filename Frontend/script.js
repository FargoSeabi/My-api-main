const API_URL = "http://localhost:3000/tickets";

const form = document.getElementById("ticketForm");
const customerName = document.getElementById("customerName");
const ticketTitle = document.getElementById("ticketTitle");
const description = document.getElementById("description");
const priority = document.getElementById("priority");
const ticketList = document.getElementById("ticketList");
const ticketCount = document.getElementById("ticketCount");

async function fetchTickets() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch tickets");
    const tickets = await response.json();

    ticketList.innerHTML = "";
    const activeTickets = tickets.filter(t => t.status !== "Resolved");

    ticketCount.textContent = activeTickets.length;

    activeTickets.forEach(ticket => {
      const li = document.createElement("li");
      li.className = `priority-${ticket.priority.toLowerCase()}`;

      const date = new Date(ticket.created_at).toLocaleString();

      li.innerHTML = `
        <strong>${ticket.title}</strong>
        <div>Customer: ${ticket.customer}</div>
        <div>${ticket.description ? ticket.description.substring(0, 120) + (ticket.description.length > 120 ? '...' : '') : ''}</div>
        <div class="ticket-meta">
          <span>Priority: ${ticket.priority}</span>
          <span>Created: ${date}</span>
        </div>
        <span class="status status-${ticket.status.toLowerCase().replace(' ', '-')}">
          ${ticket.status}
        </span>
      `;

      // Click to cycle status
      li.addEventListener("click", async () => {
        const statuses = ["Open", "In Progress", "Resolved"];
        let current = statuses.indexOf(ticket.status);
        let nextStatus = statuses[(current + 1) % statuses.length];

        if (nextStatus === "Resolved" && !confirm("Mark ticket as Resolved?")) return;

        try {
          const res = await fetch(`${API_URL}/${ticket.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus })
          });

          if (!res.ok) throw new Error("Failed to update status");
          fetchTickets(); // refresh
        } catch (err) {
          alert("Error updating ticket: " + err.message);
        }
      });

      ticketList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    ticketList.innerHTML = "<li>Error loading tickets</li>";
  }
}

// Create new ticket
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newTicket = {
    customer: customerName.value.trim(),
    title: ticketTitle.value.trim(),
    description: description.value.trim(),
    priority: priority.value
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicket)
    });

    if (!response.ok) throw new Error("Failed to create ticket");

    form.reset();
    fetchTickets();
  } catch (err) {
    alert("Error creating ticket: " + err.message);
  }
});

// Load tickets when page opens
fetchTickets();