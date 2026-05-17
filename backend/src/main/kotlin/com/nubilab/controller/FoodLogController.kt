package com.nubilab.controller

import com.nubilab.dto.FoodLogListResponse
import com.nubilab.dto.FoodLogRequest
import com.nubilab.dto.FoodLogResponse
import com.nubilab.dto.FoodLogSearchSuggestionsResponse
import com.nubilab.dto.FoodLogStatsResponse
import com.nubilab.dto.FoodLogUpdateRequest
import com.nubilab.service.FoodLogService
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.format.DateTimeParseException

@RestController
@RequestMapping("/api/food-logs")
@CrossOrigin(origins = ["http://localhost:3000"])
class FoodLogController(
    private val foodLogService: FoodLogService,
) {

    /**
     * 기능 1: 음식 기록 추가
     * POST /api/food-logs
     */
    @PostMapping
    fun addFoodLog(@Valid @RequestBody request: FoodLogRequest): ResponseEntity<FoodLogResponse> {
        val response = foodLogService.addFoodLog(request)
        return ResponseEntity.status(201).body(response)
    }

    /**
     * 기능 2: 음식 기록 목록 조회 (페이징)
     * GET /api/food-logs?page=0&size=20&date=2026-05-17
     * date 파라미터 없으면 전체 조회, 있으면 해당 날짜 필터링
     */
    @GetMapping
    fun getFoodLogs(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) date: String?,
    ): ResponseEntity<FoodLogListResponse> {
        val parsedDate: LocalDate? = if (!date.isNullOrBlank()) {
            try {
                LocalDate.parse(date)
            } catch (e: DateTimeParseException) {
                return ResponseEntity.badRequest().build()
            }
        } else {
            null
        }
        val pageable = PageRequest.of(page, size, Sort.by("id").ascending())
        return ResponseEntity.ok(foodLogService.getFoodLogs(pageable, parsedDate))
    }

    /**
     * 기능 3: 식사 유형별 칼로리 통계 조회
     * GET /api/food-logs/stats
     */
    @GetMapping("/stats")
    fun getFoodLogStats(): ResponseEntity<FoodLogStatsResponse> {
        return ResponseEntity.ok(foodLogService.getFoodLogStats())
    }

    /**
     * 기능 4: 음식 이름 자동완성 검색
     * GET /api/food-logs/search?q={keyword}
     */
    @GetMapping("/search")
    fun searchFoodNames(@RequestParam q: String): ResponseEntity<FoodLogSearchSuggestionsResponse> {
        return ResponseEntity.ok(foodLogService.searchFoodNameSuggestions(q))
    }

    /**
     * 기능 5: 음식 기록 수정 (부분 수정)
     * PATCH /api/food-logs/{id}
     */
    @PatchMapping("/{id}")
    fun updateFoodLog(
        @PathVariable id: Long,
        @Valid @RequestBody request: FoodLogUpdateRequest,
    ): ResponseEntity<FoodLogResponse> {
        val response = foodLogService.updateFoodLog(id, request)
        return ResponseEntity.ok(response)
    }
}
