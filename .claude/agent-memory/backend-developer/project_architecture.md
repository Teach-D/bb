---
name: project-architecture
description: nubilab-skeleton 백엔드 구현 패턴 및 현재 코드 상태 요약
metadata:
  type: project
---

nubilab-skeleton 백엔드는 Kotlin + Spring Boot 3.2.0 + Spring Data JPA + PostgreSQL 16 구성이다.

패키지 루트: `com.nubilab`
레이어: domain → dto → repository → service → controller

## 현재 구현된 도메인: FoodLog

- `domain/MealType.kt` — enum class (BREAKFAST, LUNCH, DINNER, SNACK)
- `domain/FoodLog.kt` — @Entity, mealType: MealType (@Enumerated(EnumType.STRING))
- `dto/FoodLogDto.kt` — FoodLogRequest(MealType), FoodLogResponse(mealType: String), FoodLogListResponse(페이징 포함), MealTypeStat, FoodLogStatsResponse, DailyCalorieStat, WeeklyCalorieResponse
- `repository/FoodLogRepository.kt` — sumCaloriesByMealType(): List<Array<Any>>, sumAllCalories(): Long, sumCaloriesByDateRange(start, end): List<Array<Any>> (nativeQuery=true)
- `service/FoodLogService.kt` — getFoodLogs(Pageable), getFoodLogStats(), getWeeklyStats() (오늘 기준 -6일~오늘 7일치)
- `controller/FoodLogController.kt` — GET /api/food-logs?page=0&size=20, POST /api/food-logs, GET /api/food-logs/stats, GET /api/food-logs/weekly

## 핵심 패턴

- Entity 변환: Service 내부 `private fun FoodLog.toResponse()` extension function
- mealType JSON 응답: MealType.name (문자열)으로 직렬화
- 페이징: PageRequest.of(page, size, Sort.by("id").ascending())
- CORS: @CrossOrigin(origins = ["http://localhost:3000"]) 컨트롤러 단위 적용
- 예외 핸들러 위치: com/nubilab/exception/GlobalExceptionHandler.kt (아직 미구현)
- PostgreSQL DATE 함수: CAST AS date 대신 네이티브 쿼리 `DATE(logged_at)` 사용
- 날짜 범위 쿼리: LocalDateTime.atStartOfDay() ~ LocalDate.atTime(LocalTime.MAX) 패턴
- 네이티브 쿼리 결과 숫자 타입: `(row[1] as Number).toInt()` — PostgreSQL numeric 타입 변동 대응

**Why:** 초기 구현 이후 4가지 기능(Enum 전환, DB 집계 쿼리, 페이징, 주간 추이)이 적용된 현재 상태
**How to apply:** 신규 도메인 추가 시 동일 패턴 적용. 날짜별 집계 쿼리는 nativeQuery=true + DATE() 함수 패턴 사용.
