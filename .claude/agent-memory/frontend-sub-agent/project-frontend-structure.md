---
name: project-frontend-structure
description: nubilab-skeleton 프론트엔드 구조, 스타일 규칙, API 패턴 핵심 메모
metadata:
  type: project
---

nubilab-skeleton 프론트엔드는 React 18 + TypeScript strict 모드로 구성됨.

- API 함수와 타입은 `api/foodLog.ts` 한 파일에 모두 위치 (도메인별 단일 파일 원칙)
- 컴포넌트는 `components/` 하위에 단일 default export 파일로 위치
- 스타일은 인라인 `style={{ }}` + 파일 하단 `CSSProperties` 상수만 허용 (외부 CSS, 라이브러리 없음)
- `App.tsx`, `api/client.ts`는 Orchestrator 전용 — 서브에이전트 수정 금지
- Axios baseURL은 `/api` (상대 경로), 프록시로 :8080 포워딩
- 상태 패턴: `useState<T | null>`, `useState<boolean>`, `useState<string | null>` 세트 필수
- `useEffect` 의존성에 `refreshTrigger: number` prop 추가로 재조회 트리거

**Why:** 프로젝트가 외부 상태관리/스타일 라이브러리 없이 의도적으로 단순하게 유지됨.
**How to apply:** 새 기능 추가 시 항상 `api/foodLog.ts`에 타입+함수 append 후 `components/` 신규 파일 생성 순서 준수.
