package com.nubilab.repository

import com.nubilab.domain.CalorieGoal
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional

@Repository
interface CalorieGoalRepository : JpaRepository<CalorieGoal, Long> {

    fun findByDate(date: LocalDate): Optional<CalorieGoal>
}
