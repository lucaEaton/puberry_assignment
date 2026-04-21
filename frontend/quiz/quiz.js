let qData = undefined
let qIndex = 0
let score = 0.0
let userAnswers = []
/*
 * we wait till the browser has loaded to then grab the lesson, rename the tab and display the question
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
 * this just lets me take the content out of the JSON being the question and create divs to 
 * further display on the frontend, if checks to see whether its a T/F Q or simpliy a multiple choice
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

/*
 * this method allows for cleaner reading code as using this before without this method, was adding major length
 */ to our script
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

/*
* The logic here is that we'll keep iterating through questions until we've done them all
* then send a POST request to our FastAPI to submit answers and do any updating if needed
* we then check if we've 
* one, passed and this wasn't completed before or now we've passed with a score higher than 70
* two, if we've completed this before 
* three, we've failed and got lower than a 70 and we don't recieved the coins 
*
* depending on these threee conditions determines the print statement along with whether or not we server points to the user or not
*
* I have a catch just incase the POST fails, they are still able to leave the lesson.
*/
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
                const oldScore = qData.current_score
                const wasComplete = qData.is_complete

                if (result.passed && (!wasComplete || oldScore <= 70)) {
                    let currentPoints = parseInt(sessionStorage.getItem("points")) || 0
                    let newPoints = currentPoints + 10
                    sessionStorage.setItem("points", newPoints)
                    fetch(`http://127.0.0.1:8000/students/1/points?points=${newPoints}`, {method: "PUT"})
                    showComplete(`<p>You've earned 10 coins! Total: ${newPoints}</p>`)
                } else if (wasComplete) {
                    showComplete(`<p>Practice complete! Keep it up.</p>`)
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
