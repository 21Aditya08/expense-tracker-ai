package com.expensetracker.controller;

import com.expensetracker.dto.ExpenseDto;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public org.springframework.data.domain.Page<ExpenseDto> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) java.time.LocalDate startDate,
            @RequestParam(required = false) java.time.LocalDate endDate,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) java.math.BigDecimal minAmount,
            @RequestParam(required = false) java.math.BigDecimal maxAmount,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "expenseDate,desc") String sort
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by(sort.split(",")[0]).descending());
        if (sort.contains(",") && sort.split(",").length > 1 && sort.split(",")[1].equalsIgnoreCase("asc")) {
            pageable = org.springframework.data.domain.PageRequest.of(page, size,
                    org.springframework.data.domain.Sort.by(sort.split(",")[0]).ascending());
        }
        return expenseService.list(principal.getId(), startDate, endDate, categoryId, type, minAmount, maxAmount, pageable);
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
