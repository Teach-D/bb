import React, { useEffect, useState } from "react";
import { getFoodLogs, FoodLogListResponse } from "../api/foodLog";

interface Props {
  refreshTrigger: number; // 이 값이 바뀔 때마다 목록 재조회
}

const PAGE_SIZE = 20;

const FoodLogList: React.FC<Props> = ({ refreshTrigger }) => {
  const [data, setData] = useState<FoodLogListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    setCurrentPage(0);
  }, [refreshTrigger]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedDate]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getFoodLogs(currentPage, PAGE_SIZE, selectedDate || undefined);
        setData(result);
      } catch (err) {
        setError("목록 조회에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [refreshTrigger, currentPage, selectedDate]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return null;

  const totalPages = Math.ceil(data.totalElements / data.size);

  return (
    <div>
      <h2>📋 오늘의 식단 기록</h2>
      <div style={dateFilterContainer}>
        <label style={dateLabel}>날짜 선택:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={dateInput}
        />
        {selectedDate && (
          <button style={resetButton} onClick={() => setSelectedDate("")}>
            초기화
          </button>
        )}
      </div>
      <div style={summaryContainer}>
        <span>
          <strong>{selectedDate ? `${selectedDate} 칼로리: ` : "총 칼로리: "}</strong>
          {data.totalCalories} kcal
        </span>
        <span>
          <strong>탄수화물: </strong>
          {data.totalCarbohydrate.toFixed(1)} g
        </span>
        <span>
          <strong>단백질: </strong>
          {data.totalProtein.toFixed(1)} g
        </span>
        <span>
          <strong>지방: </strong>
          {data.totalFat.toFixed(1)} g
        </span>
      </div>
      {data.logs.length === 0 ? (
        <p>기록이 없습니다.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={th}>음식 이름</th>
              <th style={th}>칼로리</th>
              <th style={th}>탄수화물(g)</th>
              <th style={th}>단백질(g)</th>
              <th style={th}>지방(g)</th>
              <th style={th}>식사 유형</th>
              <th style={th}>기록 시간</th>
            </tr>
          </thead>
          <tbody>
            {data.logs.map((log) => (
              <tr key={log.id}>
                <td style={td}>{log.foodName}</td>
                <td style={td}>{log.calories} kcal</td>
                <td style={td}>{log.carbohydrate.toFixed(1)}</td>
                <td style={td}>{log.protein.toFixed(1)}</td>
                <td style={td}>{log.fat.toFixed(1)}</td>
                <td style={td}>{log.mealType}</td>
                <td style={td}>{new Date(log.loggedAt).toLocaleString("ko-KR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={paginationContainer}>
        <button
          style={pageButton}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 0}
        >
          이전
        </button>
        <span style={pageInfo}>
          {currentPage + 1} / {totalPages === 0 ? 1 : totalPages}
        </span>
        <button
          style={pageButton}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          다음
        </button>
      </div>
    </div>
  );
};

const summaryContainer: React.CSSProperties = {
  display: "flex",
  gap: "24px",
  flexWrap: "wrap",
  marginBottom: "12px",
  padding: "8px 12px",
  background: "#f0f4ff",
  borderRadius: "6px",
  fontSize: "14px",
};

const dateFilterContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "12px",
};

const dateLabel: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
};

const dateInput: React.CSSProperties = {
  padding: "4px 8px",
  fontSize: "14px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const resetButton: React.CSSProperties = {
  padding: "4px 10px",
  fontSize: "13px",
  cursor: "pointer",
};

const th: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "8px 12px",
  textAlign: "left",
};

const td: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "8px 12px",
};

const paginationContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "12px",
};

const pageButton: React.CSSProperties = {
  padding: "6px 14px",
  cursor: "pointer",
};

const pageInfo: React.CSSProperties = {
  fontSize: "14px",
};

export default FoodLogList;
