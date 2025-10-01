import React, { useState, useEffect } from 'react';
import EventForm from './EventForm';
import EventList from './EventList';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(setEvents);
  }, []);

  const addEvent = (event) => {
    fetch('/api/events', {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(event)
    })
      .then(res => res.json())
      .then((newEvent) => setEvents([...events, newEvent]));
  };

  const deleteEvent = (id) => {
    fetch(`/api/events/${id}`, { method: "DELETE" })
      .then(() => setEvents(events.filter(ev => ev.id !== id)));
  };

  return (
    <Container>
      <Typography variant="h5" sx={{mb:2}}>Планировщик событий</Typography>
      <EventForm onAdd={addEvent} />
      <EventList events={events} onDelete={deleteEvent} />
    </Container>
  );
}

export default App;
