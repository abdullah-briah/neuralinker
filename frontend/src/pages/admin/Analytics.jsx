import React, { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import api from '../../api/axios';
import { Users, CheckCircle, XCircle, FileText, Activity, AlertCircle } from 'lucide-react';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading analytics...</div>;
    if (!stats) return <div style={{ padding: '2rem', color: '#ef4444' }}>Failed to load data.</div>;

    const { charts, stats: kpis } = stats;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    const VERIFICATION_COLORS = ['#22c55e', '#ef4444']; // Green for Verified, Red for Unverified
    const ROLE_COLORS = ['#a855f7', '#3b82f6']; // Purple for Admin, Blue for User

    return (
        <div style={{ padding: '2rem', color: 'white', maxWidth: '1600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: '800' }}>Analytics Dashboard</h1>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {kpis.map((kpi, index) => (
                    <div key={index} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>{kpi.label}</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700' }}>{kpi.value}</div>
                        <div style={{ fontSize: '0.85rem', color: kpi.change.includes('+') ? '#22c55e' : '#94a3b8', marginTop: '4px' }}>
                            {kpi.change !== '0' && kpi.change !== '+0%' ? kpi.change : 'Stable'}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>

                {/* 1. User Verification Status */}
                <ChartCard title="User Verification Status">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={charts.userVerificationData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {charts.userVerificationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={VERIFICATION_COLORS[index % VERIFICATION_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: 'white' }} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>



                {/* 3. Projects by Category */}
                <ChartCard title="Projects by Category">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={charts.categoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: 'white' }} />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* 4. Join Request Status */}
                <ChartCard title="Join Request Status">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={charts.requestStatusData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                            <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: 'white' }} />
                            <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* 5. Project Status: Active vs Deleted */}
                <ChartCard title="Project Status (Active vs Deleted)">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={charts.projectStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                <Cell key="cell-active" fill="#10b981" />
                                <Cell key="cell-deleted" fill="#ef4444" />
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: 'white' }} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* 6. User Growth (Line Chart) */}
                <ChartCard title="User Growth (Last 12 Months)" fullWidth>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={charts.growthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: 'white' }} />
                            <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

const ChartCard = ({ title, children, fullWidth }) => (
    <div style={{
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '1.5rem',
        gridColumn: fullWidth ? '1 / -1' : 'auto'
    }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0' }}>{title}</h3>
        {children}
    </div>
);

export default Analytics;
