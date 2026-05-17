package com.nubilab.service

import com.nubilab.domain.FavoriteFood
import com.nubilab.domain.FoodLog
import com.nubilab.dto.FavoriteFoodListResponse
import com.nubilab.dto.FavoriteFoodLogRequest
import com.nubilab.dto.FavoriteFoodRequest
import com.nubilab.dto.FavoriteFoodResponse
import com.nubilab.dto.FoodLogResponse
import com.nubilab.exception.FavoriteFoodNotFoundException
import com.nubilab.repository.FavoriteFoodRepository
import com.nubilab.repository.FoodLogRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FavoriteFoodService(
    private val favoriteFoodRepository: FavoriteFoodRepository,
    private val foodLogRepository: FoodLogRepository,
) {

    /**
     * 기능 3: 즐겨찾기 추가
     */
    @Transactional
    fun addFavoriteFood(request: FavoriteFoodRequest): FavoriteFoodResponse {
        val favoriteFood = FavoriteFood(
            foodName = request.foodName,
            calories = request.calories,
            mealType = request.mealType,
        )
        return favoriteFoodRepository.save(favoriteFood).toResponse()
    }

    /**
     * 기능 4: 즐겨찾기 목록 조회 (createdAt 내림차순)
     */
    @Transactional(readOnly = true)
    fun getFavoriteFoods(): FavoriteFoodListResponse {
        val favorites = favoriteFoodRepository.findAllByOrderByCreatedAtDesc()
        return FavoriteFoodListResponse(
            favorites = favorites.map { it.toResponse() },
            total = favorites.size,
        )
    }

    /**
     * 기능 5: 즐겨찾기 삭제
     */
    @Transactional
    fun deleteFavoriteFood(id: Long) {
        if (!favoriteFoodRepository.existsById(id)) {
            throw FavoriteFoodNotFoundException(id)
        }
        favoriteFoodRepository.deleteById(id)
    }

    /**
     * 기능 6: 즐겨찾기로 빠른 기록 (food_logs에 저장)
     * mealType이 null이면 즐겨찾기에 저장된 mealType 사용
     */
    @Transactional
    fun logFromFavorite(id: Long, request: FavoriteFoodLogRequest): FoodLogResponse {
        val favoriteFood = favoriteFoodRepository.findById(id)
            .orElseThrow { FavoriteFoodNotFoundException(id) }

        val appliedMealType = request.mealType ?: favoriteFood.mealType

        val foodLog = FoodLog(
            foodName = favoriteFood.foodName,
            calories = favoriteFood.calories,
            mealType = appliedMealType,
            favoriteFoodId = favoriteFood.id,
        )
        return foodLogRepository.save(foodLog).toFoodLogResponse()
    }

    // ─── Helper ────────────────────────────────────────────
    private fun FavoriteFood.toResponse() = FavoriteFoodResponse(
        id = id,
        foodName = foodName,
        calories = calories,
        mealType = mealType.name,
        createdAt = createdAt,
    )

    private fun FoodLog.toFoodLogResponse() = FoodLogResponse(
        id = id,
        foodName = foodName,
        calories = calories,
        mealType = mealType.name,
        loggedAt = loggedAt,
        favoriteFoodId = favoriteFoodId,
    )
}
