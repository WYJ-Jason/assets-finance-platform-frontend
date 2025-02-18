import { Authenticator } from '@aws-amplify/ui-react';
import SideBar from './SideBar';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface PersonalDetails {
  _id: string;
  name: string;
  age: number;
  email: string;
}

interface Income {
  _id: string;
  source: string;
  amount: number;
  date: string;
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  date: string;
}

interface Asset {
  _id: string;
  description: string;
  value: number;
}

interface Liability {
  _id: string;
  description: string;
  amount: number;
}

interface ApplicationData {
  _id: string;
  personalDetails: PersonalDetails;
  income: Income[];
  expenses: Expense[];
  assets: Asset[];
  liabilities: Liability[];
}

const ApplicationDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState === 'true';
  });
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedApplication, setEditedApplication] = useState<ApplicationData | null>(null);
  const editFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchApplicationDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_ENDPOINT}/read-apps?id=${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );
        setApplication(response.data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to fetch application details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplicationDetail();
    }
  }, [id]);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU');
  };

  const calculateTotalAssets = (assets: Asset[]) => {
    return assets.reduce((total, asset) => total + asset.value, 0);
  };

  const calculateTotalLiabilities = (liabilities: Liability[]) => {
    return liabilities.reduce((total, liability) => total + liability.amount, 0);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_ENDPOINT}delete-apps?id=${id}`);
        navigate('/applications');
      } catch (error) {
        console.error('Error deleting application:', error);
        setError('Failed to delete application');
      }
    }
  };

  const handleUpdate = async () => {
    if (!editedApplication) return;

    try {
      // Create a formatted version of the application data, excluding _id fields
      const formattedApplication = {
        personalDetails: {
          name: editedApplication.personalDetails.name,
          age: Number(editedApplication.personalDetails.age),
          email: editedApplication.personalDetails.email,
        },
        income: editedApplication.income.map(income => ({
          source: income.source,
          amount: Number(income.amount),
          date: new Date(income.date),
        })),
        expenses: editedApplication.expenses.map(expense => ({
          description: expense.description,
          amount: Number(expense.amount),
          date: new Date(expense.date),
        })),
        assets: editedApplication.assets.map(asset => ({
          description: asset.description,
          value: Number(asset.value),
        })),
        liabilities: editedApplication.liabilities.map(liability => ({
          description: liability.description,
          amount: Number(liability.amount),
        })),
      };

      const response = await axios.put(
        `${import.meta.env.VITE_API_ENDPOINT}update-apps`,
        {
          id: id,
          updateData: formattedApplication,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.data) {
        setApplication(response.data.data);
        setIsEditing(false);
        setError(null);
      }
    } catch (error: any) {
      console.error('Error updating application:', error);
      // Add more detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
      setError('Failed to update application');
    }
  };

  const addNewItem = (type: 'income' | 'expenses' | 'assets' | 'liabilities') => {
    if (!editedApplication) return;

    const newItem = {
      ...(type === 'income' && {
        source: '',
        amount: 0,
        date: new Date().toISOString(),
      }),
      ...(type === 'expenses' && {
        description: '',
        amount: 0,
        date: new Date().toISOString(),
      }),
      ...(type === 'assets' && {
        description: '',
        value: 0,
      }),
      ...(type === 'liabilities' && {
        description: '',
        amount: 0,
      }),
    };

    setEditedApplication({
      ...editedApplication,
      [type]: [...editedApplication[type], newItem],
    });
  };

  const removeItem = (type: 'income' | 'expenses' | 'assets' | 'liabilities', index: number) => {
    if (!editedApplication) return;

    const newItems = [...editedApplication[type]];
    newItems.splice(index, 1);
    setEditedApplication({
      ...editedApplication,
      [type]: newItems,
    });
  };

  const sectionHeaderClass = 'text-xl font-semibold text-gray-800 mb-4 flex items-center';
  const sectionIconClass = 'w-6 h-6 mr-2 text-blue-500';
  const cardClass =
    'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200';
  const itemClass = 'p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200';

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      <SideBar onCollapse={handleSidebarCollapse} />
      <div
        className={`flex-1 transition-margin duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        } bg-gray-100 min-h-screen`}
      >
        <Authenticator>
          <div className="p-4 md:p-8 h-full">
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {application && (
              <div className="space-y-4 md:space-y-6">
                {/* Back Button */}
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

                {/* Header with Personal Details */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">
                          {application.personalDetails.name}
                        </h2>
                        <div className="space-y-1 md:space-y-2 text-blue-100 text-sm md:text-base">
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                              />
                            </svg>
                            <span>ID: {application._id}</span>
                          </div>
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span>{application.personalDetails.email}</span>
                          </div>
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span>Age: {application.personalDetails.age}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 md:gap-3 mt-4 md:mt-0">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditedApplication(application);
                            setTimeout(() => {
                              editFormRef.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                              });
                            }, 100);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 cursor-pointer text-sm md:text-base"
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
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Update
                        </button>
                        <button
                          onClick={handleDelete}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 cursor-pointer text-sm md:text-base"
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
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary Cards */}
                  <div className="p-4 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-8">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                        <h3 className="text-green-800 text-lg font-medium mb-2">Total Assets</h3>
                        <p className="text-3xl font-bold text-green-700">
                          {formatCurrency(calculateTotalAssets(application.assets))}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
                        <h3 className="text-red-800 text-lg font-medium mb-2">Total Liabilities</h3>
                        <p className="text-3xl font-bold text-red-700">
                          {formatCurrency(calculateTotalLiabilities(application.liabilities))}
                        </p>
                      </div>
                    </div>

                    {/* Assets & Liabilities Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                      <div className={cardClass}>
                        <h3 className={sectionHeaderClass}>
                          <svg
                            className={sectionIconClass}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Assets
                        </h3>
                        <div className="space-y-3">
                          {application.assets.map(asset => (
                            <div key={asset._id} className={itemClass}>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-700">{asset.description}</span>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(asset.value)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={cardClass}>
                        <h3 className={sectionHeaderClass}>
                          <svg
                            className={sectionIconClass}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                            />
                          </svg>
                          Liabilities
                        </h3>
                        <div className="space-y-3">
                          {application.liabilities.map(liability => (
                            <div key={liability._id} className={itemClass}>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-700">{liability.description}</span>
                                <span className="font-semibold text-red-600">
                                  {formatCurrency(liability.amount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Income & Expenses Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-4 md:mt-8">
                      <div className={cardClass}>
                        <h3 className={sectionHeaderClass}>
                          <svg
                            className={sectionIconClass}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                            />
                          </svg>
                          Income
                        </h3>
                        <div className="space-y-3">
                          {application.income.map(income => (
                            <div key={income._id} className={itemClass}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-700">{income.source}</span>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(income.amount)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">{formatDate(income.date)}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={cardClass}>
                        <h3 className={sectionHeaderClass}>
                          <svg
                            className={sectionIconClass}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          Expenses
                        </h3>
                        <div className="space-y-3">
                          {application.expenses.map(expense => (
                            <div key={expense._id} className={itemClass}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-700">{expense.description}</span>
                                <span className="font-semibold text-red-600">
                                  {formatCurrency(expense.amount)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(expense.date)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form Styling */}
                {isEditing && editedApplication && (
                  <div ref={editFormRef} className="mt-4 md:mt-8 bg-white rounded-lg shadow-lg p-4 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-0">Update Application</h3>
                      <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
                        <button
                          onClick={handleUpdate}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer text-sm md:text-base"
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
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer text-sm md:text-base"
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
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Cancel
                        </button>
                      </div>
                    </div>

                    {/* Edit Form Content */}
                    <div className="space-y-4 md:space-y-8">
                      {/* Personal Details Form */}
                      <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                        <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-4">Personal Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                              type="text"
                              value={editedApplication.personalDetails.name}
                              onChange={e =>
                                setEditedApplication({
                                  ...editedApplication,
                                  personalDetails: {
                                    ...editedApplication.personalDetails,
                                    name: e.target.value,
                                  },
                                })
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Age</label>
                            <input
                              type="number"
                              value={editedApplication.personalDetails.age}
                              onChange={e =>
                                setEditedApplication({
                                  ...editedApplication,
                                  personalDetails: {
                                    ...editedApplication.personalDetails,
                                    age: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              value={editedApplication.personalDetails.email}
                              onChange={e =>
                                setEditedApplication({
                                  ...editedApplication,
                                  personalDetails: {
                                    ...editedApplication.personalDetails,
                                    email: e.target.value,
                                  },
                                })
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Income Section */}
                      <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">Income</h4>
                          <button
                            onClick={() => addNewItem('income')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 cursor-pointer"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Add Income
                          </button>
                        </div>
                        <div className="space-y-4">
                          {editedApplication.income.map((income, index) => (
                            <div
                              key={`income-${index}`}
                              className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded relative"
                            >
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Source
                                </label>
                                <input
                                  type="text"
                                  value={income.source}
                                  onChange={e => {
                                    const newIncome = [...editedApplication.income];
                                    newIncome[index] = { ...income, source: e.target.value };
                                    setEditedApplication({
                                      ...editedApplication,
                                      income: newIncome,
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Amount
                                </label>
                                <input
                                  type="number"
                                  value={income.amount}
                                  onChange={e => {
                                    const newIncome = [...editedApplication.income];
                                    newIncome[index] = {
                                      ...income,
                                      amount: parseFloat(e.target.value),
                                    };
                                    setEditedApplication({
                                      ...editedApplication,
                                      income: newIncome,
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={income.date.split('T')[0]}
                                  onChange={e => {
                                    const newIncome = [...editedApplication.income];
                                    newIncome[index] = {
                                      ...income,
                                      date: new Date(e.target.value).toISOString(),
                                    };
                                    setEditedApplication({
                                      ...editedApplication,
                                      income: newIncome,
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <button
                                onClick={() => removeItem('income', index)}
                                className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-full p-1.5 transform hover:scale-110 transition-transform duration-200 cursor-pointer"
                                type="button"
                                title="Remove item"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Expenses Section */}
                      <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">Expenses</h4>
                          <button
                            onClick={() => addNewItem('expenses')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 cursor-pointer"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Add Expense
                          </button>
                        </div>
                        <div className="space-y-4">
                          {editedApplication.expenses.map((expense, index) => (
                            <div
                              key={`expense-${index}`}
                              className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded relative"
                            >
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={expense.description}
                                  onChange={e => {
                                    const newExpenses = [...editedApplication.expenses];
                                    newExpenses[index] = {
                                      ...expense,
                                      description: e.target.value,
                                    };
                                    setEditedApplication({
                                      ...editedApplication,
                                      expenses: newExpenses,
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Amount
                                </label>
                                <input
                                  type="number"
                                  value={expense.amount}
                                  onChange={e => {
                                    const newExpenses = [...editedApplication.expenses];
                                    newExpenses[index] = {
                                      ...expense,
                                      amount: parseFloat(e.target.value),
                                    };
                                    setEditedApplication({
                                      ...editedApplication,
                                      expenses: newExpenses,
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={expense.date.split('T')[0]}
                                  onChange={e => {
                                    const newExpenses = [...editedApplication.expenses];
                                    newExpenses[index] = {
                                      ...expense,
                                      date: new Date(e.target.value).toISOString(),
                                    };
                                    setEditedApplication({
                                      ...editedApplication,
                                      expenses: newExpenses,
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <button
                                onClick={() => removeItem('expenses', index)}
                                className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-full p-1.5 transform hover:scale-110 transition-transform duration-200 cursor-pointer"
                                type="button"
                                title="Remove item"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Assets Section */}
                      <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">Assets</h4>
                          <button
                            onClick={() => addNewItem('assets')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 cursor-pointer"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Add Asset
                          </button>
                        </div>
                        <div className="space-y-4">
                          {editedApplication.assets.map((asset, index) => (
                            <div
                              key={`asset-${index}`}
                              className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded relative"
                            >
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={asset.description}
                                  onChange={e => {
                                    const newAssets = [...editedApplication.assets];
                                    newAssets[index] = { ...asset, description: e.target.value };
                                    setEditedApplication({
                                      ...editedApplication,
                                      assets: newAssets,
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Value
                                </label>
                                <input
                                  type="number"
                                  value={asset.value}
                                  onChange={e => {
                                    const newAssets = [...editedApplication.assets];
                                    newAssets[index] = {
                                      ...asset,
                                      value: parseFloat(e.target.value),
                                    };
                                    setEditedApplication({
                                      ...editedApplication,
                                      assets: newAssets,
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <button
                                onClick={() => removeItem('assets', index)}
                                className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-full p-1.5 transform hover:scale-110 transition-transform duration-200 cursor-pointer"
                                type="button"
                                title="Remove item"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Liabilities Section */}
                      <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">Liabilities</h4>
                          <button
                            onClick={() => addNewItem('liabilities')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 cursor-pointer"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Add Liability
                          </button>
                        </div>
                        <div className="space-y-4">
                          {editedApplication.liabilities.map((liability, index) => (
                            <div
                              key={`liability-${index}`}
                              className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded relative"
                            >
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={liability.description}
                                  onChange={e => {
                                    const newLiabilities = [...editedApplication.liabilities];
                                    newLiabilities[index] = {
                                      ...liability,
                                      description: e.target.value,
                                    };
                                    setEditedApplication({
                                      ...editedApplication,
                                      liabilities: newLiabilities,
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Amount
                                </label>
                                <input
                                  type="number"
                                  value={liability.amount}
                                  onChange={e => {
                                    const newLiabilities = [...editedApplication.liabilities];
                                    newLiabilities[index] = {
                                      ...liability,
                                      amount: parseFloat(e.target.value),
                                    };
                                    setEditedApplication({
                                      ...editedApplication,
                                      liabilities: newLiabilities,
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <button
                                onClick={() => removeItem('liabilities', index)}
                                className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-full p-1.5 transform hover:scale-110 transition-transform duration-200 cursor-pointer"
                                type="button"
                                title="Remove item"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Authenticator>
      </div>
    </div>
  );
};

export default ApplicationDetail;
