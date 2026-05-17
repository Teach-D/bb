import React, { useState } from "react";
import { setCalorieGoal } from "../api/calorieGoal";

interface Props {
  onSuccess: () => void; // 설정 성공 시 달성률 패널 갱신 트리거
}

const CalorieGoalForm: React.FC<Props> = ({ onSuccess }) => {
  const [targetCalories, setTargetCalories] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (targetCalories <= 0) {
      setError("목표 칼로리는 양수 정수로 입력해주세요.");
      return;
    }
    if (!Number.isInteger(targetCalories)) {
      setError("목표 칼로리는 정수로 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const result = await setCalorieGoal({ targetCalories });
      setSuccessMessage(`목표 칼로리가 ${result.targetCalories} kcal로 설정되었습니다.`);
      onSuccess();
    } catch {
      setError("목표 칼로리 설정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>목표 칼로리 설정</h2>
      {error && <p style={errorStyle}>{error}</p>}
      {successMessage && <p style={successStyle}>{successMessage}</p>}
      <form onSubmit={handleSubmit} style={formStyle}>
        <label style={labelStyle}>
          목표 칼로리 (kcal):
        </label>
        <input
          type="number"
          value={targetCalories === 0 ? "" : targetCalories}
          onChange={(e) => setTargetCalories(Number(e.target.value))}
          placeholder="예: 2000"
          min={1}
          step={1}
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "설정 중..." : "설정"}
        </button>
      </form>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 16,
  marginBottom: 24,
  borderRadius: 8,
};

const formStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: "bold",
};

const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  fontSize: 14,
  border: "1px solid #ccc",
  borderRadius: 4,
  width: 120,
};

const buttonStyle: React.CSSProperties = {
  padding: "6px 16px",
  fontSize: 14,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  color: "red",
  marginBottom: 8,
};

const successStyle: React.CSSProperties = {
  color: "#2e7d32",
  marginBottom: 8,
};

export default CalorieGoalForm;
