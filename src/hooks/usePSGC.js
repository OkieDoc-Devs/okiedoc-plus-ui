import { useState, useEffect, useCallback } from 'react';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

export const usePSGC = () => {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState({
    regions: false,
    provinces: false,
    cities: false,
    barangays: false,
  });

  useEffect(() => {
    const fetchRegions = async () => {
      setLoading((prev) => ({ ...prev, regions: true }));
      try {
        const response = await fetch(`${PSGC_BASE_URL}/regions.json`);
        const data = await response.json();
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setRegions(sortedData);
      } catch (error) {
        console.error('Error fetching regions:', error);
      } finally {
        setLoading((prev) => ({ ...prev, regions: false }));
      }
    };
    fetchRegions();
  }, []);

  const fetchProvinces = useCallback(async (regionCode) => {
    if (!regionCode) {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
      return;
    }
    setLoading((prev) => ({ ...prev, provinces: true }));
    try {
      const response = await fetch(
        `${PSGC_BASE_URL}/regions/${regionCode}/provinces.json`,
      );
      const data = await response.json();
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setProvinces(sortedData);
      setCities([]);
      setBarangays([]);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoading((prev) => ({ ...prev, provinces: false }));
    }
  }, []);

  const fetchCities = useCallback(async (provinceCode) => {
    if (!provinceCode) {
      setCities([]);
      setBarangays([]);
      return;
    }
    setLoading((prev) => ({ ...prev, cities: true }));
    try {
      const response = await fetch(
        `${PSGC_BASE_URL}/provinces/${provinceCode}/cities-municipalities.json`,
      );
      const data = await response.json();
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setCities(sortedData);
      setBarangays([]);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading((prev) => ({ ...prev, cities: false }));
    }
  }, []);

  const fetchBarangays = useCallback(async (cityCode) => {
    if (!cityCode) {
      setBarangays([]);
      return;
    }
    setLoading((prev) => ({ ...prev, barangays: true }));
    try {
      const response = await fetch(
        `${PSGC_BASE_URL}/cities-municipalities/${cityCode}/barangays.json`,
      );
      const data = await response.json();
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setBarangays(sortedData);
    } catch (error) {
      console.error('Error fetching barangays:', error);
    } finally {
      setLoading((prev) => ({ ...prev, barangays: false }));
    }
  }, []);

  return {
    regions,
    provinces,
    cities,
    barangays,
    loading,
    fetchProvinces,
    fetchCities,
    fetchBarangays,
  };
};
