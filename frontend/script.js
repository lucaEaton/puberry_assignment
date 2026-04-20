function getStudentName() {
    fetch('http://127.0.0.1:8000/students/1')
        .then(response => response.json())
        .then(data => {
            document.getElementById("student").innerText = data.name
        })
}
