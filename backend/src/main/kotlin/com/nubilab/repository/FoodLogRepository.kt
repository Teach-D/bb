package com.nubilab.repository

import com.nubilab.domain.FoodLog
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface FoodLogRepository : JpaRepository<FoodLog, Long> {

    @Query("SELECT f.mealType, SUM(f.calories) FROM FoodLog f GROUP BY f.mealType")
    fun sumCaloriesByMealType(): List<Array<Any>>

    @Query("SELECT COALESCE(SUM(f.calories), 0) FROM FoodLog f")
    fun sumAllCalories(): Long

    @Query("SELECT COALESCE(SUM(f.carbohydrate), 0) FROM FoodLog f")
    fun sumAllCarbohydrate(): Double

    @Query("SELECT COALESCE(SUM(f.protein), 0) FROM FoodLog f")
    fun sumAllProtein(): Double

    @Query("SELECT COALESCE(SUM(f.fat), 0) FROM FoodLog f")
    fun sumAllFat(): Double

    fun findByLoggedAtBetween(start: LocalDateTime, end: LocalDateTime, pageable: Pageable): Page<FoodLog>

    fun findByLoggedAtBetween(start: LocalDateTime, end: LocalDateTime): List<FoodLog>

    @Query("SELECT COALESCE(SUM(f.calories), 0) FROM FoodLog f WHERE f.loggedAt >= :start AND f.loggedAt < :end")
    fun sumCaloriesBetween(@Param("start") start: LocalDateTime, @Param("end") end: LocalDateTime): Long

    @Query("SELECT COALESCE(SUM(f.carbohydrate), 0) FROM FoodLog f WHERE f.loggedAt >= :start AND f.loggedAt < :end")
    fun sumCarbohydrateBetween(@Param("start") start: LocalDateTime, @Param("end") end: LocalDateTime): Double

    @Query("SELECT COALESCE(SUM(f.protein), 0) FROM FoodLog f WHERE f.loggedAt >= :start AND f.loggedAt < :end")
    fun sumProteinBetween(@Param("start") start: LocalDateTime, @Param("end") end: LocalDateTime): Double

    @Query("SELECT COALESCE(SUM(f.fat), 0) FROM FoodLog f WHERE f.loggedAt >= :start AND f.loggedAt < :end")
    fun sumFatBetween(@Param("start") start: LocalDateTime, @Param("end") end: LocalDateTime): Double

    @Query("SELECT DISTINCT f.foodName FROM FoodLog f WHERE LOWER(f.foodName) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY f.foodName")
    fun findDistinctFoodNamesByKeyword(@Param("keyword") keyword: String, pageable: Pageable): List<String>
}
