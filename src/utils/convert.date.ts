// Nhận Date | string | dayjs/moment | undefined/null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toISODate = (val: any): string | undefined => {
  if (!val) return undefined;

  // Nếu là đối tượng có .format (dayjs/moment)
  if (typeof val === "object" && typeof val.format === "function") {
    return val.format("YYYY-MM-DD"); // AntD DatePicker (dayjs) sẽ vào đây
  }

  // Nếu là Date object
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().split("T")[0]; // "YYYY-MM-DD"
  }

  // Nếu là string
  if (typeof val === "string") {
    const s = val.trim();

    // Trường hợp đã đúng ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // "2025-08-26"

    // Trường hợp kiểu dd/MM/yyyy -> convert
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
    if (m) {
      const [, dd, mm, yyyy] = m;
      return `${yyyy}-${mm}-${dd}`;
    }

    // Trường hợp "yyyy/MM/dd"
    const m2 = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(s);
    if (m2) {
      const [, yyyy, mm, dd] = m2;
      return `${yyyy}-${mm}-${dd}`;
    }

    // Thử parse về Date (cẩn thận timezone)
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  }

  // Không nhận diện được
  return undefined;
};
