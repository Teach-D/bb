package com.nubilab.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "favorite_foods")
class FavoriteFood(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val foodName: String,

    @Column(nullable = false)
    val calories: Int,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val mealType: MealType,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
)
