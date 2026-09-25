function loadResearchResults() {
    return JSON.parse(localStorage.getItem("aiResponsibleResults")) || [];
}

function displayResearchDashboard() {
    const results = loadResearchResults();
    const total = document.getElementById("researchTotalResults");
    const average = document.getElementById("researchAverageScore");

    total.textContent = "Tổng số lượt đánh giá: " + results.length;

    if (results.length === 0) {
        average.textContent = "Điểm trung bình: chưa có dữ liệu";
        return;
    }

    let totalScore = 0;
    results.forEach(function(result) {
        totalScore += result.score;
    });

    const averageScore = totalScore / results.length;
    average.textContent = "Điểm trung bình: " + averageScore.toFixed(2);
}

function displayResearchResults() {
    const results = loadResearchResults();
    const container = document.getElementById("researchResults");
    container.innerHTML = "";

    if (results.length === 0) {
        container.textContent = "Chưa có dữ liệu.";
        return;
    }

    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>Mã HS</th>
                <th>Thời gian</th>
                <th>Điểm</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    results.forEach(function(result) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${result.studentCode}</td>
            <td>${result.attempt}</td>
            <td>${result.score}/${result.totalQuestions}</td>
        `;
        tbody.appendChild(row);
    });

    container.appendChild(table);
}

function analyzeResearchBehaviors() {
    const results = loadResearchResults();
    const statistics = {};

    for (const behavior in behaviors) {
        statistics[behavior] = 0;
    }

    results.forEach(function(result) {
        for (const behavior in result.behaviorResults) {
            if (result.behaviorResults[behavior] === 0) {
                statistics[behavior]++;
            }
        }
    });

    return statistics;
}

function displayResearchBehaviorAnalysis() {
    const statistics = analyzeResearchBehaviors();
    const container = document.getElementById("researchBehaviorAnalysis");
    container.innerHTML = "";

    for (const behavior in statistics) {
        const p = document.createElement("p");
        p.textContent = behavior + " (" + behaviors[behavior] + "): " + statistics[behavior] + " lượt cần chú ý";
        container.appendChild(p);
    }
}

displayResearchDashboard();
displayResearchResults();
displayResearchBehaviorAnalysis();