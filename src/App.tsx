import React, { useState } from 'react';
import {
  UserRole,
  AppView,
  SupportedLanguage,
  FarmerNavTab,
  Notification
} from './types';
import { KisanSetuProvider, useKisanSetu } from './context/KisanSetuContext';
import { LandingPage } from './pages/LandingPage';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { NotificationDrawer } from './components/navigation/NotificationDrawer';
import { VoiceAssistantModal } from './components/navigation/VoiceAssistantModal';
import { FarmerLayout } from './layouts/FarmerLayout';
import { PortalLayout } from './layouts/PortalLayout';
import { FarmerHome } from './pages/farmer/FarmerHome';
import { BookSlotPage } from './pages/farmer/BookSlotPage';
import { TokenPage } from './pages/farmer/TokenPage';
import { CentreStatusPage } from './pages/farmer/CentreStatusPage';
import { FarmerBookingsPage } from './pages/farmer/FarmerBookingsPage';
import { ProducePage } from './pages/farmer/ProducePage';
import { PaymentsPage } from './pages/farmer/PaymentsPage';
import { FarmerAssistant } from './pages/farmer/FarmerAssistant';
import { FarmerProfile } from './pages/farmer/FarmerProfile';
import { DemoSimulationBar } from './components/farmer/DemoSimulationBar';
import { OperatorPortal } from './pages/operator/OperatorPortal';
import { TransporterPortal } from './pages/transporter/TransporterPortal';
import { AdminPortal } from './pages/admin/AdminPortal';

function AppContent() {
  const {
    farmer,
    activeBooking,
    currentToken,
    centres,
    bookings,
    vehicles,
    notifications,
    ecosystemStats,
    language,
    setLanguage,
    markAllNotificationsRead
  } = useKisanSetu();

  // Navigation & Role State
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Sub-tabs for each portal shell
  const [farmerTab, setFarmerTab] = useState<FarmerNavTab>('home');
  const [operatorTab, setOperatorTab] = useState('overview');
  const [transporterTab, setTransporterTab] = useState('overview');
  const [adminTab, setAdminTab] = useState('overview');

  const handleSelectRole = (role: UserRole) => {
    setCurrentView(role);
    setIsRoleModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationAction = (notification: Notification) => {
    if (notification.roleTarget === 'farmer') {
      setCurrentView('farmer');
      setFarmerTab('token');
    }
  };

  // View 1: Landing Page
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onLaunchDemo={() => setIsRoleModalOpen(true)}
          onSelectRole={handleSelectRole}
        />

        <RoleSelectionModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          onSelectRole={handleSelectRole}
        />

        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={markAllNotificationsRead}
          onNotificationAction={handleNotificationAction}
        />
      </>
    );
  }

  // View 2: Farmer Portal (Full Part 2 Implementation)
  if (currentView === 'farmer') {
    return (
      <FarmerLayout
        activeTab={farmerTab}
        onChangeTab={(tab) => {
          setFarmerTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedLanguage={language}
        onLanguageChange={setLanguage}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        onSwitchRole={() => setIsRoleModalOpen(true)}
        onGoHome={handleGoHome}
      >
        {farmerTab === 'home' && (
          <FarmerHome
            farmer={farmer}
            activeBooking={activeBooking}
            queueToken={currentToken}
            selectedLanguage={language}
            onNavigateToTab={(tab) => {
              setFarmerTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
          />
        )}

        {farmerTab === 'book-slot' && (
          <BookSlotPage
            onNavigateToTab={(tab) => {
              setFarmerTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {farmerTab === 'token' && (
          <TokenPage
            onNavigateToBook={() => setFarmerTab('book-slot')}
            onNavigateToCentres={() => setFarmerTab('centre-status')}
          />
        )}

        {farmerTab === 'centre-status' && (
          <CentreStatusPage
            onBookAtCentre={(centreId) => setFarmerTab('book-slot')}
          />
        )}

        {farmerTab === 'bookings' && (
          <FarmerBookingsPage
            onNavigateToBook={() => setFarmerTab('book-slot')}
            onViewToken={() => setFarmerTab('token')}
          />
        )}

        {farmerTab === 'produce' && (
          <ProducePage
            onBookProduce={() => setFarmerTab('book-slot')}
          />
        )}

        {farmerTab === 'payments' && <PaymentsPage />}

        {farmerTab === 'assistant' && (
          <FarmerAssistant
            currentLanguage={language}
            onLanguageChange={setLanguage}
            onNavigateToTab={(t) => setFarmerTab(t as FarmerNavTab)}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          />
        )}

        {farmerTab === 'profile' && (
          <FarmerProfile
            farmer={farmer}
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        )}

        {/* Demo Simulation Controls Floating Widget (Section 34) */}
        <DemoSimulationBar />

        <RoleSelectionModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          onSelectRole={handleSelectRole}
        />

        <VoiceAssistantModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          currentLanguage={language}
          onNavigateToTab={(t) => setFarmerTab(t as FarmerNavTab)}
        />

        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications.filter(
            (n) => n.roleTarget === 'farmer' || n.roleTarget === 'all' || !n.roleTarget
          )}
          onMarkAllAsRead={markAllNotificationsRead}
          onNotificationAction={handleNotificationAction}
        />
      </FarmerLayout>
    );
  }

  // View 3: Procurement Centre Operator Portal
  if (currentView === 'operator') {
    const selectedCentre = centres[0];

    return (
      <PortalLayout
        role="operator"
        activeTab={operatorTab}
        onChangeTab={setOperatorTab}
        selectedLanguage={language}
        onLanguageChange={setLanguage}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onSwitchRole={() => setIsRoleModalOpen(true)}
        onGoHome={handleGoHome}
      >
        <OperatorPortal
          centre={selectedCentre}
          activeTab={operatorTab}
          onChangeTab={setOperatorTab}
        />

        <RoleSelectionModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          onSelectRole={handleSelectRole}
        />

        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={markAllNotificationsRead}
          onNotificationAction={handleNotificationAction}
        />
      </PortalLayout>
    );
  }

  // View 4: Transporter Hub Portal
  if (currentView === 'transporter') {
    return (
      <PortalLayout
        role="transporter"
        activeTab={transporterTab}
        onChangeTab={setTransporterTab}
        selectedLanguage={language}
        onLanguageChange={setLanguage}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onSwitchRole={() => setIsRoleModalOpen(true)}
        onGoHome={handleGoHome}
      >
        <TransporterPortal
          vehicles={vehicles}
          activeTab={transporterTab}
          onChangeTab={setTransporterTab}
        />

        <RoleSelectionModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          onSelectRole={handleSelectRole}
        />

        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={markAllNotificationsRead}
          onNotificationAction={handleNotificationAction}
        />
      </PortalLayout>
    );
  }

  // View 5: Administrator Portal
  if (currentView === 'admin') {
    return (
      <PortalLayout
        role="admin"
        activeTab={adminTab}
        onChangeTab={setAdminTab}
        selectedLanguage={language}
        onLanguageChange={setLanguage}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onSwitchRole={() => setIsRoleModalOpen(true)}
        onGoHome={handleGoHome}
      >
        <AdminPortal
          stats={ecosystemStats}
          centres={centres}
          activeTab={adminTab}
          onChangeTab={setAdminTab}
        />

        <RoleSelectionModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          onSelectRole={handleSelectRole}
        />

        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={markAllNotificationsRead}
          onNotificationAction={handleNotificationAction}
        />
      </PortalLayout>
    );
  }

  return null;
}

export default function App() {
  return (
    <KisanSetuProvider>
      <AppContent />
    </KisanSetuProvider>
  );
}
