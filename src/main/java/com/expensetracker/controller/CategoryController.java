package com.expensetracker.controller;

import com.expensetracker.dto.CategoryDto;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public org.springframework.data.domain.Page<CategoryDto> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sort.endsWith(",desc") ? org.springframework.data.domain.Sort.by(sort.split(",")[0]).descending() : org.springframework.data.domain.Sort.by(sort.split(",")[0]).ascending());
        return categoryService.listCategories(principal.getId(), type, pageable);
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
