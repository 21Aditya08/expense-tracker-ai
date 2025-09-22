package com.expensetracker.service;

import com.expensetracker.dto.CategoryDto;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CategoryDto> listCategories(Long userId, String type,
                                                                           org.springframework.data.domain.Pageable pageable) {
        requireUser(userId);
        org.springframework.data.jpa.domain.Specification<Category> spec = (root, q, cb) -> cb.and(
                cb.equal(root.get("user").get("id"), userId),
                cb.isTrue(root.get("isActive"))
        );
        if (type != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("type"), Category.CategoryType.valueOf(type.toUpperCase())));
        }
        return categoryRepository.findAll(spec, pageable).map(this::toDto);
    }

    @Transactional
    public CategoryDto createCategory(Long userId, CategoryDto dto) {
        User user = requireUser(userId);
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setIconName(dto.getIconName());
        category.setColorCode(dto.getColorCode());
        category.setIsActive(true);
        category.setUser(user);
        if (dto.getType() != null) {
            category.setType(Category.CategoryType.valueOf(dto.getType().toUpperCase()));
        }
        Category saved = categoryRepository.save(category);
        return toDto(saved);
    }

    @Transactional
    public CategoryDto updateCategory(Long userId, Long id, CategoryDto dto) {
        User user = requireUser(userId);
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (dto.getName() != null) category.setName(dto.getName());
        if (dto.getDescription() != null) category.setDescription(dto.getDescription());
        if (dto.getIconName() != null) category.setIconName(dto.getIconName());
        if (dto.getColorCode() != null) category.setColorCode(dto.getColorCode());
        if (dto.getIsActive() != null) category.setIsActive(dto.getIsActive());
        if (dto.getType() != null) category.setType(Category.CategoryType.valueOf(dto.getType().toUpperCase()));
        Category saved = categoryRepository.save(category);
        return toDto(saved);
    }

    @Transactional
    public void deleteCategory(Long userId, Long id) {
        User user = requireUser(userId);
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private CategoryDto toDto(Category c) {
        CategoryDto dto = new CategoryDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDescription(c.getDescription());
        dto.setIconName(c.getIconName());
        dto.setColorCode(c.getColorCode());
        dto.setIsActive(c.getIsActive());
        dto.setType(c.getType() != null ? c.getType().name() : null);
        return dto;
    }
}
