/** The system's share sheet for a file (Web Share level 2): iPhone, Android and some desktops. */
export const canShareFile = (file: File): boolean =>
  typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

/** False when the traveller closed the sheet without picking where to send it. */
export async function shareFile(file: File, text: string): Promise<boolean> {
  try {
    await navigator.share({ files: [file], text });
    return true;
  } catch {
    return false;
  }
}
