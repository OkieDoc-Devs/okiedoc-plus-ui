import {
  Award,
  Building,
  CircleCheck,
  Clock,
  DollarSign,
  Hospital,
  MapPin,
  Shield,
  Star,
  VideoIcon,
} from 'lucide-react';

export default function SpecialistProfile() {
  return (
    <div className='min-h-screen bg-gray-100 pt-20'>
      <div className='flex items-center gap-2 text-sm border-b border-gray-100 text-gray-700 bg-blue-50 p-3 lg:pl-8 2xl:pl-52 transition-all'>
        <MapPin className='text-blue-500 size-4' />
        <div>
          Serving
          <a className='font-semibold text-blue-500'> Naga City</a>
        </div>
      </div>

      <div className='flex flex-col xl:flex-row xl:items-start xl:gap-6 xl:px-8 2xl:px-52'>
        {/* Left column */}
        <div className='flex flex-col flex-1 '>
          {/* Profile Header */}
          <div className='flex flex-col gap-4 bg-white p-8 shadow-sm mx-5 my-5 xl:mx-0 rounded-lg border border-gray-100'>
            <div className='flex flex-col sm:flex-row w-full'>
              <div className='relative bg-blue-100 rounded-lg size-30 flex justify-center items-center overflow-visible'>
                <div className='bg-blue-200 rounded-full size-22'></div>
                <div className='absolute -bottom-2 -right-2 bg-white rounded-full p-0.5'>
                  <CircleCheck className='text-white size-8 p-1 bg-green-500 rounded-full' />
                </div>
              </div>
              <div className='flex flex-col sm:px-6 gap-0.5 mt-4 sm:mt-0'>
                <span className='font-bold text-3xl'>Dr. Maria Santos</span>
                <span className='font-semibold text-xl text-blue-600'>
                  Pediatrician
                </span>
                <span>Child Development & Behavioral Pediatrics</span>
                <div className='flex items-center gap-0.5'>
                  <span className='items-center flex gap-1.5 font-bold'>
                    <Star className='text-yellow-400 fill-yellow-400 size-5' />{' '}
                    4.9{' '}
                    <span className='font-light text-base text-gray-600'>
                      (127 reviews)
                    </span>
                  </span>
                  <div className='bg-gray-300 rounded-full size-1 mx-3'></div>
                  <span className='flex text-gray-600 gap-1.5'>
                    <Award />
                    15 years experience
                  </span>
                </div>
              </div>
            </div>
            <div className='flex flex-col sm:flex-row sm:px-36 text-lg'>
              <div className='flex items-center gap-1.5 pt-3 sm:pt-0'>
                <DollarSign className='text-gray-500' />
                Consultation Fee: <span className='font-semibold'>₱800</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className='flex flex-col gap-4 bg-white p-8 shadow-sm mx-5 my-5 xl:mx-0 rounded-lg border py-10 border-gray-100'>
            <span className='text-2xl font-bold'>About</span>
            <p className='text-gray-700'>
              Dr. Maria Santos is a board-certified pediatrician with over 15
              years of experience in child healthcare. She specializes in child
              development, behavioral issues, and preventive care for children
              from newborn to adolescence.
            </p>
          </div>

          {/* Clinic Locations */}
          <div className='flex flex-col gap-4 bg-white p-8 shadow-sm mx-5 my-5 xl:mx-0 rounded-lg border border-gray-100'>
            <span className='text-2xl font-bold'>Clinic Locations</span>
            <div className='bg-white p-4 flex justify-center flex-col border gap-1.5 border-gray-300 rounded-xl w-full'>
              <span className='items-center flex gap-2 text-[18px] font-semibold'>
                <Building className='size-4 text-blue-600' />
                Naga City Medical Clinic
              </span>
              <span className='items-center flex gap-2 hover:text-blue-500 font-semibold text-[14px] text-gray-600'>
                <MapPin className='size-4' />
                123 Panganiban Drive, Naga City
              </span>
              <span className='items-center flex gap-2 font-base text-gray-600 text-[14px]'>
                <Clock className='size-4' />
                Mon-Fri: 9:00 AM - 5:00 PM
              </span>
            </div>
            <div className='bg-white p-4 flex justify-center flex-col border gap-1.5 border-gray-300 rounded-xl w-full'>
              <span className='items-center flex gap-2 text-[18px] font-semibold'>
                <Building className='size-4 text-blue-600' />
                Children's Health Center
              </span>
              <span className='items-center flex gap-2 hover:text-blue-500 font-semibold text-[14px] text-gray-600'>
                <MapPin className='size-4' />
                456 Magsaysay Avenue, Naga City
              </span>
              <span className='items-center flex gap-2 font-base text-gray-600 text-[14px]'>
                <Clock className='size-4' />
                Sat: 10:00 AM - 2:00 PM
              </span>
            </div>
          </div>

          {/* Education */}
          <div className='flex flex-col gap-4 bg-white p-8 shadow-sm mx-5 my-5 xl:mx-0 rounded-lg border border-gray-100'>
            <span className='text-2xl font-bold'>Education & Training</span>
            <div className='flex flex-col gap-4'>
              <div className='flex items-start gap-2'>
                <div className='bg-blue-600 rounded-full size-2 mt-2'></div>
                <div className='flex flex-col'>
                  <span className='font-semibold text-lg'>
                    Doctor of Medicine
                  </span>
                  <span className='text-gray-700'>
                    University of the Philippines Manila
                  </span>
                  <span className='text-[14px] text-gray-700'>2006</span>
                </div>
              </div>
              <div className='flex items-start gap-2'>
                <div className='bg-blue-600 rounded-full size-2 mt-2'></div>
                <div className='flex flex-col'>
                  <span className='font-semibold text-lg'>
                    Residency in Pediatrics
                  </span>
                  <span className='text-gray-700'>
                    Philippine General Hospital
                  </span>
                  <span className='text-[14px] text-gray-700'>2009</span>
                </div>
              </div>
              <div className='flex items-start gap-2'>
                <div className='bg-blue-600 rounded-full size-2 mt-2'></div>
                <div className='flex flex-col'>
                  <span className='font-semibold text-lg'>
                    Fellowship in Child Development
                  </span>
                  <span className='text-gray-700'>Makati Medical Center</span>
                  <span className='text-[14px] text-gray-700'>2011</span>
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-4 bg-white p-8 py-10 shadow-sm mx-5 my-5 xl:mx-0 rounded-lg border border-gray-100'>
            <span className='text-2xl font-bold'>Certifications</span>
            <div className='flex flex-col gap-2'>
              <span className='flex items-center gap-2 text-gray-700'>
                <CircleCheck className='text-green-600 size-6' /> Board
                Certified Pediatrician - Philippine Pediatric Society
              </span>
              <span className='flex items-center gap-2 text-gray-700'>
                <CircleCheck className='text-green-600 size-6' />
                Fellow, Philippine Academy of Pediatrics
              </span>
              <span className='flex items-center gap-2 text-gray-700'>
                <CircleCheck className='text-green-600 size-6' />
                Certified in Pediatric Advanced Life Support (PALS)
              </span>
            </div>
          </div>
        </div>

        <div className='xl:w-100 xl:shrink-0 xl:self-stretch flex flex-col gap-4 mx-5 xl:mx-0 my-5'>
          <div className='bg-blue-600 p-6 rounded-lg xl:sticky xl:top-24'>
            <div className='text-white flex flex-col gap-2 mb-4'>
              <span className='text-xl font-bold'>Book an Appointment</span>
              <span className='text-base text-gray-200 font-light'>
                Available for online consultation and physical visits
              </span>
            </div>
            <div className='flex flex-col gap-4'>
              <button className='items-center justify-center lg:text-[15px] bg-white p-3 w-full text-blue-600 flex gap-2 rounded-xl px-4'>
                <VideoIcon className='lg:size-4' />
                Book Online Consultation
              </button>
              <button className='items-center justify-center lg:text-[15px] bg-white p-3 w-full text-blue-600 flex gap-2 rounded-xl px-4'>
                <VideoIcon className='lg:size-4' />
                Schedule Physical Consultation
              </button>
            </div>
          </div>


          <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-xs'>
            <div className='flex flex-col gap-2'>
              <span className='text-xl text-black font-bold flex items-center gap-2 pb-2'>
                <Hospital className='text-blue-600' />
                Hospital Affiliations
              </span>
              <span className='text-[14px] text-blue-600'>
                Bicol Medical Center
              </span>
              <span className='text-[14px] text-blue-600'>
                Naga City Hospital
              </span>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-xs'>
            <div className='flex flex-col gap-2'>
              <span className='text-xl text-black font-bold flex items-center gap-2 pb-2'>
                <Shield className='text-green-600' />
                HMO Coverage
              </span>
              <div className='flex gap-2 flex-wrap'>
                <span className='text-[14px] text-green-700 bg-green-100 rounded-xl w-fit px-4 py-0.5'>
                  PhilHealth
                </span>
                <span className='text-[14px] text-green-700 bg-green-100 rounded-xl w-fit px-4 py-0.5'>
                  MaxiCare
                </span>
                <span className='text-[14px] text-green-700 bg-green-100 rounded-xl w-fit px-4 py-0.5'>
                  Medicard
                </span>
                <span className='text-[14px] text-green-700 bg-green-100 rounded-xl w-fit px-4 py-0.5'>
                  Intellicare
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
