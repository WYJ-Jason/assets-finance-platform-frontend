import { Authenticator } from "@aws-amplify/ui-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { getCurrentUser } from "aws-amplify/auth";
import axios from "axios";

interface FormData {
  personalDetails: {
    name: string;
    age: number;
    email: string;
  };
  income: {
    source: string;
    amount: number;
    date: string;
  }[];
  expenses: {
    description: string;
    amount: number;
    date: string;
  }[];
  assets: {
    description: string;
    value: number;
  }[];
  liabilities: {
    description: string;
    amount: number;
  }[];
}

const CreateApplications: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState === 'true';
  });

  const [formData, setFormData] = useState<FormData>({
    personalDetails: {
      name: "",
      age: 0,
      email: "",
    },
    income: [{ source: "", amount: 0, date: "" }],
    expenses: [{ description: "", amount: 0, date: "" }],
    assets: [{ description: "", value: 0 }],
    liabilities: [{ description: "", amount: 0 }],
  });

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const currentUser = await getCurrentUser();
        const userEmail = currentUser.signInDetails?.loginId || "";
        
        setFormData(prev => ({
          ...prev,
          personalDetails: {
            ...prev.personalDetails,
            email: userEmail
          }
        }));
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };

    fetchUserEmail();
  }, []);

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
        [name]: name === 'age' ? parseInt(value) || 0 : value
      }
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
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayField = (section: 'income' | 'expenses' | 'assets' | 'liabilities') => {
    const newField = {
      income: { source: "", amount: 0, date: "" },
      expenses: { description: "", amount: 0, date: "" },
      assets: { description: "", value: 0 },
      liabilities: { description: "", amount: 0 }
    };

    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newField[section]]
    }));
  };

  const removeArrayField = (section: 'income' | 'expenses' | 'assets' | 'liabilities', index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      const currentUser = await getCurrentUser();
      const userEmail = currentUser.signInDetails?.loginId || "";
      
      // Ensure email in personal details matches logged in user
      formData.personalDetails.email = userEmail;

      const response = await axios.post('http://127.0.0.1:3000/create-app', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        navigate('/applications');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

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
                  value={formData.personalDetails.age || ""}
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
                    onChange={(e) => handleArrayFieldChange('income', index, 'source', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={income.amount}
                    onChange={(e) => handleArrayFieldChange('income', index, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={income.date}
                    onChange={(e) => handleArrayFieldChange('income', index, 'date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                {formData.income.length > 1 && (
                  <button
                    onClick={() => removeArrayField('income', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayField('income')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={expense.description}
                    onChange={(e) => handleArrayFieldChange('expenses', index, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={expense.amount}
                    onChange={(e) => handleArrayFieldChange('expenses', index, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={expense.date}
                    onChange={(e) => handleArrayFieldChange('expenses', index, 'date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                {formData.expenses.length > 1 && (
                  <button
                    onClick={() => removeArrayField('expenses', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayField('expenses')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={asset.description}
                    onChange={(e) => handleArrayFieldChange('assets', index, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    value={asset.value}
                    onChange={(e) => handleArrayFieldChange('assets', index, 'value', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                {formData.assets.length > 1 && (
                  <button
                    onClick={() => removeArrayField('assets', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayField('assets')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={liability.description}
                    onChange={(e) => handleArrayFieldChange('liabilities', index, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={liability.amount}
                    onChange={(e) => handleArrayFieldChange('liabilities', index, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                {formData.liabilities.length > 1 && (
                  <button
                    onClick={() => removeArrayField('liabilities', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayField('liabilities')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
            { step: 5, label: 'Liabilities' }
          ].map(({ step, label }) => (
            <div key={step} className="flex flex-col items-center">
              <button
                onClick={() => setCurrentStep(step)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 relative z-10
                  ${step === currentStep 
                    ? 'bg-blue-600 text-white shadow-lg scale-110' 
                    : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-blue-500'
                  }
                `}
              >
                {step < currentStep ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </button>
              <span className={`mt-2 text-sm font-medium ${
                step === currentStep ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      <SideBar onCollapse={handleSidebarCollapse} />
      <div
        className={`flex-1 transition-margin duration-300 ease-in-out ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        } bg-gray-100 min-h-screen`}
      >
        <Authenticator>
          <div className="p-8 h-full">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                  Create New Application
                </h1>
                
                {renderProgressBar()}
                
                <div className="max-w-2xl mx-auto">
                  {renderStep()}

                  <div className="mt-8 flex justify-between pt-6 border-t">
                    {currentStep > 1 && (
                      <button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                    )}
                    {currentStep < 5 ? (
                      <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center ml-auto"
                      >
                        Next
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center ml-auto"
                      >
                        Submit Application
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
