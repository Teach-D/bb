import apiClient from "./client";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

// ─── Request / Response Types ─────────────────────────────

export interface FavoriteFoodRequest {
  foodName: string;
  calories: number;
  mealType: MealType;
}

export interface FavoriteFoodLogRequest {
  mealType?: MealType;
}

export interface FavoriteFoodResponse {
  id: number;
  foodName: string;
  calories: number;
  mealType: string;
  createdAt: string;
}

export interface FavoriteFoodListResponse {
  favorites: FavoriteFoodResponse[];
  total: number;
}

// FoodLogResponse extended with favoriteFoodId
export interface FoodLogResponse {
  id: number;
  foodName: string;
  calories: number;
  mealType: string;
  loggedAt: string;
  favoriteFoodId?: number | null;
}

// ─── API Functions ────────────────────────────────────────

/**
 * 즐겨찾기 추가
 * POST /api/favorite-foods → 201 Created
 */
export const addFavoriteFood = async (
  request: FavoriteFoodRequest
): Promise<FavoriteFoodResponse> => {
  const response = await apiClient.post<FavoriteFoodResponse>(
    "/favorite-foods",
    request
  );
  return response.data;
};

/**
 * 즐겨찾기 목록 조회
 * GET /api/favorite-foods → 200 OK
 */
export const getFavoriteFoods = async (): Promise<FavoriteFoodListResponse> => {
  const response = await apiClient.get<FavoriteFoodListResponse>(
    "/favorite-foods"
  );
  return response.data;
};

/**
 * 즐겨찾기 삭제
 * DELETE /api/favorite-foods/{id} → 204 No Content
 */
export const deleteFavoriteFood = async (id: number): Promise<void> => {
  await apiClient.delete(`/favorite-foods/${id}`);
};

/**
 * 즐겨찾기로 빠른 기록
 * POST /api/favorite-foods/{id}/log → 201 Created
 * mealType 생략 가능 — 즐겨찾기 저장값 그대로 사용할 때는 {} 전송
 */
export const logFromFavorite = async (
  id: number,
  request: FavoriteFoodLogRequest = {}
): Promise<FoodLogResponse> => {
  const response = await apiClient.post<FoodLogResponse>(
    `/favorite-foods/${id}/log`,
    request
  );
  return response.data;
};
