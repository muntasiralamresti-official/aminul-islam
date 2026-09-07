"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";

function StudentsContent() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || "",
  );

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load students");
      setStudents(data);
    } catch (error) {
      toast.error(error.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch("/api/students")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load students");
        if (active) setStudents(data);
      })
      .catch((error) => {
        if (active) toast.error(error.message || "Failed to load students");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete student");
      toast.success("Student deleted");
      fetchStudents();
    } catch (error) {
      toast.error(error.message || "Error deleting student");
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = (searchParams.get("search") || searchQuery)
      .trim()
      .toLowerCase();
    if (!query) return true;

    return [
      student.name,
      student.rollNumber,
      student.phone,
      student.guardianPhone,
      student.batch?.name,
      student.batch?.subject,
    ].some((value) => value?.toLowerCase().includes(query));
  });

  if (loading)
    return (
      <div className="p-4 flex justify-center text-gray-500">
        Loading students...
      </div>
    );

  return (
    <div>
      <div className="sm:flex sm:items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Students</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the students in your coaching center.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex-none flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full sm:w-64 rounded-md border-gray-300 shadow-sm border p-2 text-sm text-black focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Link
            href="/dashboard/students/new"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Roll No
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Batch
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {student.rollNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            {student.photo ? (
                              <img
                                className="h-8 w-8 rounded-full object-cover border"
                                src={student.photo}
                                alt=""
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {student.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-3 font-medium text-gray-900">
                            {student.name}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {student.phone}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {student.batch?.name || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${student.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/dashboard/students/${student._id}`}
                          className="text-gray-600 hover:text-gray-900 mr-4"
                        >
                          <Eye className="inline h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/students/${student._id}/edit`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="inline h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="inline h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-4 text-center text-sm text-gray-500"
                      >
                        {students.length === 0
                          ? "No students found. Create one to get started."
                          : "No students match your search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 flex justify-center text-gray-500">
          Loading students...
        </div>
      }
    >
      <StudentsContent />
    </Suspense>
  );
}
