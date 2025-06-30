import React, { useState, useEffect } from 'react';

interface WorksheetSidebarProps {
  categories: { [subject: string]: string[] };
  onSubjectSelect: (subject: string) => void;
  onGradeSelect: (grade: string) => void;
  selectedSubject: string | null;
  selectedGrade: string | null;
}

const WorksheetSidebar: React.FC<WorksheetSidebarProps> = ({
  categories,
  onSubjectSelect,
  onGradeSelect,
  selectedSubject,
  selectedGrade,
}) => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(selectedSubject);

  useEffect(() => {
    setExpandedSubject(selectedSubject);
  }, [selectedSubject]);

  const handleSubjectClick = (subject: string) => {
    const newExpandedSubject = expandedSubject === subject ? null : subject;
    setExpandedSubject(newExpandedSubject);
    onSubjectSelect(newExpandedSubject || ''); // Select subject, or clear if collapsing
  };

  const handleGradeClick = (grade: string) => {
    onGradeSelect(grade);
  };

  const subjects = Object.keys(categories).sort();

  return (
    <div className="w-64 bg-gray-900 text-white p-4 rounded-lg shadow-lg">
      <h3 className="font-bold text-xl mb-4 text-orange-500 border-b border-gray-700 pb-2">Subjects</h3>
      <ul>
        {subjects.map((subject) => (
          <li key={subject} className="mb-1">
            <button
              onClick={() => handleSubjectClick(subject)}
              className={`w-full text-left py-2 px-3 rounded transition-colors duration-200 flex justify-between items-center ${
                selectedSubject === subject ? 'bg-orange-500 text-white' : 'hover:bg-gray-700'
              }`}
            >
              <span className="font-semibold">{subject}</span>
              <span>{expandedSubject === subject ? '▲' : '▼'}</span>
            </button>
            {expandedSubject === subject && (
              <ul className="ml-4 mt-2 border-l-2 border-gray-700 pl-4">
                {categories[subject].sort().map((grade) => (
                  <li key={grade} className="mb-1">
                    <button
                      onClick={() => handleGradeClick(grade)}
                      className={`w-full text-left py-1 px-2 rounded transition-colors duration-200 ${
                        selectedGrade === grade ? 'text-orange-400 font-bold' : 'hover:text-orange-400'
                      }`}
                    >
                      {grade}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorksheetSidebar;
