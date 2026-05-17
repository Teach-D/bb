import apiClient from "./client";

export interface FoodLogRequest {
  foodName: string;
  calories: number;
  mealType: string;
}

export interface FoodLogResponse {
  id: number;
  foodName: string;
  calories: number;
  mealType: string;
  loggedAt: string;
}

export interface FoodLogListResponse {
  logs: FoodLogResponse[];
  totalCalories: number;
  page: number;
  size: number;
  totalElements: number;
}

/**
 * 기능 1: 음식 기록 추가
 * TODO: POST /api/food-logs 호출하세요
 */
export const addFoodLog = async (request: FoodLogRequest): Promise<FoodLogResponse> => {
  const response = await apiClient.post<FoodLogResponse>("/food-logs", request);
  return response.data;
};

/**
 * 기능 2: 음식 기록 목록 조회
 * date 파라미터가 있으면 해당 날짜(yyyy-MM-dd) 기준으로 필터링, 없으면 전체 조회
 */
export const getFoodLogs = async (page = 0, size = 20, date?: string): Promise<FoodLogListResponse> => {
  const response = await apiClient.get<FoodLogListResponse>("/food-logs", {
    params: { page, size, date: date || undefined },
  });
  return response.data;
};

export interface MealTypeStat {
  mealType: string;
  totalCalories: number;
  ratio: number;
}

export interface FoodLogStatsResponse {
  stats: MealTypeStat[];
  grandTotalCalories: number;
  dailyRecommended: number;
}

/**
 * 기능 3: 식사 유형별 칼로리 통계 조회
 */
export async function getFoodLogStats(): Promise<FoodLogStatsResponse> {
  const response = await apiClient.get<FoodLogStatsResponse>("/food-logs/stats");
  return response.data;
}

// ─── Search ────────────────────────────────────────────────

export interface FoodSearchSuggestionsResponse {
  suggestions: string[];
}

/**
 * 기능 4: 음식 이름 자동완성 검색
 * GET /api/food-logs/search?q={keyword}
 */
export const searchFoodSuggestions = async (q: string): Promise<FoodSearchSuggestionsResponse> => {
  const response = await apiClient.get<FoodSearchSuggestionsResponse>("/food-logs/search", {
    params: { q },
  });
  return response.data;
};

