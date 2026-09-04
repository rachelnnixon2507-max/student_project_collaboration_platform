package com.project.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point.
 *
 * NOTE FOR TEAM: In the real shared repo there should be only ONE
 * @SpringBootApplication class for the whole project. If one already
 * exists (owned by another member), DO NOT add this class again —
 * just merge the package scanning (this module already lives under
 * com.project.platform so component scanning "just works").
 */
@SpringBootApplication
public class PlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlatformApplication.class, args);
    }
}
