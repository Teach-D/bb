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
