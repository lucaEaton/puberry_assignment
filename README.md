# luca-berry
done from the "BACKEND TAKE HOME ASSIGNMENT"

## backend
I built the backend with `FastAPI`, with data being stored via two JSON files acting as 
a mock database
- `lessons.json` : stores all the lessons, along with the quiz, 
completion status and highest score for each lesson
- `students.json` : stores the student's profile and in service currency

We write and read from the JSON files with each request using helper methods :
- `load_lessons()`
- `save_lessons()`
- `load_student()`
- `save_students()`

I also utilize `Pydantic` for data validation and base models, and `Uvicorn` as the server to run the FastAPI application

## API breakdown

### Routes for Lesson Management

- Method : `GET`
  - Route : `/lessons`
    - What it does: `Gets all the lessons`
- Method : `POST`
  - Route : `/quiz/{lesson_id}/submit`
    - What it does: `Submits answers to the backend, validates them, calculates score, updates completion status and highest score`

### Routes for Student Management

- Method : `GET`
  - Route : `/students/{student_id}`
    - What it does: `Get student profile and point balance`
- Method : `PUT` 
  - Route : `/students/{student_id}/points?points={n}` 
    - What it does: `Update student coin balance`
   
## Reset
- Method : `PUT`
  - Route : `/reset`
    - What it does: `Resets all lesson completion, scores, and student points back to zero`

Just note for reset button, this is done for "testing purposes", my goal was to try and break my application to see bugs or test cases,
just allows for me to reset data so that I can test different inputs on lessons without having to touch the JSON file.

- A student earns 10 coins when they score ≥ 70% on a quiz
- Points are only awarded if the student has never passed before (`is_complete: false`) 
or previously attempted but scored under 70% (`curr_score ≤ 70`)
- Lessons are locked until the previous lesson is marked complete

## frontend
Built using vanilla JavaScript, HTML, and CSS, it runs separately using Vite. The frontend communicates with
the backend using `fetch()`, which called to the FastAPI REST API. Pages are organized as folder so the URLs and stand
to be more professional (with /quiz instead of /quiz.html as the url for example)

# examples of usage using libcurl

gets all the lessons
```bash
curl http://127.0.0.1:8000/lessons
```

submit quiz answers (for example purposes this being for lesson one's quiz)
```bash
curl -X POST http://127.0.0.1:8000/quiz/1/submit \
  -H "Content-Type: application/json" \
  -d '{"answers": ["4", "True", "94"]}'
```

get student profile
```bash
curl http://127.0.0.1:8000/students/1
```

update student points
```bash
curl -X PUT "http://127.0.0.1:8000/students/1/points?points=10"
```

reset all progress
```bash
curl -X PUT http://127.0.0.1:8000/reset
```

# set up process

mark sure to have 
- Python interp 3.10 or higher (running backend)
- node.js and npm (running frontend)


### clone repo
``` bash
    git clone https://github.com/lucaEaton/puberry_assignment
    cd puberry_assignment
```

### set up the venu
#### note i use python3 because I use a mac
```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install fastapi uvicorn pydantic
```

### open another termianl and run the backend
```bash
    cd puberry_assignment
    source venv/bin/activate
    uvicorn backend.api:app --reload
```
Backend runs at `http://127.0.0.1:8000`

### open another termianl and run the frontend
```bash
    cd puberry_assignment/frontend
    npm install
    npm run dev
```
Frontend runs at `http://localhost:5173`

To fully test, 
 
1. Start both the backend and frontend servers (see setup above)
2. Open `http://localhost:5173` in your browser
3. Click Lesson One to start the quiz
4. Answer all 3 questions, score ≥ 70% to earn 10 coins
5. Return to the home page, coin balance updates and Lesson 2 unlocks
6. Click My Profile to view lesson completion status and coin balance
7. Complete Lesson Two to finish demo

## JSON Data Format

### lessons.json
```json
[
    {
        "lesson_id": 1,
        "title": "Lesson One",
        "content": "Addition",
        "quiz": {
            "questions": [
                {
                    "question_text": "Q1: 2 + 2 = ?",
                    "answer": "4",
                    "choices": ["3", "5", "6"]
                },
                {
                    "question_text": "Q2: Is 10 - 2 = 8 ?",
                    "answer": "True"
                },
                {
                    "question_text": "Q3: 20 + 74 = ?",
                    "answer": "94",
                    "choices": ["92", "-54", "95"]
                }
            ]
        },
        "is_complete": false,
        "current_score": 0.0
    },
    {
        "lesson_id": 2,
        "title": "Lesson Two",
        "content": "Subtraction",
        "quiz": {
            "questions": [
                {
                    "question_text": "Q1: 10 - 3 = ?",
                    "answer": "7",
                    "choices": ["-7","8","9"]
                },
                {
                    "question_text": "Q2: Is 1 - 5 = 4 ?",
                    "answer": "False"
                },
                {
                    "question_text": "Q3: 1000 - 250 = ?",
                    "answer": "750",
                    "choices": ["500","-250","800"]
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
