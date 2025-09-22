package com.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private UserResponseDto user;
    
    public JwtAuthenticationResponse(String accessToken, UserResponseDto user) {
        this.accessToken = accessToken;
        this.user = user;
    }
}