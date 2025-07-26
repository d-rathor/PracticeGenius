import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import WorksheetService from '@/services/worksheet.service';
import { Worksheet } from '@/types/worksheet';
import styles from './Worksheets.module.css';

// Static data for subjects
const subjects: { [key: string]: { name: string; description: string; imageUrl: string } } = {
  Mathematics: {
    name: 'Mathematics',
    description: 'Our free mathematics worksheets offer comprehensive coverage of elementary skills, ranging from numbers and counting to more complex topics like algebra and geometry. Each worksheet is designed to be a printable file, complete with answers provided conveniently on the second page.',
    imageUrl: '/images/General-worksheet.png',
  },
  Science: {
    name: 'Science',
    description: 'Explore the wonders of the natural world with our science worksheets. Covering biology, chemistry, physics, and earth science, these printable worksheets with answers help reinforce key scientific concepts in an engaging way.',
    imageUrl: '/images/General-worksheet.png',
  },
  English: {
    name: 'English',
    description: 'Enhance literacy skills with our English worksheets. From grammar and vocabulary to reading comprehension and writing exercises, our printable worksheets with answers provide a solid foundation for language arts.',
    imageUrl: '/images/General-worksheet.png',
  },
};

const WorksheetsPage = () => {
  const router = useRouter();
  const { subject, grade } = router.query;

  const [allWorksheets, setAllWorksheets] = useState<Worksheet[]>([]);
  const [filteredWorksheets, setFilteredWorksheets] = useState<Worksheet[]>([]);
  const [availableGrades, setAvailableGrades] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect to fetch worksheets when the subject changes
  useEffect(() => {
    const fetchWorksheets = async () => {
      if (!subject) {
        setLoading(false);
        setAllWorksheets([]);
        setAvailableGrades([]);
        return;
      }
      setLoading(true);
      try {
        const filters = { subject: subject as string };
        const response = await WorksheetService.getWorksheets(filters);
        const worksheets = response.data || [];
        setAllWorksheets(worksheets);

        const grades = Array.from(
          new Set(
            worksheets
              .map(ws => {
                const match = ws.grade && ws.grade.match(/\d+/);
                return match ? parseInt(match[0], 10) : null;
              })
              .filter((g): g is number => g !== null && !isNaN(g))
          )
        ).sort((a, b) => a - b);
        setAvailableGrades(grades);
        setError(null);
      } catch (err) {
        setError('Failed to fetch worksheets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorksheets();
  }, [subject]);

  // Effect to filter worksheets when the grade or the list of all worksheets changes
  useEffect(() => {
    if (grade) {
      const numericGrade = parseInt(grade as string, 10);
      if (!isNaN(numericGrade)) {
        const filtered = allWorksheets.filter(ws => {
          const wsGradeMatch = ws.grade && ws.grade.match(/\d+/);
          const wsNumericGrade = wsGradeMatch ? parseInt(wsGradeMatch[0], 10) : null;
          return wsNumericGrade === numericGrade;
        });
        setFilteredWorksheets(filtered);
      } else {
        setFilteredWorksheets(allWorksheets);
      }
    } else {
      setFilteredWorksheets(allWorksheets);
    }
  }, [grade, allWorksheets]);

  const renderSubjectPage = () => {
    const currentSubject = subjects[subject as string];
    if (!currentSubject) {
      return <p>Subject not found.</p>;
    }

    const renderTopicList = () => {
      if (loading) return <p>Loading topics...</p>;
      if (error) return <p className={styles.error}>{error}</p>;
      if (filteredWorksheets.length > 0) {
        return (
          <ul className={styles.worksheetList}>
            {filteredWorksheets.map((worksheet) => (
              <li key={worksheet.id}>
                <Link href={`/worksheets/${worksheet.id}`}>
                  {worksheet.title}
                </Link>
              </li>
            ))}
          </ul>
        );
      }
      if (grade) {
        return <p>No worksheets found for this grade. Try another grade.</p>;
      }
      return <p>Please select a grade to see available worksheets.</p>;
    };

    return (
      <>
        <h1 className={styles.subjectTitle}>{currentSubject.name} Worksheets</h1>
        <p className={styles.subjectDescription}>{currentSubject.description}</p>

        <h2 className={styles.listHeader}>{currentSubject.name} worksheets by grade:</h2>
        <div className={styles.gradeLinksContainer}>
          {availableGrades.length > 0 ? (
            <ul className={styles.gradeList}>
              {availableGrades.map((g) => (
                <li key={g}>
                  <Link href={`/worksheets?subject=${subject}&grade=${g}`}>
                    Grade {g}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            !loading && <p>No grades available for this subject.</p>
          )}
        </div>

        <h2 className={styles.listHeader}>{currentSubject.name} worksheets by topic:</h2>
        {renderTopicList()}

        <div className={styles.worksheetImageContainer}>
          <Image 
            src="/images/General-worksheet.png" 
            alt="Sample Worksheet"
            width={700}
            height={500}
            style={{ width: '100%', height: 'auto' }}
            priority
          />
        </div>
      </>
    );
  };

  const renderMainPage = () => (
    <>
      <h1 className={styles.mainTitle}>Free Printable Worksheets</h1>
      <p className={styles.mainDescription}>
        Explore our collection of free printable worksheets for kids. We cover a range of subjects to help children learn and practice key skills in a fun and engaging way.
      </p>
      <div className={styles.subjectGrid}>
        {Object.values(subjects).map((s) => (
          <div key={s.name} className={styles.subjectCard}>
            <Link href={`/worksheets?subject=${s.name}`} legacyBehavior>
              <a>
                <Image src={s.imageUrl} alt={`${s.name} icon`} width={100} height={100} />
                <h2 className={styles.subjectName}>{s.name}</h2>
                <p className={styles.subjectCardDescription}>{s.description.substring(0, 120)}...</p>
              </a>
            </Link>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <MainLayout>
      <div className={styles.container}>
        {subject ? renderSubjectPage() : renderMainPage()}
      </div>
    </MainLayout>
  );
};

export default WorksheetsPage;
