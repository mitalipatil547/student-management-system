from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)


# =========================================================
# DATABASE CONFIG
# =========================================================

DB_CONFIG = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "mitali123",
    "database": "student_management"
}


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


# =========================================================
# INITIALIZE DATABASE
# =========================================================

def init_database():

    conn = get_db_connection()
    cursor = conn.cursor()

    # STUDENTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150),
            phone VARCHAR(30),
            course VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # COURSES
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(50) NOT NULL UNIQUE,
            name VARCHAR(150) NOT NULL,
            duration VARCHAR(50)
        )
    """)

    # ATTENDANCE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            subject_name VARCHAR(100) NULL,
            attendance_date DATE NOT NULL,
            status VARCHAR(20) NOT NULL,
            FOREIGN KEY (student_id)
                REFERENCES students(id)
                ON DELETE CASCADE
        )
    """)

    # MARKS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS marks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            subject_name VARCHAR(100) NOT NULL,
            max_marks INT NOT NULL,
            obtained_marks INT NOT NULL,
            FOREIGN KEY (student_id)
                REFERENCES students(id)
                ON DELETE CASCADE
        )
    """)

    # ADMIN USERS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            phone VARCHAR(30),
            role VARCHAR(50) DEFAULT 'Administrator',
            password VARCHAR(255) NOT NULL
        )
    """)

    # RESET TOKEN
    try:
        cursor.execute("""
            ALTER TABLE admin_users
            ADD COLUMN reset_token VARCHAR(255) NULL
        """)
    except mysql.connector.Error:
        pass

    # RESET TOKEN EXPIRY
    try:
        cursor.execute("""
            ALTER TABLE admin_users
            ADD COLUMN reset_token_expires DATETIME NULL
        """)
    except mysql.connector.Error:
        pass

    # DEFAULT ADMIN
    cursor.execute("""
        SELECT id
        FROM admin_users
        WHERE email = %s
        LIMIT 1
    """, ("admin@gmail.com",))

    admin = cursor.fetchone()

    if not admin:

        hashed_password = generate_password_hash("admin123")

        cursor.execute("""
            INSERT INTO admin_users
            (name, email, phone, role, password)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            "Admin User",
            "admin@gmail.com",
            "9876500001",
            "Administrator",
            hashed_password
        ))

    conn.commit()

    cursor.close()
    conn.close()

    print("Database initialized successfully.")


# =========================================================
# HOME
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Student Management System Backend is running"
    })


# =========================================================
# LOGIN
# =========================================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json() or {}

    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:

        return jsonify({
            "message": "Email and password are required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            name,
            email,
            phone,
            role,
            password
        FROM admin_users
        WHERE email = %s
        LIMIT 1
    """, (email,))

    admin = cursor.fetchone()

    cursor.close()
    conn.close()

    if not admin:

        return jsonify({
            "message": "Invalid email or password"
        }), 401

    if not check_password_hash(admin["password"], password):

        return jsonify({
            "message": "Invalid email or password"
        }), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": admin["id"],
            "name": admin["name"],
            "email": admin["email"],
            "phone": admin["phone"],
            "role": admin["role"]
        }
    })


# =========================================================
# FORGOT PASSWORD TOKEN
# =========================================================

