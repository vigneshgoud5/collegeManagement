import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { listStudents } from '../../api/adminStudents';

export function StudentList() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const department = params.get('department') || '';
  const year = params.get('year') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', { q, department, year }],
    queryFn: () => listStudents({ q: q || undefined, department: department || undefined, year: year ? Number(year) : undefined }),
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Students</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Search name" value={q} onChange={(e) => updateParam('q', e.target.value)} />
        <input placeholder="Department" value={department} onChange={(e) => updateParam('department', e.target.value)} />
        <input placeholder="Year" value={year} onChange={(e) => updateParam('year', e.target.value)} />
      </div>
      {isLoading && <div>Loading...</div>}
      <table width="100%" cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Email</th>
            <th align="left">Department</th>
            <th align="left">Year</th>
            <th align="left">Status</th>
          </tr>
        </thead>
        <tbody>
          {(data || []).map((s) => (
            <tr key={s._id}>
              <td>
                <Link to={`/academic/students/${s._id}`}>{s.firstName} {s.lastName}</Link>
              </td>
              <td>{(s as any).user?.email}</td>
              <td>{s.department || '-'}</td>
              <td>{s.year || '-'}</td>
              <td>{(s as any).user?.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


