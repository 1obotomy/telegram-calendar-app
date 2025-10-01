import React from "react";
import { List, ListItem, ListItemText, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";

function formatDate(date) {
  return dayjs(date).format("DD.MM.YYYY HH:mm");
}

export default function EventList({ events, onDelete }) {
  if(!events.length) return null;
  return (
    <Paper sx={{p:2, mb:2}}>
      <List>
        {events.map(ev=>(
          <ListItem key={ev.id} secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={()=>onDelete(ev.id)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText
              primary={`${ev.title} (${ev.type==="repeat"?"🏷️Повторяющееся":"Одноразовое"})`}
              secondary={ev.type==="repeat"
                ? `Дни: ${ev.repeatDays.map(i=>["Пн","Вт","Ср","Чт","Пт","Сб","Вс"][i]).join(", ")}`
                : formatDate(ev.date)}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
