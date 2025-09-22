package com.expensetracker.controller;

import com.expensetracker.dto.UserResponseDto;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponseDto getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.getUserById(principal.getId());
    }
}
