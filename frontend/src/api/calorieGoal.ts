import apiClient from "./client";

export interface CalorieGoalRequest {
  targetCalories: number; // 양수 정수
}

export interface CalorieGoalResponse {
  id: number;
  targetCalories: number;
  date: string; // "YYYY-MM-DD"
}

export interface TodayAchievementResponse {
  targetCalories: number | null;  // 목표 미설정 시 null
  consumedCalories: number;
  achievementRate: number | null; // 목표 미설정 시 null
  exceeded: boolean;
  warningMessage: string | null;
}

/**
 * 오늘 목표 칼로리 설정 (upsert)
 * POST /api/calorie-goals
 */
export const setCalorieGoal = async (request: CalorieGoalRequest): Promise<CalorieGoalResponse> => {
  const response = await apiClient.post<CalorieGoalResponse>("/calorie-goals", request);
  return response.data;
};

/**
 * 오늘 달성률 조회
 * GET /api/calorie-goals/today
 */
export const getTodayAchievement = async (): Promise<TodayAchievementResponse> => {
  const response = await apiClient.get<TodayAchievementResponse>("/calorie-goals/today");
  return response.data;
};
