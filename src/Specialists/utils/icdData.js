// ICD-11 Hierarchical Data Structure for Mortality and Morbidity Statistics
// Based on ICD-11 for Mortality and Morbidity Statistics 2026-01

export const ICD11_CHAPTERS = {
  '01': {
    code: '01',
    label: 'Certain infectious or parasitic diseases',
    blocks: {
      '1A0': {
        code: '1A0',
        label: 'Gastroenteritis or colitis of infectious origin',
        categories: {
          '1A00': {
            code: '1A00',
            label: 'Cholera',
            description: 'Cholera is a potentially epidemic disease with rapid depletion, vomiting, with rapid depletion, vomiting, with rapid depletion'
          },
          '1A01': {
            code: '1A01',
            label: 'Intestinal infection due to other Vibrio',
            description: 'Intestinal infection due to other Vibrio serotypes'
          },
          '1A02': {
            code: '1A02',
            label: 'Intestinal infections due to Shigella',
            description: 'Intestinal infections due to Shigella species'
          },
          '1A03': {
            code: '1A03',
            label: 'Intestinal infections due to Escherichia coli',
            description: 'Enterotoxigenic, enteroinvasive, enterohemorrhagic E. coli'
          },
          '1A04': {
            code: '1A04',
            label: 'Intestinal infections due to Clostridioides difficile',
            description: 'Also known as Clostridium difficile infection (CDI)'
          },
          '1A05': {
            code: '1A05',
            label: 'Intestinal infections due to Yersinia enterocolitica',
            description: 'Yersiniosis caused by Yersinia enterocolitica'
          },
          '1A06': {
            code: '1A06',
            label: 'Gastroenteritis due to Campylobacter',
            description: 'Campylobacterosis of the gastrointestinal tract'
          },
          '1A07': {
            code: '1A07',
            label: 'Typhoid fever',
            subcategories: {
              '1A07.0': {
                code: '1A07.0',
                label: 'Typhoid fever'
              },
              '1A07.1': {
                code: '1A07.1',
                label: 'Typhoid perforation'
              },
              '1A07.Y': {
                code: '1A07.Y',
                label: 'Other specified typhoid fever'
              },
              '1A07.Z': {
                code: '1A07.Z',
                label: 'Typhoid fever, unspecified'
              }
            }
          },
          '1A08': {
            code: '1A08',
            label: 'Paratyphoid fever',
            description: 'Paratyphoid fever caused by Salmonella paratyphi'
          },
          '1A09': {
            code: '1A09',
            label: 'Infections due to other Salmonella',
            description: 'Non-typhoidal Salmonella infections'
          },
          '1A0Y': {
            code: '1A0Y',
            label: 'Other specified bacterial intestinal infections',
            description: 'Other bacterial causes of gastroenteritis'
          },
          '1A0Z': {
            code: '1A0Z',
            label: 'Bacterial intestinal infections, unspecified',
            description: 'Bacterial gastroenteritis without specification'
          }
        }
      },
      '1A1': {
        code: '1A1',
        label: 'Bacterial foodborne intoxications',
        categories: {
          '1A10': {
            code: '1A10',
            label: 'Staphylococcal food poisoning',
            description: 'Food poisoning due to Staphylococcus aureus toxins'
          },
          '1A11': {
            code: '1A11',
            label: 'Clostridial food intoxication',
            description: 'Botulism and other clostridial toxin foods'
          }
        }
      },
      '1A2': {
        code: '1A2',
        label: 'Viral intestinal infections',
        categories: {
          '1A20': {
            code: '1A20',
            label: 'Rotavirus infection',
            description: 'Viral gastroenteritis caused by rotavirus'
          },
          '1A21': {
            code: '1A21',
            label: 'Norovirus infection',
            description: 'Viral gastroenteritis caused by norovirus'
          },
          '1A22': {
            code: '1A22',
            label: 'Enteroviruses, unspecified',
            description: 'Unspecified enteroviral infections'
          }
        }
      },
      '1A3': {
        code: '1A3',
        label: 'Protozoan intestinal infections',
        categories: {
          '1A30': {
            code: '1A30',
            label: 'Amebiasis',
            description: 'Infection due to Entamoeba histolytica'
          },
          '1A31': {
            code: '1A31',
            label: 'Cryptosporidiosis',
            description: 'Infection due to Cryptosporidium species'
          }
        }
      },
      '1A4': {
        code: '1A4',
        label: 'Gastroenteritis or colitis without specification of infectious agent',
        categories: {
          '1A40': {
            code: '1A40',
            label: 'Gastroenteritis or colitis without specification of infectious agent',
            description: 'Presumed infectious gastroenteritis with no organism identified'
          }
        }
      }
    }
  },
  '02': {
    code: '02',
    label: 'Neoplasms',
    blocks: {
      '2A': {
        code: '2A',
        label: 'Malignant neoplasms of lip, oral cavity and pharynx',
        categories: {
          '2A00': {
            code: '2A00',
            label: 'Malignant neoplasm of lip',
            description: 'Carcinoma of the lip'
          },
          '2A01': {
            code: '2A01',
            label: 'Malignant neoplasm of base of tongue',
            description: 'Cancer of the base of tongue'
          }
        }
      }
    }
  },
  '04': {
    code: '04',
    label: 'Diseases of the blood or blood-forming organs',
    blocks: {
      '4A': {
        code: '4A',
        label: 'Anaemias',
        categories: {
          '4A00': {
            code: '4A00',
            label: 'Iron deficiency anaemia',
            description: 'Anaemia due to iron deficiency'
          },
          '4A01': {
            code: '4A01',
            label: 'Vitamin B12 deficiency anaemia',
            description: 'Pernicious anaemia and other B12 deficiency'
          }
        }
      }
    }
  },
  '05': {
    code: '05',
    label: 'Mental, behavioural or neurodevelopmental disorders',
    blocks: {
      '5A': {
        code: '5A',
        label: 'Neurodevelopmental disorders',
        categories: {
          '5A00': {
            code: '5A00',
            label: 'Attention-deficit or hyperactivity disorder',
            description: 'ADHD'
          },
          '5A01': {
            code: '5A01',
            label: 'Autism spectrum disorder',
            description: 'ASD'
          }
        }
      }
    }
  },
  '06': {
    code: '06',
    label: 'Diseases of the nervous system',
    blocks: {
      '6A': {
        code: '6A',
        label: 'Inflammatory diseases of the central nervous system',
        categories: {
          '6A00': {
            code: '6A00',
            label: 'Meningitis',
            description: 'Inflammation of the meninges'
          },
          '6A01': {
            code: '6A01',
            label: 'Encephalitis',
            description: 'Inflammation of the brain'
          }
        }
      }
    }
  },
};

