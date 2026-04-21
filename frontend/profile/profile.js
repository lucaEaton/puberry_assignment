document.addEventListener("DOMContentLoaded", function () {
    // student data
    fetch("http://127.0.0.1:8000/students/1")
        .then(response => response.json())
        .then(student => {
            document.getElementById("student-name").innerText = student.name
            document.getElementById("student-points").innerText = student.user_points + " coins"
        })

    // lessons data
    fetch("http://127.0.0.1:8000/lessons")
        .then(response => response.json())
        .then(lessons => {
            lessons.forEach(lesson => {
                let div = document.createElement("div")
                div.classList.add("lesson-card")
                div.innerHTML = `
                    <h3>${lesson.is_complete ? "✅" : "❗"} ${lesson.title}</h3>
                    <p>${lesson.current_score > 0 
                        ? `Highest Score:  ${Math.round(lesson.current_score)}%`
                        : "Awaiting Completion"}</p>
                `
                document.getElementById("lesson-list").appendChild(div)
            })
        })
})