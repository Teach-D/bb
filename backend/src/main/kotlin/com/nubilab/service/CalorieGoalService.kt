package com.nubilab.service

import com.nubilab.domain.CalorieGoal
import com.nubilab.dto.CalorieGoalRequest
import com.nubilab.dto.CalorieGoalResponse
import com.nubilab.dto.TodayAchievementResponse
import com.nubilab.repository.CalorieGoalRepository
import com.nubilab.repository.FoodLogRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class CalorieGoalService(
    private val calorieGoalRepository: CalorieGoalRepository,
    private val foodLogRepository: FoodLogRepository,
) {

    /**
     * 목표 칼로리 설정 (upsert)
     * 오늘 날짜 목표가 이미 있으면 targetCalories 업데이트, 없으면 신규 저장
     */
    @Transactional
    fun upsertCalorieGoal(request: CalorieGoalRequest): CalorieGoalResponse {
        val today = LocalDate.now()
        val existing = calorieGoalRepository.findByDate(today)

        val calorieGoal = if (existing.isPresent) {
            val goal = existing.get()
            goal.targetCalories = request.targetCalories
            goal
        } else {
            calorieGoalRepository.save(
                CalorieGoal(
                    targetCalories = request.targetCalories,
                    date = today,
                )
            )
        }

        return calorieGoal.toResponse()
    }

    /**
     * 오늘 칼로리 달성률 조회
     */
    @Transactional(readOnly = true)
    fun getTodayAchievement(): TodayAchievementResponse {
        val today = LocalDate.now()
        val start = today.atStartOfDay()
        val end = today.plusDays(1).atStartOfDay()

        val consumedCalories = foodLogRepository.sumCaloriesBetween(start, end).toInt()
        val goal = calorieGoalRepository.findByDate(today).orElse(null)

        return if (goal == null) {
            TodayAchievementResponse(
                targetCalories = null,
                consumedCalories = consumedCalories,
                achievementRate = null,
                exceeded = false,
                warningMessage = "오늘의 목표 칼로리가 설정되지 않았습니다.",
            )
        } else {
            val targetCalories = goal.targetCalories
            val achievementRate = Math.round(consumedCalories.toDouble() / targetCalories * 100 * 10) / 10.0
            val exceeded = consumedCalories > targetCalories
            val warningMessage = if (exceeded) {
                "오늘 목표 칼로리를 초과했습니다! ${consumedCalories - targetCalories}kcal 초과"
            } else {
                null
            }

            TodayAchievementResponse(
                targetCalories = targetCalories,
                consumedCalories = consumedCalories,
                achievementRate = achievementRate,
                exceeded = exceeded,
                warningMessage = warningMessage,
            )
        }
    }

    // ─── Helper ────────────────────────────────────────────
    private fun CalorieGoal.toResponse() = CalorieGoalResponse(
        id = id,
        targetCalories = targetCalories,
        date = date,
    )
}
