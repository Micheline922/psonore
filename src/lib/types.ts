
export type Creation = {
  id: number;
  title: string;
  content: string;
  slogan: string;
  date: string;
};

export type AcademyQuizQuestion = {
    question: string;
    options: string[];
    correctAnswerIndex: number;
};

export type AcademyQuizAnswer = {
    isCorrect: boolean;
    explanation: string;
};
    
