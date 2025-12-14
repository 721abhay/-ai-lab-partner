import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, ChevronRight, Award } from 'lucide-react';
import { QuizQuestion, ViewState } from '../types';

const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "What happens if you mix Bleach and Ammonia?",
    options: ["It cleans better", "It creates toxic Chloramine gas", "Nothing happens", "It turns blue"],
    correctIndex: 1,
    explanation: "NEVER mix Bleach and Ammonia. It creates deadly Chloramine gas which causes respiratory damage."
  },
  {
    id: 2,
    question: "What is the correct way to mix Acid and Water?",
    options: ["Add Water to Acid", "Add Acid to Water", "Mix them rapidly", "Shake them together"],
    correctIndex: 1,
    explanation: "Always Add Acid (AAA). Adding water to concentrated acid can cause it to boil and splash violently."
  },
  {
    id: 3,
    question: "Which of these is safe to mix for a 'Volcano' experiment?",
    options: ["Bleach + Vinegar", "Hydrogen Peroxide + Vinegar", "Baking Soda + Vinegar", "Ammonia + Iodine"],
    correctIndex: 2,
    explanation: "Baking Soda and Vinegar create harmless Carbon Dioxide gas. Bleach+Vinegar creates toxic Chlorine gas."
  }
];

interface Props {
  onComplete: () => void;
}

const SafetyTraining: React.FC<Props> = ({ onComplete }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    setIsAnswered(true);
    if (idx === questions[currentQ].correctIndex) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-lab-darker text-center">
        <Award className="w-24 h-24 text-yellow-400 mb-6 animate-bounce" />
        <h2 className="text-3xl font-bold text-white mb-2">Training Complete!</h2>
        <p className="text-xl text-slate-300 mb-8">You scored {score} / {questions.length}</p>
        
        {score === questions.length ? (
            <div className="bg-green-500/20 border border-green-500 p-4 rounded-xl mb-8">
                <p className="font-bold text-green-400">CERTIFICATION GRANTED: LEVEL 1</p>
                <p className="text-sm text-green-200 mt-1">You can now access standard experiments.</p>
            </div>
        ) : (
            <div className="bg-red-500/20 border border-red-500 p-4 rounded-xl mb-8">
                <p className="font-bold text-red-400">CERTIFICATION FAILED</p>
                <p className="text-sm text-red-200 mt-1">Please review safety guidelines and try again.</p>
            </div>
        )}

        <button 
            onClick={onComplete}
            className="bg-lab-accent text-black font-bold py-3 px-8 rounded-full shadow-lg hover:bg-cyan-400 transition-colors"
        >
            Return to Lab
        </button>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="h-full flex flex-col p-6 bg-lab-darker">
      <div className="flex items-center gap-2 mb-8">
        <ShieldCheck className="text-lab-accent" />
        <h2 className="font-bold text-white">Safety Training Module</h2>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        <div className="mb-2 flex justify-between text-xs text-slate-500 uppercase font-bold">
            <span>Question {currentQ + 1}/{questions.length}</span>
            <span>Progress</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full mb-8">
            <div className="bg-lab-accent h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
        </div>

        <h3 className="text-xl font-bold text-white mb-6">{q.question}</h3>

        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            let btnClass = "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700";
            if (isAnswered) {
                if (idx === q.correctIndex) btnClass = "bg-green-500/20 border-green-500 text-green-400";
                else if (idx === selected) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                else btnClass = "bg-slate-800 border-slate-700 opacity-50";
            }

            return (
              <button
                key={idx}
                onClick={() => !isAnswered && handleAnswer(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${btnClass}`}
              >
                {opt}
                {isAnswered && idx === q.correctIndex && <CheckCircle className="w-5 h-5" />}
                {isAnswered && idx === selected && idx !== q.correctIndex && <XCircle className="w-5 h-5" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-6 animate-in slide-in-from-bottom">
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mb-4">
                <p className="text-sm text-blue-200"><span className="font-bold">Fact:</span> {q.explanation}</p>
            </div>
            <button 
                onClick={nextQuestion}
                className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2"
            >
                {currentQ === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyTraining;