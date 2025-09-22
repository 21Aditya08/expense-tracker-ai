package com.expensetracker.controller;

import com.expensetracker.dto.ExpenseDto;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public List<ExpenseDto> list(@AuthenticationPrincipal UserPrincipal principal) {
        return expenseService.list(principal.getId());
    }

    @PostMapping
    public ResponseEntity<ExpenseDto> create(@AuthenticationPrincipal UserPrincipal principal,
                                             @Valid @RequestBody ExpenseDto dto) {
        return ResponseEntity.ok(expenseService.create(principal.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDto> update(@AuthenticationPrincipal UserPrincipal principal,
                                             @PathVariable Long id,
                                             @Valid @RequestBody ExpenseDto dto) {
        return ResponseEntity.ok(expenseService.update(principal.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal,
                                       @PathVariable Long id) {
        expenseService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
