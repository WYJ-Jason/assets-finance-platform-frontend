import { Authenticator } from '@aws-amplify/ui-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import { getCurrentUser } from 'aws-amplify/auth';
import axios from 'axios';

// Interface defining the structure of the application form data
// This ensures type safety and consistency throughout the form handling
interface FormData {
  personalDetails: {
    name: string;
    age: number | null; // Nullable to handle empty inputs
    email: string;
  };
  income: {
    source: string;
    amount: number | null;
    date: string;
  }[];
  expenses: {
    description: string;
    amount: number | null;
    date: string;
  }[];
  assets: {
    description: string;
    value: number | null;
  }[];
  liabilities: {
    description: string;
    amount: number | null;
  }[];
}

// Persistence functions for form progress
const saveFormProgress = (data: FormData) => {
  try {
    localStorage.setItem('applicationFormProgress', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving form progress:', error);
  }
};

const loadFormProgress = (): FormData | null => {
  try {
    const saved = localStorage.getItem('applicationFormProgress');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading form progress:', error);
    return null;
  }
};

const clearFormProgress = () => {
  localStorage.removeItem('applicationFormProgress');
};

// Main component for creating applications
const CreateApplications: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // State for sidebar collapse status, persisted in localStorage
  const [_sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState === 'true';
  });

  // Form data state, initialized with saved progress or default values
  const [formData, setFormData] = useState<FormData>(() => {
    const savedProgress = loadFormProgress();
    if (savedProgress) {
      return savedProgress;
    }
    return {
      personalDetails: {
        name: '',
        age: null,
        email: '',
      },
      income: [],
      expenses: [],
      assets: [],
      liabilities: [],
    };
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch and set the authenticated user's email
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const currentUser = await getCurrentUser();
        const userEmail = currentUser.signInDetails?.loginId || '';
        setFormData(prev => ({
          ...prev,
          personalDetails: {
            ...prev.personalDetails,
            email: userEmail,
          },
        }));
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };
    fetchUserEmail();
  }, []);

  // Save form progress whenever formData changes
  useEffect(() => {
    saveFormProgress(formData);
  }, [formData]);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  };

  // Handler for personal details input changes
  const handlePersonalDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        [name]: name === 'age' ? (value === '' ? null : parseInt(value)) : value,
      },
    }));
  };

  // Handler for array field changes (income, expenses, assets, liabilities)
  const handleArrayFieldChange = (
    section: 'income' | 'expenses' | 'assets' | 'liabilities',
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === 'amount' || field === 'value'
                  ? value === ''
                    ? null
                    : parseFloat(value.toString())
                  : value,
            }
          : item
      ),
    }));
  };

  // Function to add new fields to array sections
  const addArrayField = (section: 'income' | 'expenses' | 'assets' | 'liabilities') => {
    const newField = {
      income: { source: '', amount: null, date: '' },
      expenses: { description: '', amount: null, date: '' },
      assets: { description: '', value: null },
      liabilities: { description: '', amount: null },
    };

    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newField[section]],
    }));
  };

  const removeArrayField = (
    section: 'income' | 'expenses' | 'assets' | 'liabilities',
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Function to submit the application
  const handleSubmit = async () => {
    try {
      const currentUser = await getCurrentUser();
      const userEmail = currentUser.signInDetails?.loginId || '';

      // Prepare submission data with default values for null fields
      const submissionData = {
        ...formData,
        personalDetails: {
          ...formData.personalDetails,
          age: formData.personalDetails.age || 0,
          email: userEmail,
        },
        income: formData.income.map(item => ({
          ...item,
          amount: item.amount || 0,
        })),
        expenses: formData.expenses.map(item => ({
          ...item,
          amount: item.amount || 0,
        })),
        assets: formData.assets.map(item => ({
          ...item,
          value: item.value || 0,
        })),
        liabilities: formData.liabilities.map(item => ({
          ...item,
          amount: item.amount || 0,
        })),
      };

      // Send POST request to create application
      const response = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}create-apps`,
        submissionData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        clearFormProgress();
        navigate('/applications');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setValidationErrors(['Failed to create application. Please try again.']);
    }
  };

  useEffect(() => {
    return () => {
      clearFormProgress();
    };
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Personal Details</h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.personalDetails.name}
                  onChange={handlePersonalDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.personalDetails.age ?? ''}
                  onChange={handlePersonalDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your age"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.personalDetails.email}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Income Sources</h2>
            {formData.income.map((income, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input
                    type="text"
                    value={income.source}
                    onChange={e =>
                      handleArrayFieldChange('income', index, 'source', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={income.amount ?? ''}
                    onChange={e =>
                      handleArrayFieldChange('income', index, 'amount', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={income.date}
                    onChange={e => handleArrayFieldChange('income', index, 'date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                {formData.income.length > 1 && (
                  <button
                    onClick={() => removeArrayField('income', index)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayField('income')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Add Income Source
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Expenses</h2>
            {formData.expenses.map((expense, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={expense.description}
                    onChange={e =>
                      handleArrayFieldChange('expenses', index, 'description', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={expense.amount ?? ''}
                    onChange={e =>
                      handleArrayFieldChange('expenses', index, 'amount', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={expense.date}
                    onChange={e =>
                      handleArrayFieldChange('expenses', index, 'date', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                {formData.expenses.length > 1 && (
                  <button
                    onClick={() => removeArrayField('expenses', index)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayField('expenses')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Add Expense
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Assets</h2>
            {formData.assets.map((asset, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={asset.description}
                    onChange={e =>
                      handleArrayFieldChange('assets', index, 'description', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    value={asset.value ?? ''}
                    onChange={e => handleArrayFieldChange('assets', index, 'value', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                {formData.assets.length > 1 && (
                  <button
                    onClick={() => removeArrayField('assets', index)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayField('assets')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Add Asset
            </button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Liabilities</h2>
            {formData.liabilities.map((liability, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={liability.description}
                    onChange={e =>
                      handleArrayFieldChange('liabilities', index, 'description', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={liability.amount ?? ''}
                    onChange={e =>
                      handleArrayFieldChange('liabilities', index, 'amount', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                {formData.liabilities.length > 1 && (
                  <button
                    onClick={() => removeArrayField('liabilities', index)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayField('liabilities')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Add Liability
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Component to render the progress bar
  const renderProgressBar = () => (
    <div className="mb-10">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {[
            { step: 1, label: 'Personal' },
            { step: 2, label: 'Income' },
            { step: 3, label: 'Expenses' },
            { step: 4, label: 'Assets' },
            { step: 5, label: 'Liabilities' },
          ].map(({ step, label }) => {
            const isClickable = step <= currentStep;

            return (
              <div key={step} className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && setCurrentStep(step)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 relative z-10
                    ${
                      step === currentStep
                        ? 'bg-blue-600 text-white shadow-lg scale-110 cursor-default'
                        : step < currentStep
                          ? 'bg-green-500 text-white cursor-pointer'
                          : 'bg-white border-2 border-gray-300 text-gray-600 cursor-not-allowed opacity-50'
                    }
                  `}
                  disabled={!isClickable}
                  title={!isClickable ? 'Complete previous steps first' : ''}
                >
                  {step < currentStep ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </button>
                <span
                  className={`mt-2 text-sm font-medium ${
                    step === currentStep
                      ? 'text-blue-600'
                      : step < currentStep
                        ? 'text-green-600'
                        : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const ValidationErrors = () => {
    if (!validationErrors.length) return null;

    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-medium mb-2">Please correct the following errors:</h3>
        <ul className="list-disc list-inside text-red-600">
          {validationErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      <SideBar onCollapse={handleSidebarCollapse} />
      <div
        className={`flex-1 transition-margin duration-300 ease-in-out ml-20 md:ml-64 bg-gray-100 min-h-screen pt-16 md:pt-0`}
      >
        <Authenticator>
          <div className="p-4 md:p-8 h-full">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => navigate('/applications')}
                className="flex items-center text-gray-900 font-semibold hover:text-blue-800 transition-colors duration-200 mb-2 md:mb-4 cursor-pointer group text-sm md:text-base"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Applications
              </button>

              <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-8 text-center">
                  Create New Application
                </h1>

                {renderProgressBar()}

                <div className="max-w-2xl mx-auto">
                  <ValidationErrors />
                  {renderStep()}

                  <div className="mt-6 md:mt-8 flex justify-between pt-4 md:pt-6 border-t">
                    {currentStep > 1 && (
                      <button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-4 md:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center cursor-pointer text-sm md:text-base"
                      >
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Previous
                      </button>
                    )}
                    {currentStep < 5 ? (
                      <button
                        onClick={handleNextStep}
                        className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center ml-auto cursor-pointer text-sm md:text-base"
                      >
                        Next
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="px-4 md:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center ml-auto cursor-pointer text-sm md:text-base"
                      >
                        Submit Application
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Authenticator>
      </div>
    </div>
  );
};

export default CreateApplications;
