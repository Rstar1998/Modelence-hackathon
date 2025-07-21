import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { modelenceMutation } from '@modelence/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Clipboard, Wand2, ChevronDown } from 'lucide-react';

// --- Sample Data Constants ---
const sampleResume = `
John Doe
Data Analyst

Summary
Detail-oriented Data Analyst with 3 years of experience in interpreting and analyzing data to drive successful business solutions. Proficient in Tableau, SQL, and Python. Proven track record of reducing report generation time by 40% through automation. Experienced in A/B testing and predictive modeling.

Experience
Data Analyst | Tech Solutions Inc. | 2022 - Present
- Developed and maintained automated dashboards using Tableau and SQL.
- Used Python (pandas, scikit-learn) to build predictive models for customer churn.
- Implemented clustering techniques to optimize marketing campaign ROI.

Skills
- Data Visualization: Tableau, Power BI
- Databases: SQL, PostgreSQL
- Programming: Python
- Techniques: A/B Testing, Predictive Modeling, Clustering
`;

const sampleJobDescription = `
Data Analyst
Creative Corp.

Job Description
We are seeking a highly motivated Data Analyst to join our team. The ideal candidate will have a passion for data and a talent for turning complex findings into actionable insights. You will work closely with various teams to support their data needs and drive decision-making.

Responsibilities
- Design and execute A/B tests to optimize product features.
- Build and maintain dashboards for key performance indicators.
- Translate complex data into clear presentations for non-technical stakeholders.
- Collaborate with marketing and product teams to analyze user behavior.

Qualifications
- 2+ years of experience in a data analyst role.
- Strong proficiency in SQL and data visualization tools like Tableau.
- Experience with statistical programming in Python or R.
- Excellent communication and presentation skills.
`;

// --- Type Definition (Updated) ---
type GenerationResult = {
  _id: string;
  generatedQuestions: {
    questionText: string;
    category: string;
    rationale: string;
    expectedAnswer: string; // Added field
  }[];
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};


export default function QuestionGeneratorPage() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null); // State for accordion

  const { mutate: generateQuestions, isPending, error } = useMutation({
    ...modelenceMutation('questionGenerator.generate'),
    onSuccess: (data) => {
      setResult(data as GenerationResult);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume.trim() || !jobDescription.trim()) return;
    setResult(null); // Clear previous results
    setSelectedQuestionIndex(null); // Reset accordion
    generateQuestions({ resume, jobDescription });
  };
  
  const handlePasteSampleData = () => {
    setResume(sampleResume);
    setJobDescription(sampleJobDescription);
  };

  // Handler to toggle the accordion
  const handleQuestionClick = (index: number) => {
    setSelectedQuestionIndex(prevIndex => prevIndex === index ? null : index);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}></div>
        </div>
        <motion.div 
          className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-sans"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <header className="text-center mb-10">
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
              AI Interview Question Generator
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-gray-500">
              Generate tailored questions from a resume and job description.
            </motion.p>
          </header>

          <motion.form onSubmit={handleSubmit} className="mb-8" variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste the resume here..."
                className="w-full h-80 p-4 bg-white/50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow backdrop-blur-sm"
                required
              />
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-80 p-4 bg-white/50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow backdrop-blur-sm"
                required
              />
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait transition-all transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPending ? (
                  <>
                    <Loader className="animate-spin h-5 w-5"/>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5"/>
                    Generate Questions
                  </>
                )}
              </motion.button>
              
              <motion.button
                type="button"
                onClick={handlePasteSampleData}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition-all transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Clipboard className="h-5 w-5"/>
                Paste Sample
              </motion.button>
            </div>
          </motion.form>

          <AnimatePresence>
            {isPending && (
              <motion.div
                className="text-center text-lg flex justify-center items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                 <Loader className="animate-spin h-6 w-6 text-blue-600"/> 
                 <span>The AI is analyzing the documents...</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {error && (
                <motion.div 
                    className="text-red-700 bg-red-100 p-4 rounded-lg shadow-md text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                >
                    <strong>Error:</strong> {error.message}
                </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && (
              <motion.div 
                className="space-y-4 mt-10"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <motion.h2 variants={itemVariants} className="text-3xl font-bold border-b pb-3 mb-6 text-gray-800">
                  Generated Questions
                </motion.h2>
                {result.generatedQuestions.map((q, index) => (
                  <motion.div 
                    key={index} 
                    className="p-5 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-md shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                    variants={itemVariants}
                    onClick={() => handleQuestionClick(index)}
                  >
                    <div className="flex justify-between items-center cursor-pointer">
                        <p className="font-semibold text-lg text-gray-900 pr-4">{q.questionText}</p>
                        <motion.div animate={{ rotate: selectedQuestionIndex === index ? 180 : 0 }}>
                            <ChevronDown className="h-6 w-6 text-gray-500"/>
                        </motion.div>
                    </div>
                    
                    <AnimatePresence>
                        {selectedQuestionIndex === index && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500 italic">
                                    <strong>Rationale:</strong> {q.rationale}
                                    </p>
                                    <p className="font-semibold text-gray-800 mt-3 mb-1">Expected Answer Elements:</p>
                                    <p className="text-gray-700">{q.expectedAnswer}</p>
                                    <div className="mt-4">
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            {q.category}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}></div>
        </div>
      </div>
    </div>
  );
}
