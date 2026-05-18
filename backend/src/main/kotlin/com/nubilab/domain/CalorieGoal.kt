package com.nubilab.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import java.time.LocalDate

@Entity
@Table(
    name = "calorie_goals",
    indexes = [Index(name = "idx_calorie_goals_date", columnList = "date")]
)
class CalorieGoal(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var targetCalories: Int,

    @Column(nullable = false, unique = true)
    val date: LocalDate = LocalDate.now(),
)
