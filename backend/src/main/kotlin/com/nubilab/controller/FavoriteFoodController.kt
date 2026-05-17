package com.nubilab.controller

import com.nubilab.dto.FavoriteFoodListResponse
import com.nubilab.dto.FavoriteFoodLogRequest
import com.nubilab.dto.FavoriteFoodRequest
import com.nubilab.dto.FavoriteFoodResponse
import com.nubilab.dto.FoodLogResponse
import com.nubilab.service.FavoriteFoodService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/favorite-foods")
@CrossOrigin(origins = ["http://localhost:3000"])
class FavoriteFoodController(
    private val favoriteFoodService: FavoriteFoodService,
) {

    /**
     * 기능 3: 즐겨찾기 추가
     * POST /api/favorite-foods
     */
    @PostMapping
    fun addFavoriteFood(@Valid @RequestBody request: FavoriteFoodRequest): ResponseEntity<FavoriteFoodResponse> {
        val response = favoriteFoodService.addFavoriteFood(request)
        return ResponseEntity.status(201).body(response)
    }

    /**
     * 기능 4: 즐겨찾기 목록 조회
     * GET /api/favorite-foods
     */
    @GetMapping
    fun getFavoriteFoods(): ResponseEntity<FavoriteFoodListResponse> {
        return ResponseEntity.ok(favoriteFoodService.getFavoriteFoods())
    }

    /**
     * 기능 5: 즐겨찾기 삭제
     * DELETE /api/favorite-foods/{id}
     */
    @DeleteMapping("/{id}")
    fun deleteFavoriteFood(@PathVariable id: Long): ResponseEntity<Void> {
        favoriteFoodService.deleteFavoriteFood(id)
        return ResponseEntity.noContent().build()
    }

    /**
     * 기능 6: 즐겨찾기로 빠른 기록
     * POST /api/favorite-foods/{id}/log
     */
    @PostMapping("/{id}/log")
    fun logFromFavorite(
        @PathVariable id: Long,
        @RequestBody(required = false) request: FavoriteFoodLogRequest?,
    ): ResponseEntity<FoodLogResponse> {
        val response = favoriteFoodService.logFromFavorite(id, request ?: FavoriteFoodLogRequest())
        return ResponseEntity.status(201).body(response)
    }
}
