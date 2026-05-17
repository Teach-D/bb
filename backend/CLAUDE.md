# Backend CLAUDE.md

## 기술 스택

| 항목 | 버전/내용 |
|------|-----------|
| 언어 | Kotlin 1.9.20 |
| 프레임워크 | Spring Boot 3.2.0 |
| ORM | Spring Data JPA (Hibernate) |
| DB | PostgreSQL 16 |
| 빌드 | Gradle (Kotlin DSL) |
| JVM | Java 17 |
| 테스트 | JUnit 5 + spring-boot-starter-test |

## 폴더 구조

```
backend/src/main/kotlin/com/nubilab/
├── Application.kt          # 앱 진입점
├── domain/                 # JPA Entity
├── dto/                    # Request / Response DTO
├── repository/             # Spring Data JPA Repository 인터페이스
├── service/                # 비즈니스 로직 (트랜잭션 경계)
└── controller/             # REST API 컨트롤러

backend/src/test/kotlin/com/nubilab/
├── service/                # Service 단위 테스트
└── controller/             # Controller 통합 테스트
```

## 레이어 구조 설명

```
Controller → Service → Repository → DB
```

| 레이어 | 책임 |
|--------|------|
| Controller | HTTP 요청/응답 바인딩, 상태 코드 반환. 비즈니스 로직 포함 금지 |
| Service | 비즈니스 로직, 트랜잭션 관리, Entity ↔ DTO 변환 |
| Repository | DB 접근. 커스텀 쿼리는 여기에만 선언 |
| Domain | 순수 JPA Entity. 의존성 없음 |
| DTO | 레이어 간 데이터 전달 전용. Entity를 외부에 직접 노출 금지 |

## 파일 / 함수 네이밍 규칙

- **파일**: `{도메인}{레이어}.kt` — 예: `FoodLogService.kt`, `FoodLogController.kt`
- **DTO**: 단일 파일에 도메인별로 묶기 — 예: `FoodLogDto.kt` 안에 `FoodLogRequest`, `FoodLogResponse`
- **함수**: 동사 + 목적어 camelCase
  - 조회: `get~`, `find~`
  - 저장: `add~`, `create~`
  - 수정: `update~`
  - 삭제: `delete~`, `remove~`
- **Entity 변환 헬퍼**: Service 내부 private extension function으로 선언
  ```kotlin
  private fun FoodLog.toResponse() = FoodLogResponse(...)
  ```

## DTO 규칙

- `Request` / `Response` suffix로 구분
- `data class` 사용 (불변)
- Entity를 Controller 응답으로 직접 반환 금지 — 반드시 Response DTO로 변환
- 목록 응답은 별도 `ListResponse` DTO로 감싸기

```kotlin
data class FoodLogRequest(val foodName: String, val calories: Int, val mealType: String)
data class FoodLogResponse(val id: Long, val foodName: String, val calories: Int, val mealType: String, val loggedAt: LocalDateTime)
data class FoodLogListResponse(val logs: List<FoodLogResponse>, val totalCalories: Int)
```

## API 설계 규칙

- Base path: `/api/{resource}` (복수형 명사)
- 버전 prefix 없음 (현재 스켈레톤 범위)
- CORS: `http://localhost:3000` 허용 (`@CrossOrigin` 컨트롤러 단위 적용)

| 작업 | 메서드 | 상태 코드 |
|------|--------|-----------|
| 생성 | POST | 201 Created |
| 단건 조회 | GET | 200 OK |
| 목록 조회 | GET | 200 OK |
| 수정 | PUT / PATCH | 200 OK |
| 삭제 | DELETE | 204 No Content |

```kotlin
// 생성 예시
@PostMapping
fun addFoodLog(@RequestBody request: FoodLogRequest): ResponseEntity<FoodLogResponse> {
    val response = foodLogService.addFoodLog(request)
    return ResponseEntity.status(201).body(response)
}
```

## 응답 포맷 표준

- 성공: HTTP 상태 코드 + DTO body (별도 공통 wrapper 없음)
- 에러: 아래 형태로 통일

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "calories must be positive"
}
```

- `@RestControllerAdvice` + `@ExceptionHandler`로 전역 처리

## 에러 핸들링

- 비즈니스 예외는 커스텀 Exception 클래스로 분리 (예: `FoodLogNotFoundException`)
- Controller에서 try-catch 금지 — 예외는 전역 핸들러로 위임
- `@Transactional` 메서드에서 RuntimeException 발생 시 자동 롤백
- 유효성 검사: `@Valid` + Bean Validation 어노테이션 (`@NotBlank`, `@Positive` 등) 사용

```kotlin
// 전역 예외 핸들러 위치
// → 추가 시 com/nubilab/exception/GlobalExceptionHandler.kt 에 작성
```

## 인증 / 인가

- 현재 스켈레톤에는 인증/인가 없음
- Spring Security 미적용 상태
- 추가가 필요한 경우 Orchestrator에 보고 후 진행

## Kotlin 컨벤션

- `val` 우선 사용, 불가피한 경우에만 `var`
- nullable 타입(`?`) 최소화 — 기본값으로 non-null 보장
- `data class`는 DTO에만 사용, Entity는 일반 `class`
- 확장 함수(extension function)로 변환 로직 캡슐화
- `it` 사용은 람다 한 줄 이내로 제한, 중첩 시 명시적 파라미터명 사용
- import wildcard(`*`) 사용 금지

```kotlin
// Good
val logs = repository.findAll().map { it.toResponse() }

// Bad
var logs = repository.findAll().map { log -> log.toResponse() as Any }
```

## 테스트 코드 작성법

- **Service 테스트**: `@ExtendWith(MockitoExtension::class)` + Mock Repository
- **Controller 테스트**: `@SpringBootTest` + `@AutoConfigureMockMvc` + MockMvc
- 테스트 함수명: `given_when_then` 또는 백틱 한글 사용

```kotlin
// Service 단위 테스트 예시
@ExtendWith(MockitoExtension::class)
class FoodLogServiceTest {

    @Mock lateinit var foodLogRepository: FoodLogRepository
    @InjectMocks lateinit var foodLogService: FoodLogService

    @Test
    fun `음식 기록 추가 시 저장된 엔티티를 Response로 반환한다`() { ... }
}

// Controller 통합 테스트 예시
@SpringBootTest
@AutoConfigureMockMvc
class FoodLogControllerTest {

    @Autowired lateinit var mockMvc: MockMvc

    @Test
    fun `POST food-logs 요청 시 201 응답을 반환한다`() { ... }
}
```

---

## 블로킹 상황 처리

- **공통 Entity 수정 필요** → 즉시 멈추고 Orchestrator에 보고
- **명세서에 없는 API 필요** → 임의 구현 금지, Orchestrator에 보고
- **에러 발생** → 3회 시도 후 해결 안 되면 Orchestrator에 보고
