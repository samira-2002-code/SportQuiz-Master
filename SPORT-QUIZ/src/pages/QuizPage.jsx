import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ProgressBar from "../components/ProgressBar";
import QuestionCard from "../components/QuestionCard";
import QuizHeader from "../components/QuizHeader";
import QuestionInfo from "../components/QuestionInfo";
import QuizActions from "../components/QuizActions";

import { shuffle } from "../utils/helpers";

 
const QUIZ_TIME = 30;

const QuizPage = ({ theme, onToggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  
  const questions = location.state?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);   
  const [score, setScore]               = useState(0);    
  const [selectedAnswer, setSelectedAnswer] = useState(null);  
  const [isLocked, setIsLocked]         = useState(false);   
  const [hintUsed, setHintUsed]         = useState(false);   
  const [removedOptions, setRemovedOptions] = useState([]);  
  const [timeLeft, setTimeLeft]         = useState(QUIZ_TIME);  
  const [answersLog, setAnswersLog]     = useState([]);  
  const [baseOptions, setBaseOptions]   = useState([]);  

  const currentQuestion = questions[currentIndex];

  
  useEffect(() => {
    if (!questions.length) navigate("/", { replace: true });
  }, [questions, navigate]);

  
  useEffect(() => {
    if (!currentQuestion) return;
    setTimeLeft(QUIZ_TIME);
    setSelectedAnswer(null);
    setIsLocked(false);
    setRemovedOptions([]);

   
    if (currentQuestion.type === "boolean") {
      setBaseOptions(["True", "False"]);
    } else {
      setBaseOptions(
        shuffle([currentQuestion.correct_answer, ...currentQuestion.incorrect_answers])
      );
    }

    
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
           
          clearInterval(timer);
          setIsLocked(true);
          setAnswersLog((prev) => [
            ...prev,
            {
              question: currentQuestion.question,
              userAnswer: null,
              correctAnswer: currentQuestion.correct_answer,
              isCorrect: false,
            },
          ]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

   
    return () => clearInterval(timer);
  }, [currentIndex, currentQuestion]);

  if (!currentQuestion) return null;

  const correctAnswer = currentQuestion.correct_answer;

 
  const options = baseOptions.filter((o) => !removedOptions.includes(o));

 
  function handleAnswer(ans) {
    if (isLocked) return;

    setSelectedAnswer(ans);
    setIsLocked(true);

    const isCorrect = ans === correctAnswer;
    if (isCorrect) setScore((s) => s + 1);

    setAnswersLog((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        userAnswer: ans,
        correctAnswer,
        isCorrect,
      },
    ]);
  }

 
  const canUseHint = !hintUsed && !isLocked && currentQuestion.type !== "boolean";

  
  function handleHint() {
    if (!canUseHint) return;
    const wrongAnswers = baseOptions.filter((o) => o !== correctAnswer);
    setRemovedOptions(shuffle(wrongAnswers).slice(0, 2));
    setHintUsed(true);
  }

 
  function handleNext() {
    if (!isLocked) return;

    const isLastQuestion = currentIndex === questions.length - 1;

    if (isLastQuestion) {
       navigate("/results", {
        state: {
          quizData: {
            score,
            totalQuestions: questions.length,
            answers: answersLog,
            percentage: Math.round((score / questions.length) * 100),
          },
        },
        replace: true,
      });
    } else {
    
      setCurrentIndex((i) => i + 1);
    }
  }

 
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

 
  const dashArray = 163;
  const dashOffset = Math.round(dashArray * (1 - timeLeft / QUIZ_TIME));

  return (
    <div className="font-nunito bg-white dark:bg-slate-950 min-h-screen w-full transition-colors">
      <div className="w-full min-h-screen flex flex-col px-5 py-8 lg:px-24 lg:py-14">

        <QuizHeader
          category={currentQuestion.category}
          currentIndex={currentIndex}
          total={questions.length}
          score={score}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        <QuestionInfo
          currentIndex={currentIndex}
          total={questions.length}
          timeLeft={timeLeft}
          dashArray={dashArray}
          dashOffset={dashOffset}
        />

        <div className="mb-6 lg:mb-8">
          <ProgressBar value={progressPercent} />
        </div>

        <QuestionCard
          questionText={currentQuestion.question}
          options={options}
          onSelect={handleAnswer}
          isLocked={isLocked}
          correctAnswer={correctAnswer}
          selectedAnswer={selectedAnswer}
        />

        <QuizActions
          canUseHint={canUseHint}
          onFifty={handleHint}
          onNext={handleNext}
          isLocked={isLocked}
          isLastQuestion={currentIndex === questions.length - 1}
        />

      </div>
    </div>
  );
};

export default QuizPage;