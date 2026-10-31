import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthUser, ActivePage, StudentRecord, RegionalAccount, HousingLocation, LeadershipMember, ServiceIdentityConfig } from './types';
import {
  INITIAL_REGIONAL_ACCOUNTS,
  INITIAL_IDENTITY_CONFIG,
} from './data/constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { StudentDirectoryPage } from './pages/StudentDirectoryPage';
import { FamilyRegionalPage } from './pages/FamilyRegionalPage';
import { HousingLocationsPage } from './pages/HousingLocationsPage';
import { LeadershipManagementPage } from './pages/LeadershipManagementPage';
import { StudentMapPage } from './pages/StudentMapPage';
import { SchedulePage } from './pages/SchedulePage';
import { AddStudentModal } from './components/AddStudentModal';
import { BulkImportSection } from './components/BulkImportSection';
import { AccountManagementSection } from './components/AccountManagementSection';
import { IdentitySettingsModal } from './components/IdentitySettingsModal';
import {
  fetchStudentsFromSupabase,
  addStudentToSupabase,
  updateStudentInSupabase,
  deleteStudentFromSupabase,
  bulkInsertStudentsToSupabase,
  fetchHousingFromSupabase,
  addHousingToSupabase,
  updateHousingInSupabase,
  deleteHousingFromSupabase,
  fetchLeadershipFromSupabase,
  addLeadershipToSupabase,
  updateLeadershipInSupabase,
  deleteLeadershipFromSupabase,
  fetchIdentityFromSupabase,
  saveIdentityToSupabase,
} from './services/supabaseService';
import { signOutSupabaseSession } from './services/authService';
import { Loader2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  // Authentication state - mandatory entry point at root
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('maghagha_youth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active page view
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  // Supabase state initializers - defaulting to empty arrays (ZERO fallback dummy data)
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [housingLocations, setHousingLocations] = useState<HousingLocation[]>([]);
  const [leadershipList, setLeadershipList] = useState<LeadershipMember[]>([]);

  // Regional accounts and security credentials
  const [accounts, setAccounts] = useState<RegionalAccount[]>(() => {
    try {
      const saved = localStorage.getItem('maghagha_youth_accounts');
      return saved ? JSON.parse(saved) : INITIAL_REGIONAL_ACCOUNTS;
    } catch {
      return INITIAL_REGIONAL_ACCOUNTS;
    }
  });

  // Identity, Logos, Vision & Mission Config
  const [identityConfig, setIdentityConfig] = useState<ServiceIdentityConfig>(INITIAL_IDENTITY_CONFIG);

  // Loading & Error States
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dbNotification, setDbNotification] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentRecord | null>(null);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);

  // Fetch live data from Supabase on mount
  useEffect(() => {
    let isMounted = true;

    async function loadLiveSupabaseData() {
      setIsLoadingData(true);
      setDbNotification(null);

      try {
        const [dbStudents, dbHousing, dbLeadership, dbIdentity] = await Promise.all([
          fetchStudentsFromSupabase(),
          fetchHousingFromSupabase(),
          fetchLeadershipFromSupabase(),
          fetchIdentityFromSupabase(),
        ]);

        if (isMounted) {
          setStudents(dbStudents || []);
          setHousingLocations(dbHousing || []);
          setLeadershipList(dbLeadership || []);
          if (dbIdentity) setIdentityConfig(dbIdentity);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Error fetching live data from Supabase:', err);
          setDbNotification({
            type: 'error',
            message: 'تعذر الاتصال بقاعدة بيانات Supabase. يرجى التأكد من توفر الاتصال بالإنترنت وصحة المفاتيح.',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    }

    loadLiveSupabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync authentication state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('maghagha_youth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('maghagha_youth_user');
    }
  }, [currentUser]);

  // Sync accounts to localStorage
  useEffect(() => {
    localStorage.setItem('maghagha_youth_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (dbNotification?.type === 'success') {
      const timer = setTimeout(() => setDbNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [dbNotification]);

  // Handle Login
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setActivePage('dashboard');
  };

  // Handle Logout
  const handleLogout = async () => {
    await signOutSupabaseSession();
    setCurrentUser(null);
    setActivePage('dashboard');
  };

  // Save student (handles both Add and Edit with Supabase)
  const handleSaveStudent = async (
    studentData: Omit<StudentRecord, 'id' | 'registrationDate'>,
    existingId?: string
  ) => {
    if (existingId) {
      const updatedRecord: StudentRecord = {
        ...studentData,
        id: existingId,
        registrationDate: new Date().toISOString().split('T')[0],
      };
      setStudents((prev) =>
        prev.map((s) => (s.id === existingId ? updatedRecord : s))
      );
      const success = await updateStudentInSupabase(updatedRecord);
      if (!success) {
        setDbNotification({
          type: 'error',
          message: 'حدث خرد أثناء تحديث البيانات في Supabase. يرجى إعادة المحاولة.',
        });
      } else {
        setDbNotification({
          type: 'success',
          message: 'تم تحديث بيانات الطالب في قاعدة البيانات بنجاح.',
        });
      }
    } else {
      const tempId = `st-${Date.now()}`;
      const tempRecord: StudentRecord = {
        ...studentData,
        id: tempId,
        registrationDate: new Date().toISOString().split('T')[0],
      };
      setStudents((prev) => [tempRecord, ...prev]);

      const added = await addStudentToSupabase(studentData);
      if (added) {
        setStudents((prev) => prev.map((s) => (s.id === tempId ? added : s)));
        setDbNotification({
          type: 'success',
          message: 'تم إضافة الطالب وسجل البيانات في Supabase بنجاح.',
        });
      } else {
        setDbNotification({
          type: 'error',
          message: 'حدث خطأ أثناء حفظ الطالب في Supabase.',
        });
      }
    }
    setStudentToEdit(null);
  };

  // Open Add Student Modal
  const handleOpenAddStudent = () => {
    setStudentToEdit(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Student Modal
  const handleEditStudent = (student: StudentRecord) => {
    setStudentToEdit(student);
    setIsAddModalOpen(true);
  };

  // Update student directly
  const handleUpdateStudent = async (updatedStudent: StudentRecord) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    const success = await updateStudentInSupabase(updatedStudent);
    if (!success) {
      setDbNotification({
        type: 'error',
        message: 'حدث خطأ أثناء تعديل بيانات الطالب في Supabase.',
      });
    }
  };

  // Bulk import multiple students from Excel to Supabase
  const handleBulkImportStudents = async (
    newStudents: Omit<StudentRecord, 'id' | 'registrationDate'>[]
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newRecords: StudentRecord[] = newStudents.map((st, index) => ({
      ...st,
      id: `st-imp-${Date.now()}-${index}`,
      registrationDate: today,
    }));

    setStudents((prev) => [...newRecords, ...prev]);

    const success = await bulkInsertStudentsToSupabase(newStudents);
    if (success) {
      setDbNotification({
        type: 'success',
        message: `تم استيراد وحفظ ${newStudents.length} طالباً في قاعدة بيانات Supabase بنجاح.`,
      });
    } else {
      setDbNotification({
        type: 'error',
        message: 'حدث خطأ أثناء رفع بيانات استيراد إكسيل إلى Supabase.',
      });
    }
  };

  // Delete student from Supabase
  const handleDeleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    const success = await deleteStudentFromSupabase(id);
    if (success) {
      setDbNotification({
        type: 'success',
        message: 'تم حذف الطالب من قاعدة البيانات بنجاح.',
      });
    } else {
      setDbNotification({
        type: 'error',
        message: 'حدث خطأ أثناء حذف الطالب من Supabase.',
      });
    }
  };

  // Reset records (clears array and requests live refresh from Supabase)
  const handleResetData = async () => {
    setIsLoadingData(true);
    const dbStudents = await fetchStudentsFromSupabase();
    setStudents(dbStudents);
    setIsLoadingData(false);
  };

  // Update regional account password / information
  const handleUpdateAccount = (updatedAccount: RegionalAccount) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );
  };

  // Reset accounts to defaults
  const handleResetAccountsToDefault = () => {
    setAccounts(INITIAL_REGIONAL_ACCOUNTS);
    localStorage.setItem('maghagha_youth_accounts', JSON.stringify(INITIAL_REGIONAL_ACCOUNTS));
  };

  // Off-Campus Housing management functions
  const handleAddHousingLocation = async (newHousing: Omit<HousingLocation, 'id'>) => {
    const tempId = `house-${Date.now()}`;
    const tempHousing: HousingLocation = { ...newHousing, id: tempId };
    setHousingLocations((prev) => [tempHousing, ...prev]);

    const added = await addHousingToSupabase(newHousing);
    if (added) {
      setHousingLocations((prev) => prev.map((h) => (h.id === tempId ? added : h)));
      setDbNotification({
        type: 'success',
        message: 'تم إضافة السكن الخارجي في Supabase بنجاح.',
      });
    } else {
      setDbNotification({
        type: 'error',
        message: 'حدث خطأ أثناء حفظ السكن الخارجي في Supabase.',
      });
    }
  };

  const handleUpdateHousingLocation = async (updatedHousing: HousingLocation) => {
    setHousingLocations((prev) =>
      prev.map((h) => (h.id === updatedHousing.id ? updatedHousing : h))
    );
    const success = await updateHousingInSupabase(updatedHousing);
    if (!success) {
      setDbNotification({
        type: 'error',
        message: 'حدث خطأ أثناء تعديل السكن الخارجي في Supabase.',
      });
    }
  };

  const handleDeleteHousingLocation = async (id: string) => {
    setHousingLocations((prev) => prev.filter((h) => h.id !== id));
    setStudents((prev) =>
      prev.map((s) => (s.housingUnitId === id ? { ...s, housingUnitId: undefined } : s))
    );
    const success = await deleteHousingFromSupabase(id);
    if (!success) {
      setDbNotification({
        type: 'error',
        message: 'حدث خطأ أثناء حذف السكن من Supabase.',
      });
    }
  };

  // Leadership & Organizational Structure functions
  const handleAddLeadershipMember = async (newMember: Omit<LeadershipMember, 'id'>) => {
    const tempId = `lead-${Date.now()}`;
    const tempMember: LeadershipMember = { ...newMember, id: tempId };
    setLeadershipList((prev) => [tempMember, ...prev]);

    const added = await addLeadershipToSupabase(newMember);
    if (added) {
      setLeadershipList((prev) => prev.map((m) => (m.id === tempId ? added : m)));
      setDbNotification({
        type: 'success',
        message: 'تم إضافة العضو للهيكل الإداري في Supabase بنجاح.',
      });
    } else {
      setDbNotification({
        type: 'error',
        message: 'حدث خطأ أثناء إضافة العضو إلى Supabase.',
      });
    }
  };

  const handleUpdateLeadershipMember = async (updatedMember: LeadershipMember) => {
    setLeadershipList((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
    const success = await updateLeadershipInSupabase(updatedMember);
    if (!success) {
      setDbNotification({
        type: 'error',
        message: 'حدث خطأ أثناء تعديل بيانات القيادة في Supabase.',
      });
    }
  };

  const handleDeleteLeadershipMember = async (id: string) => {
    setLeadershipList((prev) => prev.filter((m) => m.id !== id));
    const success = await deleteLeadershipFromSupabase(id);
    if (!success) {
      setDbNotification({
        type: 'error',
        message: 'حدث خطأ أثناء حذف العضو من Supabase.',
      });
    }
  };

  // Identity settings save
  const handleSaveIdentityConfig = async (config: ServiceIdentityConfig) => {
    setIdentityConfig(config);
    const success = await saveIdentityToSupabase(config);
    if (success) {
      setDbNotification({
        type: 'success',
        message: 'تم حفظ إعدادات هوية المنصة والشعارات في Supabase.',
      });
    }
  };

  // Mandatory Login Enforcement at Root
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Header View */}
      <Header
        user={currentUser}
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
        onLogout={handleLogout}
        generalLogoUrl={identityConfig.generalLogoUrl}
        onOpenIdentitySettings={() => setIsIdentityModalOpen(true)}
      />

      {/* Database Notification Alert Banner */}
      {dbNotification && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
              dbNotification.type === 'error'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{dbNotification.message}</span>
            </div>
            <button
              onClick={() => setDbNotification(null)}
              className="text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {isLoadingData ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-4 my-8 animate-pulse">
            <Loader2 className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">جاري الاتصال وجلب البيانات المباشرة من Supabase...</h3>
              <p className="text-xs text-slate-400">
                يتم استعلام جداول الطلاب والسكنات الهيكل الإداري والأسر الإقليمية مباشرة من خادم القاعدة.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {activePage === 'dashboard' && (
                <AdminDashboardPage
                  user={currentUser}
                  students={students}
                  accounts={accounts}
                  onUpdateAccount={handleUpdateAccount}
                  onResetAccountsToDefault={handleResetAccountsToDefault}
                  onOpenAddStudent={handleOpenAddStudent}
                  onNavigate={(page) => setActivePage(page)}
                  onResetData={handleResetData}
                  onDeleteStudent={handleDeleteStudent}
                  onEditStudent={handleEditStudent}
                  onOpenIdentitySettings={() => setIsIdentityModalOpen(true)}
                />
              )}

              {activePage === 'geomap' && (
                <StudentMapPage
                  user={currentUser}
                  students={students}
                  onUpdateStudent={handleUpdateStudent}
                  onNavigateToBulkImport={() => setActivePage('bulk-import')}
                />
              )}

              {activePage === 'leadership' && (
                <LeadershipManagementPage
                  user={currentUser}
                  leadershipList={leadershipList}
                  onAddMember={handleAddLeadershipMember}
                  onUpdateMember={handleUpdateLeadershipMember}
                  onDeleteMember={handleDeleteLeadershipMember}
                />
              )}

              {activePage === 'students' && (
                <StudentDirectoryPage
                  user={currentUser}
                  students={students}
                  onOpenAddStudent={handleOpenAddStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onNavigateToBulkImport={() => setActivePage('bulk-import')}
                  onEditStudent={handleEditStudent}
                />
              )}

              {activePage === 'bulk-import' && (
                <BulkImportSection
                  user={currentUser}
                  onImportStudents={handleBulkImportStudents}
                  onNavigateToStudents={() => setActivePage('students')}
                />
              )}

              {activePage === 'security' && currentUser.role === 'GENERAL_SECRETARIAT' && (
                <div className="space-y-6">
                  <AccountManagementSection
                    accounts={accounts}
                    onUpdateAccount={handleUpdateAccount}
                    onResetAllToDefault={handleResetAccountsToDefault}
                  />
                </div>
              )}

              {activePage === 'families' && (
                <FamilyRegionalPage
                  user={currentUser}
                  students={students}
                  identityConfig={identityConfig}
                />
              )}

              {activePage === 'housing' && (
                <HousingLocationsPage
                  user={currentUser}
                  housingLocations={housingLocations}
                  students={students}
                  onAddHousingLocation={handleAddHousingLocation}
                  onUpdateHousingLocation={handleUpdateHousingLocation}
                  onDeleteHousingLocation={handleDeleteHousingLocation}
                  onUpdateStudent={handleUpdateStudent}
                />
              )}

              {activePage === 'schedule' && (
                <SchedulePage user={currentUser} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Footer View */}
      <Footer
        identityConfig={identityConfig}
        user={currentUser}
        onOpenIdentitySettings={() => setIsIdentityModalOpen(true)}
      />

      {/* Add / Edit Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
        currentUserRole={currentUser.role}
        currentRegionId={currentUser.regionId}
        studentToEdit={studentToEdit}
        housingLocations={housingLocations}
      />

      {/* Identity & Branding Settings Modal */}
      <IdentitySettingsModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
        config={identityConfig}
        onSaveConfig={handleSaveIdentityConfig}
        user={currentUser}
      />
    </div>
  );
};

export default App;
