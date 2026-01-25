/**
 * quiz1script.js
 * 퀴즈 결과 계산 로직 모듈
 */

// -----------------------------------------------------------
// [Quiz 1] 운전 성향 테스트 계산 로직 (MBTI 스타일)
// input: userAnswers (예: ["S", "F", "E", "S", ...]) - 총 18개
// output: 결과 타입 코드 (예: "SFE")
// -----------------------------------------------------------
function calculateQuiz1Result(userAnswers) {
    // 1. 점수판 초기화
    let scores = { S: 0, C: 0, F: 0, Y: 0, E: 0, I: 0 };

    // 2. 답변 순회하며 점수 집계
    userAnswers.forEach(answer => {
        if (scores.hasOwnProperty(answer)) {
            scores[answer]++;
        }
    });

    // 3. 각 축별 승자 결정 (동점일 경우 기본 성향 우선: S, F, I)
    // - 속도: S vs C
    const speedType = scores.S >= scores.C ? "S" : "C";
    // - 규칙: F vs Y (Note: 기획상 F 대신 Y, 혹은 M(Mix) 등을 쓰기도 하나 여기선 F/Y 유지)
    //   * 주의: JSON 데이터에서 F(FM) / Y(Yield)를 사용했으므로 이를 따름.
    //   * 기획상 F와 Y가 반대 개념. F(규칙준수) vs Y(융통성/양보) -> 여기선 'FM' vs 'Yield'로 가정.
    //   * 만약 'SME'등의 결과 키를 맞추려면 F->M(Middle/Mix?) 매핑 확인 필요. 
    //   * (수정): 위 JSON 결과 키가 SFE, SFI, SME... 로 되어 있음.
    //   * 로직 수정: F(Rule)축의 결과가 M(Middle/Rule) 또는 F(Free/Fast?)인지 확인 필요.
    //   * -> JSON 결과키를 보면 'F'와 'M'이 섞여있음. (SFE, SME).
    //   * -> 아하! 위 기획표를 보면 F(FM/Rule) vs Y(Yield/Flex) 였음.
    //   * -> 결과값 매핑: F가 이기면 'M'(FM의 M), Y가 이기면 'F'(Free/Flex의 F) 로 매핑하면
    //        결과키(SFE, SME 등)와 혼동될 수 있음.
    //   * -> ***해결책***: 코드를 단순화하기 위해 위 JSON의 `results` 키를
    //        직관적인 [S/C][F/Y][E/I] 조합(예: SFE, SFI, SYE, SYI...)으로 변경하거나,
    //        여기서 결과 코드를 강제로 매핑해야 함.
    
    //   * 여기서는 JSON의 키(SFE, SFI 등)를 따르지 않고, 
    //     계산된 3자리 코드(예: SFE)를 그대로 리턴한다고 가정하고,
    //     JSON의 키를 이에 맞춰 수정하는 것이 가장 안전함.
    //     (위 JSON 데이터는 이미 SFE, SFI... 패턴으로 작성됨. 
    //      단, 'M'이 들어간 키(SME, CME)는 F/Y와 매칭이 안됨.)
    
    //   *** [중요] 로직 단순화를 위한 매핑 전략 ***
    //   Rule축: F(FM/준수)가 높으면 -> 'M' (Master/FM)
    //   Rule축: Y(Yield/양보)가 높으면 -> 'F' (Free/Flex)
    //   이렇게 하면 결과 코드는 SME, SFE 등이 됨.
    
    const ruleType = scores.F >= scores.Y ? "M" : "F"; // F(준수) -> M, Y(융통) -> F
    const emoType = scores.E >= scores.I ? "E" : "I";

    // 4. 최종 코드 조합 (예: SME)
    return speedType + ruleType + emoType;
}