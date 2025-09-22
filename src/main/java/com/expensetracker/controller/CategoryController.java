package com.expensetracker.controller;

import com.expensetracker.dto.CategoryDto;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public List<CategoryDto> list(@AuthenticationPrincipal UserPrincipal principal) {
        return categoryService.listCategories(principal.getId());
    }

    @PostMapping
    public ResponseEntity<CategoryDto> create(@AuthenticationPrincipal UserPrincipal principal,
                                              @Valid @RequestBody CategoryDto dto) {
        return ResponseEntity.ok(categoryService.createCategory(principal.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> update(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable Long id,
                                              @Valid @RequestBody CategoryDto dto) {
        return ResponseEntity.ok(categoryService.updateCategory(principal.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal,
                                       @PathVariable Long id) {
        categoryService.deleteCategory(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
