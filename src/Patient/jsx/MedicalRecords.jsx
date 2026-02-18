import React, { useState, useEffect } from 'react';
import { 
  FaUserMd, 
  FaCheckCircle, 
  FaStethoscope, 
  FaPlus, 
  FaTrash, 
  FaEdit,
  FaPills,
  FaCut,
  FaUsers,
  FaHeart,
  FaExclamationTriangle,
  FaHistory,
  FaSave
} from 'react-icons/fa';

const MedicalRecords = () => {
  const [medicalData, setMedicalData] = useState({
    activeDiseases: [],
    pastDiseases: [],
    medications: [],
    surgeries: [],
    familyHistory: [],
    socialHistory: [],
    allergies: []
  });

  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState('');

  // Fetch medical records from the backend * AS TO DO 
  useEffect(() => {
    // Example:
    // fetchMedicalRecords().then(data => setMedicalData(data));
  }, []);

  const categories = [
    { key: 'activeDiseases', label: 'Active Diseases', icon: FaStethoscope, color: '#dc3545' },
    { key: 'pastDiseases', label: 'Past Diseases', icon: FaHistory, color: '#6c757d' },
    { key: 'medications', label: 'Medications', icon: FaPills, color: '#007bff' },
    { key: 'surgeries', label: 'Surgeries', icon: FaCut, color: '#fd7e14' },
    { key: 'familyHistory', label: 'Family History', icon: FaUsers, color: '#20c997' },
    { key: 'socialHistory', label: 'Social History', icon: FaHeart, color: '#e83e8c' },
    { key: 'allergies', label: 'Allergies', icon: FaExclamationTriangle, color: '#ffc107' }
  ];

  const handleInputChange = (category, field, value) => {
    setMedicalData(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === editingItem ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddItem = (category) => {
    const newItem = {
      id: Date.now(),
      name: '',
      date: '',
      description: '',
      severity: '',
      status: ''
    };

    setMedicalData(prev => ({
      ...prev,
      [category]: [...prev[category], newItem]
    }));

    setEditingItem(newItem.id);
    setEditingCategory(category);
  };

  const handleEditItem = (item, category) => {
    // Consider if editing should be optimistic or wait for backend response * AS TO DO 
    setEditingItem(item.id);
    setEditingCategory(category);
  };

  const handleDeleteItem = (id, category) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setMedicalData(prev => ({
        // Call backend to delete item, then update state on success * AS TO DO 
        ...prev,
        [category]: prev[category].filter(item => item.id !== id)
      }));
    }
  };

  const handleSaveItem = (category) => {
    // Call backend to save the item (editingItem) * AS TO DO 
    setEditingItem(null);
    setEditingCategory('');
  };

  const handleCancelEdit = (category) => {
    if (editingItem) {
      // If it's a new item (empty name), remove it
      const item = medicalData[category].find(item => item.id === editingItem);
      if (item && !item.name.trim()) {
        setMedicalData(prev => ({
          ...prev,
          [category]: prev[category].filter(item => item.id !== editingItem)
        }));
      }
    }
    setEditingItem(null);
    setEditingCategory('');
  };

  const getFormFields = (category) => {
    const baseFields = [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'description', label: 'Description', type: 'textarea' }
    ];

    switch (category) {
      case 'activeDiseases':
      case 'pastDiseases':
        return [...baseFields, 
          { name: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe'] },
          { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Resolved'] }
        ];
      case 'medications':
        return [
          { name: 'name', label: 'Medication Name', type: 'text', required: true },
          { name: 'description', label: 'Dosage', type: 'text' },
          { name: 'date', label: 'Start Date', type: 'date' },
          { name: 'severity', label: 'Frequency', type: 'text' }
        ];
      case 'surgeries':
        return [
          ...baseFields,
          { name: 'severity', label: 'Surgeon', type: 'text' },
          { name: 'status', label: 'Hospital', type: 'text' }
        ];
      case 'familyHistory':
        return [
          ...baseFields,
          { name: 'severity', label: 'Relationship', type: 'select', options: ['Parent', 'Sibling', 'Grandparent', 'Aunt/Uncle', 'Cousin'] }
        ];
      case 'socialHistory':
        return [
          { name: 'name', label: 'Category', type: 'select', options: ['Smoking', 'Alcohol', 'Exercise', 'Diet', 'Occupation'], required: true },
          { name: 'description', label: 'Details', type: 'textarea' },
          { name: 'date', label: 'Date', type: 'date' }
        ];
      case 'allergies':
        return [
          { name: 'name', label: 'Allergen', type: 'text', required: true },
          { name: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe', 'Life-threatening'] },
          { name: 'description', label: 'Reaction', type: 'textarea' },
          { name: 'date', label: 'First Occurrence', type: 'date' }
        ];
      default:
        return baseFields;
    }
  };

  const renderCategorySection = (category) => {
    const categoryInfo = categories.find(cat => cat.key === category);
    const IconComponent = categoryInfo.icon;
    const items = medicalData[category] || [];
    const isEditing = editingCategory === category;

    return (
      <div key={category} className="patient-category-section">
        <div className="patient-category-header">
          <div className="patient-category-title">
            <IconComponent className="patient-category-icon" style={{ color: categoryInfo.color }} />
            <h3>{categoryInfo.label}</h3>
            <span className="patient-item-count">({items.length})</span>
          </div>
          <button 
            className="patient-add-category-btn"
            onClick={() => handleAddItem(category)}
            disabled={isEditing}
          >
            <FaPlus className="patient-btn-icon" />
            Add {categoryInfo.label.slice(0, -1)}
          </button>
        </div>

        <div className="patient-category-content">
          {items.length === 0 ? (
            <div className="patient-empty-category">
              <p>No {categoryInfo.label.toLowerCase()} recorded yet.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className={`patient-medical-item ${editingItem === item.id ? 'patient-editing' : ''}`}>
                {editingItem === item.id ? (
                  <div className="patient-edit-form">
                    <div className="patient-form-fields">
                      {getFormFields(category).map(field => (
                        <div key={field.name} className="patient-form-group">
                          <label htmlFor={`${category}-${item.id}-${field.name}`}>
                            {field.label}
                            {field.required && <span className="patient-required">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              id={`${category}-${item.id}-${field.name}`}
                              value={item[field.name] || ''}
                              onChange={(e) => handleInputChange(category, field.name, e.target.value)}
                              rows={2}
                              required={field.required}
                            />
                          ) : field.type === 'select' ? (
                            <select
                              id={`${category}-${item.id}-${field.name}`}
                              value={item[field.name] || ''}
                              onChange={(e) => handleInputChange(category, field.name, e.target.value)}
                              required={field.required}
                            >
                              <option value="">Select {field.label}</option>
                              {field.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              id={`${category}-${item.id}-${field.name}`}
                              value={item[field.name] || ''}
                              onChange={(e) => handleInputChange(category, field.name, e.target.value)}
                              required={field.required}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="patient-edit-actions">
                      <button 
                        className="patient-save-btn"
                        onClick={() => handleSaveItem(category)}
                      >
                        <FaSave />
                        Save
                      </button>
                      <button 
                        className="patient-cancel-btn"
                        onClick={() => handleCancelEdit(category)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="patient-item-content">
                      <h4>{item.name || 'Untitled'}</h4>
                      {item.date && <p className="patient-item-date">{item.date}</p>}
                      {item.description && <p className="patient-item-description">{item.description}</p>}
                      {item.severity && <span className="patient-item-severity">{item.severity}</span>}
                      {item.status && <span className="patient-item-status">{item.status}</span>}
                    </div>
                    <div className="patient-item-actions">
                      <button 
                        className="patient-edit-btn"
                        onClick={() => handleEditItem(item, category)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="patient-delete-btn"
                        onClick={() => handleDeleteItem(item.id, category)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="patient-page-content">
      <h2>Medical Records</h2>
      
      <div className="patient-unified-medical-form">
        {categories.map(category => renderCategorySection(category.key))}
      </div>
    </div>
  );
};

export default MedicalRecords;