/**
 * Get all top-level chapters
 */
export const getChapters = () => {
  return Object.values(ICD11_CHAPTERS).map(chapter => ({
    value: chapter.code,
    label: `${chapter.code} - ${chapter.label}`
  }));
};

/**
 * Get blocks for a specific chapter
 */
export const getBlocksForChapter = (chapterCode) => {
  const chapter = ICD11_CHAPTERS[chapterCode];
  if (!chapter) return [];
  
  return Object.values(chapter.blocks).map(block => ({
    value: block.code,
    label: `${block.code} - ${block.label}`
  }));
};

/**
 * Get categories for a specific block
 */
export const getCategoriesForBlock = (chapterCode, blockCode) => {
  const chapter = ICD11_CHAPTERS[chapterCode];
  if (!chapter) return [];
  
  const block = chapter.blocks[blockCode];
  if (!block) return [];
  
  return Object.values(block.categories).map(category => ({
    value: category.code,
    label: `${category.code} - ${category.label}`,
    hasSubcategories: !!category.subcategories
  }));
};

/**
 * Get subcategories for a specific category
 */
export const getSubcategoriesForCategory = (chapterCode, blockCode, categoryCode) => {
  const chapter = ICD11_CHAPTERS[chapterCode];
  if (!chapter) return [];
  
  const block = chapter.blocks[blockCode];
  if (!block) return [];
  
  const category = block.categories[categoryCode];
  if (!category || !category.subcategories) return [];
  
  return Object.values(category.subcategories).map(subcat => ({
    value: subcat.code,
    label: `${subcat.code} - ${subcat.label}`
  }));
};

/**
 * Get code details including description
 */
export const getCodeDetails = (chapterCode, blockCode, categoryCode, subcategoryCode = null) => {
  const chapter = ICD11_CHAPTERS[chapterCode];
  if (!chapter) return null;
  
  const block = chapter.blocks[blockCode];
  if (!block) return null;
  
  const category = block.categories[categoryCode];
  if (!category) return null;
  
  if (subcategoryCode && category.subcategories) {
    const subcat = category.subcategories[subcategoryCode];
    return subcat || null;
  }
  
  return category;
};

/**
 * Build the full ICD code path
 */
export const buildICDCode = (chapter, block, category, subcategory = null) => {
  const parts = [chapter, block, category];
  if (subcategory) {
    parts.push(subcategory);
  }
  return parts.join('-');
};

/**
 * Parse ICD code path back into components
 */
export const parseICDCode = (icdCode) => {
  if (!icdCode) return { chapter: '', block: '', category: '', subcategory: '' };
  
  const parts = icdCode.split('-');
  return {
    chapter: parts[0] || '',
    block: parts[1] || '',
    category: parts[2] || '',
    subcategory: parts[3] || ''
  };
};
