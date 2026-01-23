import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { DashboardStudent } from './pages/DashboardStudent';
import { DashboardAcademic } from './pages/DashboardAcademic';
import { RequireAuth, RequireRole } from './routesGuards';
import { StudentProfile } from './pages/StudentProfile';
import { Settings } from './pages/Settings';
import { StudentsList } from './pages/StudentsList';
import { StudentDetail } from './pages/StudentDetail';
import { StudentForm } from './pages/StudentForm';
import { AcademicProfile } from './pages/AcademicProfile';
import { AcademicSettings } from './pages/AcademicSettings';
import { FacultyList } from './pages/FacultyList';
import { FacultyDetail } from './pages/FacultyDetail';
import { FacultyForm } from './pages/FacultyForm';

export const router = createBrowserRouter([
	{ path: '/', element: <Navigate to="/login" replace /> },
	{ path: '/login', element: <Login /> },
	{ path: '/signup', element: <Signup /> },
	{
		path: '/dashboard/student',
		element: (
			<RequireAuth>
				<RequireRole role="student">
					<DashboardStudent />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/dashboard/academic',
		element: (
			<RequireAuth>
				<RequireRole role="academic">
					<DashboardAcademic />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/student/profile',
		element: (
			<RequireAuth>
				<RequireRole role="student">
					<StudentProfile />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/student/settings',
		element: (
			<RequireAuth>
				<RequireRole role="student">
					<Settings />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/academic/students',
		element: (
			<RequireAuth>
				<RequireRole role="academic">
					<StudentsList />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/academic/students/new',
		element: (
			<RequireAuth>
				<RequireRole role="academic">
					<StudentForm />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/academic/students/:id',
		element: (
			<RequireAuth>
				<RequireRole role="academic">
					<StudentDetail />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/academic/students/:id/edit',
		element: (
			<RequireAuth>
				<RequireRole role="academic">
					<StudentForm />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/academic/profile',
		element: (
			<RequireAuth>
				<RequireRole role="academic">
					<AcademicProfile />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/academic/settings',
		element: (
			<RequireAuth>
				<RequireRole role="academic">
					<AcademicSettings />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/academic/faculty',
		element: (
			<RequireAuth>
				<RequireRole role="academic">
					<FacultyList />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/academic/faculty/new',
		element: (
			<RequireAuth>
				<RequireRole role="academic">
					<FacultyForm />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/academic/faculty/:id',
		element: (
			<RequireAuth>
				<RequireRole role="academic">
					<FacultyDetail />
				</RequireRole>
			</RequireAuth>
		),
	},
	{
		path: '/academic/faculty/:id/edit',
		element: (
			<RequireAuth>
				<RequireRole role="academic">
					<FacultyForm />
				</RequireRole>
			</RequireAuth>
		),
	},
]);