@app.route("/api/forgot-password", methods=["POST"])
def forgot_password():

    data = request.get_json() or {}

    email = data.get("email", "").strip()

    if not email:

        return jsonify({
            "message": "Email is required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, email
        FROM admin_users
        WHERE email = %s
        LIMIT 1
    """, (email,))

    admin = cursor.fetchone()

    if not admin:

        cursor.close()
        conn.close()

        return jsonify({
            "message": "If this email exists, password reset instructions are available."
        })

    reset_token = secrets.token_urlsafe(32)

    expires_at = datetime.now() + timedelta(minutes=15)

    cursor.execute("""
        UPDATE admin_users
        SET
            reset_token = %s,
            reset_token_expires = %s
        WHERE id = %s
    """, (
        reset_token,
        expires_at,
        admin["id"]
    ))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Password reset request created.",
        "reset_token": reset_token
    })


# =========================================================
# RESET PASSWORD USING TOKEN
# =========================================================

@app.route("/api/reset-password", methods=["POST"])
def reset_password():

    data = request.get_json() or {}

    token = data.get("token", "").strip()
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not token:

        return jsonify({
            "message": "Reset token is required"
        }), 400

    if not new_password or not confirm_password:

        return jsonify({
            "message": "New password and confirm password are required"
        }), 400

    if len(new_password) < 6:

        return jsonify({
            "message": "New password must be at least 6 characters"
        }), 400

    if new_password != confirm_password:

        return jsonify({
            "message": "Passwords do not match"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            reset_token_expires
        FROM admin_users
        WHERE reset_token = %s
        LIMIT 1
    """, (token,))

    admin = cursor.fetchone()

    if not admin:

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Invalid or expired reset token"
        }), 400

    if (
        not admin["reset_token_expires"]
        or datetime.now() > admin["reset_token_expires"]
    ):

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Invalid or expired reset token"
        }), 400

    hashed_password = generate_password_hash(new_password)

    cursor.execute("""
        UPDATE admin_users
        SET
            password = %s,
            reset_token = NULL,
            reset_token_expires = NULL
        WHERE id = %s
    """, (
        hashed_password,
        admin["id"]
    ))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Password reset successfully"
    })


# =========================================================
# LOCAL PASSWORD RESET
# NO CURRENT PASSWORD
# NO EMAIL
# =========================================================

@app.route("/api/admin/password-reset-local", methods=["PUT"])
def reset_admin_password_local():

    # Security:
    # This endpoint works only from the same computer.
    if request.remote_addr not in ("127.0.0.1", "::1"):

        return jsonify({
            "message": "Password reset is available only on the local computer."
        }), 403

    data = request.get_json() or {}

    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not new_password or not confirm_password:

        return jsonify({
            "message": "New password and confirm password are required"
        }), 400

    if len(new_password) < 6:

        return jsonify({
            "message": "Password must be at least 6 characters"
        }), 400

    if new_password != confirm_password:

        return jsonify({
            "message": "Passwords do not match"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:

        # First admin account
        cursor.execute("""
            SELECT id
            FROM admin_users
            ORDER BY id
            LIMIT 1
        """)

        admin = cursor.fetchone()

        if not admin:

            return jsonify({
                "message": "Admin account not found"
            }), 404

        hashed_password = generate_password_hash(new_password)

        cursor.execute("""
            UPDATE admin_users
            SET
                password = %s,
                reset_token = NULL,
                reset_token_expires = NULL
            WHERE id = %s
        """, (
            hashed_password,
            admin["id"]
        ))

        conn.commit()

        return jsonify({
            "message": "Password changed successfully"
        }), 200

    except mysql.connector.Error as error:

        conn.rollback()

        return jsonify({
            "message": str(error)
        }), 500

    finally:

        cursor.close()
        conn.close()


# =========================================================
# ADMIN PROFILE - GET
# =========================================================

@app.route("/api/admin/profile", methods=["GET"])
def get_admin_profile():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            name,
            email,
            phone,
            role
        FROM admin_users
        ORDER BY id
        LIMIT 1
    """)

    admin = cursor.fetchone()

    cursor.close()
    conn.close()

    if not admin:

        return jsonify({
            "message": "Admin profile not found"
        }), 404

    return jsonify(admin)


# =========================================================
# ADMIN PROFILE - UPDATE
# =========================================================

@app.route("/api/admin/profile", methods=["PUT"])
def update_admin_profile():

    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()

    if not name or not email:

        return jsonify({
            "message": "Name and email are required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id
        FROM admin_users
        ORDER BY id
        LIMIT 1
    """)

    admin = cursor.fetchone()

    if not admin:

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Admin profile not found"
        }), 404

    admin_id = admin["id"]

    cursor.execute("""
        SELECT id
        FROM admin_users
        WHERE email = %s
        AND id != %s
        LIMIT 1
    """, (
        email,
        admin_id
    ))

    existing_email = cursor.fetchone()

    if existing_email:

        cursor.close()
        conn.close()

        return jsonify({
            "message": "This email is already in use"
        }), 400

    cursor.execute("""
        UPDATE admin_users
        SET
            name = %s,
            email = %s,
            phone = %s
        WHERE id = %s
    """, (
        name,
        email,
        phone,
        admin_id
    ))

    conn.commit()

    cursor.execute("""
        SELECT
            id,
            name,
            email,
            phone,
            role
        FROM admin_users
        WHERE id = %s
    """, (admin_id,))

    updated_admin = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Profile updated successfully",
        "user": updated_admin
    })


