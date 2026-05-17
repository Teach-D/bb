import React, { useEffect, useState } from "react";
import { getFoodLogStats, FoodLogStatsResponse } from "../api/foodLog";

const MEAL_TYPE_LABEL: Record<string, string> = {
  BREAKFAST: "아침",
  LUNCH: "점심",
  DINNER: "저녁",
  SNACK: "간식",
};

interface Props {
  refreshTrigger: number;
}

const FoodLogStats: React.FC<Props> = ({ refreshTrigger }) => {
  const [data, setData] = useState<FoodLogStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getFoodLogStats();
        setData(result);
      } catch (err) {
        setError("통계 조회에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  if (loading) return <p>통계 로딩 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return null;

  return (
    <div style={containerStyle}>
      <h2>통계 — 식사 유형별 칼로리</h2>
      <div style={summaryStyle}>
        <span>
          총 섭취: <strong>{data.grandTotalCalories} kcal</strong>
        </span>
        <span style={{ marginLeft: 24 }}>
          일일 권장: <strong>{data.dailyRecommended} kcal</strong>
        </span>
      </div>
      <div style={statListStyle}>
        {data.stats.map((stat) => (
          <div key={stat.mealType} style={statRowStyle}>
            <div style={labelStyle}>
              {MEAL_TYPE_LABEL[stat.mealType] ?? stat.mealType}
            </div>
            <div style={barContainerStyle}>
              <div
                style={{
                  ...barFillStyle,
                  width: `${Math.min(stat.ratio, 100)}%`,
                }}
              />
            </div>
            <div style={valueStyle}>
              {stat.totalCalories} kcal ({stat.ratio.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  marginTop: 32,
  padding: "16px 20px",
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  background: "#fafafa",
};

const summaryStyle: React.CSSProperties = {
  marginBottom: 16,
  fontSize: 15,
};

const statListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const statRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const labelStyle: React.CSSProperties = {
  width: 48,
  fontWeight: "bold",
  fontSize: 14,
  flexShrink: 0,
};

const barContainerStyle: React.CSSProperties = {
  flex: 1,
  height: 18,
  background: "#e9ecef",
  borderRadius: 9,
  overflow: "hidden",
};

const barFillStyle: React.CSSProperties = {
  height: "100%",
  background: "#4caf50",
  borderRadius: 9,
  transition: "width 0.3s ease",
};

const valueStyle: React.CSSProperties = {
  width: 160,
  fontSize: 13,
  color: "#555",
  flexShrink: 0,
  textAlign: "right",
};

export default FoodLogStats;
