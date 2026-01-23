import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { AcademicNav } from '../components/AcademicNav';

export function DashboardAcademic() {
	const { user } = useAuthStore();
	const isAdministrator = user?.subRole === 'administrative';
	
	return (
		<div className="page-container">
			<AcademicNav />
			<div className="page-content">
				<div className="container">
					<h1>Academic Dashboard</h1>
					{user?.subRole && (
						<p className="text-muted">
							Role: {user.subRole.charAt(0).toUpperCase() + user.subRole.slice(1)}
						</p>
					)}
					<div className="card mt-lg">
						<div className="card-header">
							<h2 className="card-title">Quick Actions</h2>
						</div>
						<div className="grid grid-auto-fit gap-lg">
							<Link to="/academic/profile" className="quick-action-card">
								<div className="quick-action-icon">📋</div>
								<div className="quick-action-title">My Profile</div>
								<div className="quick-action-description">View your account details</div>
							</Link>
							<Link to="/academic/students" className="quick-action-card">
								<div className="quick-action-icon">👥</div>
								<div className="quick-action-title">View All Students</div>
								<div className="quick-action-description">Browse, search and filter student records</div>
							</Link>
							{isAdministrator && (
								<Link to="/academic/faculty" className="quick-action-card">
									<div className="quick-action-icon">👨‍🏫</div>
									<div className="quick-action-title">View All Faculty</div>
									<div className="quick-action-description">Browse, search and filter faculty records</div>
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
