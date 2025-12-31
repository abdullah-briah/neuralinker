import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // كلمة مرور واحدة مشفّرة لكل المستخدمين (للاختبار)
    const password = await bcrypt.hash('12345678', 10);

    const users = [
        {
            name: 'Ahmed Hassan',
            email: 'ahmed.hassan@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=12',
            title: 'Full Stack Software Engineer',
            bio: 'Full Stack Developer with experience in scalable web applications.',
            skills: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'PostgreSQL']
        },
        {
            name: 'Sara Ali',
            email: 'sara.ali@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=32',
            title: 'Data Analyst',
            bio: 'Data Analyst focused on dashboards and business insights.',
            skills: ['SQL', 'Excel', 'Power BI', 'Python', 'Data Visualization']
        },
        {
            name: 'Mohamed Youssef',
            email: 'mohamed.youssef@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=mohamed',
            title: 'Data Scientist',
            bio: 'Data Scientist working with machine learning models.',
            skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Machine Learning']
        },
        {
            name: 'Lina Karim',
            email: 'lina.karim@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/adventurer/png?seed=lina',
            title: 'AI Engineer',
            bio: 'AI Engineer building deep learning and NLP solutions.',
            skills: ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP']
        },
        {
            name: 'Omar Fathy',
            email: 'omar.fathy@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/personas/png?seed=omar',
            title: 'Backend Engineer',
            bio: 'Backend engineer specialized in APIs and databases.',
            skills: ['Node.js', 'NestJS', 'Prisma', 'PostgreSQL', 'Docker']
        },
        {
            name: 'Youssef Adel',
            email: 'youssef.adel@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=14',
            title: 'Machine Learning Engineer',
            bio: 'ML Engineer deploying predictive models to production.',
            skills: ['Python', 'Scikit-learn', 'ML Pipelines', 'Model Deployment']
        },
        {
            name: 'Mariam Said',
            email: 'mariam.said@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=47',
            title: 'Business Intelligence Analyst',
            bio: 'BI Analyst creating data-driven dashboards.',
            skills: ['Power BI', 'SQL', 'ETL', 'Data Modeling']
        },
        {
            name: 'Khaled Nasser',
            email: 'khaled.nasser@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=khaled',
            title: 'Frontend Developer',
            bio: 'Frontend developer with focus on UX and performance.',
            skills: ['React', 'Next.js', 'Tailwind', 'JavaScript']
        },
        {
            name: 'Nada Ibrahim',
            email: 'nada.ibrahim@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=56',
            title: 'AI Research Assistant',
            bio: 'Research assistant working on AI experiments.',
            skills: ['Python', 'AI Models', 'Data Cleaning', 'Research']
        },
        {
            name: 'Hassan Mahmoud',
            email: 'hassan.mahmoud@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/adventurer/png?seed=hassan',
            title: 'DevOps Engineer',
            bio: 'DevOps engineer automating deployments.',
            skills: ['Docker', 'CI/CD', 'Linux', 'Cloud']
        },
        {
            name: 'Salma Tarek',
            email: 'salma.tarek@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=68',
            title: 'Data Engineer',
            bio: 'Data Engineer building ETL pipelines.',
            skills: ['Python', 'Airflow', 'ETL', 'Big Data']
        },
        {
            name: 'Mostafa Amin',
            email: 'mostafa.amin@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/personas/png?seed=mostafa',
            title: 'Software Engineer',
            bio: 'Software engineer with strong backend skills.',
            skills: ['Java', 'Spring', 'APIs', 'Databases']
        },
        {
            name: 'Rana Fawzy',
            email: 'rana.fawzy@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=71',
            title: 'AI Product Analyst',
            bio: 'Analyzing AI-powered product performance.',
            skills: ['Analytics', 'AI Metrics', 'SQL', 'Reporting']
        },
        {
            name: 'Adel Samir',
            email: 'adel.samir@example.com',
            avatarUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=adel',
            title: 'Cloud Engineer',
            bio: 'Cloud engineer managing scalable systems.',
            skills: ['AWS', 'Cloud Architecture', 'Security']
        },
        {
            name: 'Dina Hossam',
            email: 'dina.hossam@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=24',
            title: 'Junior Data Scientist',
            bio: 'Junior Data Scientist learning ML and analytics.',
            skills: ['Python', 'Statistics', 'Data Analysis']
        }
    ];

    await prisma.user.createMany({
        data: users.map(user => ({
            ...user,
            password
        })),
        skipDuplicates: true
    });

    console.log('✅ 15 Mock users seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
