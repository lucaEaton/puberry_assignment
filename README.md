# luca-berry
done from the "BACKEND TAKE HOME ASSIGNMENT"

## backend
I built the backend with `FastAPI`, with data being stored via two JSON files acting as 
a mock database
- `lessons.json` : stores all the lessons, along with the quiz, 
completion status and highest score for each lesson
- `students.json` : stores the student's profile and in service currency

We write and read from the JSON files with each request using helper methods :
- `load_lesson()`
- `save_lesson()`
- `load_student()`
- `save_students()`

I also utilize `Pydantic` for data validation and base models, and `Uvicorn` as the server to run the FastAPI application

## API breakdown

### Routes for Lesson Management
- Method : `GET`
  - Route : `/lesson`
    - What it does: `Gets all the lessons`
- Method : `GET` 
  - Route : `/quiz/{lesson_id}` 
    - What it does: `Get a specific lesson and to utilize its quiz`
- Method : `PUT` 
  - Route : `/quiz/{lesson_id}/{new_score}` 
    - What it does: `Update lesson completion and score`

### Routes for Student Management
- Method : `GET`
  - Route : `/students/{student_id}`
    - What it does: `Get student profile and point balance`
- Method : `PUT` 
  - Route : `/students/{student_id}/points?points={n}` 
    - What it does: `Update student coin balance`

## frontend
Built using vanilla JavaScript, HTML, and CSS, it runs separately using Vite. The frontend communicates with
the backend using `fetch()`, which called to the FastAPI REST API. Pages are organized as folder so the URLs and stand
to be more professional (with /quiz instead of /quiz.html as the url for example)

- A student earns 10 coins when they score ≥ 70% on a quiz
- Points are only awarded if the student has never passed before (`is_complete: false`) 
or previously attempted but scored under 70% (`curr_score ≤ 70`)
- Lessons are locked until the previous lesson is marked complete

# examples of usage using libcurl

gets all the lessons
```bash
curl http://127.0.0.1:8000/lessons
```

get a specific quiz
```bash
curl http://127.0.0.1:8000/quiz/1
```
 
mark lesson as complete with a score
```bash
curl -X PUT http://127.0.0.1:8000/quiz/1/100
```
 
get student profile
```bash
curl http://127.0.0.1:8000/students/1
```
 
update student points
```bash
curl -X PUT http://127.0.0.1:8000/students/1/points?points=10
```


# set up process

mark sure to have 
- Python interp 3.10 or higher (running backend)
- node.js and npm (running frontend)


### clone repo
``` bash
    git clone https://github.com/lucaEaton/puberry_assignment
    cd puberry_backend_assignment
```

### set up the venu
```bash
    python -m venv venv
    source venv/bin/activate
    pip install fastapi uvicorn pydantic
```

### run the backend
```bash
    uvicorn backend.api:app --reload
```
Backend runs at `http://127.0.0.1:8000`

### run the frontend
```bash
    npm install
    npm run dev
```
Frontend runs at `http://localhost:5173`

To fully test, 
 
1. Start both the backend and frontend servers (see setup above)
2. Open `http://localhost:5173` in your browser
3. You will be greeted with the student's name and current coin balance
4. Click Lesson 1 to start the quiz
5. Answer all 3 questions, score ≥ 70% to earn 10 coins
6. Return to the home page, coin balance updates and Lesson 2 unlocks
7. Complete Lesson 2 to finish demo

## JSON Data Format

### lessons.json
```json
[
    {
        "lesson_id": 1,
        "title": "Lesson 1",
        "content": "Addition",
        "quiz": {
            "questions": [
                {
                    "question_text": "Q1: 2 + 2 = ?",
                    "answer": "4"
                },
                {
                    "question_text": "Q2: Is 10 - 2 = 8 ?",
                    "answer": "True"
                },
                {
                    "question_text": "Q3: 20 + 74 = ?",
                    "answer": "94"
                }
            ]
        },
        "is_complete": false,
        "current_score": 0.0
    },
    {
        "lesson_id": 2,
        "title": "Lesson 2",
        "content": "Subtraction",
        "quiz": {
            "questions": [
                {
                    "question_text": "Q1: 10 - 3 = ?",
                    "answer": "7"
                },
                {
                    "question_text": "Q2: Is 1 - 5 = 4 ?",
                    "answer": "False"
                },
                {
                    "question_text": "Q3: 1000 - 250 = ?",
                    "answer": "750"
                }
            ]
        },
        "is_complete": false,
        "current_score": 0.0
    }
]
```
 
### students.json
```json
[
    {
        "id": 1,
        "name": "Luca",
        "user_points": 0,
        "lessons": [
            {
                "lesson_id": 1
            },
            {
                "lesson_id": 2
            }
        ]
    }
]
```