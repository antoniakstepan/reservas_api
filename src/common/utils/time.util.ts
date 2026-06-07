export class TimeUtil {
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }

  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  }

  static getMinutesFromDate(date: Date): number {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
  }

  static getDayOfWeek(date: Date): number {
    return date.getUTCDay();
  }
}
