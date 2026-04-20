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
        })
}

/*
 * we send a get request to our fastapi to gather
 * the current stored lesson plans
 * we make sure to lock any further lessons so that learning is done sequentially
 *
 * We want to make these clickable buttons in the future however for now they are a display unit
 *
 */
function getLessonPlans() {
    fetch('http://127.0.0.1:8000/lessons')
        .then(response => response.json())
        .then(data => {
            console.log(data.length);
            data.forEach((lesson, index) => {
                let div = undefined
                if (index > 0 && !data[index-1].is_complete){
                    div = document.createElement("div")
                     div.classList.add("lesson-card")
                     div.innerHTML =
                            `
                            <h3>🔒${lesson.title}: ${lesson.content}</h3>
                            <p>Complete the previous lesson first</p>
                            `
                }else{
                    div = document.createElement("div")
                    div.classList.add("lesson-card")
                    div.innerHTML =
                         `
                         <h3>${lesson.title}: ${lesson.content}</h3>
                         `
                }
                document.getElementById("lesson_blocks").appendChild(div)
            })
        })
}