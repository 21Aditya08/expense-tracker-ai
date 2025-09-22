package com.expensetracker.it;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.junit.jupiter.api.AfterAll;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class IntegrationTestBase {

    private static boolean USE_TESTCONTAINERS = false;

    // Declare but do not initialize to avoid touching Docker when disabled
    @Container
    static MySQLContainer<?> mysql;

    @BeforeAll
    static void initEnvironment() {
        // Enable Testcontainers via -DuseTestcontainers=true or env USE_TESTCONTAINERS=true
        String sys = System.getProperty("useTestcontainers");
        String env = System.getenv("USE_TESTCONTAINERS");
        USE_TESTCONTAINERS = Boolean.parseBoolean(sys != null ? sys : (env != null ? env : "false"));

        if (USE_TESTCONTAINERS) {
            mysql = new MySQLContainer<>("mysql:8.0")
                    .withDatabaseName("expense_tracker_test")
                    .withUsername("test")
                    .withPassword("test");
            // Start container only when explicitly enabled
            mysql.start();
        }
    }

    @DynamicPropertySource
    static void registerProps(DynamicPropertyRegistry registry) {
    // Common test props - use 32+ byte secret to satisfy JJWT requirements
    registry.add("jwt.secret", () -> "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
        registry.add("spring.main.allow-bean-definition-overriding", () -> "true");

        if (USE_TESTCONTAINERS) {
            // Wire Testcontainers MySQL
            registry.add("spring.datasource.url", mysql::getJdbcUrl);
            registry.add("spring.datasource.username", mysql::getUsername);
            registry.add("spring.datasource.password", mysql::getPassword);
            registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
            registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        } else {
            // Fallback to in-memory H2 for local runs without Docker
            registry.add("spring.datasource.url", () -> "jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
            registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
            registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.H2Dialect");
            registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
            registry.add("spring.h2.console.enabled", () -> "true");
        }
    }

    @AfterAll
    static void tearDown() {
        if (mysql != null) {
            try {
                mysql.stop();
            } catch (Exception ignored) {
            }
        }
    }
}
