package com.expensetracker.repository;

import com.expensetracker.entity.Category;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    Page<Expense> findByUserOrderByExpenseDateDesc(User user, Pageable pageable);
    
    Optional<Expense> findByIdAndUser(Long id, User user);
    
    List<Expense> findByUserAndExpenseDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    List<Expense> findByUserAndCategory(User user, Category category);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.type = 'EXPENSE' AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalExpensesByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.type = 'INCOME' AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalIncomeByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e.category.name, SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.type = 'EXPENSE' AND e.expenseDate BETWEEN :startDate AND :endDate GROUP BY e.category.name")
    List<Object[]> getExpensesByCategoryAndDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(e) FROM Expense e WHERE e.user = :user")
    Long countByUser(@Param("user") User user);
    
    List<Expense> findByUserAndIsRecurringTrue(User user);
}