import { lazy } from "react";
import { Navigate, useLocation } from "react-router";
import { ARCHIE_PREVIEW } from "@/lib/config";

const TeacherHubDashboard = lazy(() => import("./index"));
const TeacherHubLoginPage = lazy(() => import("./login"));
const StudentDetailPage = lazy(() => import("./student/[studentId]"));

/**
 * The local school preview has no backend, so the teacher login and student
 * dashboard cannot work there. In preview, every /teacher-hub entry point leads
 * to the real lesson bank at /teacher (keeping any ?year=&subject= query).
 * Outside preview the backend-connected pages are unchanged.
 */
function PreviewTeacherRedirect() {
  const { search } = useLocation();
  return <Navigate to={"/teacher" + search} replace />;
}

export function TeacherHubEntry({ preview = ARCHIE_PREVIEW }: { preview?: boolean }) {
  return preview ? <PreviewTeacherRedirect /> : <TeacherHubDashboard />;
}
export function TeacherHubLoginEntry({ preview = ARCHIE_PREVIEW }: { preview?: boolean }) {
  return preview ? <PreviewTeacherRedirect /> : <TeacherHubLoginPage />;
}
export function TeacherHubStudentEntry({ preview = ARCHIE_PREVIEW }: { preview?: boolean }) {
  return preview ? <PreviewTeacherRedirect /> : <StudentDetailPage />;
}
