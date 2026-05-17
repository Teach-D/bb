# FoodLog API 명세서

> Base URL: `http://localhost:8080/api`
> Content-Type: `application/json`
> 인증: 없음

---

## 목차

- [기능 1. 오늘의 식단 목록 조회](#기능-1-오늘의-식단-목록-조회)
- [기능 2. 식사 유형별 칼로리 통계 조회](#기능-2-식사-유형별-칼로리-통계-조회)
- [기능 3. 목표 칼로리 설정](#기능-3-목표-칼로리-설정)
- [기능 4. 오늘 목표 칼로리 달성률 조회](#기능-4-오늘-목표-칼로리-달성률-조회)
- [기능 5. 영양소 기록 (탄단지)](#기능-5-영양소-기록-탄단지)

---

## 기능 1. 오늘의 식단 목록 조회

| 항목 | 내용 |
|------|------|
| **메서드** | `GET` |
| **경로** | `/api/food-logs` |
| **인증** | 필요 없음 |
| **설명** | 저장된 음식 기록 전체 목록과 총 칼로리 합산값을 반환한다 |

### Request

Path Parameter, Query Parameter, Request Body 없음

### Response

#### 성공 응답 — `200 OK`

| 필드 | 타입 | 설명 |
|------|------|------|
| `logs` | `FoodLogResponse[]` | 음식 기록 배열 |
| `logs[].id` | `Long` | 기록 고유 ID |
| `logs[].foodName` | `String` | 음식 이름 |
| `logs[].calories` | `Int` | 칼로리 (kcal) |
| `logs[].mealType` | `String` | 식사 유형 — `BREAKFAST` \| `LUNCH` \| `DINNER` \| `SNACK` |
| `logs[].loggedAt` | `String (ISO 8601)` | 기록 시각 |
| `totalCalories` | `Int` | 전체 기록의 칼로리 합산 |

```json
{
  "logs": [
    {
      "id": 1,
      "foodName": "오트밀",
      "calories": 350,
      "mealType": "BREAKFAST",
      "loggedAt": "2026-05-17T08:00:00"
    },
    {
      "id": 2,
      "foodName": "비빔밥",
      "calories": 550,
      "mealType": "LUNCH",
      "loggedAt": "2026-05-17T12:30:00"
    }
  ],
  "totalCalories": 900
}
```

기록이 없는 경우:

```json
{
  "logs": [],
  "totalCalories": 0
}
```

#### 에러 응답

| 상태 코드 | 발생 조건 |
|-----------|-----------|
| `500 Internal Server Error` | DB 조회 실패 등 서버 오류 |

---

## 기능 2. 식사 유형별 칼로리 통계 조회

| 항목 | 내용 |
|------|------|
| **메서드** | `GET` |
| **경로** | `/api/food-logs/stats` |
| **인증** | 필요 없음 |
| **설명** | 식사 유형(BREAKFAST·LUNCH·DINNER·SNACK)별 칼로리 합계와 하루 권장 칼로리(2000 kcal) 대비 비율을 반환한다 |

### Request

Path Parameter, Query Parameter, Request Body 없음

### Response

#### 성공 응답 — `200 OK`

| 필드 | 타입 | 설명 |
|------|------|------|
| `stats` | `MealTypeStat[]` | 식사 유형별 통계 배열 (4개 고정) |
| `stats[].mealType` | `String` | 식사 유형 — `BREAKFAST` \| `LUNCH` \| `DINNER` \| `SNACK` |
| `stats[].totalCalories` | `Int` | 해당 유형의 칼로리 합계 (kcal) |
| `stats[].ratio` | `Double` | 하루 권장 칼로리(2000 kcal) 대비 비율 (%, 소수점 1자리) |
| `grandTotalCalories` | `Int` | 전체 유형 칼로리 합산 |
| `dailyRecommended` | `Int` | 하루 권장 칼로리 기준값 (고정: `2000`) |

```json
{
  "stats": [
    {
      "mealType": "BREAKFAST",
      "totalCalories": 350,
      "ratio": 17.5
    },
    {
      "mealType": "LUNCH",
      "totalCalories": 550,
      "ratio": 27.5
    },
    {
      "mealType": "DINNER",
      "totalCalories": 700,
      "ratio": 35.0
    },
    {
      "mealType": "SNACK",
      "totalCalories": 200,
      "ratio": 10.0
    }
  ],
  "grandTotalCalories": 1800,
  "dailyRecommended": 2000
}
```

기록이 없는 식사 유형은 `totalCalories: 0`, `ratio: 0.0` 으로 반환:

```json
{
  "stats": [
    { "mealType": "BREAKFAST", "totalCalories": 0, "ratio": 0.0 },
    { "mealType": "LUNCH",     "totalCalories": 0, "ratio": 0.0 },
    { "mealType": "DINNER",    "totalCalories": 0, "ratio": 0.0 },
    { "mealType": "SNACK",     "totalCalories": 0, "ratio": 0.0 }
  ],
  "grandTotalCalories": 0,
  "dailyRecommended": 2000
}
```

#### 에러 응답

| 상태 코드 | 발생 조건 |
|-----------|-----------|
| `500 Internal Server Error` | DB 조회 실패 등 서버 오류 |

---

---

## 기능 3. 목표 칼로리 설정

| 항목 | 내용 |
|------|------|
| **메서드** | `POST` |
| **경로** | `/api/calorie-goals` |
| **인증** | 필요 없음 |
| **설명** | 오늘 날짜 기준으로 하루 목표 칼로리를 설정한다. 같은 날짜에 이미 목표가 존재하면 덮어쓴다(upsert). |

### Request

#### Request Body

Content-Type: `application/json`

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `targetCalories` | `Int` | ✅ | 목표 칼로리 (kcal, 양수) |

```json
{
  "targetCalories": 2000
}
```

### Response

#### 성공 응답 — `201 Created`

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `Long` | 생성된 목표 칼로리 레코드 ID |
| `targetCalories` | `Int` | 설정된 목표 칼로리 (kcal) |
| `date` | `String (ISO 8601 date)` | 목표 날짜 (서버 저장 시점의 오늘 날짜 자동 설정) |

```json
{
  "id": 1,
  "targetCalories": 2000,
  "date": "2026-05-18"
}
```

#### 에러 응답

| 상태 코드 | 발생 조건 | 응답 예시 |
|-----------|-----------|-----------|
| `400 Bad Request` | `targetCalories` 누락 또는 0 이하 | `{"error": "targetCalories must be positive"}` |
| `500 Internal Server Error` | DB 저장 실패 등 서버 오류 | `{"error": "Internal Server Error"}` |

---

## 기능 4. 오늘 목표 칼로리 달성률 조회

| 항목 | 내용 |
|------|------|
| **메서드** | `GET` |
| **경로** | `/api/calorie-goals/today` |
| **인증** | 필요 없음 |
| **설명** | 오늘의 목표 칼로리와 `food_logs`에서 집계한 오늘 섭취 칼로리를 비교하여 달성률과 초과 여부를 반환한다. `calorie_goals`와 `food_logs` 두 테이블 간 연산이 포함된다. |

### Request

Path Parameter, Query Parameter, Request Body 없음

### Response

#### 성공 응답 — `200 OK` (목표 설정된 경우)

| 필드 | 타입 | 설명 |
|------|------|------|
| `targetCalories` | `Int` | 오늘의 목표 칼로리 (kcal) |
| `consumedCalories` | `Int` | 오늘 섭취한 칼로리 합산 (`food_logs.logged_at` 기준 오늘 날짜 필터) |
| `achievementRate` | `Double` | 달성률 (%) = `consumedCalories / targetCalories * 100`, 소수점 1자리 |
| `exceeded` | `Boolean` | 목표 초과 여부 (`consumedCalories > targetCalories` 이면 `true`) |
| `warningMessage` | `String` | 목표 초과 시 경고 메시지, 미초과 시 `null` |

```json
{
  "targetCalories": 2000,
  "consumedCalories": 2400,
  "achievementRate": 120.0,
  "exceeded": true,
  "warningMessage": "오늘 목표 칼로리를 초과했습니다! 400kcal 초과"
}
```

미초과 예시:

```json
{
  "targetCalories": 2000,
  "consumedCalories": 1500,
  "achievementRate": 75.0,
  "exceeded": false,
  "warningMessage": null
}
```

#### 성공 응답 — `200 OK` (목표 미설정 시)

| 필드 | 타입 | 설명 |
|------|------|------|
| `targetCalories` | `null` | 오늘 목표 칼로리 미설정 |
| `consumedCalories` | `Int` | 오늘 섭취한 칼로리 합산 (목표 없어도 계산) |
| `achievementRate` | `null` | 목표 없으므로 달성률 계산 불가 |
| `exceeded` | `Boolean` | `false` 고정 (목표 없음) |
| `warningMessage` | `String` | 목표 미설정 안내 메시지 |

```json
{
  "targetCalories": null,
  "consumedCalories": 1200,
  "achievementRate": null,
  "exceeded": false,
  "warningMessage": "오늘의 목표 칼로리가 설정되지 않았습니다."
}
```

#### 에러 응답

---

## 기능 5. 영양소 기록 (탄단지)

칼로리 외에 탄수화물·단백질·지방을 함께 기록하고 조회한다.  
기존 `/api/food-logs` POST·GET 엔드포인트를 확장하며, 새 필드가 추가됨에 따라 Request DTO 유효성 검증과 Response DTO가 변경된다.

---

### 5-1. 음식 기록 추가 (영양소 포함)

| 항목 | 내용 |
|------|------|
| **메서드** | `POST` |
| **경로** | `/api/food-logs` |
| **인증** | 필요 없음 |
| **설명** | 음식 이름·식사 유형·칼로리와 함께 탄수화물·단백질·지방을 기록한다 |

#### Request Body

| 필드 | 타입 | 필수 | 제약 조건 | 설명 |
|------|------|------|-----------|------|
| `foodName` | `String` | Y | 1 ~ 100자 | 음식 이름 |
| `calories` | `Int` | Y | 0 이상 | 칼로리 (kcal) |
| `mealType` | `String` | Y | `BREAKFAST` \| `LUNCH` \| `DINNER` \| `SNACK` | 식사 유형 |
| `carbohydrate` | `Double` | Y | 0.0 이상 | 탄수화물 (g) |
| `protein` | `Double` | Y | 0.0 이상 | 단백질 (g) |
| `fat` | `Double` | Y | 0.0 이상 | 지방 (g) |

```json
{
  "foodName": "비빔밥",
  "calories": 550,
  "mealType": "LUNCH",
  "carbohydrate": 80.5,
  "protein": 18.0,
  "fat": 12.3
}
```

#### Response

##### 성공 응답 — `201 Created`

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `Long` | 생성된 기록의 고유 ID |
| `foodName` | `String` | 음식 이름 |
| `calories` | `Int` | 칼로리 (kcal) |
| `mealType` | `String` | 식사 유형 |
| `carbohydrate` | `Double` | 탄수화물 (g) |
| `protein` | `Double` | 단백질 (g) |
| `fat` | `Double` | 지방 (g) |
| `loggedAt` | `String (ISO 8601)` | 서버 저장 시각 (자동 설정) |

```json
{
  "id": 3,
  "foodName": "비빔밥",
  "calories": 550,
  "mealType": "LUNCH",
  "carbohydrate": 80.5,
  "protein": 18.0,
  "fat": 12.3,
  "loggedAt": "2026-05-18T12:30:00"
}
```

##### 에러 응답

| 상태 코드 | 발생 조건 |
|-----------|-----------|
| `400 Bad Request` | 필수 필드 누락, 타입 불일치, 유효성 검증 실패 |
| `500 Internal Server Error` | DB 저장 실패 등 서버 오류 |

유효성 검증 실패 예시 (`400 Bad Request`):

```json
{
  "status": 400,
  "errors": [
    { "field": "carbohydrate", "message": "탄수화물은 0 이상이어야 합니다" },
    { "field": "foodName",     "message": "음식 이름은 필수입니다" }
  ]
}
```

---

### 5-2. 음식 기록 목록 조회 (영양소 포함)

| 항목 | 내용 |
|------|------|
| **메서드** | `GET` |
| **경로** | `/api/food-logs` |
| **인증** | 필요 없음 |
| **설명** | 저장된 음식 기록 전체 목록과 칼로리·탄수화물·단백질·지방의 합산값을 반환한다 |

#### Request

Path Parameter, Query Parameter, Request Body 없음

#### Response

##### 성공 응답 — `200 OK`

| 필드 | 타입 | 설명 |
|------|------|------|
| `logs` | `FoodLogResponse[]` | 음식 기록 배열 |
| `logs[].id` | `Long` | 기록 고유 ID |
| `logs[].foodName` | `String` | 음식 이름 |
| `logs[].calories` | `Int` | 칼로리 (kcal) |
| `logs[].mealType` | `String` | 식사 유형 |
| `logs[].carbohydrate` | `Double` | 탄수화물 (g) |
| `logs[].protein` | `Double` | 단백질 (g) |
| `logs[].fat` | `Double` | 지방 (g) |
| `logs[].loggedAt` | `String (ISO 8601)` | 기록 시각 |
| `totalCalories` | `Int` | 전체 기록의 칼로리 합산 |
| `totalCarbohydrate` | `Double` | 전체 기록의 탄수화물 합산 (g) |
| `totalProtein` | `Double` | 전체 기록의 단백질 합산 (g) |
| `totalFat` | `Double` | 전체 기록의 지방 합산 (g) |

```json
{
  "logs": [
    {
      "id": 1,
      "foodName": "오트밀",
      "calories": 350,
      "mealType": "BREAKFAST",
      "carbohydrate": 60.0,
      "protein": 12.0,
      "fat": 6.5,
      "loggedAt": "2026-05-18T08:00:00"
    },
    {
      "id": 2,
      "foodName": "비빔밥",
      "calories": 550,
      "mealType": "LUNCH",
      "carbohydrate": 80.5,
      "protein": 18.0,
      "fat": 12.3,
      "loggedAt": "2026-05-18T12:30:00"
    }
  ],
  "totalCalories": 900,
  "totalCarbohydrate": 140.5,
  "totalProtein": 30.0,
  "totalFat": 18.8
}
```

기록이 없는 경우:

```json
{
  "logs": [],
  "totalCalories": 0,
  "totalCarbohydrate": 0.0,
  "totalProtein": 0.0,
  "totalFat": 0.0
}
```

##### 에러 응답

| 상태 코드 | 발생 조건 |
|-----------|-----------|
| `500 Internal Server Error` | DB 조회 실패 등 서버 오류 |

---

## 추론 항목

> 코드에서 명시적으로 확인되지 않아 관례·요구사항으로 추론한 항목입니다. 실제 구현 시 확인 후 수정하세요.

**기능 1**
- **날짜 필터링 없음**: 현재 `findAll()` 사용으로 "오늘" 필터링 미적용 — 전체 기록 반환. 오늘 기준 필터가 필요하면 `?date=2026-05-17` Query Parameter 추가 및 Repository에 `findAllByLoggedAtBetween()` 구현 필요
- **정렬 기준 미지정**: `findAll()` 기본 동작 — PK(id) 오름차순으로 반환될 가능성 높음

**기능 2**
- **미구현 엔드포인트**: `GET /api/food-logs/stats` 는 현재 코드에 없음 — 요구사항 기반 설계
- **ratio 계산식**: `(mealType 칼로리 합계 / 2000) * 100`, 소수점 1자리 반올림
- **stats 배열 순서**: `BREAKFAST → LUNCH → DINNER → SNACK` 고정 순서 권장
**기능 3, 4**
- **upsert 구현 방식**: 같은 날짜 목표 덮어쓰기는 `findByDate()` 후 존재하면 update, 없으면 insert로 구현 권장
- **오늘 날짜 기준**: `LocalDate.now()` 기준 — 서버 타임존 의존. 필요 시 클라이언트 날짜를 Query Parameter로 받는 확장 고려
- **consumedCalories 계산**: `food_logs.logged_at`을 오늘 날짜(`00:00:00 ~ 23:59:59`)로 범위 필터 후 `calories` 합산
- **에러 응답 형식**: `GlobalExceptionHandler`에서 `{"error": "message"}` 구조로 반환 (`MethodArgumentNotValidException` → 400, 기타 → 500)

**기능 5**
- **기존 엔드포인트 확장**: POST/GET 모두 같은 경로(`/api/food-logs`)를 유지하며 새 필드를 추가하는 방식 — 하위 호환이 필요하면 `carbohydrate`/`protein`/`fat` 을 optional(nullable)로 처리하고 null 시 0.0으로 합산 처리 가능
- **유효성 검증 구현**: `@NotNull`, `@Min(0)` 또는 `@DecimalMin("0.0")` 어노테이션을 Request DTO 필드에 적용; `@Valid` + `MethodArgumentNotValidException` 핸들러로 400 응답 포맷 통일 필요
- **소수점 정밀도**: `Double` 사용 시 부동소수점 오차 발생 가능 — 정밀도가 중요하다면 DB 컬럼 타입을 `NUMERIC(6,1)`, Kotlin 필드는 `Double` 유지하고 응답 시 소수점 1자리 반올림 권장
- **합산 필드 타입**: `totalCarbohydrate` 등은 `Double`로 반환; Kotlin `sumOf { it.carbohydrate }` 로 계산 가능
- **DB 스키마 변경**: 기존 `food_log` 테이블에 `carbohydrate NUMERIC(6,1) NOT NULL DEFAULT 0`, `protein NUMERIC(6,1) NOT NULL DEFAULT 0`, `fat NUMERIC(6,1) NOT NULL DEFAULT 0` 컬럼 추가 필요 (기존 데이터 마이그레이션 고려)

---

# 음식 즐겨찾기 API 명세서

> Base URL: `http://localhost:8080/api`
> Content-Type: `application/json`
> 인증: 없음

자주 먹는 음식을 `favorite_foods` 테이블에 저장해두고, 즐겨찾기 항목을 선택하면 `food_logs`에 즉시 기록하는 기능이다.
`food_logs.favorite_food_id` 컬럼이 두 테이블을 연결하는 참조 키 역할을 한다 (nullable, ON DELETE SET NULL).

---

## 목차

- [기능 3. 즐겨찾기 추가](#기능-3-즐겨찾기-추가)
- [기능 4. 즐겨찾기 목록 조회](#기능-4-즐겨찾기-목록-조회)
- [기능 5. 즐겨찾기 삭제](#기능-5-즐겨찾기-삭제)
- [기능 6. 즐겨찾기로 빠른 기록](#기능-6-즐겨찾기로-빠른-기록)

---

## DB 스키마 설계

### favorite_foods 테이블

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | `BIGINT` | PK, AUTO_INCREMENT | 즐겨찾기 고유 ID |
| `food_name` | `VARCHAR(255)` | NOT NULL | 음식 이름 |
| `calories` | `INT` | NOT NULL | 칼로리 (kcal) |
| `meal_type` | `VARCHAR(20)` | NOT NULL | 식사 유형 (`BREAKFAST`/`LUNCH`/`DINNER`/`SNACK`) |
| `created_at` | `TIMESTAMP` | NOT NULL | 즐겨찾기 등록 시각 (자동 설정) |

### food_logs 테이블 변경

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `favorite_food_id` | `BIGINT` | NULL 허용, FK → `favorite_foods.id` | 즐겨찾기 참조 ID (즐겨찾기 삭제 시 SET NULL) |

---

## 기능 3. 즐겨찾기 추가

| 항목 | 내용 |
|------|------|
| **메서드** | `POST` |
| **경로** | `/api/favorite-foods` |
| **인증** | 필요 없음 |
| **설명** | 자주 먹는 음식을 즐겨찾기에 등록한다 |

### Request

#### Request Body

Content-Type: `application/json`

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `foodName` | `String` | ✅ | 음식 이름 (공백 불가) |
| `calories` | `Int` | ✅ | 칼로리 (1 이상) |
| `mealType` | `String` | ✅ | 식사 유형 — `BREAKFAST` \| `LUNCH` \| `DINNER` \| `SNACK` |

```json
{
  "foodName": "비빔밥",
  "calories": 550,
  "mealType": "LUNCH"
}
```

### Response

#### 성공 응답 — `201 Created`

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `Long` | 생성된 즐겨찾기 ID |
| `foodName` | `String` | 음식 이름 |
| `calories` | `Int` | 칼로리 (kcal) |
| `mealType` | `String` | 식사 유형 |
| `createdAt` | `String (ISO 8601)` | 즐겨찾기 등록 시각 |

```json
{
  "id": 1,
  "foodName": "비빔밥",
  "calories": 550,
  "mealType": "LUNCH",
  "createdAt": "2026-05-18T09:00:00"
}
```

#### 에러 응답

| 상태 코드 | 발생 조건 | 응답 예시 |
|-----------|-----------|-----------|
| `400 Bad Request` | `foodName` 이 비어있거나 `calories` 가 1 미만 | `{"error": "음식 이름은 필수입니다."}` |
| `400 Bad Request` | `mealType` 이 허용된 값이 아님 | `{"error": "올바르지 않은 식사 유형입니다."}` |

---

## 기능 4. 즐겨찾기 목록 조회

| 항목 | 내용 |
|------|------|
| **메서드** | `GET` |
| **경로** | `/api/favorite-foods` |
| **인증** | 필요 없음 |
| **설명** | 등록된 즐겨찾기 전체 목록을 반환한다 |

### Request

Path Parameter, Query Parameter, Request Body 없음

### Response

#### 성공 응답 — `200 OK`

| 필드 | 타입 | 설명 |
|------|------|------|
| `favorites` | `FavoriteFoodResponse[]` | 즐겨찾기 배열 |
| `favorites[].id` | `Long` | 즐겨찾기 고유 ID |
| `favorites[].foodName` | `String` | 음식 이름 |
| `favorites[].calories` | `Int` | 칼로리 (kcal) |
| `favorites[].mealType` | `String` | 식사 유형 |
| `favorites[].createdAt` | `String (ISO 8601)` | 즐겨찾기 등록 시각 |
| `total` | `Int` | 즐겨찾기 총 개수 |

```json
{
  "favorites": [
    {
      "id": 1,
      "foodName": "비빔밥",
      "calories": 550,
      "mealType": "LUNCH",
      "createdAt": "2026-05-18T09:00:00"
    },
    {
      "id": 2,
      "foodName": "오트밀",
      "calories": 350,
      "mealType": "BREAKFAST",
      "createdAt": "2026-05-18T09:05:00"
    }
  ],
  "total": 2
}
```

즐겨찾기가 없는 경우:

```json
{
  "favorites": [],
  "total": 0
}
```

#### 에러 응답

| 상태 코드 | 발생 조건 |
|-----------|-----------|
| `500 Internal Server Error` | DB 조회 실패 등 서버 오류 |

---

## 기능 5. 즐겨찾기 삭제

| 항목 | 내용 |
|------|------|
| **메서드** | `DELETE` |
| **경로** | `/api/favorite-foods/{id}` |
| **인증** | 필요 없음 |
| **설명** | 즐겨찾기를 삭제한다. 해당 즐겨찾기로 생성된 `food_logs` 레코드는 유지되며, `favorite_food_id` 는 `NULL` 로 설정된다 |

### Request

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `id` | `Long` | ✅ | 삭제할 즐겨찾기 ID |

Request Body 없음

### Response

#### 성공 응답 — `204 No Content`

응답 Body 없음

#### 에러 응답

| 상태 코드 | 발생 조건 | 응답 예시 |
|-----------|-----------|-----------|
| `404 Not Found` | 해당 ID의 즐겨찾기가 존재하지 않음 | `{"error": "즐겨찾기를 찾을 수 없습니다."}` |

---

## 기능 6. 즐겨찾기로 빠른 기록

| 항목 | 내용 |
|------|------|
| **메서드** | `POST` |
| **경로** | `/api/favorite-foods/{id}/log` |
| **인증** | 필요 없음 |
| **설명** | 즐겨찾기 항목을 선택해 `food_logs` 에 즉시 기록한다. `foodName`, `calories` 는 즐겨찾기 값을 그대로 사용하고, `mealType` 은 요청으로 덮어쓸 수 있다 |

### Request

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `id` | `Long` | ✅ | 기록으로 추가할 즐겨찾기 ID |

#### Request Body

Content-Type: `application/json`

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `mealType` | `String` | ❌ | 식사 유형 덮어쓰기 — 생략 시 즐겨찾기에 저장된 `mealType` 사용 |

```json
{
  "mealType": "DINNER"
}
```

mealType 생략 시:

```json
{}
```

### Response

#### 성공 응답 — `201 Created`

즐겨찾기 값으로 생성된 `FoodLogResponse` 를 반환한다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `Long` | 생성된 food_log ID |
| `foodName` | `String` | 음식 이름 (즐겨찾기 값 복사) |
| `calories` | `Int` | 칼로리 kcal (즐겨찾기 값 복사) |
| `mealType` | `String` | 실제 적용된 식사 유형 |
| `loggedAt` | `String (ISO 8601)` | 기록 시각 (서버 저장 시점 자동 설정) |
| `favoriteFoodId` | `Long` | 참조한 즐겨찾기 ID |

```json
{
  "id": 10,
  "foodName": "비빔밥",
  "calories": 550,
  "mealType": "DINNER",
  "loggedAt": "2026-05-18T18:30:00",
  "favoriteFoodId": 1
}
```

#### 에러 응답

| 상태 코드 | 발생 조건 | 응답 예시 |
|-----------|-----------|-----------|
| `404 Not Found` | 해당 ID의 즐겨찾기가 존재하지 않음 | `{"error": "즐겨찾기를 찾을 수 없습니다."}` |
| `400 Bad Request` | `mealType` 이 허용된 값이 아님 | `{"error": "올바르지 않은 식사 유형입니다."}` |

---

## 추론 항목 (즐겨찾기 기능)

> 아래 항목은 코드에서 명시적으로 확인되지 않아 관례 및 요구사항으로 추론했습니다.
> 실제 구현 시 확인 후 수정하세요.

- **즐겨찾기 중복 허용**: 동일한 `foodName` 의 즐겨찾기를 중복 등록 허용으로 가정 (중복 방지가 필요하면 `409 Conflict` 에러 추가)
- **즐겨찾기 삭제 시 food_logs 처리**: `food_logs.favorite_food_id` 를 `ON DELETE SET NULL` 로 설정하여 기록 유지 가정
- **정렬 기준**: `GET /api/favorite-foods` 는 `created_at` 내림차순(최신순) 반환으로 가정
- **빠른 기록 응답의 favoriteFoodId 필드**: 기존 `FoodLogResponse` 에 `favoriteFoodId` 필드 추가가 필요 — 기존 food_logs 조회 응답에도 영향 (nullable 로 처리 권장)
- **에러 응답 형식**: 기존 `GlobalExceptionHandler` 패턴(`{"error": "메시지"}`) 동일하게 적용
