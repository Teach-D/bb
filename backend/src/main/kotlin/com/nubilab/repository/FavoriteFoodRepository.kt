package com.nubilab.repository

import com.nubilab.domain.FavoriteFood
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface FavoriteFoodRepository : JpaRepository<FavoriteFood, Long> {

    fun findAllByOrderByCreatedAtDesc(): List<FavoriteFood>
}
