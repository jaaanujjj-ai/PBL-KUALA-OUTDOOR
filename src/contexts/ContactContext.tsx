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

// ✅ DEFAULT VALUES
const defaultContactInfo: ContactInfo = {
  phone1: '089692854470',
  phone2: '082253446316',
  instagram: '@kuala_outdoor',
  address: 'Jl. K.H. Abdurrahman Wahid, Kuala Dua, Gg Jambu, No 78, Kab. Kubu Raya'
};

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo);
  const [loading, setLoading] = useState(true);

  // Load dari localStorage saat init
  useEffect(() => {
    try {
      const saved = localStorage.getItem('contact_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        setContactInfo(parsed);
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