/**
 * quiz3script.js
 * 퀴즈 데이터 로드 및 점수 계산 로직
 */

const QUIZ3_DATA_URL = 'quiz3.json';

let cachedQuiz3Data = null;

async function fetchQuiz3Data() {
    if (cachedQuiz3Data) return cachedQuiz3Data;
    
    try {
        const response = await fetch(QUIZ3_DATA_URL);
        cachedQuiz3Data = await response.json();
        return cachedQuiz3Data;
    } catch (error) {
        console.error("데이터 로드 실패:", error);
        return null;
    }
}

/**
 * QuizEngine용 결과 계산 함수
 * userAnswers: [0, 1, 2, ...] (사용자가 선택한 옵션의 인덱스 배열)
 * returns: 점수 기반 등급 코드 (예: "A", "B", "C", "S")
 */
function calculateQuiz3Result(userAnswers) {
    if (!cachedQuiz3Data || !cachedQuiz3Data.questions) {
        console.error('Quiz data not loaded');
        return 'C';
    }
    
    let score = 0;
    
    cachedQuiz3Data.questions.forEach((q, index) => {
        const userChoiceIndex = userAnswers[index];
        const userChoiceOption = q.options[userChoiceIndex];
        
        const isCorrect = userChoiceOption ? userChoiceOption.isCorrect : false;
        if (isCorrect) score++;
    });
    
    const resultType = cachedQuiz3Data.results.find(r => score >= r.min && score <= r.max);
    
    return resultType ? resultType.grade : 'C';
}

// 점수 계산 및 결과 도출 함수 (result3.html용 - 상세 결과)
async function calculateQuiz3DetailedResult(userAnswers) {
    const data = await fetchQuiz3Data();
    if (!data) return null;

    let score = 0;
    const reviewData = [];

    data.questions.forEach((q, index) => {
        const userChoiceIndex = userAnswers[index];
        const userChoiceOption = q.options[userChoiceIndex];
        
        const isCorrect = userChoiceOption ? userChoiceOption.isCorrect : false;
        if (isCorrect) score++;

        const correctOptionIndex = q.options.findIndex(opt => opt.isCorrect);
        const correctOption = q.options[correctOptionIndex];

        reviewData.push({
            id: q.id,
            question: q.q,
            userChoiceText: userChoiceOption ? userChoiceOption.text : "선택 안함",
            correctChoiceText: correctOption.text,
            isCorrect: isCorrect,
            explanation: correctOption.desc
        });
    });

    const resultType = data.results.find(r => score >= r.min && score <= r.max);

    return {
        score: score,
        total: data.questions.length,
        grade: resultType.grade,
        title: resultType.title,
        desc: resultType.desc,
        review: reviewData
    };
}
