---
name: project-recurring-issues
description: nubilab-skeleton 프로젝트에서 반복적으로 발견되는 코드 품질 이슈 패턴
metadata:
  type: project
---

## 반복 발견 이슈 목록

### Backend

1. **@Valid 누락 (높은 빈도)**
   - Controller의 `@RequestBody` 앞에 `@Valid` 를 빠뜨리는 패턴이 반복됨
   - FoodLogRequest DTO에도 Bean Validation 어노테이션(`@NotBlank`, `@Min`, `@Pattern`) 미적용
   - 검토 시 Controller → DTO 순서로 반드시 확인할 것

2. **findAll() 무제한 조회**
   - `getFoodLogs()`, `getFoodLogStats()` 양쪽 모두 페이징 없이 `findAll()` 사용
   - 데이터 규모가 커질수록 OOM 위험 — 향후 페이징 적용 권고

3. **mealType을 String으로 관리**
   - Enum 타입 대신 `String`으로 저장하여 잘못된 값 입력 시 런타임 오류 가능
   - `@Pattern` 검증으로 단기 완화, 장기적으로 Enum 전환 권고

4. **ratio 계산 기준 고정값(2000) 사용**
   - `getFoodLogStats()`에서 ratio를 `grandTotal` 기준이 아닌 `dailyRecommended(2000)` 기준으로 계산
   - grandTotal이 0일 때 0/2000=0 으로 처리되어 NaN은 발생하지 않으나, 의미상 "전체 대비 비율"이 아님 — 설계 의도 확인 필요

### Frontend

1. **refreshTrigger 전파 누락 (반복 패턴)**
   - 새 컴포넌트 추가 시 `refreshTrigger` prop 연결을 빠뜨리는 패턴 발생
   - `FoodLogStats`가 독립 컴포넌트로 추가되면서 `refreshTrigger` 미수신으로 폼 제출 후 통계 미갱신 버그 발생
   - 향후 새 데이터 표시 컴포넌트 추가 시 반드시 `refreshTrigger` 수신 여부 확인

2. **인라인 스타일 객체 의존성 배열 미포함**
   - 현재 코드는 인라인 스타일이 파일 하단 상수로 분리되어 있어 문제없음
   - 추후 컴포넌트 내부에서 동적 스타일 객체를 생성할 경우 불필요한 리렌더링 위험

**Why:** 두 에이전트가 병렬로 작업하면서 App.tsx 연결 단계에서 누락이 발생하기 쉬운 구조
**How to apply:** 검토 시 신규 컴포넌트는 반드시 App.tsx에서 prop 전달 완결 여부를 확인
