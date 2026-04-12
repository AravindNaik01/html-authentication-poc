import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getItems, createItem, updateItem, deleteItem, getStats } from '../api/itemApi';

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const Icon = ({ path, className = 'h-5 w-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const STATUS_BADGE = {
  active: <span className="badge-active"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Active</span>,
  pending: <span className="badge-pending"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Pending</span>,
  completed: <span className="badge-completed"><span className="h-1.5 w-1.5 rounded-full bg-sky-400" />Completed</span>,
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, gradient, loading }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400">{label}</p>
        {loading
          ? <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-slate-700" />
          : <p className="mt-1 text-3xl font-bold text-white">{value}</p>
        }
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

// ─── Item Form Modal ──────────────────────────────────────────────────────────
const ItemModal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: item?.title || '',
    description: item?.description || '',
    status: item?.status || 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!item;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await updateItem(item.id, form);
      } else {
        await createItem(form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      {/* Modal */}
      <div className="relative w-full max-w-lg animate-slide-up glass-card p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors">
            <Icon path="M6 18L18 6M6 6l12 12" />
          </button>
        </div>

        {error && (
          <div className="alert-error mb-5">
            <Icon path="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="item-title">Title *</label>
            <input
              id="item-title"
              type="text"
              placeholder="Enter item title"
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setError(''); }}
              className="form-field"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="item-desc">Description</label>
            <textarea
              id="item-desc"
              rows={3}
              placeholder="Describe this item..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-field resize-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="item-status">Status</label>
            <select
              id="item-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="form-field"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{isEdit ? 'Saving...' : 'Adding...'}</>
              ) : (isEdit ? 'Save Changes' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ item, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-md animate-slide-up glass-card p-8" onClick={(e) => e.stopPropagation()}>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/30">
        <Icon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" className="h-7 w-7 text-red-400" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-white">Delete Item</h2>
      <p className="mb-6 text-slate-400">
        Are you sure you want to delete <strong className="text-slate-200">"{item?.title}"</strong>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 font-semibold text-white transition-all duration-200 hover:from-red-500 hover:to-red-400 disabled:opacity-60 active:scale-[0.98]"
        >
          {loading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Deleting...</> : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, completed: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [alert, setAlert] = useState({ type: '', message: '' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoadingData(true);
      setLoadingStats(true);
      const [itemsRes, statsRes] = await Promise.all([getItems(), getStats()]);
      setItems(itemsRes.data.items || []);
      setStats(statsRes.data.stats || { total: 0, active: 0, pending: 0, completed: 0 });
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoadingData(false);
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setShowModal(false);
    setEditItem(null);
    await fetchData();
    showAlert('success', editItem ? 'Item updated successfully!' : 'Item created successfully!');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteItem(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
      showAlert('success', 'Item deleted successfully.');
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to delete item.');
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickStatus = async (item, newStatus) => {
    try {
      await updateItem(item.id, { status: newStatus });
      await fetchData();
      showAlert('success', `Status updated to ${newStatus}.`);
    } catch {
      showAlert('error', 'Failed to update status.');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // Filter + search
  const filteredItems = items.filter((item) => {
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statCards = [
    { label: 'Total Items', value: stats.total, gradient: 'from-primary-600 to-primary-400', icon: <Icon path="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" className="h-6 w-6 text-white" /> },
    { label: 'Active', value: stats.active, gradient: 'from-emerald-600 to-emerald-400', icon: <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="h-6 w-6 text-white" /> },
    { label: 'Pending', value: stats.pending, gradient: 'from-amber-600 to-amber-400', icon: <Icon path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" className="h-6 w-6 text-white" /> },
    { label: 'Completed', value: stats.completed, gradient: 'from-sky-600 to-sky-400', icon: <Icon path="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" className="h-6 w-6 text-white" /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-400">
              <Icon path="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AuthDash</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-300 text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white leading-none">{user?.name}</p>
                <p className="text-xs text-slate-400 leading-none mt-0.5">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-outline text-sm gap-1.5">
              <Icon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Alert */}
        {alert.message && (
          <div className={alert.type === 'success' ? 'alert-success' : 'alert-error'}>
            <Icon path={alert.type === 'success'
              ? 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              : 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
            } />
            <span>{alert.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="mt-1 text-slate-400">Here's an overview of your items.</p>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="btn-primary w-auto px-5 py-2.5"
          >
            <Icon path="M12 4.5v15m7.5-7.5h-15" className="h-4 w-4" />
            Add Item
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} loading={loadingStats} />
          ))}
        </div>

        {/* Items Section */}
        <div className="glass-card overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white">Your Items</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative">
                <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-field pl-9 py-2 text-sm w-full sm:w-52"
                />
              </div>
              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-field py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loadingData ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-800/50" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                <Icon path="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-lg font-semibold text-slate-300">
                {search || filterStatus !== 'all' ? 'No items match your filters' : 'No items yet'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {search || filterStatus !== 'all' ? 'Try adjusting your search or filter.' : 'Click "Add Item" to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Title</th>
                    <th className="hidden px-5 py-3 md:table-cell">Description</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => (
                    <tr key={item.id} className="table-row-hover border-b border-white/5 last:border-0">
                      <td className="px-5 py-4 text-sm text-slate-500">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{item.title}</p>
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <p className="max-w-xs truncate text-sm text-slate-400">{item.description || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleQuickStatus(item, e.target.value)}
                          className="cursor-pointer rounded-lg border border-transparent bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          title="Change status"
                        >
                          <option value="active">🟢 Active</option>
                          <option value="pending">🟡 Pending</option>
                          <option value="completed">🔵 Completed</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditItem(item); setShowModal(true); }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-primary-500/15 hover:text-primary-400 transition-colors"
                            title="Edit"
                          >
                            <Icon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {filteredItems.length > 0 && (
            <div className="border-t border-white/5 px-5 py-3 text-xs text-slate-500">
              Showing {filteredItems.length} of {items.length} item{items.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showModal && (
        <ItemModal
          item={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Dashboard;
