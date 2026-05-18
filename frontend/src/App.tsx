import React, { useState } from "react";
import FoodLogForm from "./components/FoodLogForm";
import FoodLogList from "./components/FoodLogList";
import FoodLogStats from "./components/FoodLogStats";
import FavoritePanel from "./components/FavoritePanel";
import CalorieGoalForm from "./components/CalorieGoalForm";
import CalorieGoalPanel from "./components/CalorieGoalPanel";

const App: React.FC = () => {
  // FoodLogForm에서 추가 성공 시 이 값을 올려서 FoodLogList가 재조회하도록 트리거
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [goalRefreshTrigger, setGoalRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleGoalSuccess = () => {
    setGoalRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>🥗 누비랩 식단 기록</h1>
      <CalorieGoalForm onSuccess={handleGoalSuccess} />
      <CalorieGoalPanel refreshTrigger={goalRefreshTrigger} />
      <FoodLogForm onSuccess={handleSuccess} />
      <FoodLogList refreshTrigger={refreshTrigger} />
      <FoodLogStats refreshTrigger={refreshTrigger} />
      <FavoritePanel onLogSuccess={handleSuccess} />
    </div>
  );
};

export default App;
