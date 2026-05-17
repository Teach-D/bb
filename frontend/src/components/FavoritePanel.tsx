import React, { useEffect, useState } from "react";
import {
  addFavoriteFood,
  deleteFavoriteFood,
  getFavoriteFoods,
  logFromFavorite,
  FavoriteFoodListResponse,
  FavoriteFoodRequest,
  MealType,
} from "../api/favoriteFoods";

interface Props {
  onLogSuccess?: () => void; // 빠른 기록 성공 시 FoodLogList 재조회 트리거
}

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

const INITIAL_FORM: FavoriteFoodRequest = {
  foodName: "",
  calories: 0,
  mealType: "LUNCH",
};

const FavoritePanel: React.FC<Props> = ({ onLogSuccess }) => {
  // ─── 목록 상태 ───────────────────────────────────────────
  const [data, setData] = useState<FavoriteFoodListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── 빠른 기록 알림 ──────────────────────────────────────
  const [logSuccessMsg, setLogSuccessMsg] = useState<string | null>(null);

  // ─── 즐겨찾기 추가 폼 상태 ──────────────────────────────
  const [form, setForm] = useState<FavoriteFoodRequest>(INITIAL_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // ─── 삭제 진행 중인 id ────────────────────────────────────
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ─── 빠른 기록 진행 중인 id ──────────────────────────────
  const [loggingId, setLoggingId] = useState<number | null>(null);

  // ─── 최초 마운트 + 새로고침 ──────────────────────────────
  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getFavoriteFoods();
      setData(result);
    } catch {
      setError("즐겨찾기 목록 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // ─── 즐겨찾기 추가 ───────────────────────────────────────
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "calories" ? Number(value) : value,
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.foodName.trim()) {
      setAddError("음식 이름을 입력해 주세요.");
      return;
    }
    if (form.calories <= 0) {
      setAddError("칼로리는 1 이상이어야 합니다.");
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      await addFavoriteFood(form);
      setForm(INITIAL_FORM);
      await fetchFavorites();
    } catch {
      setAddError("즐겨찾기 추가에 실패했습니다.");
    } finally {
      setAddLoading(false);
    }
  };

  // ─── 즐겨찾기 삭제 ───────────────────────────────────────
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteFavoriteFood(id);
      await fetchFavorites();
    } catch {
      setError("즐겨찾기 삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── 빠른 기록 ───────────────────────────────────────────
  const handleLog = async (id: number) => {
    setLoggingId(id);
    setLogSuccessMsg(null);
    try {
      await logFromFavorite(id, {});
      setLogSuccessMsg("기록되었습니다!");
      // 3초 후 알림 자동 제거
      setTimeout(() => setLogSuccessMsg(null), 3000);
      if (onLogSuccess) onLogSuccess();
    } catch {
      setError("기록에 실패했습니다.");
    } finally {
      setLoggingId(null);
    }
  };

  return (
    <div style={panelContainer}>
      <h2 style={{ marginTop: 0 }}>즐겨찾기</h2>

      {/* ─── 빠른 기록 성공 알림 ─── */}
      {logSuccessMsg && (
        <p style={successMsg}>{logSuccessMsg}</p>
      )}

      {/* ─── 즐겨찾기 추가 폼 ─── */}
      <div style={formContainer}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>즐겨찾기 추가</h3>
        {addError && <p style={errorText}>{addError}</p>}
        <form onSubmit={handleAdd}>
          <div style={formRow}>
            <label style={labelStyle}>음식 이름:</label>
            <input
              name="foodName"
              type="text"
              value={form.foodName}
              onChange={handleFormChange}
              placeholder="예: 비빔밥"
              style={inputStyle}
            />
          </div>
          <div style={formRow}>
            <label style={labelStyle}>칼로리:</label>
            <input
              name="calories"
              type="number"
              value={form.calories}
              onChange={handleFormChange}
              min={1}
              style={inputStyle}
            />
          </div>
          <div style={formRow}>
            <label style={labelStyle}>식사 유형:</label>
            <select
              name="mealType"
              value={form.mealType}
              onChange={handleFormChange}
              style={inputStyle}
            >
              {MEAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={addLoading} style={addButton}>
            {addLoading ? "추가 중..." : "즐겨찾기 추가"}
          </button>
        </form>
      </div>

      {/* ─── 즐겨찾기 목록 ─── */}
      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 12 }}>즐겨찾기 목록</h3>
        {error && <p style={errorText}>{error}</p>}
        {loading && <p>로딩 중...</p>}
        {!loading && data && data.favorites.length === 0 && (
          <p style={{ color: "#888" }}>즐겨찾기가 없습니다.</p>
        )}
        {!loading && data && data.favorites.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={th}>음식 이름</th>
                <th style={th}>칼로리</th>
                <th style={th}>식사 유형</th>
                <th style={th}>기록</th>
                <th style={th}>삭제</th>
              </tr>
            </thead>
            <tbody>
              {data.favorites.map((fav) => (
                <tr key={fav.id}>
                  <td style={td}>{fav.foodName}</td>
                  <td style={td}>{fav.calories} kcal</td>
                  <td style={td}>{fav.mealType}</td>
                  <td style={td}>
                    <button
                      onClick={() => handleLog(fav.id)}
                      disabled={loggingId === fav.id}
                      style={logButton}
                    >
                      {loggingId === fav.id ? "기록 중..." : "기록하기"}
                    </button>
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => handleDelete(fav.id)}
                      disabled={deletingId === fav.id}
                      style={deleteButton}
                    >
                      {deletingId === fav.id ? "삭제 중..." : "삭제"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && data && (
          <p style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
            총 {data.total}개
          </p>
        )}
      </div>
    </div>
  );
};

export default FavoritePanel;

// ─── Style Constants ──────────────────────────────────────

const panelContainer: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 16,
  marginTop: 24,
  borderRadius: 8,
};

const formContainer: React.CSSProperties = {
  background: "#fafafa",
  border: "1px solid #eee",
  borderRadius: 6,
  padding: 16,
};

const formRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: 8,
  gap: 8,
};

const labelStyle: React.CSSProperties = {
  width: 80,
  fontSize: 14,
  fontWeight: "bold",
};

const inputStyle: React.CSSProperties = {
  padding: "4px 8px",
  fontSize: 14,
  border: "1px solid #ccc",
  borderRadius: 4,
};

const addButton: React.CSSProperties = {
  marginTop: 8,
  padding: "6px 16px",
  cursor: "pointer",
  background: "#4caf50",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  fontSize: 14,
};

const logButton: React.CSSProperties = {
  padding: "4px 10px",
  cursor: "pointer",
  background: "#1976d2",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  fontSize: 13,
};

const deleteButton: React.CSSProperties = {
  padding: "4px 10px",
  cursor: "pointer",
  background: "#e53935",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  fontSize: 13,
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

const errorText: React.CSSProperties = {
  color: "red",
  margin: "4px 0",
};

const successMsg: React.CSSProperties = {
  background: "#e8f5e9",
  color: "#2e7d32",
  border: "1px solid #a5d6a7",
  borderRadius: 4,
  padding: "8px 12px",
  marginBottom: 12,
  fontWeight: "bold",
};
