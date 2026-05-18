import React, { useState, useRef, useEffect } from "react";
import { addFoodLog, FoodLogRequest, searchFoodSuggestions } from "../api/foodLog";

interface Props {
  onSuccess: () => void; // 추가 성공 시 목록 새로고침 트리거
}

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

const FoodLogForm: React.FC<Props> = ({ onSuccess }) => {
  const [form, setForm] = useState<FoodLogRequest>({
    foodName: "",
    calories: 0,
    mealType: "LUNCH",
    carbohydrate: 0,
    protein: 0,
    fat: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Autocomplete state ───────────────────────────────────
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Handlers ─────────────────────────────────────────────

  // calories, mealType, 영양소 등 일반 필드 변경
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ["calories", "carbohydrate", "protein", "fat"];
    if (name === "mealType") {
      setForm((prev) => ({
        ...prev,
        mealType: value as FoodLogRequest["mealType"],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: numericFields.includes(name) ? Number(value) : value,
      }));
    }
  };

  // foodName 전용 핸들러 (debounce + 자동완성)
  const handleFoodNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, foodName: value }));
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await searchFoodSuggestions(value.trim());
        setSuggestions(result.suggestions);
        setShowDropdown(result.suggestions.length > 0);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // 드롭다운 항목 선택
  const selectSuggestion = (name: string) => {
    setForm((prev) => ({ ...prev, foodName: name }));
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 클라이언트 validation
    if (!form.foodName.trim()) {
      setError("음식 이름을 입력해주세요.");
      return;
    }
    if (form.calories < 0) {
      setError("칼로리는 0 이상이어야 합니다.");
      return;
    }
    if (form.carbohydrate < 0 || form.protein < 0 || form.fat < 0) {
      setError("영양소 값은 0 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addFoodLog(form);
      setForm({ foodName: "", calories: 0, mealType: "LUNCH", carbohydrate: 0, protein: 0, fat: 0 });
      setSuggestions([]);
      setShowDropdown(false);
      onSuccess();
    } catch (err) {
      setError("기록 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 16, marginBottom: 24, borderRadius: 8 }}>
      <h2>🍽 음식 기록 추가</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 음식 이름 + 자동완성 드롭다운 */}
      <div>
        <label>음식 이름: </label>
        <div ref={wrapperRef} style={{ position: "relative", display: "inline-block" }}>
          <input
            name="foodName"
            type="text"
            value={form.foodName}
            onChange={handleFoodNameChange}
            onKeyDown={handleKeyDown}
            placeholder="예: 비빔밥"
            autoComplete="off"
          />
          {showDropdown && suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 1000,
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: 4,
                margin: 0,
                padding: 0,
                listStyle: "none",
                minWidth: "100%",
                maxHeight: 220,
                overflowY: "auto",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {suggestions.map((s, i) => (
                <li
                  key={s}
                  onMouseDown={() => selectSuggestion(s)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: i === activeIndex ? "#e6f0ff" : "#fff",
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 칼로리 */}
      <div style={{ marginTop: 8 }}>
        <label>칼로리: </label>
        <input name="calories" type="number" value={form.calories} onChange={handleChange} />
      </div>

      {/* 식사 유형 */}
      <div style={{ marginTop: 8 }}>
        <label>식사 유형: </label>
        <select name="mealType" value={form.mealType} onChange={handleChange}>
          {MEAL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* 탄수화물 */}
      <div style={{ marginTop: 8 }}>
        <label>탄수화물(g): </label>
        <input
          name="carbohydrate"
          type="number"
          min={0}
          step={0.1}
          value={form.carbohydrate}
          onChange={handleChange}
        />
      </div>

      {/* 단백질 */}
      <div style={{ marginTop: 8 }}>
        <label>단백질(g): </label>
        <input
          name="protein"
          type="number"
          min={0}
          step={0.1}
          value={form.protein}
          onChange={handleChange}
        />
      </div>

      {/* 지방 */}
      <div style={{ marginTop: 8 }}>
        <label>지방(g): </label>
        <input
          name="fat"
          type="number"
          min={0}
          step={0.1}
          value={form.fat}
          onChange={handleChange}
        />
      </div>

      <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 12 }}>
        {loading ? "저장 중..." : "추가하기"}
      </button>
    </div>
  );
};

export default FoodLogForm;
