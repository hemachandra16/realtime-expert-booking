export default function SlotPicker({ dates, slotDetails, bookedSlots, selectedDate, selectedSlot, onDateChange, onSlotSelect }) {
  const formatDateTab = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[d.getDay()]} ${d.getDate()}`;
  };

  const dateKeys = Object.keys(dates).sort();
  const currentDateSlots = slotDetails && slotDetails[selectedDate] ? slotDetails[selectedDate] : [];

  return (
    <div className="slot-picker">
      <h3>📅 Select a Date & Time Slot</h3>
      <div className="date-tabs">
        {dateKeys.map((date) => (
          <button
            key={date}
            className={`date-tab ${selectedDate === date ? 'active' : ''}`}
            onClick={() => onDateChange(date)}
          >
            {formatDateTab(date)}
          </button>
        ))}
      </div>
      <div className="time-slots">
        {currentDateSlots.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No slots available for this date.</p>
        )}
        {currentDateSlots.map((slot) => {
          const isBooked = slot.isBooked || bookedSlots.includes(slot._id);
          const isSelected = selectedSlot === slot._id;
          let className = 'time-slot ';
          if (isBooked) className += 'booked';
          else if (isSelected) className += 'selected';
          else className += 'available';

          return (
            <button
              key={slot._id}
              className={className}
              disabled={isBooked}
              onClick={() => !isBooked && onSlotSelect(slot._id, slot.time)}
            >
              {slot.time}
              {isBooked && ' ✕'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
