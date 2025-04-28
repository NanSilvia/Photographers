import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import usePhotographerStore from '../stores/PhotographerStore';
import { Box, Typography } from '@mui/material';

const Charts = () => {
    const { photographers } = usePhotographerStore();
    const [aliveDeadData, setAliveDeadData] = useState<{ name: string; value: number }[]>([]);
    const [youngPhotographersData, setYoungPhotographersData] = useState<{ name: string; value: number }[]>([]);
    const [diedMoreThan5YearsAgoData, setDiedMoreThan5YearsAgoData] = useState<{ name: string; value: number }[]>([]);

    // Function to calculate alive + dead photographers
    const calculateAliveDeadRatio = () => {
        const alive = photographers.filter((p) => p.death === null).length;
        const dead = photographers.filter((p) => p.death !== null).length;
        setAliveDeadData([
            { name: 'Alive', value: alive },
            { name: 'Dead', value: dead },
        ]);
    };

    // Function to calculate photographers <= 45 yo
    const calculateYoungPhotographers = () => {
        const now = new Date();
        const young = photographers.filter((p) => {
            const age = now.getFullYear() - p.birth.getFullYear();
            return age < 45;
        }).length;
        const old = photographers.length - young;
        setYoungPhotographersData([
            { name: 'Young (<45)', value: young },
            { name: 'Old (>=45)', value: old },
        ]);
    };

    // Calculate who died more than 5 years ago
    const calculateDiedMoreThan5YearsAgo =() =>{
        const now = new Date();
        const fiveYearsAgo = new Date(now.setFullYear(now.getFullYear() - 5));

        const photogDied = photographers.filter((p) => {
            return p.death && p.death < fiveYearsAgo;
        }).length;

        setDiedMoreThan5YearsAgoData([
            { name: 'Female (Died >5y)', value: photogDied },
            { name: 'Male (Died >5y)', value: photographers.length - photogDied },
        ]);

    }

    // Update charts when photographers data changes
    useEffect(() => {
        calculateAliveDeadRatio();
        calculateYoungPhotographers();
        calculateDiedMoreThan5YearsAgo();
    }, [photographers]);

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                Photographer Metrics
            </Typography>

            {/* Alive vs. Dead Photographers Pie Chart */}
            <Typography variant="h5" gutterBottom>
                Alive vs. Dead Photographers
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={aliveDeadData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {aliveDeadData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            {/* Photographers Younger Than 45 Bar Chart */}
            <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
                Photographers Younger Than 45
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={youngPhotographersData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>

            {/* Photographers Who Died More Than 5 Years Ago Pie Chart */}
            <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
                Photographers Who Died More Than 5 Years Ago
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={diedMoreThan5YearsAgoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {diedMoreThan5YearsAgoData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
           
        </Box>
    );
};

export default Charts;