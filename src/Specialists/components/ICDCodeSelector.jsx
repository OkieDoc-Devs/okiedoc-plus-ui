import React, { useState, useEffect } from 'react';
import {
  getChapters,
  getBlocksForChapter,
  getCategoriesForBlock,
  getSubcategoriesForCategory,
  getCodeDetails,
  parseICDCode,
  buildICDCode,
} from '../utils/icdData';

const ICDCodeSelector = ({ value = '', onChange }) => {
  const [selections, setSelections] = useState({
    chapter: '',
    block: '',
    category: '',
    subcategory: '',
  });

  const [availableOptions, setAvailableOptions] = useState({
    chapters: getChapters(),
    blocks: [],
    categories: [],
    subcategories: [],
  });

  const [codeDetails, setCodeDetails] = useState(null);

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const parsed = parseICDCode(value);
      setSelections(parsed);
      updateAvailableOptions(
        parsed.chapter,
        parsed.block,
        parsed.category,
        parsed.subcategory
      );
    }
  }, [value]);

  const updateAvailableOptions = (chapter, block, category, subcategory) => {
    const newOptions = {
      chapters: getChapters(),
      blocks: chapter ? getBlocksForChapter(chapter) : [],
      categories: chapter && block ? getCategoriesForBlock(chapter, block) : [],
      subcategories:
        chapter && block && category
          ? getSubcategoriesForCategory(chapter, block, category)
          : [],
    };

    setAvailableOptions(newOptions);

    // Update code details
    if (chapter && block && category) {
      const details = getCodeDetails(chapter, block, category, subcategory);
      setCodeDetails(details);
    } else {
      setCodeDetails(null);
    }
  };

  const handleChapterChange = (e) => {
    const newChapter = e.target.value;
    const newSelections = {
      chapter: newChapter,
      block: '',
      category: '',
      subcategory: '',
    };
    setSelections(newSelections);
    updateAvailableOptions(newChapter, '', '', '');
    onChange(newChapter ? buildICDCode(newChapter, '', '', '') : '');
    setCodeDetails(null);
  };

  const handleBlockChange = (e) => {
    const newBlock = e.target.value;
    const newSelections = {
      ...selections,
      block: newBlock,
      category: '',
      subcategory: '',
    };
    setSelections(newSelections);
    updateAvailableOptions(selections.chapter, newBlock, '', '');
    onChange(
      selections.chapter && newBlock
        ? buildICDCode(selections.chapter, newBlock, '', '')
        : buildICDCode(selections.chapter, '', '', '')
    );
    setCodeDetails(null);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    const newSelections = {
      ...selections,
      category: newCategory,
      subcategory: '',
    };
    setSelections(newSelections);
    updateAvailableOptions(selections.chapter, selections.block, newCategory, '');

    const newCode = buildICDCode(
      selections.chapter,
      selections.block,
      newCategory,
      ''
    );
    onChange(newCode);

    // Update details
    if (newCategory) {
      const details = getCodeDetails(
        selections.chapter,
        selections.block,
        newCategory,
        ''
      );
      setCodeDetails(details);
    }
  };

  const handleSubcategoryChange = (e) => {
    const newSubcategory = e.target.value;
    const newSelections = {
      ...selections,
      subcategory: newSubcategory,
    };
    setSelections(newSelections);

    const newCode = buildICDCode(
      selections.chapter,
      selections.block,
      selections.category,
      newSubcategory
    );
    onChange(newCode);

    // Update details
    if (newSubcategory) {
      const details = getCodeDetails(
        selections.chapter,
        selections.block,
        selections.category,
        newSubcategory
      );
      setCodeDetails(details);
    }
  };

  return (
    <div className='icd-code-selector'>
      <div className='icd-dropdowns-container'>
        {/* Chapter Dropdown */}
        <div className='icd-dropdown-group'>
          <label className='icd-label'>Chapter</label>
          <select
            value={selections.chapter}
            onChange={handleChapterChange}
            className='icd-dropdown'
          >
            <option value=''>Select Chapter...</option>
            {availableOptions.chapters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Block Dropdown - appears if chapter is selected */}
        {selections.chapter && (
          <div className='icd-dropdown-group'>
            <label className='icd-label'>Block</label>
            <select
              value={selections.block}
              onChange={handleBlockChange}
              className='icd-dropdown'
            >
              <option value=''>Select Block...</option>
              {availableOptions.blocks.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Dropdown - appears if block is selected */}
        {selections.block && (
          <div className='icd-dropdown-group'>
            <label className='icd-label'>Category</label>
            <select
              value={selections.category}
              onChange={handleCategoryChange}
              className='icd-dropdown'
            >
              <option value=''>Select Category...</option>
              {availableOptions.categories.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Subcategory Dropdown - appears if category is selected and has subcategories */}
        {selections.category && availableOptions.subcategories.length > 0 && (
          <div className='icd-dropdown-group'>
            <label className='icd-label'>Subcategory</label>
            <select
              value={selections.subcategory}
              onChange={handleSubcategoryChange}
              className='icd-dropdown'
            >
              <option value=''>Select Subcategory...</option>
              {availableOptions.subcategories.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Display Code Details */}
      {codeDetails && (
        <div className='icd-code-details'>
          <div className='icd-code-value'>
            <strong>Selected Code:</strong> {selections.category}
            {selections.subcategory && `-${selections.subcategory}`}
          </div>
          <div className='icd-code-description'>
            <strong>Description:</strong> {codeDetails.label}
          </div>
          {codeDetails.description && (
            <div className='icd-code-additional-info'>
              {codeDetails.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ICDCodeSelector;