# =========================================================
# OLD CHANGE PASSWORD
# CURRENT PASSWORD REQUIRED
# =========================================================

@app.route("/api/admin/password", methods=["PUT"])
def change_admin_password():

    data = request.get_json() or {}

    email = data.get("email", "").strip()
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")

    if not email or not current_password or not new_password:

        return jsonify({
            "message": "Email, current password and new password are required"
        }), 400

    if len(new_password) < 6:

        return jsonify({
            "message": "New password must be at least 6 characters"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            password
        FROM admin_users
        WHERE email = %s
        LIMIT 1
    """, (email,))

    admin = cursor.fetchone()

    if not admin:

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Admin account not found"
        }), 404

    if not check_password_hash(
        admin["password"],
        current_password
    ):

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Current password is incorrect"
        }), 400

    new_hashed_password = generate_password_hash(new_password)

    cursor.execute("""
        UPDATE admin_users
        SET password = %s
        WHERE id = %s
    """, (
        new_hashed_password,
        admin["id"]
    ))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Password changed successfully"
    })


# =========================================================
# STUDENTS - GET ALL
# =========================================================

@app.route("/api/students", methods=["GET"])
def get_students():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            name,
            email,
            phone,
            course,
            created_at
        FROM students
        ORDER BY id DESC
    """)

    students = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(students)


# =========================================================
# STUDENTS - ADD
# =========================================================

@app.route("/api/students", methods=["POST"])
def add_student():

    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    course = data.get("course", "").strip()

    if not name:

        return jsonify({
            "message": "Student name is required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO students
        (
            name,
            email,
            phone,
            course
        )
        VALUES (%s, %s, %s, %s)
    """, (
        name,
        email,
        phone,
        course
    ))

    conn.commit()

    student_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Student added successfully",
        "id": student_id
    }), 201


# =========================================================
# STUDENT - GET BY ID
# =========================================================

@app.route("/api/students/<int:student_id>", methods=["GET"])
def get_student(student_id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            name,
            email,
            phone,
            course,
            created_at
        FROM students
        WHERE id = %s
    """, (student_id,))

    student = cursor.fetchone()

    cursor.close()
    conn.close()

    if not student:

        return jsonify({
            "message": "Student not found"
        }), 404

    return jsonify(student)


# =========================================================
# STUDENT - UPDATE
# =========================================================

@app.route("/api/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):

    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    course = data.get("course", "").strip()

    if not name:

        return jsonify({
            "message": "Student name is required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE students
        SET
            name = %s,
            email = %s,
            phone = %s,
            course = %s
        WHERE id = %s
    """, (
        name,
        email,
        phone,
        course,
        student_id
    ))

    conn.commit()

    if cursor.rowcount == 0:

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Student not found"
        }), 404

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Student updated successfully"
    })


# =========================================================
# STUDENT - DELETE
# =========================================================

@app.route("/api/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM students
        WHERE id = %s
    """, (student_id,))

    conn.commit()

    if cursor.rowcount == 0:

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Student not found"
        }), 404

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Student deleted successfully"
    })


# =========================================================
# COURSES - GET ALL
# =========================================================

