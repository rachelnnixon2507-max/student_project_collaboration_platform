package com.project.platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("local")
class PlatformApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the full Spring Boot application context, entities, repositories, and seeders load correctly
    }
}
