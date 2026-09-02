import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="logout" onClick={logout}>
          Log out
        </button>
      </header>

      <section className="card">
        <h2>Welcome, {user?.name} 👋</h2>
        <p className="muted">You are viewing a protected page.</p>

        <dl className="profile">
          <dt>Name</dt>
          <dd>{user?.name}</dd>
          <dt>Email</dt>
          <dd>{user?.email}</dd>
          <dt>User ID</dt>
          <dd>{user?.id}</dd>
          <dt>Joined</dt>
          <dd>{user?.createdAt}</dd>
        </dl>
      </section>
    </div>
  );
}
