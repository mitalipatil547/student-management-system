import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

interface Student {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  course?: string;
}

interface SubjectMark {
  id: number;
  subject: string;
  internalMarks: string;
  externalMarks: string;
}

export default function AddMarks() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [semester, setSemester] = useState("Semester 1");

  // Multiple subjects
  const [subjectMarks, setSubjectMarks] = useState<SubjectMark[]>([
    {
      id: Date.now(),
      subject: "",
      internalMarks: "",
      externalMarks: "",
    },
  ]);

  // Load students
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/students")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load students");
        }

        return response.json();
      })
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error loading students:", error);
        alert("Students load झाले नाहीत.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Add new subject
  const addSubject = () => {
    setSubjectMarks((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        subject: "",
        internalMarks: "",
        externalMarks: "",
      },
    ]);
  };

  // Remove subject
  const removeSubject = (id: number) => {
    if (subjectMarks.length === 1) {
      alert("कमीत कमी एक subject असणे आवश्यक आहे.");
      return;
    }

    setSubjectMarks((prev) =>
      prev.filter((subject) => subject.id !== id)
    );
  };

  // Update subject field
  const updateSubject = (
    id: number,
    field: keyof SubjectMark,
    value: string
  ) => {
    setSubjectMarks((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // Calculate total
  const getTotal = (item: SubjectMark) => {
    const internal = Number(item.internalMarks || 0);
    const external = Number(item.externalMarks || 0);

    return internal + external;
  };

  // Save all subjects
  const handleSave = async () => {
    if (!studentId) {
      alert("Please select a student.");
      return;
    }

    if (subjectMarks.length === 0) {
      alert("Please add at least one subject.");
      return;
    }

    // Validate all subjects
    for (let i = 0; i < subjectMarks.length; i++) {
      const item = subjectMarks[i];

      if (!item.subject.trim()) {
        alert(`Please enter Subject ${i + 1} name.`);
        return;
      }

      if (item.internalMarks === "") {
        alert(`Please enter Internal Marks for ${item.subject}.`);
        return;
      }

      if (item.externalMarks === "") {
        alert(`Please enter External Marks for ${item.subject}.`);
        return;
      }

      const internal = Number(item.internalMarks);
      const external = Number(item.externalMarks);

      if (internal < 0 || internal > 50) {
        alert(
          `Internal marks for ${item.subject} must be between 0 and 50.`
        );
        return;
      }

      if (external < 0 || external > 75) {
        alert(
          `External marks for ${item.subject} must be between 0 and 75.`
        );
        return;
      }
    }

    // Check duplicate subjects
    const subjects = subjectMarks.map((item) =>
      item.subject.trim().toLowerCase()
    );

    const hasDuplicate = subjects.some(
      (subject, index) => subjects.indexOf(subject) !== index
    );

    if (hasDuplicate) {
      alert("Same subject multiple times add करू नका.");
      return;
    }

    setSaving(true);

    try {
      // Save every subject one by one
      for (const item of subjectMarks) {
        const internal = Number(item.internalMarks);
        const external = Number(item.externalMarks);
        const totalMarks = internal + external;

        const response = await fetch(
          "http://127.0.0.1:5000/api/marks",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              student_id: Number(studentId),

              // Subject name
              subject_name: item.subject.trim(),

              // Maximum marks
              max_marks: 125,

              // Internal + External
              obtained_marks: totalMarks,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              `Failed to save ${item.subject}`
          );
        }
      }

      alert("All subjects and marks saved successfully!");

      navigate("/marks");
    } catch (error) {
      console.error("Save marks error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save marks"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Add Marks
          </h1>

          <p className="text-gray-500 mt-1">
            Add multiple subjects and marks for a student
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

          {/* Student */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>

            {loading ? (
              <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-500">
                Loading students...
              </div>
            ) : (
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  Select Student
                </option>

                {students.map((student) => (
                  <option
                    key={student.id}
                    value={student.id}
                  >
                    {student.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Semester */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>

            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semester 1">
                Semester 1
              </option>

              <option value="Semester 2">
                Semester 2
              </option>

              <option value="Semester 3">
                Semester 3
              </option>

              <option value="Semester 4">
                Semester 4
              </option>

              <option value="Semester 5">
                Semester 5
              </option>

              <option value="Semester 6">
                Semester 6
              </option>
            </select>

            <p className="text-xs text-gray-500 mt-1">
              Semester is shown in the UI.
            </p>
          </div>

          {/* Subjects Section */}
          <div className="mb-5">

            {/* Subject Header */}
            <div className="flex items-center justify-between mb-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Subjects & Marks
                </label>

                <p className="text-xs text-gray-500 mt-1">
                  Add multiple subjects and enter marks for each subject.
                </p>
              </div>

              <button
                type="button"
                onClick={addSubject}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                <span className="text-lg leading-none">
                  +
                </span>

                Add Subject
              </button>

            </div>


            {/* Subject Rows */}
            <div className="space-y-5">

              {subjectMarks.map((item, index) => {

                const totalMarks = getTotal(item);

                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-5 bg-gray-50"
                  >

                    {/* Subject Row Header */}
                    <div className="flex items-center justify-between mb-4">

                      <h3 className="font-semibold text-gray-800">
                        Subject {index + 1}
                      </h3>

                      {subjectMarks.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeSubject(item.id)
                          }
                          disabled={saving}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      )}

                    </div>


                    {/* Subject Name */}
                    <div className="mb-4">

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Name
                      </label>

                      <input
                        type="text"
                        value={item.subject}
                        onChange={(e) =>
                          updateSubject(
                            item.id,
                            "subject",
                            e.target.value
                          )
                        }
                        placeholder="Enter subject name"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                    </div>


                    {/* Marks */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                      {/* Internal */}
                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Internal Marks
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={item.internalMarks}
                          onChange={(e) =>
                            updateSubject(
                              item.id,
                              "internalMarks",
                              e.target.value
                            )
                          }
                          placeholder="Out of 50"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <p className="text-xs text-gray-500 mt-1">
                          Maximum: 50
                        </p>

                      </div>


                      {/* External */}
                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          External Marks
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="75"
                          value={item.externalMarks}
                          onChange={(e) =>
                            updateSubject(
                              item.id,
                              "externalMarks",
                              e.target.value
                            )
                          }
                          placeholder="Out of 75"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <p className="text-xs text-gray-500 mt-1">
                          Maximum: 75
                        </p>

                      </div>


                      {/* Total */}
                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total
                        </label>

                        <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white font-semibold text-gray-900">
                          {totalMarks} / 125
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Internal + External
                        </p>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>


          {/* Add Another Subject */}
          <div className="flex justify-center mt-5 mb-2">

            <button
              type="button"
              onClick={addSubject}
              disabled={saving}
              className="px-5 py-2.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-50"
            >
              + Add Another Subject
            </button>

          </div>


          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">

            <button
              type="button"
              onClick={() => navigate("/marks")}
              disabled={saving}
              className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save All Marks"}
            </button>

          </div>

        </div>
      </div>
    </Layout>
  );
}