import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface NewWorksheetFilterProps {
  categories: { [subject: string]: string[] };
  difficulties: string[];
  selectedSubject: string | null;
  selectedGrade: string | null;
  selectedDifficulty: string | null;
  onSubjectSelect: (subject: string | null) => void;
  onGradeSelect: (grade: string | null) => void;
  onDifficultySelect: (difficulty: string | null) => void;
  onClearFilters: () => void;
}

const NewWorksheetFilter: React.FC<NewWorksheetFilterProps> = ({ 
  categories,
  difficulties,
  selectedSubject,
  selectedGrade,
  selectedDifficulty,
  onSubjectSelect,
  onGradeSelect,
  onDifficultySelect,
  onClearFilters
}) => {

  const handleSubjectClick = (subject: string) => {
    onSubjectSelect(subject === selectedSubject ? null : subject);
  };

  const handleGradeClick = (grade: string) => {
    onGradeSelect(grade === selectedGrade ? null : grade);
  };

  const handleDifficultyClick = (difficulty: string) => {
    onDifficultySelect(difficulty === selectedDifficulty ? null : difficulty);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button 
          onClick={onClearFilters}
          className="text-sm text-orange-600 hover:text-orange-800 font-medium"
        >
          Clear All
        </button>
      </div>

      <Accordion type="multiple" defaultValue={['subject', 'difficulty']} className="w-full">
        {/* Subject Filter */}
        <AccordionItem value="subject">
          <AccordionTrigger className="text-base font-semibold">Subject</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {Object.keys(categories).sort().map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectClick(subject)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedSubject === subject
                      ? 'bg-orange-100 text-orange-700 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Grade Filter */}
        <AccordionItem value="grade" disabled={!selectedSubject}>
          <AccordionTrigger className="text-base font-semibold">Grade</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {(selectedSubject && categories[selectedSubject] ? categories[selectedSubject].sort() : []).map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeClick(grade)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedGrade === grade
                      ? 'bg-orange-100 text-orange-700 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Difficulty Filter */}
        <AccordionItem value="difficulty">
          <AccordionTrigger className="text-base font-semibold">Difficulty</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => handleDifficultyClick(difficulty)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm capitalize transition-colors ${
                    selectedDifficulty === difficulty
                      ? 'bg-orange-100 text-orange-700 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default NewWorksheetFilter;
