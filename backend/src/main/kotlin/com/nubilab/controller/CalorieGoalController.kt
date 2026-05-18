package com.nubilab.controller

import com.nubilab.dto.CalorieGoalRequest
import com.nubilab.dto.CalorieGoalResponse
import com.nubilab.dto.TodayAchievementResponse
import com.nubilab.service.CalorieGoalService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/calorie-goals")
@CrossOrigin(origins = ["http://localhost:3000"])
class CalorieGoalController(
    private val calorieGoalService: CalorieGoalService,
) {

    /**
     * 목표 칼로리 설정 (upsert)
     * POST /api/calorie-goals
     */
    @PostMapping
    fun upsertCalorieGoal(
        @Valid @RequestBody request: CalorieGoalRequest,
    ): ResponseEntity<CalorieGoalResponse> {
        val response = calorieGoalService.upsertCalorieGoal(request)
        return ResponseEntity.status(201).body(response)
    }

    /**
     * 오늘 칼로리 달성률 조회
     * GET /api/calorie-goals/today
     */
    @GetMapping("/today")
    fun getTodayAchievement(): ResponseEntity<TodayAchievementResponse> {
        return ResponseEntity.ok(calorieGoalService.getTodayAchievement())
    }
}
