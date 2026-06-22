import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiClock, HiCheckCircle, HiXCircle, HiArrowRight, HiArrowLeft } from 'react-icons/hi';
import { fetchQuizDataThunk, submitQuizThunk, fetchMyResultThunk, setAnswer, nextQuestion, prevQuestion, goToQuestion, decrementTimer, resetQuiz, startQuiz } from '../../features/quizSlice';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const QuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentQuiz, currentQuestionIndex, answers, timeRemaining, isSubmitted, quizResult, quizLoading } = useSelector((s) => s.quiz);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        dispatch(fetchQuizDataThunk(id));
        return () => dispatch(resetQuiz());
    }, [id, dispatch]);

    // Initialize timer when quiz data loads
    useEffect(() => {
        if (currentQuiz && !isSubmitted && timeRemaining === 0) {
            dispatch(startQuiz(currentQuiz));
        }
    }, [currentQuiz, isSubmitted, timeRemaining, dispatch]);

    // Timer countdown
    useEffect(() => {
        if (!currentQuiz || isSubmitted) return;
        const timer = setInterval(() => dispatch(decrementTimer()), 1000);
        return () => clearInterval(timer);
    }, [currentQuiz, isSubmitted, dispatch]);

    // Auto-submit on timeout
    useEffect(() => {
        if (timeRemaining === 0 && currentQuiz && !isSubmitted && Object.keys(answers).length > 0) {
            handleApiSubmit();
            toast('⏰ Time\'s up! Quiz submitted automatically.');
        }
    }, [timeRemaining]);

    const handleApiSubmit = async () => {
        if (!currentQuiz) return;
        // Build submission: map local answers to QuizSubmitDto format
        const submissionAnswers = Object.entries(answers).map(([questionId, answerIndex]) => {
            const question = currentQuiz.questions?.find((q) => String(q.id) === String(questionId));
            const selectedAnswer = question?.options?.[answerIndex]?.text || question?.options?.[answerIndex] || String(answerIndex);
            return { questionId: Number(questionId), selectedAnswer: typeof selectedAnswer === 'object' ? selectedAnswer.text : selectedAnswer };
        });
        const result = await dispatch(submitQuizThunk({ quizId: Number(id), answers: submissionAnswers }));
        if (submitQuizThunk.fulfilled.match(result)) {
            toast.success('Quiz submitted! 🎉');
        } else {
            toast.error(result.payload || 'Failed to submit quiz');
        }
    };

    if (quizLoading && !currentQuiz) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" /><p className="text-sm text-text-secondary">Loading quiz...</p></div>;
    if (!currentQuiz) return <div className="text-center py-20"><p className="text-xl text-text-secondary">Quiz not found</p></div>;

    const questions = currentQuiz.questions || [];
    const question = questions[currentQuestionIndex];
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const answeredCount = Object.keys(answers).length;

    // Results screen
    if (isSubmitted && quizResult) {
        const score = quizResult;
        const passed = score.passed ?? (score.percentage >= (currentQuiz.passingScore || 70));
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
                <div className={`bg-card rounded-3xl shadow-xl border p-8 text-center ${passed ? 'border-emerald-200' : 'border-red-200'}`}>
                    <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {passed ? <HiCheckCircle className="w-14 h-14 text-emerald-500" /> : <HiXCircle className="w-14 h-14 text-red-500" />}
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">{passed ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}</h2>
                    <p className="text-text-secondary mb-6">{passed ? 'You passed the quiz!' : 'Better luck next time!'}</p>
                    <div className="text-6xl font-bold mb-2 gradient-text">{score.percentage ?? score.score ?? 0}%</div>
                    <p className="text-sm text-text-secondary mb-6">{score.correctAnswers ?? score.correct ?? 0}/{score.totalQuestions ?? questions.length} correct</p>
                    <div className="flex gap-3 justify-center mt-8">
                        <button onClick={() => { dispatch(resetQuiz()); dispatch(fetchQuizDataThunk(id)); }}
                            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">Retake Quiz</button>
                        <button onClick={() => navigate(-1)}
                            className="px-6 py-2.5 border border-border text-text-secondary rounded-xl text-sm font-medium hover:bg-surface transition-colors">Back to Course</button>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (!question) return <div className="text-center py-20"><p className="text-xl text-text-secondary">No questions in this quiz</p></div>;

    // Get options — handle both string arrays and OptionDto arrays [{text: "..."}]
    const getOptions = (q) => {
        if (!q?.options) return [];
        return q.options.map((o) => (typeof o === 'object' ? o.text : o));
    };
    const options = getOptions(question);
    const questionId = question.id || currentQuestionIndex;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">{currentQuiz.title}</h1>
                    <p className="text-sm text-text-secondary">{currentQuiz.description}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-semibold text-sm ${timeRemaining < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-text-secondary'}`}>
                    <HiClock className="w-4 h-4" />{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
            </div>

            <div className="flex gap-1.5 mb-6">
                {questions.map((q, i) => (
                    <button key={q.id || i} onClick={() => dispatch(goToQuestion(i))}
                        className={`flex-1 h-2 rounded-full transition-all ${i === currentQuestionIndex ? 'bg-primary-500' : answers[q.id || i] !== undefined ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                    <p className="text-xs text-primary-600 font-semibold mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    <h2 className="text-lg font-semibold text-text-primary mb-6">{question.questionText || question.question}</h2>
                    <div className="space-y-3">
                        {options.map((option, i) => (
                            <button key={i} onClick={() => dispatch(setAnswer({ questionId, answerIndex: i }))}
                                className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm transition-all ${answers[questionId] === i ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-border text-text-secondary hover:border-primary-200'}`}>
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-xs font-semibold mr-3">{String.fromCharCode(65 + i)}</span>
                                {option}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6">
                <button onClick={() => dispatch(prevQuestion())} disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-medium text-text-secondary hover:bg-surface disabled:opacity-40 transition-all">
                    <HiArrowLeft className="w-4 h-4" /> Previous
                </button>
                <p className="text-sm text-gray-400">{answeredCount}/{questions.length} answered</p>
                {currentQuestionIndex < questions.length - 1 ? (
                    <button onClick={() => dispatch(nextQuestion())}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-all">
                        Next <HiArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button onClick={() => setShowConfirm(true)}
                        className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all">
                        Submit Quiz
                    </button>
                )}
            </div>

            <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Submit Quiz?">
                <div className="p-6 text-center">
                    <p className="text-text-secondary mb-2">You answered <b>{answeredCount}</b> out of <b>{questions.length}</b> questions.</p>
                    {answeredCount < questions.length && <p className="text-sm text-amber-600 mb-4">⚠️ Some questions are unanswered.</p>}
                    <div className="flex gap-3 justify-center mt-4">
                        <button onClick={() => setShowConfirm(false)} className="px-5 py-2 border border-border rounded-xl text-sm font-medium text-text-secondary">Cancel</button>
                        <button onClick={() => { setShowConfirm(false); handleApiSubmit(); }} disabled={quizLoading} className="px-5 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                            {quizLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default QuizPage;
