import { useState } from "react";
import axios from "axios";
import "./App.css";
import { MCQResponse, MCQuestion } from "./types";

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [questions, setQuestions] = useState<MCQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setError("Please enter a YouTube video URL");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setSelectedAnswers([]);
    setSubmitted(false);
    setScore(0);

    try {
      const response = await axios.post<MCQResponse>(
        "https://quiztube-backend.onrender.com/api/generate-mcq",
        {
          videoUrl,
        }
      );

      const randomizedQuestions = response.data.questions.map((q) => {
        const correctAnswer = q.options[q.correctIndex];
        const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
        const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

        return {
          ...q,
          options: shuffledOptions,
          correctIndex: newCorrectIndex,
        };
      });

      setQuestions(randomizedQuestions);
      setSelectedAnswers(new Array(randomizedQuestions.length).fill(-1));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to generate questions. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitAnswers = () => {
    if (selectedAnswers.includes(-1)) {
      setError("Please answer all questions before submitting");
      return;
    }
    setError("");
    const correctAnswers = selectedAnswers.reduce((count, answer, index) => {
      return count + (answer === questions[index].correctIndex ? 1 : 0);
    }, 0);
    setScore(correctAnswers);
    setSubmitted(true);
  };

  return (
    <div className="container">
      <h1>YouTube Video MCQ Generator</h1>
      <form onSubmit={handleSubmit} className="video-form">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Paste YouTube video link here"
          className="video-input"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate MCQs"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {questions.length > 0 && (
        <div className="questions-container">
          <h2>Multiple Choice Questions</h2>
          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className={`question-card ${
                submitted
                  ? selectedAnswers[qIndex] === q.correctIndex
                    ? "correct-answer"
                    : "wrong-answer"
                  : ""
              }`}
            >
              <h3>Question {qIndex + 1}</h3>
              <p>{q.question}</p>
              <div className="options">
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="option">
                    <input
                      type="checkbox"
                      id={`q${qIndex}-o${oIndex}`}
                      checked={selectedAnswers[qIndex] === oIndex}
                      onChange={() => handleAnswerSelect(qIndex, oIndex)}
                      disabled={submitted}
                    />
                    <label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</label>
                  </div>
                ))}
              </div>
              {submitted && (
                <p
                  style={{
                    color:
                      selectedAnswers[qIndex] === q.correctIndex
                        ? "#22c55e"
                        : "#ff4444",
                    marginTop: "1rem",
                  }}
                >
                  {selectedAnswers[qIndex] === q.correctIndex
                    ? "✓ Correct!"
                    : `✗ Incorrect. The correct answer is: ${
                        q.options[q.correctIndex]
                      }`}
                </p>
              )}
            </div>
          ))}

          {!submitted && questions.length > 0 && (
            <button
              className="submit-answers"
              onClick={handleSubmitAnswers}
              disabled={selectedAnswers.includes(-1)}
            >
              Submit Answers
            </button>
          )}

          {submitted && (
            <div className="result">
              <h2>Your Score</h2>
              <p className="score">{score} out of 10</p>
              <p>
                {score === 10
                  ? "Perfect score! Excellent work! 🎉"
                  : score >= 7
                  ? "Great job! Keep it up! 👏"
                  : "Good try! Review the correct answers above to learn more. 📚"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
