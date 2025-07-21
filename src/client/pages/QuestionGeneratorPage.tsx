import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { modelenceMutation } from '@modelence/react-query';

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

// Define a type for our generation result for better TypeScript support
type GenerationResult = {
  _id: string;
  generatedQuestions: {
    questionText: string;
    category: string;
    rationale: string;
  }[];
};

export default function QuestionGeneratorPage() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);

  const { mutate: generateQuestions, isPending, error } = useMutation({
    // Use the mutation we defined in our backend module
    ...modelenceMutation('questionGenerator.generate'),
    onSuccess: (data) => {
      // When the mutation is successful, store the result in our state
      setResult(data as GenerationResult);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume.trim() || !jobDescription.trim()) return;
    generateQuestions({ resume, jobDescription });
  };

  const handlePasteSampleData = () => {
    setResume(sampleResume);
    setJobDescription(sampleJobDescription);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">AI Interview Question Generator</h1>
      <p className="text-gray-600 mb-6">Paste a resume and job description to generate tailored interview questions.</p>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste the full resume text here..."
            className="w-full h-80 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description text here..."
            className="w-full h-80 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {/* --- UPDATED: Button container --- */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-wait"
          >
            {isPending ? 'Generating...' : 'Generate Questions'}
          </button>
          
          {/* --- NEW: The sample button --- */}
          <button
            type="button" // Use type="button" to prevent form submission
            onClick={handlePasteSampleData}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300"
          >
            📋 Paste Sample
          </button>
          {/* --- END NEW --- */}
          
        </div>
        {/* --- END UPDATED --- */}
      </form>

      {/* --- Display Results --- */}
      {isPending && <div className="text-center text-lg">Thinking... The AI is generating questions.</div>}
      
      {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">Error: {error.message}</div>}

      {result && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-2">Generated Questions</h2>
          {result.generatedQuestions.map((q, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
              <p className="font-semibold text-gray-800">{q.questionText}</p>
              <p className="text-sm text-gray-500 mt-2 italic"><strong>Rationale:</strong> {q.rationale}</p>
              <span className="mt-2 inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">{q.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}