@app.route("/api/courses", methods=["GET"])
def get_courses():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            c.id,
            c.code,
            c.name,
            c.duration,
            COUNT(s.id) AS students
        FROM courses c
        LEFT JOIN students s
            ON s.course = c.name
        GROUP BY
            c.id,
            c.code,
            c.name,
            c.duration
        ORDER BY c.id DESC
    """)

    courses = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(courses)


# =========================================================
# COURSE - GET BY CODE
# =========================================================

@app.route("/api/courses/<string:code>", methods=["GET"])
def get_course(code):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            c.id,
            c.code,
            c.name,
            c.duration,
            COUNT(s.id) AS students
        FROM courses c
        LEFT JOIN students s
            ON s.course = c.name
        WHERE c.code = %s
        GROUP BY
            c.id,
            c.code,
            c.name,
            c.duration
    """, (code,))

    course = cursor.fetchone()

    cursor.close()
    conn.close()

    if not course:

        return jsonify({
            "message": "Course not found"
        }), 404

    return jsonify(course)


# =========================================================
# COURSE - ADD
# =========================================================

@app.route("/api/courses", methods=["POST"])
def add_course():

    data = request.get_json() or {}

    code = data.get("code", "").strip()
    name = data.get("name", "").strip()
    duration = data.get("duration", "").strip()

    if not code or not name:

        return jsonify({
            "message": "Course code and name are required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            INSERT INTO courses
            (
                code,
                name,
                duration
            )
            VALUES (%s, %s, %s)
        """, (
            code,
            name,
            duration
        ))

        conn.commit()

        course_id = cursor.lastrowid

        return jsonify({
            "message": "Course added successfully",
            "id": course_id
        }), 201

    except mysql.connector.Error as error:

        conn.rollback()

        return jsonify({
            "message": str(error)
        }), 400

    finally:

        cursor.close()
        conn.close()


# =========================================================
# COURSE - UPDATE
# =========================================================

@app.route("/api/courses/<string:code>", methods=["PUT"])
def update_course(code):

    data = request.get_json() or {}

    name = data.get("name", "").strip()
    duration = data.get("duration", "").strip()

    if not name:

        return jsonify({
            "message": "Course name is required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE courses
        SET
            name = %s,
            duration = %s
        WHERE code = %s
    """, (
        name,
        duration,
        code
    ))

    conn.commit()

    if cursor.rowcount == 0:

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Course not found"
        }), 404

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Course updated successfully"
    })


# =========================================================
# COURSE - DELETE
# =========================================================

@app.route("/api/courses/<string:code>", methods=["DELETE"])
def delete_course(code):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM courses
        WHERE code = %s
    """, (code,))

    conn.commit()

    if cursor.rowcount == 0:

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Course not found"
        }), 404

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Course deleted successfully"
    })


# =========================================================
# ATTENDANCE - GET
# =========================================================

@app.route("/api/attendance", methods=["GET"])
def get_attendance():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            a.id,
            a.student_id,
            s.name AS student_name,
            s.course,
            a.subject_name,
            a.attendance_date,
            a.status
        FROM attendance a
        JOIN students s
            ON s.id = a.student_id
        ORDER BY
            a.attendance_date DESC,
            a.id DESC
    """)

    attendance = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(attendance)


# =========================================================
# ATTENDANCE - ADD
# =========================================================

