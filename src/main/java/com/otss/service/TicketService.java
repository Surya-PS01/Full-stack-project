package com.otss.service;

import com.otss.entity.Ticket;
import com.otss.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    // Create a new ticket
    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus("pending");
        return ticketRepository.save(ticket);
    }

    // Get ticket by ID
    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    // Get all tickets
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // Update ticket status
    public Ticket updateTicketStatus(Long id, String status) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(id);
        if (optionalTicket.isPresent()) {
            Ticket ticket = optionalTicket.get();
            ticket.setStatus(status);
            return ticketRepository.save(ticket);
        }
        return null;
    }
}
