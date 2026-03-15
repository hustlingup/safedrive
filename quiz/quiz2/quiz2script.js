/**
 * quiz2script.js
 * 퀴즈 데이터 로드 및 점수 계산 로직
 */

const QUIZ_DATA_URL = 'quiz2.json';

// 캐시된 퀴즈 데이터
let cachedQuizData = null;

// 데이터 로드 함수
async function fetchQuizData() {
    if (cachedQuizData) return cachedQuizData;
    
    try {
        const response = await fetch(QUIZ_DATA_URL);
        cachedQuizData = await response.json();
        return cachedQuizData;
    } catch (error) {
        console.error("데이터 로드 실패:", error);
        return null;
    }
}

/**
 * QuizEngine용 결과 계산 함수
 * userAnswers: [0, 1, 2, ...] (사용자가 선택한 옵션의 인덱스 배열)
 * returns: 점수 기반 등급 코드 (예: "A", "B", "C", "D", "F")
 */
function calculateQuiz2Result(userAnswers) {
    if (!cachedQuizData || !cachedQuizData.questions) {
        console.error('Quiz data not loaded');
        return 'C'; // 기본값
    }
    
    let score = 0;
    
    cachedQuizData.questions.forEach((q, index) => {
        const userChoiceIndex = userAnswers[index];
        const userChoiceOption = q.options[userChoiceIndex];
        
        // 정답 여부 확인
        const isCorrect = userChoiceOption ? userChoiceOption.isCorrect : false;
        if (isCorrect) score++;
    });
    
    // 점수에 따른 등급 결정
    const resultType = cachedQuizData.results.find(r => score >= r.min && score <= r.max);
    
    // 등급 코드 반환 (result2.html에서 사용)
    return resultType ? resultType.grade : 'C';
}

// 점수 계산 및 결과 도출 함수 (result2.html용 - 상세 결과)
// userAnswers: [0, 1, 2, ...] (사용자가 선택한 옵션의 인덱스 배열)
async function calculateResult(userAnswers) {
    const data = await fetchQuizData();
    if (!data) return null;

    let score = 0;
    const reviewData = []; // 오답 노트용 데이터

    data.questions.forEach((q, index) => {
        const userChoiceIndex = userAnswers[index];
        const userChoiceOption = q.options[userChoiceIndex];
        
        // 정답 여부 확인
        const isCorrect = userChoiceOption ? userChoiceOption.isCorrect : false;
        if (isCorrect) score++;

        // 정답 옵션 찾기
        const correctOptionIndex = q.options.findIndex(opt => opt.isCorrect);
        const correctOption = q.options[correctOptionIndex];

        // 리뷰 데이터 생성
        reviewData.push({
            id: q.id,
            question: q.q,
            userChoiceText: userChoiceOption ? userChoiceOption.text : "선택 안함",
            correctChoiceText: correctOption.text,
            isCorrect: isCorrect,
            explanation: correctOption.desc // 정답 옵션에 있는 설명 사용
        });
    });

    // 점수에 따른 등급(Result Type) 결정
    // JSON의 results 배열에서 범위에 맞는 등급 찾기
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