# FoodLog API 명세서

> Base URL: `http://localhost:8080/api`
> Content-Type: `application/json`
> 인증: 없음

---

## 목차

- [기능 1. 오늘의 식단 목록 조회](#기능-1-오늘의-식단-목록-조회)
- [기능 2. 식사 유형별 칼로리 통계 조회](#기능-2-식사-유형별-칼로리-통계-조회)

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

## 추론 항목

> 코드에서 명시적으로 확인되지 않아 관례·요구사항으로 추론한 항목입니다. 실제 구현 시 확인 후 수정하세요.

**기능 1**
- **날짜 필터링 없음**: 현재 `findAll()` 사용으로 "오늘" 필터링 미적용 — 전체 기록 반환. 오늘 기준 필터가 필요하면 `?date=2026-05-17` Query Parameter 추가 및 Repository에 `findAllByLoggedAtBetween()` 구현 필요
- **정렬 기준 미지정**: `findAll()` 기본 동작 — PK(id) 오름차순으로 반환될 가능성 높음

**기능 2**
- **미구현 엔드포인트**: `GET /api/food-logs/stats` 는 현재 코드에 없음 — 요구사항 기반 설계
- **ratio 계산식**: `(mealType 칼로리 합계 / 2000) * 100`, 소수점 1자리 반올림
- **stats 배열 순서**: `BREAKFAST → LUNCH → DINNER → SNACK` 고정 순서 권장
- **에러 응답 형식**: `GlobalExceptionHandler` 미존재 — Spring Boot 기본 에러 응답 형식 가정

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
