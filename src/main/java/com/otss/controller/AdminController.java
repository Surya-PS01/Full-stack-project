package com.otss.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    // Hardcoded admin PIN
    private static final String ADMIN_PIN = "1234";

    // POST /admin/login → simple PIN-based authentication
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String pin = body.get("pin");
        Map<String, Object> response = new HashMap<>();

        if (ADMIN_PIN.equals(pin)) {
            response.put("success", true);
            response.put("message", "Login successful");
        } else {
            response.put("success", false);
            response.put("message", "Invalid PIN");
        }

        return ResponseEntity.ok(response);
    }
}
