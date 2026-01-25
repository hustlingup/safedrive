/**
 * quiz2script.js
 * 퀴즈 결과 계산 로직 모듈
 */

// -----------------------------------------------------------
// [Quiz 2] 시나리오 챌린지 계산 로직 (조합형)
// input: userAnswers (예: ["A", "B", "A", "C", ...])
// output: 결과 타입 코드 (예: "A", "AB", "BC" 등)
// -----------------------------------------------------------
function calculateQuiz2Result(userAnswers) {
    // 1. 점수판 초기화
    let counts = { A: 0, B: 0, C: 0, D: 0 };

    // 2. 답변 집계
    userAnswers.forEach(ans => {
        if (counts.hasOwnProperty(ans)) counts[ans]++;
    });

    // 3. 점수 내림차순 정렬 ( [key, value] 배열로 변환 )
    let sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    
    // 1등과 2등 타입 추출
    let first = sorted[0];  // ["A", 10]
    let second = sorted[1]; // ["B", 5]

    // 4. 결과 도출 로직
    // 4-1. 압도적인 1등인 경우 (1등 점수가 전체의 50% 초과거나, 2등과 3점 이상 차이)
    //      여기서는 단순하게 "2등과 점수 차이가 3점 이상"이면 단일형으로 간주
    if (first[1] - second[1] >= 3) {
        return first[0]; // "A", "B", "C", "D"
    }

    // 4-2. 혼합형인 경우 (1등과 2등 조합)
    //      키 순서를 알파벳 순으로 정렬하여 반환 (예: B+A -> "AB")
    let combo = [first[0], second[0]].sort().join(""); // "AB", "BC", "AC"...

    // 5. 예외 처리: 만약 생성된 조합이 JSON에 없는 경우 (예: "BD")
    //    JSON에 정의된 키 목록: A, B, C, D, AB, BC, AC, DA
    const validCombos = ["AB", "BC", "AC", "DA"]; 
    
    if (validCombos.includes(combo)) {
        return combo;
    } else {
        // 정의되지 않은 조합(BD, CD 등)이 나오면 그냥 1등 타입을 리턴
        return first[0];
    }
}