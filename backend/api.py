from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

"""
 CORS middleware is done since our frontend and backend run on different ports
 frontend on 5173, and backend on 8000
"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

"""
 this reads our JSON file including the lessons we wish to show
 on our site for the student to take
"""


def load_lessons(lessons_path: str = "./backend/lessons.json"):
    with open(lessons_path) as f:
        return json.load(f)


"""
 reads lessons.json and returns the full list of lessons
"""


def load_students(students_path: str = "./backend/students.json"):
    with open(students_path) as f:
        return json.load(f)


"""
 writes the updated students list back to students.json,
 acting as our save mechanism since we have no database
"""


def save_students(students):
    with open("./backend/students.json", "w") as f:
        json.dump(students, f, indent=4)


"""
 writes the updated lessons list back to lessons.json,
 acting as our save mechanism since we have no database
"""


def save_lessons(lessons):
    with open("./backend/lessons.json", "w") as f:
        json.dump(lessons, f, indent=4)


"""
 represent a question in a given quiz
 this utilizes a nested model, being a base model inside a base model
"""


class Question(BaseModel):
    question_text: str
    answer: str
    choices: list[str] = []


"""
 represents a full quiz, with a nested list of questions
 each question holding its whole nested answer base model
"""


class Quiz(BaseModel):
    questions: list[Question]


"""
the goal here was to match up perfectly with the provided example structure
 Lessons = {
     Title: "Lesson 1",
     Content: "This is content for Lesson 1",
     Quiz: {
         Q1: "True or False: Lemons are yellow."
         {Answer: "True"}
     }
 }
 it needing a title, the content of such lesson, and a nested quiz basemodel
 
 we'll also hold if the lesson is completed or not and the currScore of the lesson
 (if the student was to retake it to achieve a higher score)
"""


class Lesson(BaseModel):
    lesson_id: int
    title: str
    content: str
    quiz: Quiz
    is_complete: bool = False
    curr_score: float = 0.0


"""
 my though process here is that we of course need an ID
 we'll hold their first name and the list of lessons available to them
"""


class StudentProfile(BaseModel):
    id: int
    first_name: str
    user_points: int = 0
    lessons: list[Lesson]


"""
 I noticed that I check answers on the frontend in quiz.JS, however
 I question if that is the correct approach, for safety this previous approach is faulty
 because it exposes the correct answers to the client.
 """


class Submission(BaseModel):
    answers: list[str]


@app.get("/")
def start():
    return {"Hello": "World"}


"""
loads the entire lesson plan from lessons.json
"""


@app.get("/lessons")
def get_lessons():
    return load_lessons()


"""
grabs the json payload for a student based on ID
"""


@app.get("/students/{student_id}")
def get_student(student_id: int):
    students = load_students()
    for student in students:
        if student["id"] == student_id:
            return student
    raise HTTPException(status_code=404, detail="Student not found")


"""
this allows for us to make changes to our students.json, updating their points
"""


@app.put("/students/{student_id}/points")
def update_points(student_id: int, points: int):
    students = load_students()
    for student in students:
        if student["id"] == student_id:
            student["user_points"] = points
            save_students(students)
            return student
    raise HTTPException(status_code=404, detail="Student not found")


"""
 this route accepts a list of answers from the frontend and validates them
 server side, this is more secure than checking answers on the frontend
 as it prevents the correct answers from being exposed to the client.
 
 we iterate through each question and compare the submitted answer to the
 correct answer, tallying the correct answers to calculate a final score.
 
 if the student passes (>= 70%) we mark the lesson as complete and update
 their highest score if it exceeds their previous attempt, then return
 the result back to the frontend to handle the reward logic.
"""


@app.post("/quiz/{lesson_id}/submit")
def submit_quiz(lesson_id: int, submission: Submission):
    lessons = load_lessons()
    for lesson in lessons:
        if lesson["lesson_id"] == lesson_id:
            questions = lesson["quiz"]["questions"]
            correct = 0
            for i, question in enumerate(questions):
                if i < len(questions):
                    if submission.answers[i] == question["answer"]:
                        correct += 1
            score = (correct / len(questions)) * 100
            passed = score >= 70
            if passed:
                lesson["is_complete"] = True
            if lesson["current_score"] < score:
                lesson["current_score"] = score
            save_lessons(lessons)
            return {
                "score": round(score),
                "passed": passed,
                "correct": correct,
                "total": len(questions)
            }

    raise HTTPException(status_code=404, detail="Lesson not found")
