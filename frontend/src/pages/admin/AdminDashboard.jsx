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
                const response = await api.get('/admin/stats');
                const { stats: apiStats, charts } = response.data;
                setApiStatsData(apiStats); // Save raw for toggling

                // Initial load
                updateProjectStat(apiStats, 'active');

                setChartsData(charts);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Toggle Project Stats
    const updateProjectStat = (data, filter) => {
        const activeProj = data.find(s => s.label === 'Active Projects');
        const deletedProj = data.find(s => s.label === 'Deleted Projects');
        const target = filter === 'active' ? activeProj : deletedProj;

        setStats([
            { title: 'Total Users', value: data[0].value.toString(), icon: <Users size={24} />, trend: data[0].change, color: '#3b82f6', static: true },
            {
                title: filter === 'active' ? 'Active Projects' : 'Deleted Projects',
                value: target.value.toString(),
                icon: filter === 'active' ? <Activity size={24} /> : <Trash2 size={24} />, // Need Trash2 imported
                trend: target.change,
                color: filter === 'active' ? '#10b981' : '#ef4444',
                clickable: true,
                filterType: filter
            },
            { title: 'Pending Requests', value: data[2].value.toString(), icon: <FileQuestion size={24} />, trend: data[2].change, color: '#f59e0b', static: true },
            { title: 'Total Projects', value: data[1].value.toString(), icon: <Folder size={24} />, trend: data[1].change, color: '#a855f7', static: true },
        ]);
        setProjectFilter(filter);
    };

    const handleStatClick = (stat) => {
        if (stat.clickable) {
            const newFilter = projectFilter === 'active' ? 'deleted' : 'active';
            updateProjectStat(apiStatsData, newFilter);
        }
    };

    // Filter User Growth Data
    const getFilteredGrowthData = () => {
        if (userMonthFilter === 'all') return chartsData.growthData;
        return chartsData.growthData.filter(d => d.month === userMonthFilter);
    };

    // Colors for charts
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

    if (loading) {
        return <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
    }

    // Helper to convert hex to rgba for background
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

    return (
        <div style={{
            padding: '2rem',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            maxWidth: '1600px',
            margin: '0 auto'
        }}>

            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        marginBottom: '8px',
                        background: 'linear-gradient(90deg, #fff, #cbd5e1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Dashboard Overview
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>Welcome back, Admin. Here's what's happening today.</p>
                </div>

                {/* Admin Profile - Moved to Navbar */}
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                {stats.map((stat, index) => (
                    <div key={index}
                        style={{
                            background: 'rgba(30, 41, 59, 0.6)',
                            border: stat.clickable ? '1px solid ' + stat.color : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s',
                            cursor: stat.clickable ? 'pointer' : 'default',
                            boxShadow: stat.clickable ? `0 0 15px ${stat.color}33` : 'none'
                        }}
                        onClick={() => handleStatClick(stat)}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            if (stat.clickable) e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            if (stat.clickable) e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{
                                padding: '12px',
                                borderRadius: '14px',
                                background: hexToRgba(stat.color, 0.2),
                                color: stat.color
                            }}>
                                {stat.icon}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.85rem',
                                color: (stat.trend || '').startsWith('+') ? '#4ade80' : '#f87171',
                                fontWeight: '600',
                                background: (stat.trend || '').startsWith('+') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                padding: '4px 8px',
                                borderRadius: '8px'
                            }}>
                                {(stat.trend || '').startsWith('+') ? <TrendingUp size={14} /> : <Zap size={14} />}
                                {stat.trend || '0'}
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 4px 0', color: 'white' }}>{stat.value}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>{stat.title}</p>
                                {stat.clickable && (
                                    <span style={{ fontSize: '0.75rem', color: stat.color, border: `1px solid ${stat.color}`, padding: '2px 6px', borderRadius: '4px' }}>
                                        Click to Toggle
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Management Section */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Management Sections</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    <div
                        onClick={() => window.location.href = '/admin/users'}
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            backdropFilter: 'blur(10px)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#3b82f6';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                    >
                        <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                            <Users size={32} />
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '600' }}>Users Management</h4>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Manage roles, view profiles, and ban users.</p>
                        </div>
                    </div>

                    <div
                        onClick={() => window.location.href = '/admin/projects'}
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            backdropFilter: 'blur(10px)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#a855f7';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                    >
                        <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>
                            <Folder size={32} />
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '600' }}>Projects Management</h4>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Oversee projects, statuses, and history.</p>
                        </div>
                    </div>

                    <div
                        onClick={() => window.location.href = '/admin/requests'}
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            backdropFilter: 'blur(10px)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#f59e0b';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                    >
                        <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                            <FileQuestion size={32} />
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '600' }}>Join Requests</h4>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Accept or reject talent applications.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
            }}>

                {/* Projects by Category (Bar Chart) */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '2rem',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Projects by Category</h3>
                    <div style={{ height: '300px', width: '100%' }}>
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
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                                    itemStyle={{ color: '#cbd5e1' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={40}>
                                    {chartsData.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#a855f7', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'][index % 6]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth (Area Chart) */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '2rem',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>New Users per Month</h3>
                        <select
                            value={userMonthFilter}
                            onChange={(e) => setUserMonthFilter(e.target.value)}
                            style={{
                                background: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">All Months</option>
                            {chartsData.growthData.map(d => (
                                <option key={d.month} value={d.month}>{d.month}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
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
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Bottom Row - Request Status */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '2rem',
                backdropFilter: 'blur(10px)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                alignItems: 'center',
                '@media (max-width: 900px)': {
                    gridTemplateColumns: '1fr'
                }
            }}>
                <div>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>Join Request Stats</h3>
                    <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        Monitoring the acceptance rate of project join requests is crucial for understanding platform liquidity.
                        A high rejection rate might indicate a mismatch between talent supply and project needs.
                    </p>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        {chartsData.requestStatusData.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{item.name}: <strong>{item.value}</strong></span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ height: '250px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width={300} height="100%">
                        <PieChart>
                            <Pie
                                data={chartsData.requestStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartsData.requestStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
