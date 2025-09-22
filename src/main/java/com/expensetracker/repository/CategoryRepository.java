package com.expensetracker.repository;

import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Category> {
    
    List<Category> findByUserAndIsActiveTrue(User user);
    
    Optional<Category> findByIdAndUser(Long id, User user);
    
    @Query("SELECT c FROM Category c WHERE c.user = :user AND c.name = :name AND c.isActive = true")
    Optional<Category> findByUserAndNameAndIsActiveTrue(@Param("user") User user, @Param("name") String name);
    
    @Query("SELECT COUNT(c) FROM Category c WHERE c.user = :user AND c.isActive = true")
    Long countActiveByUser(@Param("user") User user);
    
    Boolean existsByUserAndNameAndIsActiveTrue(User user, String name);
}