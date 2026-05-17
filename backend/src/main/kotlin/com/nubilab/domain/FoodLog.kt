package com.nubilab.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(
    name = "food_logs",
    indexes = [
        Index(name = "idx_food_logs_meal_type", columnList = "mealType"),
        Index(name = "idx_food_logs_logged_at", columnList = "loggedAt"),
    ]
)
class FoodLog(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var foodName: String,

    @Column(nullable = false)
    var calories: Int,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var mealType: MealType,

    @Column(nullable = false)
    var carbohydrate: Double,

    @Column(nullable = false)
    var protein: Double,

    @Column(nullable = false)
    var fat: Double,

    @Column(nullable = false)
    val loggedAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = true)
    var favoriteFoodId: Long? = null,
)
