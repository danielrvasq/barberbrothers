/**
 * Validaciones de horario de negocio para la barbería
 */

// Horarios de servicio
export const BUSINESS_HOURS = {
  // Lunes a Viernes
  weekday: {
    morning: { start: "08:00", end: "12:00" },
    afternoon: { start: "13:00", end: "17:00" },
  },
  // Sábado
  saturday: {
    start: "08:00",
    end: "20:00",
  },
  // Domingo: cerrado
  sunday: null,
};

/**
 * Verifica si una fecha es domingo
 */
export const isSunday = (date) => {
  return date.getDay() === 0;
};

/**
 * Verifica si una fecha/hora está dentro del horario de negocio
 */
export const isWithinBusinessHours = (datetime) => {
  const date = new Date(datetime);
  const dayOfWeek = date.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
  const timeStr = date.toTimeString().slice(0, 5); // "HH:MM"

  // Domingos cerrado
  if (dayOfWeek === 0) {
    return false;
  }

  // Sábados
  if (dayOfWeek === 6) {
    return (
      timeStr >= BUSINESS_HOURS.saturday.start &&
      timeStr < BUSINESS_HOURS.saturday.end
    );
  }

  // Lunes a Viernes
  const morning = BUSINESS_HOURS.weekday.morning;
  const afternoon = BUSINESS_HOURS.weekday.afternoon;

  return (
    (timeStr >= morning.start && timeStr < morning.end) ||
    (timeStr >= afternoon.start && timeStr < afternoon.end)
  );
};

/**
 * Obtiene el próximo horario disponible (evita domingos y horas cerradas)
 */
export const getNextAvailableSlot = (date = new Date()) => {
  let nextDate = new Date(date);

  // Si es domingo, mover al lunes
  if (nextDate.getDay() === 0) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  // Ajustar hora al inicio del horario de negocio
  nextDate.setHours(8, 0, 0, 0);

  return nextDate;
};

/**
 * Genera slots de tiempo disponibles para un día dado
 * @param {Date} date - Fecha para generar slots
 * @param {number} durationMinutes - Duración de cada slot en minutos (default: 30)
 * @returns {Array} Array de objetos con start y end time
 */
export const generateTimeSlots = (date, durationMinutes = 30) => {
  const slots = [];
  const dayOfWeek = date.getDay();

  // Domingos cerrado
  if (dayOfWeek === 0) {
    return slots;
  }

  let ranges = [];

  // Sábados
  if (dayOfWeek === 6) {
    ranges = [
      {
        start: BUSINESS_HOURS.saturday.start,
        end: BUSINESS_HOURS.saturday.end,
      },
    ];
  } else {
    // Lunes a Viernes
    ranges = [
      {
        start: BUSINESS_HOURS.weekday.morning.start,
        end: BUSINESS_HOURS.weekday.morning.end,
      },
      {
        start: BUSINESS_HOURS.weekday.afternoon.start,
        end: BUSINESS_HOURS.weekday.afternoon.end,
      },
    ];
  }

  // Generar slots para cada rango
  ranges.forEach((range) => {
    const [startHour, startMin] = range.start.split(":").map(Number);
    const [endHour, endMin] = range.end.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const min = currentMinutes % 60;

      const startTime = `${String(hour).padStart(2, "0")}:${String(
        min
      ).padStart(2, "0")}`;

      currentMinutes += durationMinutes;

      const endHour = Math.floor(currentMinutes / 60);
      const endMin = currentMinutes % 60;
      const endTime = `${String(endHour).padStart(2, "0")}:${String(
        endMin
      ).padStart(2, "0")}`;

      slots.push({
        start: startTime,
        end: endTime,
        display: startTime,
      });
    }
  });

  return slots;
};

/**
 * Formatea una fecha para mostrar en español
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formatea una hora para mostrar
 */
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Combina fecha y hora en formato ISO para Supabase
 */
export const combineDateTime = (dateStr, timeStr) => {
  const date = new Date(dateStr);
  const [hours, minutes] = timeStr.split(":");
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date.toISOString();
};

/**
 * Valida que la fecha no sea en el pasado
 */
export const isNotPastDate = (datetime) => {
  return new Date(datetime) > new Date();
};

/**
 * Obtiene el nombre del día de la semana en español
 */
export const getDayName = (date) => {
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return days[new Date(date).getDay()];
};

/**
 * Valida una cita completa
 */
export const validateAppointment = (barberId, startAt, service) => {
  const errors = [];

  if (!barberId) {
    errors.push("Debes seleccionar un barbero");
  }

  if (!startAt) {
    errors.push("Debes seleccionar fecha y hora");
  }

  if (!service) {
    errors.push("Debes seleccionar un servicio");
  }

  if (startAt) {
    if (isSunday(new Date(startAt))) {
      errors.push("Los domingos no hay servicio");
    }

    if (!isWithinBusinessHours(startAt)) {
      errors.push("La hora seleccionada está fuera del horario de atención");
    }

    if (!isNotPastDate(startAt)) {
      errors.push("No puedes agendar citas en el pasado");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
