package com.trackmybus.controller;

import com.trackmybus.model.Passenger;
import com.trackmybus.repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passengers")
@CrossOrigin(origins = "*")
public class PassengerController {

    @Autowired
    private PassengerRepository passengerRepository;

    @GetMapping
    public List<Passenger> getAllPassengers() {
        return passengerRepository.findAll();
    }

    @GetMapping("/bus/{busId}")
    public List<Passenger> getPassengersByBusId(@PathVariable String busId) {
        return passengerRepository.findByBusId(busId);
    }

    @PostMapping("/add")
    public Passenger addPassenger(@RequestBody Passenger passenger) {
        return passengerRepository.save(passenger);
    }

    @DeleteMapping("/{id}")
    public String deletePassenger(@PathVariable Long id) {
        passengerRepository.deleteById(id);
        return "Passenger removed successfully";
    }

    // New endpoint to generate random passengers for a given bus
    @PostMapping("/generate")
    public List<Passenger> generatePassengers(@RequestParam String busId, @RequestParam(defaultValue = "5") int count) {
        List<Passenger> generated = new java.util.ArrayList<>();
        String[] firstNames = {"Arun", "Bala", "Chitra", "Divya", "Eka", "Feroz", "Gita", "Hari", "Isha", "Jai"};
        String[] lastNames = {"Kumar", "Rao", "Singh", "Patel", "Sharma", "Gupta", "Iyer", "Menon", "Nair", "Joshi"};
        java.util.Random rand = new java.util.Random();
        for (int i = 0; i < count; i++) {
            String name = firstNames[rand.nextInt(firstNames.length)] + " " + lastNames[rand.nextInt(lastNames.length)];
            String phone = "9" + (100000000 + rand.nextInt(900000000)); // simple 10‑digit Indian mobile
            // For simplicity use generic boarding/destination points
            String boarding = "Stop" + (rand.nextInt(5) + 1);
            String destination = "Stop" + (rand.nextInt(5) + 6);
            Passenger p = new Passenger(name, phone, boarding, destination, busId);
            generated.add(p);
        }
        return passengerRepository.saveAll(generated);
    }
}
