package com.expensetracker.it;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AuthIntegrationTest extends IntegrationTestBase {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void signup_login_me_flow() throws Exception {
        var signupPayload = Map.of(
                "username", "testuser",
                "email", "test@example.com",
                "password", "Password123!",
                "name", "Test User"
        );

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupPayload)))
                .andExpect(status().isOk());

        var loginPayload = Map.of(
                "usernameOrEmail", "testuser",
                "password", "Password123!"
        );

        var loginResponse = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        var map = objectMapper.readValue(loginResponse, Map.class);
        var token = (String) map.get("accessToken");
        assertThat(token).isNotBlank();

        mockMvc.perform(get("/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
