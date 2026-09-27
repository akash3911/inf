package com.labtrack.repository;

import com.labtrack.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByStatus(String status);
}
