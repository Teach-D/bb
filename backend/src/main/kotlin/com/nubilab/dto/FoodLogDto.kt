package com.nubilab.dto

import com.nubilab.domain.MealType
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

// ─── Request ───────────────────────────────────────────────
data class FoodLogRequest(
    @field:NotBlank(message = "음식 이름은 필수입니다.")
    val foodName: String,

    @field:Min(value = 0, message = "칼로리는 0 이상이어야 합니다.")
    val calories: Int,

    val mealType: MealType,

    @field:DecimalMin(value = "0.0", message = "탄수화물은 0 이상이어야 합니다")
    val carbohydrate: Double,

    @field:DecimalMin(value = "0.0", message = "단백질은 0 이상이어야 합니다")
    val protein: Double,

    @field:DecimalMin(value = "0.0", message = "지방은 0 이상이어야 합니다")
    val fat: Double,
)

// ─── Update Request ────────────────────────────────────────
data class FoodLogUpdateRequest(
    @field:NotBlank(message = "음식 이름은 비어있을 수 없습니다.")
    val foodName: String?,

    @field:Min(value = 1, message = "칼로리는 1 이상이어야 합니다.")
    val calories: Int?,

    val mealType: MealType?,
)

// ─── Response ──────────────────────────────────────────────
data class FoodLogResponse(
    val id: Long,
    val foodName: String,
    val calories: Int,
    val mealType: String,
    val carbohydrate: Double,
    val protein: Double,
    val fat: Double,
    val loggedAt: LocalDateTime,
    val favoriteFoodId: Long? = null,
)

data class FoodLogListResponse(
    val logs: List<FoodLogResponse>,
    val totalCalories: Int,       // 전체 records의 합산 (페이지 무관)
    val totalCarbohydrate: Double,
    val totalProtein: Double,
    val totalFat: Double,
    val page: Int,
    val size: Int,
    val totalElements: Long,
)

// ─── Stats Response ────────────────────────────────────────
data class MealTypeStat(
    val mealType: String,
    val totalCalories: Int,
    val ratio: Double,
)

data class FoodLogStatsResponse(
    val stats: List<MealTypeStat>,
    val grandTotalCalories: Int,
    val dailyRecommended: Int = 2000,
)

// ─── Weekly Response ───────────────────────────────────────
data class DailyCalories(
    val date: String,
    val totalCalories: Int,
)

data class WeeklyCaloriesResponse(
    val data: List<DailyCalories>,
)

// ─── Search Response ───────────────────────────────────────
data class FoodLogSearchSuggestionsResponse(
    val suggestions: List<String>,
)

