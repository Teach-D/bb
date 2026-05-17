package com.nubilab.service

import com.nubilab.domain.FoodLog
import com.nubilab.domain.MealType
import com.nubilab.dto.FoodLogListResponse
import com.nubilab.dto.FoodLogRequest
import com.nubilab.dto.FoodLogResponse
import com.nubilab.dto.FoodLogSearchSuggestionsResponse
import com.nubilab.dto.FoodLogStatsResponse
import com.nubilab.dto.FoodLogUpdateRequest
import com.nubilab.dto.MealTypeStat
import com.nubilab.exception.FoodLogNotFoundException
import com.nubilab.repository.FoodLogRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class FoodLogService(
    private val foodLogRepository: FoodLogRepository,
) {

    /**
     * 기능 1: 음식 기록 추가
     */
    @Transactional
    fun addFoodLog(request: FoodLogRequest): FoodLogResponse {
        val foodLog = FoodLog(
            foodName = request.foodName,
            calories = request.calories,
            mealType = request.mealType,
        )
        return foodLogRepository.save(foodLog).toResponse()
    }

    /**
     * 기능 2: 음식 기록 목록 조회 (페이징)
     * date가 null이면 전체 조회, null이 아니면 해당 날짜 00:00:00 ~ 23:59:59 범위 필터링
     */
    @Transactional(readOnly = true)
    fun getFoodLogs(pageable: Pageable, date: LocalDate?): FoodLogListResponse {
        val (page, totalCalories) = if (date == null) {
            val p = foodLogRepository.findAll(pageable)
            val cal = foodLogRepository.sumAllCalories().toInt()
            Pair(p, cal)
        } else {
            val start = date.atStartOfDay()
            val end = date.plusDays(1).atStartOfDay()
            val p = foodLogRepository.findByLoggedAtBetween(start, end, pageable)
            val cal = foodLogRepository.sumCaloriesBetween(start, end).toInt()
            Pair(p, cal)
        }
        return FoodLogListResponse(
            logs = page.content.map { it.toResponse() },
            totalCalories = totalCalories,
            page = pageable.pageNumber,
            size = pageable.pageSize,
            totalElements = page.totalElements,
        )
    }

    /**
     * 기능 4: 음식 기록 수정 (부분 수정)
     * null 필드는 기존 값 유지, dirty checking으로 자동 저장
     */
    @Transactional
    fun updateFoodLog(id: Long, request: FoodLogUpdateRequest): FoodLogResponse {
        val foodLog = foodLogRepository.findById(id)
            .orElseThrow { FoodLogNotFoundException(id) }

        request.foodName?.let { foodLog.foodName = it }
        request.calories?.let { foodLog.calories = it }
        request.mealType?.let { foodLog.mealType = it }

        return foodLog.toResponse()
    }

    /**
     * 기능 3: 식사 유형별 칼로리 통계 조회 (DB 집계 쿼리 사용)
     */
    @Transactional(readOnly = true)
    fun getFoodLogStats(): FoodLogStatsResponse {
        val rows = foodLogRepository.sumCaloriesByMealType()
        val caloriesByMealType: Map<MealType, Int> = rows.associate { row ->
            row[0] as MealType to (row[1] as Long).toInt()
        }

        val stats = MealType.entries.map { mealType ->
            val total = caloriesByMealType.getOrDefault(mealType, 0)
            MealTypeStat(
                mealType = mealType.name,
                totalCalories = total,
                ratio = Math.round(total / 2000.0 * 100 * 10) / 10.0,
            )
        }

        val grandTotal = caloriesByMealType.values.sum()
        return FoodLogStatsResponse(stats = stats, grandTotalCalories = grandTotal)
    }

    /**
     * 기능 4: 음식 이름 자동완성 검색
     */
    @Transactional(readOnly = true)
    fun searchFoodNameSuggestions(keyword: String): FoodLogSearchSuggestionsResponse {
        val pageable = PageRequest.of(0, 10)
        val suggestions = foodLogRepository.findDistinctFoodNamesByKeyword(keyword, pageable)
        return FoodLogSearchSuggestionsResponse(suggestions = suggestions)
    }

    // ─── Helper ────────────────────────────────────────────
    private fun FoodLog.toResponse() = FoodLogResponse(
        id = id,
        foodName = foodName,
        calories = calories,
        mealType = mealType.name,
        loggedAt = loggedAt,
        favoriteFoodId = favoriteFoodId,
    )
}
