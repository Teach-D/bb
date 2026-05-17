# Frontend CLAUDE.md

## 기술 스택

| 항목 | 버전/내용 |
|------|-----------|
| 언어 | TypeScript 4.9.5 (strict 모드) |
| 프레임워크 | React 18.2 |
| HTTP 클라이언트 | Axios 1.6 |
| 빌드 | Create React App (react-scripts 5) |
| 라우터 | 없음 (단일 페이지) |
| 상태 관리 | useState / useEffect (외부 라이브러리 없음) |

## 폴더 구조

```
frontend/src/
├── api/
│   ├── client.ts          # Axios 인스턴스 (baseURL, 헤더 설정)
│   └── foodLog.ts         # 도메인별 API 호출 함수 + 타입 정의
├── components/
│   ├── FoodLogForm.tsx    # 음식 기록 추가 폼
│   └── FoodLogList.tsx    # 목록 + 총 칼로리 표시
└── App.tsx                # 루트 컴포넌트, 전역 상태(refreshTrigger) 소유
```

- API 함수와 타입은 `api/{도메인}.ts` 한 파일에 함께 둔다
- 공통 컴포넌트가 생기면 `components/common/` 하위에 추가

## 컴포넌트 설계 규칙

- **함수형 컴포넌트 + FC 타입** 사용
  ```tsx
  const FoodLogForm: React.FC<Props> = ({ onSuccess }) => { ... };
  ```
- Props 타입은 컴포넌트 파일 상단에 `interface Props` 로 선언
- 컴포넌트 파일 하나에 컴포넌트 하나 (default export)
- 스타일 상수(`CSSProperties`)는 파일 하단에 분리
  ```tsx
  const th: React.CSSProperties = { border: "1px solid #ddd", padding: "8px 12px" };
  ```
- 비즈니스 로직(API 호출)은 컴포넌트 내부 핸들러에서 처리 — 커스텀 훅 없이도 충분한 경우 유지
- children / 합성 패턴은 현재 범위에서 사용하지 않음

## 상태 관리 패턴

- 전역 상태 라이브러리(Redux, Zustand 등) **없음** — `useState`로만 관리
- 컴포넌트 간 데이터 공유는 **lifting state up** 방식

```
App (refreshTrigger 소유)
 ├── FoodLogForm  →  성공 시 onSuccess() 호출 → App이 refreshTrigger 증가
 └── FoodLogList  →  refreshTrigger 변경 감지 → useEffect로 재조회
```

- 로딩/에러 상태는 각 컴포넌트가 자체 관리

```tsx
const [data, setData] = useState<FoodLogListResponse | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

- 목록 재조회 트리거: `refreshTrigger: number` 값을 올려 `useEffect` 의존성 배열로 감지

## API 연동 패턴

- Axios 인스턴스는 `api/client.ts` 한 곳에서만 생성
  ```ts
  const apiClient = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } });
  ```
- 도메인별 함수는 `api/{도메인}.ts`에 선언, **async/await** 사용
  ```ts
  export const addFoodLog = async (request: FoodLogRequest): Promise<FoodLogResponse> => {
    const response = await apiClient.post<FoodLogResponse>("/food-logs", request);
    return response.data;
  };
  ```
- 컴포넌트에서 API 호출 시 반드시 try/catch + finally(loading 해제) 처리
  ```tsx
  try {
    const result = await getFoodLogs();
    setData(result);
  } catch {
    setError("목록 조회에 실패했습니다.");
  } finally {
    setLoading(false);
  }
  ```
- API 함수에서 에러를 삼키지 않는다 — 컴포넌트 핸들러에서 catch

## 스타일링 규칙

- 현재 CSS 파일/CSS Module/Styled Components **없음** — 인라인 스타일(`style={{ }}`)만 사용
- 재사용 스타일 상수는 파일 하단 `CSSProperties` 객체로 분리
  ```tsx
  const th: React.CSSProperties = { border: "1px solid #ddd", padding: "8px 12px", textAlign: "left" };
  ```
- 전역 CSS 추가가 필요한 경우 Orchestrator에 보고 후 결정
- 색상/간격 값은 하드코딩 허용 (디자인 토큰 없음)

## 라우팅 / 페이징 구조

- React Router **미적용** — 단일 페이지(SPA) 구조
- 페이지 이동 없이 컴포넌트 조합으로만 화면 구성
- 라우팅 추가가 필요한 경우 Orchestrator에 보고 후 진행

```
App.tsx
 ├── FoodLogForm   (음식 추가 폼)
 └── FoodLogList   (목록 + 총 칼로리)
```

- 프록시 설정(`package.json > "proxy": "http://localhost:8080"`)으로 `/api/*` 요청을 백엔드로 포워딩

---

## 블로킹 상황 처리

- **공통 파일 수정 필요** (`App.tsx`, `api/client.ts` 등) → 즉시 멈추고 Orchestrator에 보고
- **명세서에 없는 API 연동 필요** → 임의 구현 금지, Orchestrator에 보고
- **에러 발생** → 3회 시도 후 해결 안 되면 Orchestrator에 보고
