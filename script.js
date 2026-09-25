let currentQuestion = 0;
let answers = [];

const startButton = document.getElementById("startButton");
const quiz = document.getElementById("quiz");
const startSection = document.getElementById("startSection");
const nextButton = document.getElementById("nextButton");
const result = document.getElementById("result");
const scoreResult = document.getElementById("scoreResult");
const attentionResult = document.getElementById("attentionResult");
const recommendationResult = document.getElementById("recommendationResult");

let currentViewedResult = null;

if (startButton) {
    startButton.addEventListener("click", function () {
        const studentCode = document.getElementById("studentCode").value.trim();
        if (studentCode === "") {
            alert("Vui lòng nhập mã học sinh.");
            return;
        }
        quiz.style.display = "block";
        startSection.style.display = "none";
        showQuestion();
    });
}

function showQuestion() {
    const q = questions[currentQuestion];
    document.getElementById("questionNumber").textContent = q.id;
    document.getElementById("questionText").textContent = q.question;
    
    if (currentQuestion === questions.length - 1) {
        nextButton.textContent = "Nộp bài";
    } else {
        nextButton.textContent = "Tiếp tục";
    }

    const options = document.getElementById("options");
    options.innerHTML = "";
    q.options.forEach(function(option, index) {
        options.innerHTML += `
            <label>
                <input type="radio" name="answer" value="${index}">
                ${option}
            </label>
            <br><br>
        `;
    });
}

if (nextButton) {
    nextButton.addEventListener("click", function () {
        const selected = document.querySelector('input[name="answer"]:checked');
        if (!selected) {
            alert("Vui lòng chọn một phương án.");
            return;
        }
        answers[currentQuestion] = Number(selected.value);
        currentQuestion++;

        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            finishQuiz();
        }
    });
}

function calculateScore() {
    let totalScore = 0;
    for (let i = 0; i < questions.length; i++) {
        if (answers[i] === questions[i].answer) {
            totalScore++;
        }
    }
    return totalScore;
}

function analyzeBehaviors() {
    let behaviorResults = {};
    for (let i = 0; i < questions.length; i++) {
        const behavior = questions[i].behavior;
        if (answers[i] === questions[i].answer) {
            behaviorResults[behavior] = 1;
        } else {
            behaviorResults[behavior] = 0;
        }
    }
    return behaviorResults;
}

function getNeedAttention(behaviorResults) {
    let needAttention = [];
    for (const behavior in behaviorResults) {
        if (behaviorResults[behavior] === 0) {
            needAttention.push(behavior);
        }
    }
    return needAttention;
}

function getRecommendations(needAttention) {
    let result = [];
    for (let i = 0; i < needAttention.length; i++) {
        const behavior = needAttention[i];
        result.push({
            behavior: behavior,
            recommendation: recommendations[behavior]
        });
    }
    return result;
}

// Lưu kết quả vào localStorage
function saveResult(studentCode, score, behaviorResults, needAttention, resultRecommendations) {
    const resultData = {
        studentCode: studentCode,
        attempt: new Date().toLocaleString(),
        score: score,
        totalQuestions: questions.length,
        answers: answers,
        behaviorResults: behaviorResults,
        needAttention: needAttention,
        recommendations: resultRecommendations
    };
    let results = JSON.parse(localStorage.getItem("aiResponsibleResults")) || [];
    results.push(resultData);
    localStorage.setItem("aiResponsibleResults", JSON.stringify(results));
}

// --- CÁC HÀM PHÂN TÍCH DỮ LIỆU TỔNG HỢP THEO TÀI LIỆU ---

function loadResults() {
    const savedData = localStorage.getItem("aiResponsibleResults");
    if (!savedData) return [];
    return JSON.parse(savedData);
}

function calculateAverageScore(results) {
    if (results.length === 0) return 0;
    let total = 0;
    results.forEach(function(item) {
        total += item.score;
    });
    return total / results.length;
}

function analyzeBehaviorStatistics(results) {
    const statistics = {};
    for (const behavior in behaviors) {
        statistics[behavior] = 0;
    }

    results.forEach(function(item) {
        for (const behavior in item.behaviorResults) {
            if (item.behaviorResults[behavior] === 0) {
                statistics[behavior]++;
            }
        }
    });

    return statistics;
}

function analyzeAllResults() {
    const results = loadResults();
    const totalResults = results.length;
    const averageScore = calculateAverageScore(results);
    const behaviorStatistics = analyzeBehaviorStatistics(results);

    return {
        totalResults: totalResults,
        averageScore: averageScore,
        behaviorStatistics: behaviorStatistics
    };
}

// Hiển thị phần thống kê phân tích lên giao diện (nếu có khung tương ứng)
function displayAnalysis() {
    const analysis = analyzeAllResults();
    const analysisPanel = document.getElementById("analysisPanel");
    const totalResultsEl = document.getElementById("totalResults");
    const averageScoreEl = document.getElementById("averageScore");
    const behaviorStatisticsEl = document.getElementById("behaviorStatistics");

    if (!analysisPanel) return;

    analysisPanel.style.display = "block";
    if (totalResultsEl) totalResultsEl.textContent = "Tổng số lượt đánh giá: " + analysis.totalResults;
    if (averageScoreEl) averageScoreEl.textContent = "Điểm trung bình: " + analysis.averageScore.toFixed(2);

    if (behaviorStatisticsEl) {
        behaviorStatisticsEl.innerHTML = "";
        for (const behavior in analysis.behaviorStatistics) {
            behaviorStatisticsEl.innerHTML += `<p>${behavior} (${behaviors[behavior]}): ${analysis.behaviorStatistics[behavior]} lượt cần chú ý</p>`;
        }
    }
}

function showResult(score, needAttention, resultRecommendations) {
    quiz.style.display = "none";
    result.style.display = "block";
    scoreResult.textContent = "Điểm của bạn: " + score + "/" + questions.length;
    
    attentionResult.innerHTML = "";
    recommendationResult.innerHTML = "";

    if (needAttention.length === 0) {
        attentionResult.innerHTML = "<p>Chưa có nội dung cần chú ý trong các tình huống đánh giá.</p>";
    } else {
        needAttention.forEach(function(behavior) {
            attentionResult.innerHTML += "<p>• " + behavior + " – " + behaviors[behavior] + "</p>";
        });
    }

    resultRecommendations.forEach(function(item) {
        recommendationResult.innerHTML += "<p>• " + item.behavior + ": " + item.recommendation + "</p>";
    });

    // Gọi hiển thị phân tích tổng hợp ngay sau khi nộp bài
    displayAnalysis();
}

function finishQuiz() {
    const studentCode = document.getElementById("studentCode").value.trim();
    const score = calculateScore();
    const behaviorResults = analyzeBehaviors();
    const needAttention = getNeedAttention(behaviorResults);
    const resultRecommendations = getRecommendations(needAttention);

    saveResult(studentCode, score, behaviorResults, needAttention, resultRecommendations);
    showResult(score, needAttention, resultRecommendations);
}