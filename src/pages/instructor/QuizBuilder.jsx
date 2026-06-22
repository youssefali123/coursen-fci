import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiCheck, HiDuplicate, HiArrowLeft, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { createQuizThunk } from '../../features/quizSlice';
import toast from 'react-hot-toast';

const QUIZ_TYPE = { 0: 'Practice Quiz', 1: 'Exam Quiz', 2: 'Assignment Quiz' };

const QuizBuilder = () => {
    const { courseId: routeCourseId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { courses } = useSelector((s) => s.courses);
    const { quizLoading } = useSelector((s) => s.quiz);

    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        timeLimitInMinutes: 30,
        quizType: 0,
        courseId: routeCourseId ? Number(routeCourseId) : courses[0]?.id || '',
        questions: [
            {
                questionText: '',
                explanation: '',
                points: 10,
                correctAnswer: '',
                options: [{ text: '' }, { text: '' }]
            }
        ]
    });

    const [expandedQuestions, setExpandedQuestions] = useState({ 0: true });

    // Auto calculate total marks
    const totalMarks = useMemo(() => {
        return quizData.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    }, [quizData.questions]);

    const toggleQuestionExpand = (index) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const addQuestion = () => {
        const newQuestion = {
            questionText: '',
            explanation: '',
            points: 10,
            correctAnswer: '',
            options: [{ text: '' }, { text: '' }]
        };
        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
        setExpandedQuestions(prev => ({
            ...prev,
            [quizData.questions.length]: true
        }));
    };

    const duplicateQuestion = (index) => {
        const questionToDuplicate = { ...quizData.questions[index] };
        questionToDuplicate.options = questionToDuplicate.options.map(opt => ({ ...opt }));
        setQuizData(prev => ({
            ...prev,
            questions: [
                ...prev.questions.slice(0, index + 1),
                questionToDuplicate,
                ...prev.questions.slice(index + 1)
            ]
        }));
    };

    const removeQuestion = (index) => {
        if (quizData.questions.length <= 1) return;
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
        const newExpanded = {};
        Object.keys(expandedQuestions).forEach(key => {
            const numKey = Number(key);
            if (numKey < index) newExpanded[numKey] = expandedQuestions[numKey];
            else if (numKey > index) newExpanded[numKey - 1] = expandedQuestions[numKey];
        });
        setExpandedQuestions(newExpanded);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...quizData.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuizData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addOption = (questionIndex) => {
        const newQuestions = [...quizData.questions];
        newQuestions[questionIndex].options.push({ text: '' });
        setQuizData(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeOption = (questionIndex, optionIndex) => {
        const newQuestions = [...quizData.questions];
        if (newQuestions[questionIndex].options.length <= 2) return;
        // If removing correct answer, clear it
        if (newQuestions[questionIndex].correctAnswer === newQuestions[questionIndex].options[optionIndex].text) {
            newQuestions[questionIndex].correctAnswer = '';
        }
        newQuestions[questionIndex].options.splice(optionIndex, 1);
        setQuizData(prev => ({ ...prev, questions: newQuestions }));
    };

    const updateOption = (questionIndex, optionIndex, value) => {
        const newQuestions = [...quizData.questions];
        const oldText = newQuestions[questionIndex].options[optionIndex].text;
        newQuestions[questionIndex].options[optionIndex] = { text: value };
        // If this was the correct answer, update it
        if (newQuestions[questionIndex].correctAnswer === oldText) {
            newQuestions[questionIndex].correctAnswer = value;
        }
        setQuizData(prev => ({ ...prev, questions: newQuestions }));
    };

    const validateQuiz = () => {
        if (!quizData.title.trim()) {
            toast.error('Quiz title is required');
            return false;
        }
        if (!quizData.description.trim()) {
            toast.error('Quiz description is required');
            return false;
        }
        if (!quizData.courseId) {
            toast.error('Course is required');
            return false;
        }
        if (Number(quizData.timeLimitInMinutes) <= 0) {
            toast.error('Time limit must be greater than 0');
            return false;
        }
        if (quizData.questions.length === 0) {
            toast.error('At least one question is required');
            return false;
        }
        for (let i = 0; i < quizData.questions.length; i++) {
            const q = quizData.questions[i];
            if (!q.questionText.trim()) {
                toast.error(`Question ${i + 1} text is required`);
                return false;
            }
            if (Number(q.points) <= 0) {
                toast.error(`Question ${i + 1} points must be greater than 0`);
                return false;
            }
            if (q.options.length < 2) {
                toast.error(`Question ${i + 1} must have at least 2 options`);
                return false;
            }
            if (!q.correctAnswer || !q.options.some(opt => opt.text === q.correctAnswer)) {
                toast.error(`Question ${i + 1} must have a valid correct answer`);
                return false;
            }
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateQuiz()) return;

        const payload = {
            title: quizData.title,
            description: quizData.description,
            quizType: Number(quizData.quizType),
            totalMarks: totalMarks,
            timeLimitInMinutes: Number(quizData.timeLimitInMinutes),
            courseId: Number(quizData.courseId),
            questions: quizData.questions.map(q => ({
                questionText: q.questionText,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                points: Number(q.points),
                options: q.options.filter(opt => opt.text.trim() !== '')
            }))
        };

        const result = await dispatch(createQuizThunk(payload));
        if (createQuizThunk.fulfilled.match(result)) {
            toast.success('Quiz created successfully! 🎉');
            if (routeCourseId) {
                navigate(`/instructor/courses/${routeCourseId}/edit`);
            } else {
                navigate('/instructor/dashboard');
            }
        } else {
            toast.error(result.payload || 'Failed to create quiz');
        }
    };

    const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-transparent';

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-600 mb-4 transition-colors">
                    <HiArrowLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="text-2xl font-bold text-text-primary">Create <span className="gradient-text">Quiz</span></h1>
                <p className="text-text-secondary text-sm mt-1">Create a new quiz for your course</p>
            </motion.div>

            {/* Quiz Information */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Quiz Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Quiz Title *</label>
                        <input
                            type="text"
                            value={quizData.title}
                            onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                            placeholder="e.g., JavaScript Basics Quiz"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Description *</label>
                        <textarea
                            value={quizData.description}
                            onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                            rows={3}
                            placeholder="Test your understanding of variables and functions..."
                            className={inputClass + ' resize-none'}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Quiz Type *</label>
                            <select
                                value={quizData.quizType}
                                onChange={(e) => setQuizData({ ...quizData, quizType: Number(e.target.value) })}
                                className={inputClass}
                            >
                                {Object.entries(QUIZ_TYPE).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Time Limit (Minutes) *</label>
                            <input
                                type="number"
                                min="1"
                                value={quizData.timeLimitInMinutes}
                                onChange={(e) => setQuizData({ ...quizData, timeLimitInMinutes: Number(e.target.value) })}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Total Marks</label>
                            <input
                                type="number"
                                value={totalMarks}
                                disabled
                                className={inputClass + ' bg-gray-50 dark:bg-gray-900/20 cursor-not-allowed'}
                            />
                        </div>
                    </div>
                    {!routeCourseId && (
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Course *</label>
                            <select
                                value={quizData.courseId}
                                onChange={(e) => setQuizData({ ...quizData, courseId: e.target.value })}
                                className={inputClass}
                            >
                                <option value="">Select a course...</option>
                                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Questions ({quizData.questions.length})</h3>
                </div>
                {quizData.questions.map((question, qIndex) => (
                    <motion.div
                        key={qIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-border bg-surface/50">
                            <button
                                onClick={() => toggleQuestionExpand(qIndex)}
                                className="flex items-center gap-3 text-left font-bold text-text-primary group w-full"
                            >
                                <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded font-bold">
                                    {qIndex + 1}
                                </span>
                                <span className="text-sm truncate">
                                    {question.questionText || 'Untitled Question'}
                                </span>
                                <span className="ml-auto flex items-center gap-1 text-xs text-text-secondary font-normal">
                                    {question.points} pts
                                </span>
                                {expandedQuestions[qIndex] ? (
                                    <HiChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <HiChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                            <div className="flex items-center gap-1 ml-2">
                                <button
                                    onClick={() => duplicateQuestion(qIndex)}
                                    className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                                    title="Duplicate Question"
                                >
                                    <HiDuplicate className="w-4 h-4" />
                                </button>
                                {quizData.questions.length > 1 && (
                                    <button
                                        onClick={() => removeQuestion(qIndex)}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Question"
                                    >
                                        <HiTrash className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {expandedQuestions[qIndex] && (
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary mb-1">Question Text *</label>
                                    <input
                                        type="text"
                                        value={question.questionText}
                                        onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                        placeholder="e.g., What is React?"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary mb-1">Explanation</label>
                                    <textarea
                                        value={question.explanation}
                                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                        rows={2}
                                        placeholder="Explain why the correct answer is right..."
                                        className={inputClass + ' resize-none'}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-text-secondary mb-1">Points *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={question.points}
                                            onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-text-secondary">Options *</label>
                                        <button
                                            onClick={() => addOption(qIndex)}
                                            className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1"
                                        >
                                            <HiPlus className="w-3 h-3" /> Add Option
                                        </button>
                                    </div>
                                    {question.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuestion(qIndex, 'correctAnswer', option.text)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                                    question.correctAnswer === option.text
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-emerald-100'
                                                }`}
                                                title="Set as Correct Answer"
                                            >
                                                {question.correctAnswer === option.text ? (
                                                    <HiCheck className="w-4 h-4" />
                                                ) : (
                                                    String.fromCharCode(65 + oIndex)
                                                )}
                                            </button>
                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                className={inputClass}
                                            />
                                            {question.options.length > 2 && (
                                                <button
                                                    onClick={() => removeOption(qIndex, oIndex)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove Option"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold text-text-secondary hover:border-primary-300 hover:text-primary-600 transition-all"
                >
                    <HiPlus className="w-4 h-4" /> Add Question
                </button>
                <button
                    onClick={handleSave}
                    disabled={quizLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-60"
                >
                    {quizLoading ? 'Saving...' : 'Save Quiz'}
                </button>
            </div>
        </div>
    );
};

export default QuizBuilder;
