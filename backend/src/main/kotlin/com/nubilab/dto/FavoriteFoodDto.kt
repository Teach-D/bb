package com.nubilab.dto

import com.nubilab.domain.MealType
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

// ─── Request ───────────────────────────────────────────────
data class FavoriteFoodRequest(
    @field:NotBlank(message = "음식 이름은 필수입니다.")
    val foodName: String,

    @field:Min(value = 1, message = "칼로리는 1 이상이어야 합니다.")
    val calories: Int,

    val mealType: MealType,
)

data class FavoriteFoodLogRequest(
    val mealType: MealType? = null,
)

// ─── Response ──────────────────────────────────────────────
data class FavoriteFoodResponse(
    val id: Long,
    val foodName: String,
    val calories: Int,
    val mealType: String,
    val createdAt: LocalDateTime,
)

data class FavoriteFoodListResponse(
    val favorites: List<FavoriteFoodResponse>,
    val total: Int,
)
