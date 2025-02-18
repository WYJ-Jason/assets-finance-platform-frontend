import { Authenticator } from '@aws-amplify/ui-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import { getCurrentUser } from 'aws-amplify/auth';
import axios from 'axios';

interface FormData {
  personalDetails: {
    name: string;
    age: number | null;
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

const validatePersonalDetails = (details: FormData['personalDetails']): string[] => {
  const errors: string[] = [];
  if (!details.name.trim()) errors.push('Name is required');
  if (!details.age || details.age < 18) errors.push('Age must be 18 or older');
  if (!details.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push('Valid email is required');
  return errors;
};

const validateIncome = (income: FormData['income']): string[] => {
  const errors: string[] = [];
  income.forEach((item, index) => {
    if (!item.source.trim()) errors.push(`Income source ${index + 1} is required`);
    if (!item.amount || item.amount <= 0)
      errors.push(`Income amount ${index + 1} must be greater than 0`);
    if (!item.date) errors.push(`Date for income ${index + 1} is required`);
  });
  return errors;
};

const validateExpenses = (expenses: FormData['expenses']): string[] => {
  const errors: string[] = [];
  expenses.forEach((item, index) => {
    if (!item.description.trim()) errors.push(`Expense description ${index + 1} is required`);
    if (!item.amount || item.amount <= 0)
      errors.push(`Expense amount ${index + 1} must be greater than 0`);
    if (!item.date) errors.push(`Date for expense ${index + 1} is required`);
  });
  return errors;
};

const validateAssets = (assets: FormData['assets']): string[] => {
  const errors: string[] = [];
  assets.forEach((item, index) => {
    if (!item.description.trim()) errors.push(`Asset description ${index + 1} is required`);
    if (!item.value || item.value <= 0)
      errors.push(`Asset value ${index + 1} must be greater than 0`);
  });
  return errors;
};

const validateLiabilities = (liabilities: FormData['liabilities']): string[] => {
  const errors: string[] = [];
  liabilities.forEach((item, index) => {
    if (!item.description.trim()) errors.push(`Liability description ${index + 1} is required`);
    if (!item.amount || item.amount <= 0)
      errors.push(`Liability amount ${index + 1} must be greater than 0`);
  });
  return errors;
};

const isStepComplete = (step: number, data: FormData): boolean => {
  switch (step) {
    case 1:
      return validatePersonalDetails(data.personalDetails).length === 0;
    case 2:
      return validateIncome(data.income).length === 0;
    case 3:
      return validateExpenses(data.expenses).length === 0;
    case 4:
      return validateAssets(data.assets).length === 0;
    case 5:
      return validateLiabilities(data.liabilities).length === 0;
    default:
      return false;
  }
};

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

const CreateApplications: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState === 'true';
  });

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
      income: [{ source: '', amount: null, date: '' }],
      expenses: [{ description: '', amount: null, date: '' }],
      assets: [{ description: '', value: null }],
      liabilities: [{ description: '', amount: null }],
    };
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

  useEffect(() => {
    saveFormProgress(formData);
  }, [formData]);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  };

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
    let errors: string[] = [];

    switch (currentStep) {
      case 1:
        errors = validatePersonalDetails(formData.personalDetails);
        break;
      case 2:
        errors = validateIncome(formData.income);
        break;
      case 3:
        errors = validateExpenses(formData.expenses);
        break;
      case 4:
        errors = validateAssets(formData.assets);
        break;
      case 5:
        errors = validateLiabilities(formData.liabilities);
        break;
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    const errors = validateLiabilities(formData.liabilities);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      const userEmail = currentUser.signInDetails?.loginId || '';

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

      const response = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}/create-apps`,
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
            const isCompleted = isStepComplete(step, formData);
            const isClickable = step <= currentStep || isCompleted;

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
                        : isCompleted
                          ? 'bg-green-500 text-white cursor-pointer'
                          : step < currentStep
                            ? 'bg-yellow-500 text-white cursor-pointer'
                            : 'bg-white border-2 border-gray-300 text-gray-600 cursor-not-allowed opacity-50'
                    }
                  `}
                  disabled={!isClickable}
                  title={!isClickable ? 'Complete previous steps first' : ''}
                >
                  {isCompleted ? (
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
                      : isCompleted
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
        className={`flex-1 transition-margin duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        } bg-gray-100 min-h-screen`}
      >
        <Authenticator>
          <div className="p-8 h-full">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => navigate('/applications')}
                className="flex items-center text-gray-900 font-semibold hover:text-blue-800 transition-colors duration-200 mb-4 cursor-pointer group"
              >
                <svg
                  className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
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

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                  Create New Application
                </h1>

                {renderProgressBar()}

                <div className="max-w-2xl mx-auto">
                  <ValidationErrors />
                  {renderStep()}

                  <div className="mt-8 flex justify-between pt-6 border-t">
                    {currentStep > 1 && (
                      <button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center cursor-pointer"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
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
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center ml-auto cursor-pointer"
                      >
                        Next
                        <svg
                          className="w-5 h-5 ml-2"
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
                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center ml-auto cursor-pointer"
                      >
                        Submit Application
                        <svg
                          className="w-5 h-5 ml-2"
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
