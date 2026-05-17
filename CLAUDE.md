# nubilab-skeleton

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Kotlin, Spring Boot, Spring Data JPA, Spring Web |
| Frontend | React, TypeScript, Axios |
| DB | PostgreSQL 16 |
| 인프라 | Docker / docker-compose |

## 폴더 구조

```
nubilab-skeleton/
├── backend/src/main/kotlin/com/nubilab/
│   ├── domain/          # JPA Entity
│   ├── dto/             # Request / Response DTO
│   ├── repository/      # Spring Data JPA Repository
│   ├── service/         # 비즈니스 로직
│   └── controller/      # REST API 엔드포인트
├── frontend/src/
│   ├── api/             # Axios 클라이언트 및 API 호출 함수
│   └── components/      # React 컴포넌트
├── docker-compose.yml
└── CLAUDE.md
```

## 실행 명령어

```bash
# DB (Docker)
docker compose up -d

# Backend
cd backend
./gradlew bootRun        # Mac/Linux
gradlew.bat bootRun      # Windows

# Frontend
cd frontend
npm install
npm start
```

- Backend: http://localhost:8080
- Frontend: http://localhost:3000 (프록시 → 8080)

## 도메인 용어 정의

| 용어 | 설명 |
|------|------|
| FoodLog | 사용자가 기록한 한 끼 음식 데이터 |
| foodName | 음식 이름 (예: 비빔밥) |
| calories | 칼로리 (kcal 단위, Int) |
| mealType | 식사 유형 — `BREAKFAST` / `LUNCH` / `DINNER` / `SNACK` |
| loggedAt | 기록 시각 (LocalDateTime, 서버 저장 시점 자동 설정) |
| totalCalories | 조회된 전체 FoodLog의 calories 합산 값 |

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/food-logs` | 음식 기록 추가 → 201 Created |
| GET | `/api/food-logs` | 음식 기록 목록 + totalCalories 조회 → 200 OK |

## Agent 실행 규칙

- 기능 agent는 동시 실행 가능 (Backend agent / Frontend agent 병렬 처리 허용)
- 공통 파일 변경 (`docker-compose.yml`, `CLAUDE.md`, 공유 설정 등)은 반드시 Orchestrator가 직접 처리
