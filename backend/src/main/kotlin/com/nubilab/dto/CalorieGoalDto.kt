package com.nubilab.dto

import jakarta.validation.constraints.Min
import java.time.LocalDate

// ─── Request ───────────────────────────────────────────────
data class CalorieGoalRequest(
    @field:Min(value = 1, message = "목표 칼로리는 1 이상이어야 합니다.")
    val targetCalories: Int,
)

// ─── Response ──────────────────────────────────────────────
data class CalorieGoalResponse(
    val id: Long,
    val targetCalories: Int,
    val date: LocalDate,
)

data class TodayAchievementResponse(
    val targetCalories: Int?,
    val consumedCalories: Int,
    val achievementRate: Double?,
    val exceeded: Boolean,
    val warningMessage: String?,
)
