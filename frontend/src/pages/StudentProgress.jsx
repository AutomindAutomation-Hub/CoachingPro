import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const StudentProgress = () => {
    const { user } = useAuthStore();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Derived metrics
    const [averagePercent, setAveragePercent] = useState(0);
    const [highestScore, setHighestScore] = useState(0);

    useEffect(() => {
        if (!user) return;

        const fetchProgress = async () => {
            try {
                // Determine student ID based on role.
                // Normally a Parent role would pass their child's ID via query param
                // or the backend would resolve it automatically.
                // For Phase 3, standardizing it to the logged in user if they are a student.
                // Parent dashboard will have somewhat similar logic inside it.

                let targetStudentId = user._id; // Default for Student role

                const [testsRes, quizzesRes] = await Promise.all([
                    axios.get(`/tests/student/${targetStudentId}`),
                    axios.get(`/quizzes/student/${targetStudentId}`)
                ]);

                // Format data for Recharts
                let totalPercent = 0;
                let validTests = 0;
                let highest = 0;
                let combinedData = [];

                testsRes.data.forEach(test => {
                    const myResult = test.results.find(r => r.studentId === targetStudentId || r.studentId?._id === targetStudentId);
                    const marks = myResult ? myResult.marksObtained : 0;
                    const percent = test.maxMarks > 0 ? (marks / test.maxMarks) * 100 : 0;

                    if (myResult && myResult.status !== 'Absent') {
                        totalPercent += percent;
                        validTests++;
                        if (percent > highest) highest = percent;
                    }

                    combinedData.push({
                        name: test.testName,
                        dateObj: new Date(test.date),
                        score: Number(percent.toFixed(1)),
                        rawMarks: marks,
                        max: test.maxMarks,
                        status: myResult?.status || 'Unknown'
                    });
                });

                quizzesRes.data.forEach(quiz => {
                    const myResult = quiz.results.find(r => r.studentId === targetStudentId || r.studentId?._id === targetStudentId);
                    if (myResult) {
                        const percent = myResult.score;
                        totalPercent += percent;
                        validTests++;
                        if (percent > highest) highest = percent;

                        combinedData.push({
                            name: quiz.title,
                            dateObj: new Date(quiz.createdAt || Date.now()),
                            score: Number(percent.toFixed(1)),
                            rawMarks: Math.round((percent / 100) * quiz.questions.length),
                            max: quiz.questions.length,
                            status: 'Completed'
                        });
                    }
                });

                combinedData.sort((a, b) => a.dateObj - b.dateObj);

                const chartData = combinedData.map(item => ({
                    ...item,
                    date: format(item.dateObj, 'MMM dd'),
                    fullDate: format(item.dateObj, 'dd MMM yyyy')
                }));


                setTests(chartData);
                if (validTests > 0) setAveragePercent((totalPercent / validTests).toFixed(1));
                setHighestScore(highest.toFixed(1));
            } catch (err) {
                console.error('Error fetching progress', err);
            }
            setLoading(false);
        };
        fetchProgress();
    }, [user?._id]);

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading your academic progress...</div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                <TrendingUp className="text-indigo-600" size={32} />
                <span>Performance & Marks Tracker</span>
            </h1>

            {tests.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <Award size={64} className="text-gray-200 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-600 mb-2">No Test Data Found</h2>
                    <p className="text-gray-500">You haven't taken any offline tests yet, or marks haven't been published.</p>
                </div>
            ) : (
                <>
                    {/* Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md">
                            <p className="text-sm uppercase tracking-wider font-semibold opacity-80 mb-1">Average Score</p>
                            <h3 className="text-4xl font-bold">{averagePercent}%</h3>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl p-6 text-white shadow-md">
                            <p className="text-sm uppercase tracking-wider font-semibold opacity-80 mb-1">Highest Score</p>
                            <h3 className="text-4xl font-bold">{highestScore}%</h3>
                        </div>
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col justify-center">
                            <p className="text-sm tracking-wider font-semibold text-gray-500 mb-1">Tests Documented</p>
                            <h3 className="text-4xl font-bold text-gray-800">{tests.length}</h3>
                        </div>
                    </div>

                    {/* Chart Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Academic Trajectory</h2>
                        <div className="w-full h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={tests}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontWeight: 500 }}
                                        tickFormatter={(val) => `${val}%`}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                        formatter={(value, name, props) => {
                                            if (props.payload.status === 'Absent') return ['Absent', 'Result'];
                                            return [`${value}% (${props.payload.rawMarks}/${props.payload.max})`, 'Score'];
                                        }}
                                        labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        name="Percentage Score"
                                        stroke="#4F46E5"
                                        strokeWidth={4}
                                        dot={{ stroke: '#4F46E5', strokeWidth: 4, r: 4, fill: '#fff' }}
                                        activeDot={{ r: 8, strokeWidth: 0, fill: '#4F46E5' }}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Detailed List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Recent Results Breakdown</h2>
                        <div className="space-y-4">
                            {[...tests].reverse().map((t, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition border border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white p-3 rounded-lg shadow-sm text-indigo-500">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-lg">{t.name}</h4>
                                            <p className="text-sm text-gray-500">{t.fullDate}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {t.status === 'Absent' ? (
                                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded font-bold text-sm">Absent</span>
                                        ) : (
                                            <>
                                                <h4 className="font-bold text-indigo-600 text-2xl">{t.score}%</h4>
                                                <p className="text-xs text-gray-400 font-medium tracking-wide">({t.rawMarks} / {t.max} marks)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentProgress;
