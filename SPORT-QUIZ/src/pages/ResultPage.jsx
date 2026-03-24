import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ScoreCircle from "../components/ScoreCircle";
import StatsCard from "../components/StatsCard";
import ReviewList from "../components/ReviewList";
import ResultButtons from "../components/ResultButtons";

const ResultPage = ({ theme, onToggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const quizData = location.state?.quizData;
  const [showReview, setShowReview] = useState(false);

  if (!quizData) {
    navigate("/", { replace: true });
    return null;
  }

  const { score, totalQuestions, answers, percentage } = quizData;
  const wrongCount = totalQuestions - score;

  return (
    <div className="font-nunito bg-white dark:bg-slate-950 min-h-screen w-full transition-colors">
      <div className="w-full min-h-screen flex flex-col px-5 py-8 lg:px-24 lg:py-14">
        <Header
          title="SportQuiz"
          subtitle="Résultats de ta partie"
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        <ScoreCircle score={score} total={totalQuestions} />

        <div className="text-center mb-8">
          <p className="text-gray-400 font-semibold text-sm mb-2">
            Pourcentage
          </p>
          <p className="font-black text-indigo-600 text-3xl">{percentage}%</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mb-10 lg:mb-14">
          <StatsCard
            label="Bonnes reponses"
            count={score}
            color="green"
            icon="fa-circle-check"
          />
          <StatsCard
            label="Mauvaises reponses "
            count={wrongCount}
            color="red"
            icon="fa-circle-xmark"
          />
        </div>

        {showReview && <ReviewList answers={answers} />}

        <div className="flex-1" />
        <ResultButtons showReview={showReview} setShowReview={setShowReview} />
      </div>
    </div>
  );
};

export default ResultPage;