@app.route("/api/attendance", methods=["POST"])
def add_attendance():

    data = request.get_json() or {}

    attendance_date = data.get("date")
    attendance_records = data.get("attendance", [])

    if not attendance_date:

        return jsonify({
            "message": "Attendance date is required"
        }), 400

    if not isinstance(attendance_records, list):

        return jsonify({
            "message": "Attendance records must be a list"
        }), 400

    if len(attendance_records) == 0:

        return jsonify({
            "message": "Attendance records are required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        saved_count = 0

        for record in attendance_records:

            student_id = record.get("student_id")
            status = record.get("status")

            if not student_id or not status:
                continue

            cursor.execute("""
                SELECT id
                FROM students
                WHERE id = %s
                LIMIT 1
            """, (student_id,))

            student = cursor.fetchone()

            if not student:
                continue

            cursor.execute("""
                SELECT id
                FROM attendance
                WHERE student_id = %s
                AND attendance_date = %s
                LIMIT 1
            """, (
                student_id,
                attendance_date
            ))

            existing = cursor.fetchone()

            if existing:

                cursor.execute("""
                    UPDATE attendance
                    SET status = %s
                    WHERE id = %s
                """, (
                    status,
                    existing[0]
                ))

            else:

                cursor.execute("""
                    INSERT INTO attendance
                    (
                        student_id,
                        subject_name,
                        attendance_date,
                        status
                    )
                    VALUES (%s, %s, %s, %s)
                """, (
                    student_id,
                    None,
                    attendance_date,
                    status
                ))

            saved_count += 1

        conn.commit()

        return jsonify({
            "message": "Attendance saved successfully",
            "saved_count": saved_count
        }), 201

    except mysql.connector.Error as error:

        conn.rollback()

        return jsonify({
            "message": str(error)
        }), 400

    finally:

        cursor.close()
        conn.close()


# =========================================================
# MARKS - GET ALL
# =========================================================

@app.route("/api/marks", methods=["GET"])
def get_marks():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            m.id,
            m.student_id,
            s.name AS student_name,
            s.email,
            s.course,
            m.subject_name,
            m.max_marks,
            m.obtained_marks
        FROM marks m
        JOIN students s
            ON s.id = m.student_id
        ORDER BY m.id DESC
    """)

    marks = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(marks)


# =========================================================
# MARKS - ADD
# =========================================================

@app.route("/api/marks", methods=["POST"])
def add_marks():

    data = request.get_json() or {}

    student_id = data.get("student_id")
    subject_name = data.get("subject_name", "").strip()
    max_marks = data.get("max_marks")
    obtained_marks = data.get("obtained_marks")

    if not student_id or not subject_name:

        return jsonify({
            "message": "Student and subject are required"
        }), 400

    if max_marks is None or obtained_marks is None:

        return jsonify({
            "message": "Maximum marks and obtained marks are required"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO marks
        (
            student_id,
            subject_name,
            max_marks,
            obtained_marks
        )
        VALUES (%s, %s, %s, %s)
    """, (
        student_id,
        subject_name,
        max_marks,
        obtained_marks
    ))

    conn.commit()

    mark_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Marks saved successfully",
        "id": mark_id
    }), 201


# =========================================================
# STUDENT MARKS
# =========================================================

@app.route("/api/students/<int:student_id>/marks", methods=["GET"])
def get_student_marks(student_id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            m.id,
            m.student_id,
            s.name AS student_name,
            s.course,
            m.subject_name,
            m.max_marks,
            m.obtained_marks
        FROM marks m
        JOIN students s
            ON s.id = m.student_id
        WHERE m.student_id = %s
        ORDER BY m.id DESC
    """, (student_id,))

    marks = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(marks)


# =========================================================
# DASHBOARD
# =========================================================

@app.route("/api/dashboard", methods=["GET"])
def dashboard():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT COUNT(*) AS total_students FROM students"
    )
    total_students = cursor.fetchone()["total_students"]

    cursor.execute(
        "SELECT COUNT(*) AS total_courses FROM courses"
    )
    total_courses = cursor.fetchone()["total_courses"]

    cursor.execute(
        "SELECT COUNT(*) AS total_attendance FROM attendance"
    )
    total_attendance = cursor.fetchone()["total_attendance"]

    cursor.execute(
        "SELECT COUNT(*) AS total_marks FROM marks"
    )
    total_marks = cursor.fetchone()["total_marks"]

    cursor.close()
    conn.close()

    return jsonify({
        "total_students": total_students,
        "total_courses": total_courses,
        "total_attendance": total_attendance,
        "total_marks": total_marks
    })


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    try:

        init_database()

        print("")
        print("==============================================")
        print("Student Management System Backend")
        print("Running on http://127.0.0.1:5000")
        print("==============================================")
        print("")

        app.run(
            host="127.0.0.1",
            port=5000,
            debug=True
        )

    except Exception as error:

        print("")
        print("Backend could not start.")
        print("Error:", error)
        print("")