import { useState, useEffect } from 'react';

const Calendar = ({ leaves = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, leaves]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startDayOfWeek = firstDay.getDay();
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, leaves: [] });
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLeaves = leaves.filter(leave => {
        if (leave.status !== 'approved') return false;
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        return date >= start && date <= end;
      });
      
      days.push({ 
        date: dateStr, 
        dayNumber: day,
        leaves: dayLeaves 
      });
    }
    
    setCalendarDays(days);
  };

  const getSurname = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1];
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div className="leave-calendar">
      <div className="calendar-header">
        <button onClick={prevMonth} className="calendar-nav">◀</button>
        <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <button onClick={nextMonth} className="calendar-nav">▶</button>
      </div>
      
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`calendar-day ${!day.date ? 'empty' : ''} ${day.date && isToday(day.date) ? 'today' : ''}`}
          >
            {day.dayNumber}
            {day.leaves.length > 0 && (
              <div className="day-leaves">
                {day.leaves.slice(0, 3).map((leave, idx) => (
                  <div 
                    key={idx} 
                    className="leave-dot" 
                    title={leave.employeeName}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(showDropdown === index ? null : index);
                    }}
                  >
                    {getSurname(leave.employeeName)}
                  </div>
                ))}
                {day.leaves.length > 3 && (
                  <div className="leave-more">+{day.leaves.length - 3}</div>
                )}
              </div>
            )}
            {showDropdown === index && day.leaves.length > 0 && (
              <div className="leave-dropdown">
                {day.leaves.map((leave, idx) => (
                  <div key={idx} className="dropdown-item">
                    {leave.employeeName} ({leave.leaveType})
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
          <span>On Leave</span>
        </div>
        <div className="legend-info">
          {leaves.filter(l => l.status === 'approved').length} approved leave(s) this month
        </div>
      </div>
    </div>
  );
};

export default Calendar;
