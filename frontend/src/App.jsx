import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Breadcrumb from './components/Breadcrumb';
import GreetingBanner from './components/GreetingBanner';
import SummaryCards from './components/SummaryCards';
import CourseCards from './components/CourseCards';
import AnnouncementBanner from './components/AnnouncementBanner';
import AssignmentWidget from './components/AssignmentWidget';
import AttendanceWidget from './components/AttendanceWidget';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mainWrapClass = sidebarOpen
    ? 'pl-64 transition-all duration-300'
    : 'pl-0 transition-all duration-300';

  return (
    <div className="bg-background font-body-md text-on-surface antialiased">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <div className={mainWrapClass}>
        <main className="w-full pt-16 px-gutter bg-background min-h-screen">
          <div className="flex flex-col w-full pb-space-xl">
            {/* Dynamic Glow Scrim */}
            <div className="relative w-full">
              <div className="absolute -top-10 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
              <div className="absolute top-48 right-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />

              <Breadcrumb />
              <GreetingBanner />
              <SummaryCards />
              <CourseCards />
              <AnnouncementBanner />

              {/* Quick Metrics / Central Timeline Mini Widget */}
              <section
                aria-labelledby="timeline-widget-heading"
                className="grid grid-cols-1 lg:grid-cols-3 gap-space-md"
              >
                <AssignmentWidget />
                <AttendanceWidget />
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;