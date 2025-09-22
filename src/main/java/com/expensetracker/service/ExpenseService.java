package com.expensetracker.service;

import com.expensetracker.dto.ExpenseDto;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
 

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ExpenseDto> list(Long userId,
                                                                 java.time.LocalDate startDate,
                                                                 java.time.LocalDate endDate,
                                                                 Long categoryId,
                                                                 String type,
                                                                 java.math.BigDecimal minAmount,
                                                                 java.math.BigDecimal maxAmount,
                                                                 org.springframework.data.domain.Pageable pageable) {
        requireUser(userId);
        org.springframework.data.jpa.domain.Specification<Expense> spec = (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
        if (startDate != null) spec = spec.and((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("expenseDate"), startDate));
        if (endDate != null) spec = spec.and((root, q, cb) -> cb.lessThanOrEqualTo(root.get("expenseDate"), endDate));
        if (categoryId != null) spec = spec.and((root, q, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        if (type != null) spec = spec.and((root, q, cb) -> cb.equal(root.get("type"), Expense.ExpenseType.valueOf(type.toUpperCase())));
        if (minAmount != null) spec = spec.and((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("amount"), minAmount));
        if (maxAmount != null) spec = spec.and((root, q, cb) -> cb.lessThanOrEqualTo(root.get("amount"), maxAmount));

        return expenseRepository.findAll(spec, pageable).map(this::toDto);
    }

    @Transactional
    public ExpenseDto create(Long userId, ExpenseDto dto) {
        validateAmount(dto.getAmount());
        User user = requireUser(userId);
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Category does not belong to current user");
        }
        Expense e = new Expense();
        e.setTitle(dto.getTitle());
        e.setDescription(dto.getDescription());
        e.setAmount(dto.getAmount());
        e.setExpenseDate(dto.getExpenseDate());
        if (dto.getType() != null) e.setType(Expense.ExpenseType.valueOf(dto.getType().toUpperCase()));
        if (dto.getPaymentMethod() != null) e.setPaymentMethod(Expense.PaymentMethod.valueOf(dto.getPaymentMethod().toUpperCase()));
        e.setNotes(dto.getNotes());
        e.setReceiptUrl(dto.getReceiptUrl());
        e.setIsRecurring(dto.getIsRecurring() != null ? dto.getIsRecurring() : false);
        if (dto.getRecurringFrequency() != null) e.setRecurringFrequency(Expense.RecurringFrequency.valueOf(dto.getRecurringFrequency().toUpperCase()));
        e.setUser(user);
        e.setCategory(category);
        Expense saved = expenseRepository.save(e);
        return toDto(saved);
    }

    @Transactional
    public ExpenseDto update(Long userId, Long id, ExpenseDto dto) {
        User user = requireUser(userId);
        Expense e = expenseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        if (dto.getTitle() != null) e.setTitle(dto.getTitle());
        if (dto.getDescription() != null) e.setDescription(dto.getDescription());
        if (dto.getAmount() != null) { validateAmount(dto.getAmount()); e.setAmount(dto.getAmount()); }
        if (dto.getExpenseDate() != null) e.setExpenseDate(dto.getExpenseDate());
        if (dto.getType() != null) e.setType(Expense.ExpenseType.valueOf(dto.getType().toUpperCase()));
        if (dto.getPaymentMethod() != null) e.setPaymentMethod(Expense.PaymentMethod.valueOf(dto.getPaymentMethod().toUpperCase()));
        if (dto.getNotes() != null) e.setNotes(dto.getNotes());
        if (dto.getReceiptUrl() != null) e.setReceiptUrl(dto.getReceiptUrl());
        if (dto.getIsRecurring() != null) e.setIsRecurring(dto.getIsRecurring());
        if (dto.getRecurringFrequency() != null) e.setRecurringFrequency(Expense.RecurringFrequency.valueOf(dto.getRecurringFrequency().toUpperCase()));
        if (dto.getCategoryId() != null) {
            Category cat = categoryRepository.findById(dto.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));
            if (!cat.getUser().getId().equals(userId)) throw new RuntimeException("Category does not belong to current user");
            e.setCategory(cat);
        }
        Expense saved = expenseRepository.save(e);
        return toDto(saved);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        User user = requireUser(userId);
        Expense e = expenseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        expenseRepository.delete(e);
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ExpenseDto toDto(Expense e) {
        ExpenseDto dto = new ExpenseDto();
        dto.setId(e.getId());
        dto.setTitle(e.getTitle());
        dto.setDescription(e.getDescription());
        dto.setAmount(e.getAmount());
        dto.setExpenseDate(e.getExpenseDate());
        dto.setType(e.getType() != null ? e.getType().name() : null);
        dto.setPaymentMethod(e.getPaymentMethod() != null ? e.getPaymentMethod().name() : null);
        dto.setNotes(e.getNotes());
        dto.setReceiptUrl(e.getReceiptUrl());
        dto.setIsRecurring(e.getIsRecurring());
        dto.setRecurringFrequency(e.getRecurringFrequency() != null ? e.getRecurringFrequency().name() : null);
        dto.setCategoryId(e.getCategory().getId());
        dto.setCategoryName(e.getCategory().getName());
        return dto;
    }
}
