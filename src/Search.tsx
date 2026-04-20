import {
  Building,
  Calendar,
  Check,
  ChevronDown,
  DollarSign,
  Filter,
  MapPin,
  Search,
  Star,
  Video,
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Doc1 from './assets/doc-1.jpg';
import Doc2 from './assets/doc-2.jpg';
import Doc3 from './assets/doc-3.jpg';

function FilterCheckbox({
  label,
  isChecked,
  onChange,
}: {
  label: string;
  isChecked: boolean;
  onChange: () => void;
}) {
  return (
    <label className='flex items-center gap-2 cursor-pointer group'>
      <input
        type='checkbox'
        checked={isChecked}
        onChange={onChange}
        className='sr-only'
      />
      <div
        className={`flex size-3.75 items-center justify-center rounded border transition-all duration-200 ${
          isChecked
            ? 'bg-black border-black shadow-sm'
            : 'bg-white border-gray-300 group-hover:border-gray-400'
        }`}
      >
        {isChecked && (
          <Check className='size-3 text-white animate-in zoom-in duration-200' />
        )}
      </div>
      <span className='text-black font-semibold text-[14px] select-none'>
        {label}
      </span>
    </label>
  );
}

function FeeRangeDropdown({
  selectedFee,
  onChange,
}: {
  selectedFee: string;
  onChange: (fee: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const feeOptions = [
    'Any price',
    'Under ₱500',
    '₱500 - ₱1,000',
    'Over ₱1,000',
  ];

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={dropdownRef} className='relative w-full'>
      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        className='flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg border border-transparent'
      >
        <span className='text-[14px] font-medium text-gray-900'>
          {selectedFee}
        </span>
        <ChevronDown
          className={`size-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <ul
        className={`absolute z-30 w-full mt-1 top-full origin-top-left rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-200 py-1 ${
          isOpen
            ? 'visible opacity-100 scale-100'
            : 'invisible opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {feeOptions.map((option) => {
          const isSelected = selectedFee === option;
          return (
            <li
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2 text-[14px] cursor-pointer transition-colors mx-1 rounded-md ${
                isSelected
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{option}</span>
              {isSelected && <Check className='size-4 text-gray-600' />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SortDropdown({
  selectedSort,
  onChange,
}: {
  selectedSort: string;
  onChange: (sort: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    'Most Relevant',
    'Highest Rating',
    'Price: Low to High',
    'Price: High to Low',
  ];

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={dropdownRef} className='relative w-45'>
      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        className='flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg border border-transparent'
      >
        <span className='text-[14px] font-medium text-gray-900'>
          {selectedSort}
        </span>
        <ChevronDown
          className={`size-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <ul
        className={`absolute z-30 w-full mt-1 top-full origin-top-left rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-200 py-1 ${
          isOpen
            ? 'visible opacity-100 scale-100'
            : 'invisible opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {sortOptions.map((option) => {
          const isSelected = selectedSort === option;
          return (
            <li
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2 text-[14px] cursor-pointer transition-colors mx-1 rounded-md ${
                isSelected
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{option}</span>
              {isSelected && <Check className='size-4 text-gray-600' />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('Doctor');
  const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false);
  const searchTypeRef = useRef<HTMLDivElement | null>(null);

  const [selectedConsultations, setSelectedConsultations] = useState<string[]>(
    [],
  );
  const [feeRange, setFeeRange] = useState('Any price');
  const [sortRange, setSortRange] = useState('Most Relevant');

  const specialistsProfile = [
    {
      image: <img src={Doc1} className='size-35 rounded-2xl object-cover' />,
      name: 'Dr. Sloane Mercer',
      specialty: 'Internal Medicine',
      hospital: 'Naga City Medical Clinic',
      location: '123 Panganiban Drive, Naga City',
      schedule: 'Mon-Fri: 9AM-5PM',
      consultationFee: '800',
      rating: 4.9,
      ratingCount: 127,
      hmo: ['PhilHealth', 'Maxicare', 'Medicard'],
    },
    {
      image: <img src={Doc2} className='size-35 rounded-2xl object-cover' />,
      name: 'Dr. Arnav Menon',
      specialty: 'Pediatrics',
      hospital: 'Heart Care Center Naga',
      location: '456 Magsaysay Avenue, Naga City',
      schedule: 'Tue-Sat: 10AM-6PM',
      consultationFee: '1,200',
      rating: 4.8,
      ratingCount: 98,
      hmo: ['PhilHealth', 'Intellicare'],
    },
    {
      image: <img src={Doc3} className='size-35 rounded-2xl object-cover' />,
      name: 'Dr. Beatriz Cárdenas',
      specialty: 'Psychiatrist',
      hospital: 'Mind Wellness Clinic',
      location: '789 Rizal Street, Naga City',
      schedule: 'Tue-Sat: 1PM-7PM',
      consultationFee: '1,500',
      rating: 5,
      ratingCount: 156,
      hmo: ['PhilHealth', 'Maxicare'],
    },
  ];

  const handleConsultationToggle = (type: string) => {
    setSelectedConsultations((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type],
    );
  };

  const handleClearAll = () => {
    setSelectedConsultations([]);
    setFeeRange('Any price'); // Also reset the dropdown!
  };

  return (
    <main className='min-h-screen bg-white pt-20'>
      {/*Location*/}
      <div className='flex items-center gap-2 text-sm border-b border-gray-100 text-gray-700 bg-blue-50 p-3 lg:pl-8 2xl:pl-52  transition-all'>
        <MapPin className='text-blue-500 size-4' />
        <div>
          Serving
          <a className='font-semibold text-blue-500'> Naga City</a>
        </div>
      </div>

      {/*Search Bar*/}
      <section>
        <div className='bg-white shadow-xs border border-gray-200 mt-10 mb-5 mx-3 p-5 py-5 md:mx-13  lg:mx-10 2xl:mx-50  rounded-2xl'>
          <div className='flex flex-col md:flex-row w-full gap-4'>
            <div
              ref={searchTypeRef}
              className='relative w-full md:w-40 shrink-0'
            >
              <button
                type='button'
                onClick={() => setIsSearchTypeOpen((prev) => !prev)}
                aria-expanded={isSearchTypeOpen}
                className='flex w-full cursor-pointer text-[15px] items-center justify-between gap-2 px-4 py-2 bg-gray-100 rounded-lg'
              >
                <span className='font-semibold'>{searchType}</span>
                <ChevronDown
                  className={`size-4 text-gray-400 transition-transform ${
                    isSearchTypeOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <ul
                className={`absolute w-full z-20 mt-1 top-full text-[15px] origin-top-left  rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-200 p-2 ${
                  isSearchTypeOpen
                    ? 'visible opacity-100 scale-100'
                    : 'invisible opacity-0 scale-95 pointer-events-none'
                }`}
              >
                {['Doctor', 'Specialty', 'Hospital', 'Clinic', 'HMO'].map(
                  (item) => (
                    <li
                      key={item}
                      onClick={() => {
                        setSearchType(item);
                        setIsSearchTypeOpen(false);
                      }}
                      className='py-2 hover:bg-gray-100 rounded-lg px-2 cursor-pointer'
                    >
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className='relative flex-1'>
              <div className='absolute inset-y-0 flex pl-3 items-center pointer-events-none'>
                <Search className='size-4 text-gray-400' />
              </div>
              <input
                type='search'
                placeholder={`Search for ${searchType.toLowerCase()}...`}
                className='bg-gray-100 text-gray-400 rounded-lg py-2 pl-10 w-full outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='relative w-full md:w-32 shrink-0'>
              <button className='flex items-center w-full justify-center gap-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all cursor-pointer'>
                <Search className='size-4' />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className='flex flex-col lg:flex-row gap-6 md:mx-10 2xl:mx-50'>
          <div className='mb-5 h-full mx-3  p-5 py-5  lg:mx-0 rounded-2xl shadow-xs border border-gray-300 max-w-[calc(100%-1.5rem)] lg:w-72 shrink-0'>
            <div className='group flex justify-between items-center'>
              <span className='flex items-center font-bold text-gray-900 gap-2 text-[16px]'>
                <Filter className='size-4.75 ' /> Filters
              </span>
              <button
                onClick={handleClearAll}
                className='text-blue-600 font-semibold text-[14px] hover:text-blue-800 cursor-pointer transition-colors'
              >
                Clear All
              </button>
            </div>
            <div>
              <div className='pt-4 w flex flex-col gap-3'>
                <span className='font-semibold text-gray-800 text-[14px]'>
                  Consultation Type
                </span>
                <div className='flex flex-col gap-2'>
                  <FilterCheckbox
                    label='Online Consultation'
                    isChecked={selectedConsultations.includes(
                      'Online Consultation',
                    )}
                    onChange={() =>
                      handleConsultationToggle('Online Consultation')
                    }
                  />

                  <FilterCheckbox
                    label='Physical Visit'
                    isChecked={selectedConsultations.includes('Physical Visit')}
                    onChange={() => handleConsultationToggle('Physical Visit')}
                  />
                </div>
              </div>
              <div className='pt-4 w flex flex-col gap-3'>
                <span className='font-semibold text-gray-800 text-[14px]'>
                  Availability
                </span>
                <div className='flex flex-col gap-2'>
                  <FilterCheckbox
                    label='Available Today'
                    isChecked={selectedConsultations.includes(
                      'Available Today',
                    )}
                    onChange={() => handleConsultationToggle('Available Today')}
                  />

                  <FilterCheckbox
                    label='This Week'
                    isChecked={selectedConsultations.includes('This Week')}
                    onChange={() => handleConsultationToggle('This Week')}
                  />
                </div>
              </div>

              <div className='pt-4 w flex flex-col gap-3'>
                <span className='font-semibold text-gray-800 text-[14px]'>
                  Fee Range
                </span>
                <FeeRangeDropdown
                  selectedFee={feeRange}
                  onChange={setFeeRange}
                />
              </div>

              <div className='pt-4 w flex flex-col gap-3'>
                <span className='font-semibold text-gray-800 text-[14px]'>
                  HMO Affiliations
                </span>
                <div className='flex flex-col gap-2'>
                  <FilterCheckbox
                    label='PhilHealth'
                    isChecked={selectedConsultations.includes('PhilHealth')}
                    onChange={() => handleConsultationToggle('PhilHealth')}
                  />

                  <FilterCheckbox
                    label='MaxiCare'
                    isChecked={selectedConsultations.includes('MaxiCare')}
                    onChange={() => handleConsultationToggle('MaxiCare')}
                  />

                  <FilterCheckbox
                    label='Medicard'
                    isChecked={selectedConsultations.includes('Medicard')}
                    onChange={() => handleConsultationToggle('Medicard')}
                  />

                  <FilterCheckbox
                    label='Intellicare'
                    isChecked={selectedConsultations.includes('Intellicare')}
                    onChange={() => handleConsultationToggle('Intellicare')}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='group flex-1  flex flex-col justify-between mb-20 mx-4'>
            <div className='group flex  items-center justify-between '>
              <span>
                Found <span className='font-bold'>3</span> results
              </span>
              <SortDropdown selectedSort={sortRange} onChange={setSortRange} />
            </div>
            <div>
              <div className=' '>
                {specialistsProfile.map(
                  (
                    {
                      image,
                      name,
                      specialty,
                      schedule,
                      hospital,
                      location,
                      consultationFee,
                      hmo,
                      rating,
                      ratingCount,
                    },
                    index,
                  ) => (
                    <div
                      key={name}
                      className='grid md:flex  mt-5 gap-6 w-full  hover:shadow-md  transition-all bg-white border border-gray-200 rounded-2xl p-6 shadow-sm'
                    >
                      <div className='pb-2 rounded-2xl overflow-hidden'>
                        {image}
                      </div>
                      <div className='flex w-full justify-between'>
                        <div className='flex flex-col gap-2.5'>
                          <div>
                            <div className='font-bold  text-xl text-black'>
                              {name}
                            </div>
                            <span className='font-semibold text-md text-blue-600'>
                              {specialty}
                            </span>
                          </div>

                          <span className='font-light text-gray-700 flex items-center text-[14px] gap-1.5'>
                            <Building className='size-4' /> {hospital}
                          </span>
                          <span className='font-light text-gray-700 flex items-center text-[14px] gap-1.5'>
                            <MapPin className='size-4' /> {location}
                          </span>
                          <span className='font-light text-gray-700 flex items-center text-[14px] gap-1.5'>
                            <Calendar className='size-4' /> {schedule}
                          </span>
                          <span className='font-light text-gray-700 flex items-center text-[14px] gap-1.5'>
                            <span className='flex items-center text-[15px] gap-1.5'>
                              <DollarSign className='size-4' /> Consultation
                              Fee:{' '}
                              <span className='font-semibold text-[14px]'>
                                ₱{consultationFee}
                              </span>
                            </span>
                          </span>
                          <div className='flex flex-wrap items-center gap-2'>
                            <span className='text-[14px] text-gray-600'>
                              HMO:
                            </span>

                            <div className='flex flex-wrap gap-1.5'>
                              {hmo.map((provider) => (
                                <span
                                  key={provider}
                                  className='px-2 py-0.5 bg-green-100 text-green-700 text-[12px] font-medium rounded-md'
                                >
                                  {provider}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className='gap-3 mt-1 flex'>
                            <button className='flex items-center justify-center gap-2 w-45 text-[14px] bg-blue-600 text-white font-semibold rounded-lg py-2 hover:bg-blue-700 transition-all hover:cursor-pointer'>
                              <Video className='size-4' />
                              Book Appointment
                            </button>

                            <button
                              onClick={() => {
                                window.scrollTo(0, 0);
                                navigate(`/specialist/${index}`);
                              }}
                              className='flex items-center justify-center gap-2 w-30 text-[14px] bg-white text-black border border-gray-700 font-semibold rounded-lg py-2 hover:bg-gray-100 transition-all hover:cursor-pointer'
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className='flex items-center gap-1 group font-bold'>
                            <Star className='fill-yellow-400 text-yellow-400 size-5' />
                            {rating}{' '}
                            <span className='font-light'>({ratingCount})</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div>
              <div className=' '></div>
            </div>
          </div>
        </div>
      </section>
      <section></section>
    </main>
  );
}
