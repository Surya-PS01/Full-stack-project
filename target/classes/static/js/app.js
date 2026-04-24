
const API_BASE = 'http://localhost:8080';


function submitTicket() {
    var subject = document.getElementById('subject').value.trim();
    var description = document.getElementById('description').value.trim();

    if (!subject || !description) {
        alert('Please fill in all fields.');
        return;
    }

    fetch(API_BASE + '/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject, description: description })
    })
    .then(function (response) { return response.json(); })
    .then(function (data) {
        alert('Ticket created successfully!\nYour Ticket ID: ' + data.id + '\n\nPlease save this ID to track your ticket.');
        document.getElementById('subject').value = '';
        document.getElementById('description').value = '';
    })
    .catch(function (error) {
        alert('Error creating ticket. Please try again.');
        console.error(error);
    });
}


function trackTicket() {
    var ticketId = document.getElementById('ticketId').value.trim();
    var resultDiv = document.getElementById('ticketResult');

    if (!ticketId) {
        alert('Please enter a Ticket ID.');
        return;
    }

    fetch(API_BASE + '/tickets/' + ticketId)
    .then(function (response) {
        if (!response.ok) {
            throw new Error('Ticket not found');
        }
        return response.json();
    })
    .then(function (data) {
        var badgeClass = data.status === 'resolved' ? 'badge-resolved' : 'badge-pending';
        resultDiv.className = 'ticket-result';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML =
            '<h3>Ticket Details</h3>' +
            '<div class="detail"><span>Ticket ID</span><span>#' + data.id + '</span></div>' +
            '<div class="detail"><span>Subject</span><span>' + escapeHtml(data.subject) + '</span></div>' +
            '<div class="detail"><span>Description</span><span>' + escapeHtml(data.description) + '</span></div>' +
            '<div class="detail"><span>Status</span><span class="badge ' + badgeClass + '">' + data.status + '</span></div>';
    })
    .catch(function (error) {
        resultDiv.className = 'ticket-result error';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<h3>Not Found</h3><p>No ticket found with the given ID. Please check and try again.</p>';
    });
}


function adminLogin() {
    var pin = document.getElementById('pin').value.trim();

    if (!pin) {
        alert('Please enter the admin PIN.');
        return;
    }

    fetch(API_BASE + '/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin })
    })
    .then(function (response) { return response.json(); })
    .then(function (data) {
        if (data.success) {
            // Store admin session and redirect
            sessionStorage.setItem('adminAuth', 'true');
            window.location.href = 'admin-dashboard.html';
        } else {
            alert('Invalid PIN. Please try again.');
        }
    })
    .catch(function (error) {
        alert('Error connecting to server.');
        console.error(error);
    });
}


function loadDashboard() {
    // Check if admin is logged in
    if (sessionStorage.getItem('adminAuth') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    fetch(API_BASE + '/tickets')
    .then(function (response) { return response.json(); })
    .then(function (tickets) {
        var tbody = document.getElementById('ticketsTableBody');
        var totalEl = document.getElementById('totalCount');
        var pendingEl = document.getElementById('pendingCount');
        var resolvedEl = document.getElementById('resolvedCount');

        var pending = 0;
        var resolved = 0;

        tickets.forEach(function (t) {
            if (t.status === 'resolved') resolved++;
            else pending++;
        });

        totalEl.textContent = tickets.length;
        pendingEl.textContent = pending;
        resolvedEl.textContent = resolved;

        if (tickets.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="5">' +
                '<div class="empty-state"><div class="icon">📭</div><p>No tickets yet.</p></div>' +
                '</td></tr>';
            return;
        }

        var rows = '';
        tickets.forEach(function (ticket) {
            var badgeClass = ticket.status === 'resolved' ? 'badge-resolved' : 'badge-pending';
            var actionBtn = '';
            if (ticket.status !== 'resolved') {
                actionBtn = '<button class="btn btn-success" onclick="resolveTicket(' + ticket.id + ')">✓ Resolve</button>';
            } else {
                actionBtn = '<span style="color: var(--text-muted); font-size: 0.85rem;">Done</span>';
            }

            rows +=
                '<tr>' +
                '<td><strong>#' + ticket.id + '</strong></td>' +
                '<td>' + escapeHtml(ticket.subject) + '</td>' +
                '<td>' + escapeHtml(ticket.description) + '</td>' +
                '<td><span class="badge ' + badgeClass + '">' + ticket.status + '</span></td>' +
                '<td>' + actionBtn + '</td>' +
                '</tr>';
        });

        tbody.innerHTML = rows;
    })
    .catch(function (error) {
        console.error('Error loading tickets:', error);
    });
}


function resolveTicket(id) {
    fetch(API_BASE + '/tickets/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
    })
    .then(function (response) { return response.json(); })
    .then(function (data) {
        loadDashboard(); // Refresh the table
    })
    .catch(function (error) {
        alert('Error resolving ticket.');
        console.error(error);
    });
}


function adminLogout() {
    sessionStorage.removeItem('adminAuth');
    window.location.href = 'admin-login.html';
}


function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
