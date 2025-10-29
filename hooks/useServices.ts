import { useEffect, useState } from 'react';
import { fetchServices, Service } from '../src/serviceApi';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);


  useEffect(() => {
    const load = async () => {
      const data = await fetchServices();
      setServices(data);
    };
    load();
  }, []);

  return services;
};
