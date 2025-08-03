import React, { useState } from 'react';
import { worksheetGeneratorService, WorksheetGenerationParams } from '@/services/worksheet.generator.service';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';

const WorksheetGeneratorPage: React.FC = () => {
  const [formData, setFormData] = useState<WorksheetGenerationParams>({
    grade: '',
    subject: '',
    topic: '',
    customTopic: '',
    summary: '',
    numOfQuestions: 5,
    includeImages: false,
    generateAnswerKey: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [answerKeyUrl, setAnswerKeyUrl] = useState<string | null>(null);
  const [worksheetPreviewUrl, setWorksheetPreviewUrl] = useState<string | null>(null);
  const [answerKeyPreviewUrl, setAnswerKeyPreviewUrl] = useState<string | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'worksheet' | 'answerkey'>('worksheet');
  const [showInstructions, setShowInstructions] = useState(false);

  // Subject-specific topic options
  const topicOptions = {
    Math: [
      'Addition',
      'Subtraction', 
      'Numbers and Counting',
      'Patterns',
      'Place Value',
      'Mixed Operations',
      'Fractions',
      'Time and Money',
      'Geometry',
      'Measurement',
      'Data and Graphing',
      'Math Puzzles',
      'Create your own topic'
    ],
    English: [
      'Alphabet',
      'Handwriting',
      'Phonics',
      'Reading Comprehension',
      'Vocabulary',
      'Grammar',
      'Writing',
      'Spelling',
      'Poetry',
      'Story Elements',
      'Create your own topic'
    ],
    Science: [
      'Animals',
      'Plants',
      'Weather',
      'Space',
      'Human Body',
      'Matter',
      'Energy',
      'Earth Science',
      'Life Cycles',
      'Simple Machines',
      'Create your own topic'
    ]
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset topic when subject changes
    if (name === 'subject') {
      setFormData(prev => ({ ...prev, topic: '', customTopic: '' }));
    }
    
    // Reset custom topic when topic changes
    if (name === 'topic' && value !== 'Create your own topic') {
      setFormData(prev => ({ ...prev, customTopic: '' }));
    }
  };

  const handleCheckboxChange = (name: string, checked: CheckedState) => {
    setFormData(prev => ({ ...prev, [name]: checked === true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.grade || !formData.subject || !formData.topic) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (formData.topic === 'Create your own topic' && (!formData.customTopic || !formData.customTopic.trim())) {
      setError('Please enter a custom topic.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await worksheetGeneratorService.generateWorksheet(formData);
      setDownloadUrl(response.downloadUrl || null);
      setAnswerKeyUrl(response.answerKeyUrl || null);
      setWorksheetPreviewUrl(response.worksheetPreviewUrl || null);
      setAnswerKeyPreviewUrl(response.answerKeyPreviewUrl || null);
      setActivePreviewTab('worksheet');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the worksheet.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTopics = () => {
    if (!formData.subject || !(formData.subject in topicOptions)) {
      return [];
    }
    return topicOptions[formData.subject as keyof typeof topicOptions];
  };

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  return (
    <AdminLayout>
      {/* Compact Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent mb-1">
              AI Worksheet Generator
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Create professional, customized worksheets with AI-powered questions and images.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-full mx-auto">

          {/* Main Layout: Form on Left, Preview on Right */}
          <div className="flex flex-row gap-6 xl:gap-8">
            
            {/* Left Column: Form */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                <h2 className="text-xl font-bold text-white mb-1">Create Your Worksheet</h2>
                <p className="text-sm text-orange-100">
                  Customize every detail to match your teaching needs
                </p>
              </div>
              
              {/* Form Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Ready to generate</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowInstructions(true)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help & Tips
                  </button>
                </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Grade and Subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-semibold text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Grade Level
                    </Label>
                    <Select name="grade" onValueChange={(value: string) => handleSelectChange('grade', value)} defaultValue={formData.grade}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                        <SelectValue placeholder="Choose grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(5)].map((_, i) => (
                          <SelectItem key={i + 1} value={`${i + 1}`} className="py-3">
                            <div className="flex items-center">
                              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                                {i + 1}
                              </span>
                              Grade {i + 1}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-semibold text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      Subject Area
                    </Label>
                    <Select name="subject" onValueChange={(value: string) => handleSelectChange('subject', value)} defaultValue={formData.subject}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                        <SelectValue placeholder="Choose subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Math" className="py-3">
                          <div className="flex items-center">
                            <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                              ∑
                            </span>
                            Mathematics
                          </div>
                        </SelectItem>
                        <SelectItem value="Science" className="py-3">
                          <div className="flex items-center">
                            <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                              🔬
                            </span>
                            Science
                          </div>
                        </SelectItem>
                        <SelectItem value="English" className="py-3">
                          <div className="flex items-center">
                            <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                              📝
                            </span>
                            English
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Topic */}
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-sm font-semibold text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Topic Selection
                  </Label>
                  <Select 
                    name="topic" 
                    onValueChange={(value: string) => handleSelectChange('topic', value)} 
                    value={formData.topic}
                    disabled={!formData.subject}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400">
                      <SelectValue placeholder={formData.subject ? "Choose a topic" : "Select a subject first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getCurrentTopics().map((topic) => (
                        <SelectItem key={topic} value={topic} className="py-2">
                          <div className="flex items-center">
                            {topic === 'Create your own topic' ? (
                              <>
                                <span className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                  +
                                </span>
                                <span className="font-medium text-purple-600">{topic}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                                {topic}
                              </>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Topic Input */}
                {formData.topic === 'Create your own topic' && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-dashed border-pink-200 rounded-xl p-6 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <Label htmlFor="customTopic" className="text-sm font-semibold text-purple-700">
                        Create Your Custom Topic
                      </Label>
                    </div>
                    <Input
                      type="text"
                      id="customTopic"
                      name="customTopic"
                      value={formData.customTopic}
                      onChange={handleInputChange}
                      placeholder="e.g., 'Weather Patterns', 'Basic Fractions', 'Story Elements'"
                      className="h-12 border-2 border-pink-200 focus:border-purple-400 bg-white/70"
                    />
                    <p className="text-xs text-purple-600">
                      💡 Be specific but not too narrow. Match the complexity to your selected grade level.
                    </p>
                  </div>
                )}

                {/* Summary */}
                <div className="space-y-3">
                  <Label htmlFor="summary" className="text-sm font-semibold text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Learning Instructions
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">Optional</span>
                  </Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    placeholder="Provide specific instructions for the AI. Example: 'Focus on basic addition with numbers 1-10, include word problems about animals'"
                    rows={4}
                    className="border-2 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    💡 The more specific your instructions, the better the AI can tailor the questions to your needs.
                  </p>
                </div>

                {/* Question Count Section */}
                <div className="space-y-2">
                  <Label htmlFor="numOfQuestions" className="text-sm font-semibold text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Question Count
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      id="numOfQuestions"
                      name="numOfQuestions"
                      value={formData.numOfQuestions}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="h-12 border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors pl-4 pr-16"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      questions
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Recommended: 5-10 questions for optimal results</p>
                </div>

                {/* Worksheet Settings Section */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Worksheet Settings
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-100 hover:border-purple-200 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <Label htmlFor="includeImages" className="text-sm font-semibold text-gray-800">Include AI Images</Label>
                          <p className="text-xs text-gray-500">Generate educational images for each question</p>
                        </div>
                      </div>
                      <Checkbox
                        id="includeImages"
                        checked={formData.includeImages}
                        onCheckedChange={(checked) => handleCheckboxChange('includeImages', checked)}
                        className="w-5 h-5"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-100 hover:border-green-200 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <Label htmlFor="generateAnswerKey" className="text-sm font-semibold text-gray-800">Generate Answer Key</Label>
                          <p className="text-xs text-gray-500">Create a separate PDF with correct answers</p>
                        </div>
                      </div>
                      <Checkbox
                        id="generateAnswerKey"
                        checked={formData.generateAnswerKey}
                        onCheckedChange={(checked) => handleCheckboxChange('generateAnswerKey', checked)}
                        className="w-5 h-5"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Generate Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-3">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Creating Your Worksheet...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate Worksheet</span>
                      </div>
                    )}
                  </Button>
                </div>
                
                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}
              </form>
            </div>
            {/* Right Column: Preview Panel */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                <h2 className="text-xl font-bold text-white mb-1">Worksheet Preview</h2>
                <p className="text-sm text-gray-300">
                  Your generated worksheet will appear here
                </p>
              </div>
              
              {/* Preview Content */}
              <div className="p-6">
                {!downloadUrl ? (
                  /* Empty State */
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No worksheet generated</h3>
                    <p className="mt-1 text-sm text-gray-500">Fill out the form and click Create to generate your worksheet.</p>
                  </div>
                ) : (
                  /* Preview with Tabs */
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 bg-gray-50">
                      <nav className="-mb-px flex" aria-label="Tabs">
                        <button
                          onClick={() => setActivePreviewTab('worksheet')}
                          className={`py-3 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                            activePreviewTab === 'worksheet'
                              ? 'border-green-500 text-green-600 bg-white'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          WORKSHEET
                        </button>
                        {answerKeyUrl && (
                          <button
                            onClick={() => setActivePreviewTab('answerkey')}
                            className={`py-3 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                              activePreviewTab === 'answerkey'
                                ? 'border-blue-500 text-blue-600 bg-white'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            ANSWER KEY
                          </button>
                        )}
                      </nav>
                    </div>

                    {/* Preview Content */}
                    <div className="p-4">
                      {activePreviewTab === 'worksheet' && (
                        <div className="space-y-4">
                          {/* PDF Preview */}
                          <div className="bg-gray-100 rounded-lg overflow-hidden">
                            <embed
                              src={`${backendUrl}${worksheetPreviewUrl || downloadUrl}`}
                              type="application/pdf"
                              width="100%"
                              height="400"
                              className="border-0"
                            />
                          </div>
                        </div>
                      )}

                      {activePreviewTab === 'answerkey' && answerKeyUrl && (
                        <div className="space-y-4">
                          {/* PDF Preview */}
                          <div className="bg-gray-100 rounded-lg overflow-hidden">
                            <embed
                              src={`${backendUrl}${answerKeyPreviewUrl || answerKeyUrl}`}
                              type="application/pdf"
                              width="100%"
                              height="400"
                              className="border-0"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                      <div className="flex space-x-3">
                        {activePreviewTab === 'worksheet' && (
                          <a
                            href={`${backendUrl}${downloadUrl}`}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                          >
                            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Worksheet
                          </a>
                        )}

                        {activePreviewTab === 'answerkey' && answerKeyUrl && (
                          <a
                            href={`${backendUrl}${answerKeyUrl}`}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Answer Key
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowInstructions(false)}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">📚 Worksheet Generator Instructions</h3>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6 text-gray-700">
                {/* Quick Start */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">🚀 Quick Start</h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Select <strong>Grade</strong> and <strong>Subject</strong></li>
                    <li>Choose a <strong>Topic</strong> from the dropdown or create your own</li>
                    <li>Optionally add a <strong>Summary</strong> with specific instructions</li>
                    <li>Set number of questions and enable images if needed</li>
                    <li>Click <strong>Generate Worksheet</strong> and wait for AI to create your content!</li>
                  </ol>
                </div>

                {/* Summary Field Tips */}
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                  <h4 className="text-lg font-semibold text-green-800 mb-3">💡 Summary Field Tips</h4>
                  <p className="text-green-700 mb-3">
                    The Summary field helps you provide specific instructions to the AI for generating better questions.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-green-800">✅ Good Examples:</h5>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-green-700 ml-4">
                        <li>"Focus on basic addition with numbers 1-10, include word problems"</li>
                        <li>"Cover plant parts: roots, stems, leaves, flowers. Include functions of each part"</li>
                        <li>"Practice reading comprehension with short stories about animals"</li>
                        <li>"Include questions about photosynthesis process and what plants need to grow"</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-800">❌ Avoid:</h5>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-green-700 ml-4">
                        <li>Vague instructions like "make it good" or "easy questions"</li>
                        <li>Very long paragraphs (keep it concise)</li>
                        <li>Contradictory requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Create Your Own Topic */}
                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3">🎯 "Create Your Own Topic" Guide</h4>
                  <p className="text-purple-700 mb-3">
                    When you select "Create your own topic", you can specify any custom topic not in the predefined list.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-purple-800">✅ Good Custom Topics:</h5>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-purple-700 ml-4">
                        <li><strong>Math:</strong> "Skip Counting by 2s and 5s", "Comparing Numbers", "Basic Multiplication Tables"</li>
                        <li><strong>Science:</strong> "Weather Patterns", "Animal Habitats", "States of Matter"</li>
                        <li><strong>English:</strong> "Rhyming Words", "Sentence Structure", "Story Sequencing"</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-purple-800">💡 Pro Tips:</h5>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-purple-700 ml-4">
                        <li>Be specific but not too narrow (e.g., "Addition" vs "Adding 2+3")</li>
                        <li>Match the complexity to the selected grade level</li>
                        <li>Use the Summary field to provide additional context</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Additional Features */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-3">⚡ Additional Features</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-yellow-800">🖼️ Include Images</h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        AI will generate simple, educational images related to each question. Great for visual learners!
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-yellow-800">📋 Answer Key</h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        Automatically generates a separate answer key PDF with correct answers highlighted.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-yellow-800">📊 Question Count</h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        Choose 5-20 questions. More questions = longer generation time but more practice material.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-yellow-800">📱 Preview & Download</h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        Preview your worksheet before downloading. Both worksheet and answer key are available.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">🏆 Best Practices</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Start with fewer questions (5-10) to test the output quality</li>
                    <li>Use the Summary field to specify difficulty level or focus areas</li>
                    <li>Enable images for subjects like Science and Math for better engagement</li>
                    <li>Always generate an answer key for easy grading</li>
                    <li>Preview before downloading to ensure content meets your needs</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Got it, let's create!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default WorksheetGeneratorPage;
