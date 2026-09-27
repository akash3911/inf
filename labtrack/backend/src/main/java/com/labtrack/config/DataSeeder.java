package com.labtrack.config;

import com.labtrack.entity.Equipment;
import com.labtrack.entity.User;
import com.labtrack.repository.EquipmentRepository;
import com.labtrack.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(UserRepository users, EquipmentRepository equipment, PasswordEncoder encoder) {
        return args -> {
            if (users.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(encoder.encode("admin123"));
                admin.setRole("ADMIN");
                users.save(admin);
            }
            if (users.findByUsername("staff").isEmpty()) {
                User staff = new User();
                staff.setUsername("staff");
                staff.setPassword(encoder.encode("staff123"));
                staff.setRole("STAFF");
                users.save(staff);
            }
            if (equipment.count() == 0) {
                for (String[] row : new String[][]{
                        {"Oscilloscope", "Electronics", "Lab A-101"},
                        {"3D Printer", "Fabrication", "Lab B-202"},
                        {"Centrifuge", "Chemistry", "Lab C-303"}}) {
                    Equipment e = new Equipment();
                    e.setName(row[0]);
                    e.setCategory(row[1]);
                    e.setLocation(row[2]);
                    e.setStatus("AVAILABLE");
                    equipment.save(e);
                }
            }
        };
    }
}
