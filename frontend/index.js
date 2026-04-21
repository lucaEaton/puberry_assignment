/*
 * we send a get request to our fastapi to gather
 * the students name and his current points
 * from students.json
 *
 * we do this so that we can display the users name and points
 */
function getStudent() {
    fetch('http://127.0.0.1:8000/students/1')
        .then(response => response.json())
        .then(data => {
            document.getElementById("student").innerText = data.name
            document.getElementById("student_points").innerText = data.user_points
            sessionStorage.setItem("points", data.user_points)
        })
}

/*
 * we send a get request to our fastapi to gather
 * the current stored lesson plans
 * we make sure to lock any further lessons so that learning is done sequentially
 */
function getLessonPlans() {
    fetch('http://127.0.0.1:8000/lessons')
        .then(response => response.json())
        .then(data => {
            console.log(data.length);
            data.forEach((lesson, index) => {
                let div
                if (index > 0 && !data[index - 1].is_complete) {
                    div = document.createElement("div")
                    div.classList.add("lesson-card")
                    div.innerHTML =
                        `
                            <h3>🔒${lesson.title}: ${lesson.content}</h3>
                            <p>Complete the previous lesson first</p>
                            `
                } else {
                    div = document.createElement("div")
                    div.classList.add("lesson-card")
                    if (lesson.current_score !== 0) {
                        div.innerHTML =
                            `
                                    <h3>${lesson.title}: ${lesson.content}</h3>
                                    ${lesson.is_complete ? `<p>✅ Completed! Highest Score: ${lesson.current_score}%</p>`
                                : `<p>Highest Score: ${Math.round(lesson.current_score)}%</p>`}
                                    `
                    } else {
                        div.innerHTML =
                            `
                                    <h3>${lesson.title}: ${lesson.content}</h3>
                                    <p>Awaiting Completion❗</p>
                                    `
                    }
                    div.onclick = function () {
                        sessionStorage.setItem("lessonId", lesson.lesson_id)
                        console.log(sessionStorage.getItem("lessonId"))
                        window.location.href = "/quiz/"
                    }
                }
                document.getElementById("lesson_blocks").appendChild(div)
            })
        })
}
/*
* When testing it was really annoying to constanly go back to the JSON to bring everything back to zero, so with a Reset Button it not only 
* makes it easier for me, but easier for the testers to find bugs or simpliy just test the application loop without having to touch a single line of JSON
*/
function resetStats() {
    fetch("http://127.0.0.1:8000/reset", { method: "PUT" })
        .then(response => response.json())
        .then(() => {
            sessionStorage.clear()  // clears points from session
            window.location.reload()
        })
}
