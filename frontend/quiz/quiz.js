let qData = undefined
let qIndex = 0
let score = 0.0
let userAnswers = []
/*
 * we wait till the browser has loaded
 */
document.addEventListener("DOMContentLoaded", function () {
    fetch(`http://127.0.0.1:8000/lessons`)
        .then(response => response.json())
        .then(data => {
            // search the json like an array
           qData = data.find(lesson => lesson.lesson_id == sessionStorage.getItem("lessonId"))
            document.getElementById("title").innerText = qData.title + "'s Quiz"
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
        div.innerHTML +=
            `
                <button class="submit-button" onclick="submitAnswer('True')">True</button>
                <button class="submit-button" onclick="submitAnswer('False')">False</button>
                `
    } else if (currentIndex.choices && currentIndex.choices.length > 0) {
        let allChoices = [...currentIndex.choices, currentIndex.answer]
        allChoices.sort(() => Math.random() - 0.5)

        allChoices.forEach(choice => {
            div.innerHTML +=
                `
                <button class="submit-button" onclick="submitAnswer('${choice}')">
                    ${choice}
                </button>
                `
        })
    } else {
        div.innerHTML +=
            `
            <input type="text" id="answer-input" placeholder="Your answer">
            <button onclick="submitAnswer(document.getElementById('answer-input').value)">Submit</button>
            `
    }
    document.getElementById("quiz-title").innerText = qData.title + ": Quiz"
    document.getElementById("questions_block").appendChild(div)
}

// this method allows for cleaner reading code as using this before without this method, was adding major length
// to our script
function showComplete(message = "") {
    document.getElementById("questions_block").innerHTML = `
        <div class="question-card">
            <h2>Quiz Complete!</h2>
            <h3>Your score: ${Math.round(score)}%</h3>
            ${message}
            <button class="submit-button" onclick="window.location.href='/'">Back to Home</button>
        </div>
    `
}

function submitAnswer(a) {
    userAnswers.push(a)
    qIndex++
    if (qIndex < qData.quiz.questions.length) {
        displayQ()
    } else {
        // submit all answers to backend at once
        fetch(`http://127.0.0.1:8000/quiz/${sessionStorage.getItem("lessonId")}/submit`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({answers: userAnswers})
        })
            .then(response => response.json())
            .then(result => {
                score = result.score
                const oldScore = qData.curr_score
                const wasComplete = qData.is_complete

                if (result.passed && (!wasComplete || oldScore <= 70)) {
                    let currentPoints = parseInt(sessionStorage.getItem("points")) || 0
                    let newPoints = currentPoints + 10
                    sessionStorage.setItem("points", newPoints)
                    fetch(`http://127.0.0.1:8000/students/1/points?points=${newPoints}`, {method: "PUT"})
                    showComplete(`<p>You've earned 10 coins! Total: ${newPoints}</p>`)
                } else if (result.passed) {
                    showComplete(`<p></p>`)
                } else {
                    showComplete(`<p>Need at least 70% to earn coins. Try again!</p>`)
                }
            })
            .catch(error => {
                console.log("POST failed:", error)
                showComplete()
            })
    }
}