import React, { useState, useEffect } from 'react';
import {
    Users,
    Folder,
    FileText,
    TrendingUp,
    Activity,
    Settings,
    LogOut,
    Bell,
    CheckCircle,
    XCircle,
    Clock,
    FileQuestion,
    ChevronRight,
    Search,
    Zap,
    Trash2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import api from '../../api/axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState([
        { title: 'Total Users', value: '...', icon: <Users size={24} />, trend: '+0%', color: '#3b82f6' },
        { title: 'Total Projects', value: '...', icon: <Folder size={24} />, trend: '+0%', color: '#a855f7' },
        { title: 'Pending Requests', value: '...', icon: <FileQuestion size={24} />, trend: '0', color: '#f59e0b' },
        { title: 'Active Projects', value: '...', icon: <Activity size={24} />, trend: '+0%', color: '#10b981' },
    ]);
    const [chartsData, setChartsData] = useState({
        categoryData: [],
        growthData: [],
        requestStatusData: []
    });
    const [loading, setLoading] = useState(true);
    const [apiStatsData, setApiStatsData] = useState([]); // Store raw data
    const [projectFilter, setProjectFilter] = useState('active'); // active | deleted
    const [userMonthFilter, setUserMonthFilter] = useState('all'); // all | specific month

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Simulate slight delay for animation effect
                await new Promise(resolve => setTimeout(resolve, 800));

                const response = await api.get('/admin/stats');
                // Backend returns { stats: [...], charts: {...} }
                const { stats: apiStats, charts } = response.data;

                setApiStatsData(apiStats || []);
                setChartsData(charts || { categoryData: [], growthData: [], requestStatusData: [] });

                // Initial load - map API stats to UI stats
                // API Stats: [{ label: 'Total Users', value: ... }, ...]
                // UI Stats: [{ title: 'Total Users', value: ... }]
                updateDashboardStats(apiStats || [], 'active');

            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Toggle Project Stats
    const updateDashboardStats = (data, filter) => {
        if (!data || data.length === 0) return;

        const getStat = (label) => data.find(s => s.label === label) || { value: 0, change: '0' };

        const activeProj = getStat('Active Projects');
        const deletedProj = getStat('Deleted Projects');
        const targetProjExp = filter === 'active' ? activeProj : deletedProj;

        setStats([
            {
                title: 'Total Users',
                value: getStat('Total Users').value.toString(),
                icon: <Users size={24} />,
                trend: getStat('Total Users').change,
                color: '#3b82f6',
                static: true
            },
            {
                title: filter === 'active' ? 'Active Projects' : 'Deleted Projects',
                value: targetProjExp.value.toString(),
                icon: filter === 'active' ? <Activity size={24} /> : <Trash2 size={24} />,
                trend: targetProjExp.change,
                color: filter === 'active' ? '#10b981' : '#ef4444',
                clickable: true,
                filterType: filter
            },
            {
                title: 'Pending Requests',
                value: getStat('Pending Requests').value.toString(),
                icon: <FileQuestion size={24} />,
                trend: getStat('Pending Requests').change,
                color: '#f59e0b',
                static: true
            },
            {
                title: 'Total Projects',
                value: getStat('Total Projects').value.toString(),
                icon: <Folder size={24} />,
                trend: getStat('Total Projects').change,
                color: '#a855f7',
                static: true
            },
        ]);
        setProjectFilter(filter);
    };

    const handleStatClick = (stat) => {
        if (stat.clickable) {
            const newFilter = projectFilter === 'active' ? 'deleted' : 'active';
            updateDashboardStats(apiStatsData, newFilter);
        }
    };

    // Filter User Growth Data
    const getFilteredGrowthData = () => {
        if (userMonthFilter === 'all') return chartsData.growthData;
        return chartsData.growthData.filter(d => d.month === userMonthFilter);
    };

    // Colors for charts
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

    // Helper to convert hex to rgba
    const hexToRgba = (hex, alpha) => {
        let r = 0, g = 0, b = 0;
        // 3 digits
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        }
        // 6 digits
        else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="dashboard-container">

            {/* Header */}
            <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard Overview</h1>
                <p className="dashboard-subtitle">Welcome back, Admin. Real-time insights at your fingertips.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`glass-card ${stat.clickable ? 'clickable-card' : ''}`}
                        style={{ '--card-color': stat.color, '--card-glow': stat.color }}
                        onClick={() => handleStatClick(stat)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div className="stat-icon-wrapper" style={{ background: hexToRgba(stat.color, 0.2), color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-trend" style={{
                                color: (stat.trend || '').startsWith('+') ? '#4ade80' : '#f87171',
                                background: (stat.trend || '').startsWith('+') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)'
                            }}>
                                {(stat.trend || '').startsWith('+') ? <TrendingUp size={14} /> : <Zap size={14} />}
                                {stat.trend || '0'}
                            </div>
                        </div>
                        <div>
                            <h3 className="stat-value">{stat.value}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>{stat.title}</p>
                                {stat.clickable && (
                                    <span style={{ fontSize: '0.75rem', color: stat.color, border: `1px solid ${stat.color}`, padding: '2px 6px', borderRadius: '4px', opacity: 0.8 }}>
                                        {projectFilter === 'active' ? 'Show Deleted' : 'Show Active'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions (Management Sections) */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 className="chart-title">Quick Actions</h3>
                <div className="stats-grid">
                    <ManagementCard
                        title="Users Management"
                        description="View profiles, manage roles, and ban users."
                        icon={<Users size={28} />}
                        color="#3b82f6"
                        link="/admin/users"
                    />
                    <ManagementCard
                        title="Projects Management"
                        description="Oversee project lifecycle and content."
                        icon={<Folder size={28} />}
                        color="#a855f7"
                        link="/admin/projects"
                    />
                    <ManagementCard
                        title="Join Requests"
                        description="Review and approve talent applications."
                        icon={<FileQuestion size={28} />}
                        color="#f59e0b"
                        link="/admin/requests"
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">

                {/* Projects by Category (Bar Chart) */}
                <div className="glass-card">
                    <h3 className="chart-title">Projects by Category</h3>
                    <div className="chart-container">
                        <ResponsiveContainer>
                            <BarChart data={chartsData.categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500}>
                                    {chartsData.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#a855f7', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'][index % 6]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth (Area Chart) */}
                <div className="glass-card">
                    <div className="chart-title">
                        <h3>User Growth</h3>
                        <select
                            value={userMonthFilter}
                            onChange={(e) => setUserMonthFilter(e.target.value)}
                            style={{
                                background: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                outline: 'none',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="all">All Months</option>
                            {chartsData.growthData.map(d => (
                                <option key={d.month} value={d.month}>{d.month}</option>
                            ))}
                        </select>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer>
                            <AreaChart data={getFilteredGrowthData()}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Bottom Requests */}
            <div className="bottom-grid glass-card">
                <div>
                    <h3 className="chart-title">Join Request Stats</h3>
                    <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        Monitoring acceptance rates helps optimize the talent matching integration.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {chartsData.requestStatusData.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{item.name}: <strong>{item.value}</strong></span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ height: '300px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartsData.requestStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartsData.requestStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

// Sub-components
const ManagementCard = ({ title, description, icon, color, link }) => (
    <div
        className="glass-card action-card clickable-card"
        style={{ '--card-color': color, '--card-glow': color }}
        onClick={() => window.location.href = link}
    >
        <div className="action-icon" style={{ background: `${color}33`, color: color }}>
            {icon}
        </div>
        <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '600' }}>{title}</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{description}</p>
        </div>
        <div style={{ marginLeft: 'auto', color: color, opacity: 0.5 }}>
            <ChevronRight size={24} />
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '12px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
                <p style={{ margin: '0 0 5px', color: '#cbd5e1', fontWeight: '600' }}>{label || payload[0].name}</p>
                <p style={{ margin: 0, color: payload[0].fill || payload[0].stroke, fontWeight: 'bold' }}>
                    {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const DashboardSkeleton = () => (
    <div className="dashboard-container">
        <div className="dashboard-header">
            <div className="skeleton" style={{ width: '300px', height: '40px', marginBottom: '10px' }}></div>
            <div className="skeleton" style={{ width: '400px', height: '20px' }}></div>
        </div>
        <div className="stats-grid">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-card" style={{ height: '180px' }}>
                    <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '12px', marginBottom: '20px' }}></div>
                    <div className="skeleton" style={{ width: '100px', height: '40px', marginBottom: '10px' }}></div>
                    <div className="skeleton" style={{ width: '150px', height: '20px' }}></div>
                </div>
            ))}
        </div>
        <div className="charts-grid">
            <div className="glass-card" style={{ height: '400px' }}><div className="skeleton" style={{ width: '100%', height: '100%' }}></div></div>
            <div className="glass-card" style={{ height: '400px' }}><div className="skeleton" style={{ width: '100%', height: '100%' }}></div></div>
        </div>
    </div>
);

export default AdminDashboard;
