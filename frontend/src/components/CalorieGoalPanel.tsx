import React, { useEffect, useState } from "react";
import { getTodayAchievement, TodayAchievementResponse } from "../api/calorieGoal";

interface Props {
  refreshTrigger: number; // 이 값이 바뀔 때마다 달성률 재조회
}

const CalorieGoalPanel: React.FC<Props> = ({ refreshTrigger }) => {
  const [data, setData] = useState<TodayAchievementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievement = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getTodayAchievement();
        setData(result);
      } catch {
        setError("달성률 조회에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchAchievement();
  }, [refreshTrigger]);

  if (loading) return <p>달성률 로딩 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return null;

  const rate = data.achievementRate ?? 0;
  const barWidth = Math.min(rate, 100);
  const isExceeded = data.exceeded;
  const barColor = isExceeded ? "#e53935" : "#4caf50";

  return (
    <div style={containerStyle}>
      <h2>오늘의 칼로리 달성률</h2>

      {/* 경고/안내 메시지 박스 */}
      {data.warningMessage && (
        <div style={isExceeded ? warningBoxStyle : infoBoxStyle}>
          {data.warningMessage}
        </div>
      )}

      {/* 목표/섭취/달성률 요약 */}
      <div style={summaryStyle}>
        <div style={summaryItemStyle}>
          <span style={summaryLabelStyle}>목표 칼로리</span>
          <span style={summaryValueStyle}>
            {data.targetCalories !== null ? `${data.targetCalories} kcal` : "미설정"}
          </span>
        </div>
        <div style={summaryItemStyle}>
          <span style={summaryLabelStyle}>섭취 칼로리</span>
          <span style={summaryValueStyle}>{data.consumedCalories} kcal</span>
        </div>
        <div style={summaryItemStyle}>
          <span style={summaryLabelStyle}>달성률</span>
          <span style={summaryValueStyle}>
            {data.achievementRate !== null ? `${data.achievementRate.toFixed(1)}%` : "-"}
          </span>
        </div>
      </div>

      {/* 진행 바 */}
      {data.targetCalories !== null && (
        <div style={barContainerStyle}>
          <div
            style={{
              ...barFillStyle,
              width: `${barWidth}%`,
              background: barColor,
            }}
          />
        </div>
      )}
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

const warningBoxStyle: React.CSSProperties = {
  background: "#ffebee",
  border: "1px solid #e53935",
  borderRadius: 6,
  padding: "10px 14px",
  color: "#b71c1c",
  fontWeight: "bold",
  marginBottom: 16,
};

const infoBoxStyle: React.CSSProperties = {
  background: "#fff8e1",
  border: "1px solid #f9a825",
  borderRadius: 6,
  padding: "10px 14px",
  color: "#795548",
  marginBottom: 16,
};

const summaryStyle: React.CSSProperties = {
  display: "flex",
  gap: 24,
  marginBottom: 16,
  flexWrap: "wrap",
};

const summaryItemStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
};

const summaryLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#888",
  marginBottom: 4,
};

const summaryValueStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: "bold",
};

const barContainerStyle: React.CSSProperties = {
  height: 22,
  background: "#e9ecef",
  borderRadius: 11,
  overflow: "hidden",
};

const barFillStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: 11,
  transition: "width 0.3s ease",
};

export default CalorieGoalPanel;
