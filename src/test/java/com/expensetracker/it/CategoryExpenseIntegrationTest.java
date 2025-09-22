package com.expensetracker.it;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class CategoryExpenseIntegrationTest extends IntegrationTestBase {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    String token;

    @BeforeEach
    void setupUser() throws Exception {
        var signupPayload = Map.of(
                "username", "catuser",
                "email", "cat@example.com",
                "password", "Password123!",
                "name", "Cat User"
        );
        mockMvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupPayload))).andExpect(status().isOk());

        var loginPayload = Map.of("usernameOrEmail", "catuser", "password", "Password123!");
        var loginResponse = mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginPayload))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var map = objectMapper.readValue(loginResponse, Map.class);
        token = (String) map.get("accessToken");
        assertThat(token).isNotBlank();
    }

    @Test
    void create_category_and_expense_then_list_with_filters() throws Exception {
        var categoryPayload = Map.of(
                "name", "Food",
                "description", "Meals",
                "type", "EXPENSE"
        );
        var catRes = mockMvc.perform(post("/categories").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(categoryPayload)))
                        .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        JsonNode catJson = objectMapper.readTree(catRes);
        long categoryId = catJson.get("id").asLong();

        var today = LocalDate.now().toString();
        var expensePayload = Map.of(
                "title", "Lunch",
                "description", "Burger",
                "amount", 12.50,
                "expenseDate", today,
                "categoryId", categoryId
        );
        mockMvc.perform(post("/expenses").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(expensePayload)))
                        .andExpect(status().isOk());

        var listResponse = mockMvc.perform(get("/expenses").header("Authorization", "Bearer " + token)
                .param("startDate", today).param("endDate", today))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        JsonNode listJson = objectMapper.readTree(listResponse);
        assertThat(listJson.get("content").isArray()).isTrue();
        assertThat(listJson.get("content").size()).isGreaterThanOrEqualTo(1);
    }
}
