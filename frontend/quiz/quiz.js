let qData = undefined
let qIndex = 0
let score = 0.0
/*
 * we wait till the browser has loaded
 */
document.addEventListener("DOMContentLoaded", function () {
    fetch(`http://127.0.0.1:8000/quiz/${sessionStorage.getItem("lessonId")}`)
        .then(response => response.json())
        .then(data => {
            qData = data
            displayQ()
        })
})
/*
 * this just lets me take the content out of the JSON being the question
 */
function displayQ() {
    document.getElementById("questions_block").innerHTML = ""
    let currentIndex = qData.quiz.questions[qIndex]
    let div = document.createElement("div")
    div.classList.add("question-card")
    div.innerHTML =
        `
                    <h2>Question ${qIndex + 1} of ${qData.quiz.questions.length}</h2>
                    <h3>${currentIndex.question_text}: </h3>
                    `

    if (currentIndex.answer === "True" || currentIndex.answer === "False") {
        div.innerHTML += `
                <button class="submit-button" onclick="submitAnswer('True')">True</button>
                <button class="submit-button" onclick="submitAnswer('False')">False</button>
            `
    } else {
        div.innerHTML += `
            <input type="text" id="answer-input" placeholder="Your answer">
            <button onclick="submitAnswer(document.getElementById('answer-input').value)">Submit</button>
        `
    }
    document.getElementById("quiz-title").innerText = qData.title + ": Quiz"
    document.getElementById("questions_block").appendChild(div)
}


function submitAnswer(a) {
    let currentIndex = qData.quiz.questions[qIndex].answer
    if (a === currentIndex) {
        score += 33.33
    }

    qIndex++
    if (qIndex < qData.quiz.questions.length) {
        displayQ()
    } else {
        // I do this our qData gets updated when we fetch,
        // this wasn't allowing me to provide points to someone that, even though they may have completed the quiz,
        // they haven't scored that 70 for points and may want to try again.
        const oldScore = qData.curr_score
        const wasComplete = qData.is_complete
        fetch(`http://127.0.0.1:8000/quiz/${sessionStorage.getItem("lessonId")}/${Math.round(score)}`, {
            method: "PUT"
        })
            .then(response => response.json())
            .then(data => {
                if (Math.round(score) > 70) {
                    if (!wasComplete|| oldScore <= 70) {
                        let currentPoints = parseInt(sessionStorage.getItem("points")) || 0
                        let newPoints = currentPoints + 10
                        sessionStorage.setItem("points", newPoints)

                        fetch(`http://127.0.0.1:8000/students/1/points?points=${newPoints}`, {
                            method: "PUT"
                        })

                        document.getElementById("questions_block").innerHTML =
                            `
                            <div class="question-card">
                            <h2>Quiz Complete!</h2>
                            <h3>Your score: ${Math.round(score)}%</h3>
                            <p>You've earned 10 points! Total: ${newPoints}</p>
                            <button class="submit-button" onclick="window.location.href='/'">Back to Home</button>
                            </div>
                            `
                    } else {
                        document.getElementById("questions_block").innerHTML =
                            `
                            <div class="question-card">
                            <h2>Quiz Complete!</h2>
                            <h3>Your score: ${Math.round(score)}%</h3>
                            <button class="submit-button" onclick="window.location.href='/'">Back to Home</button>
                            </div>
                            `
                    }
                } else {
                    document.getElementById("questions_block").innerHTML =
                        `
                        <div class="question-card">
                        <h2>Quiz Complete!</h2>
                        <h3>Your score: ${Math.round(score)}%</h3>
                        <p>Need Atleast a 70% to earn some points. Why Don't You Try Again!</p>
                        <button class="submit-button" onclick="window.location.href='/'">Back to Home</button>
                        </div>
                        `
                }
            })
            .catch(error => {
                console.log("PUT failed:", error)
                // still show completion screen even if save fails
                document.getElementById("questions_block").innerHTML = `
                    <div class="question-card">
                        <h2>Quiz Complete!</h2>
                        <h3>Your score: ${Math.round(score)}%</h3>
                        <button class="submit-button" onclick="window.location.href='/'">Back to Home</button>
                    </div>
                `
            })
    }
}