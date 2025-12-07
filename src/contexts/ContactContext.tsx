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

// ✅ DEFAULT VALUES - Nomor Abang (Owner) - VERSION 2
const CONTACT_VERSION = 'v2'; // ✅ Increment untuk force reset localStorage
const defaultContactInfo: ContactInfo = {
  phone1: '6289692854470',
  phone2: '082253446316',
  instagram: '@kuala_outdoor',
  address: 'Jl. K.H. Abdurrahman Wahid, Kuala Dua, Gg Jambu, No 78, Kab. Kubu Raya'
};

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo);
  const [loading, setLoading] = useState(true);

  // ✅ HARD RESET localStorage jika version berbeda
  useEffect(() => {
    try {
      const savedVersion = localStorage.getItem('contact_version');
      const saved = localStorage.getItem('contact_info');
      
      // ✅ FORCE RESET jika version berbeda atau tidak ada
      if (savedVersion !== CONTACT_VERSION) {
        console.log('🔄 RESET localStorage - version changed:', savedVersion, '->', CONTACT_VERSION);
        setContactInfo(defaultContactInfo);
        localStorage.setItem('contact_info', JSON.stringify(defaultContactInfo));
        localStorage.setItem('contact_version', CONTACT_VERSION);
      } else if (saved) {
        // ✅ GUNAKAN YANG DI localStorage (hasil save admin)
        const parsed = JSON.parse(saved);
        setContactInfo(parsed);
        console.log('✅ Loaded contact from localStorage:', parsed.phone1);
      } else {
        // ✅ KALAU BELUM ADA, GUNAKAN DEFAULT
        setContactInfo(defaultContactInfo);
        localStorage.setItem('contact_info', JSON.stringify(defaultContactInfo));
        localStorage.setItem('contact_version', CONTACT_VERSION);
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
      console.log('💾 Saving new contact info:', newInfo.phone1);
      setContactInfo(newInfo);
      localStorage.setItem('contact_info', JSON.stringify(newInfo));
      localStorage.setItem('contact_version', CONTACT_VERSION);
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