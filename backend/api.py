from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# this reads our JSON file including the lessons we wish to show
# on our site for the student to take
def load_lessons(lessons_path: str = "./backend/lessons.json"):
    with open(lessons_path) as f:
        return json.load(f)

def load_students(students_path: str = "./backend/students.json"):
    with open(students_path) as f:
        return json.load(f)

def save_students(students):
    with open("./backend/students.json", "w") as f:
        json.dump(students, f, indent=4)

def save_lessons(lessons):
    with open("./backend/lessons.json", "w") as f:
        json.dump(lessons, f, indent=4)

# represent a question in a given quiz
# this utilizes a nested model, being a base model inside a base model
class Question(BaseModel):
    question_text: str
    answer: str

# represents a full quiz, with a nested list of questions
# each question holding its whole nested answer base model
class Quiz(BaseModel):
    questions: list[Question]

# the goal here was to match up perfectly with the provided example structure
# Lessons = {
#     Title: "Lesson 1",
#     Content: "This is content for Lesson 1",
#     Quiz: {
#         Q1: "True or False: Lemons are yellow."
#         {Answer: "True"}
#     }
# }
# it needing a title, the content of such lesson, and a nested quiz basemodel
#
# we'll also hold if the lesson is completed or not and the currScore of the lesson
# (if the student was to retake it to achieve a higher score)
class Lesson(BaseModel):
    lesson_id: int
    title: str
    content: str
    quiz: Quiz
    is_complete: bool = False
    curr_score: float = 0.0

# my though process here is that we of course need an ID
# we'll hold their first name and the list of lessons available to them
class StudentProfile(BaseModel):
    id: int
    first_name: str
    user_points: int = 0
    lessons: list[Lesson]

@app.get("/")
def start():
    return {"Hello": "World"}

# loads the entire lesson plan from lessons.json
@app.get("/lessons")
def get_lessons():
    return load_lessons()

# grabs the json payload for a student based on ID
@app.get("/students/{student_id}")
def get_student(student_id: int):
    students = load_students()
    for student in students:
        if student["id"] == student_id:
            return student
    raise HTTPException(status_code=404, detail="Student not found")

# for the /quiz page, we want to display each question,
# so this allows for just that fetching the lesson based on
# the card we clicked
@app.get("/quiz/{lesson_id}")
def get_quiz(lesson_id: int):
    lessons = load_lessons()
    for lesson in lessons:
        if lesson["lesson_id"] == lesson_id:
            return lesson
    raise HTTPException(status_code=404, detail="Lesson not found")

@app.put("/quiz/{lesson_id}/{new_score}")
def update_quiz(lesson_id: int, new_score: float):
    lessons = load_lessons()
    for lesson in lessons:
        if lesson["lesson_id"] == lesson_id:
            if new_score > 70:
                lesson["is_complete"] = True
            if lesson["current_score"] < new_score:
                lesson["current_score"] = new_score
            save_lessons(lessons)
            return lesson
    raise HTTPException(status_code=404, detail="Lesson not found")


@app.put("/students/{student_id}/points")
def update_points(student_id: int, points: int):
    students = load_students()
    for student in students:
        if student["id"] == student_id:
            student["user_points"] = points
            save_students(students)
            return student
    raise HTTPException(status_code=404, detail="Student not found")


