import {useEffect} from 'react';
import {useSeniorStore} from '../store/senior.store';

export const useSeniors = () => {
  const {seniors, isLoading, error, fetchSeniors} = useSeniorStore();

  useEffect(() => {
    fetchSeniors();
  }, [fetchSeniors]);

  function calculateAge(birthDateString: string) {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  return {seniors, isLoading, error, calculateAge};
};
