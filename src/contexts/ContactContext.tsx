import React, { createContext, useContext, useState, useEffect } from 'react';

interface ContactInfo {
  phone1: string;
  phone2: string;
  instagram: string;
  address: string;
}

interface ContactContextType {
  contactInfo: ContactInfo;
  updateContactInfo: (newInfo: ContactInfo) => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

// ✅ DEFAULT VALUES - Nomor Abang (Owner)
const defaultContactInfo: ContactInfo = {
  phone1: '6289692854470',
  phone2: '082253446316',
  instagram: '@kuala_outdoor',
  address: 'Jl. K.H. Abdurrahman Wahid, Kuala Dua, Gg Jambu, No 78, Kab. Kubu Raya'
};

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo);
  const [loading, setLoading] = useState(true);

  // ✅ PRIORITAS: localStorage (yang admin save) > default
  useEffect(() => {
    try {
      const saved = localStorage.getItem('contact_info');
      if (saved) {
        // ✅ GUNAKAN YANG DI localStorage (hasil save admin)
        const parsed = JSON.parse(saved);
        setContactInfo(parsed);
        console.log('✅ Loaded contact from localStorage:', parsed.phone1);
      } else {
        // ✅ KALAU BELUM ADA, GUNAKAN DEFAULT
        setContactInfo(defaultContactInfo);
        localStorage.setItem('contact_info', JSON.stringify(defaultContactInfo));
        console.log('✅ Set default contact:', defaultContactInfo.phone1);
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
      setContactInfo(defaultContactInfo);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContactInfo = (newInfo: ContactInfo) => {
    try {
      setContactInfo(newInfo);
      localStorage.setItem('contact_info', JSON.stringify(newInfo));
    } catch (error) {
      console.error('Error saving contact info:', error);
    }
  };

  // ✅ RETURN LOADING STATE JIKA MASIH LOADING
  if (loading) {
    return <div>Loading contact info...</div>;
  }

  return (
    <ContactContext.Provider value={{ contactInfo, updateContactInfo }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};