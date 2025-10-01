import React, { useState } from 'react';
import { Button, TextField, FormGroup, FormControlLabel, Checkbox, RadioGroup, Radio } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

function EventForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(dayjs());
  const [type, setType] = useState('once');
  const [repeatDays, setRepeatDays] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    onAdd({
      title,
      date: date.toISOString(),
      type,
      repeatDays,
    });
    setTitle('');
    setDate(dayjs());
    setType('once');
    setRepeatDays([]);
  };

  return (
    <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:16, marginBottom:16}}>
      <TextField label="Название события" value={title} onChange={e=>setTitle(e.target.value)} required />

      <DateTimePicker
        label="Дата и время"
        value={date}
        onChange={setDate}
        disablePast
        renderInput={(params) => <TextField {...params} />}
      />

      <RadioGroup row value={type} onChange={e=>setType(e.target.value)}>
        <FormControlLabel value="once" control={<Radio />} label="Разовое" />
        <FormControlLabel value="repeat" control={<Radio />} label="Повторяющееся" />
      </RadioGroup>

      {type==="repeat" && (
        <FormGroup row>
          {days.map((d,i)=>(
            <FormControlLabel key={d}
              control={
                <Checkbox checked={repeatDays.includes(i)}
                  onChange={e=>{
                    setRepeatDays( repeatDays.includes(i)
                      ? repeatDays.filter(day => day!==i)
                      : [...repeatDays,i]
                    );
                  }}/>
              } label={d}/>
          ))}
        </FormGroup>
      )}

      <Button type="submit" variant="contained" color="primary">
        Активировать событие
      </Button>
    </form>
  );
}

export default EventForm;
